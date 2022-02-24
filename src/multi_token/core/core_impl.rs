use crate::multi_token::core::{MultiTokenCore, MultiTokenResolver};
use crate::multi_token::events::{MtMint, MtTransfer};
use crate::multi_token::metadata::TokenMetadata;
use crate::multi_token::token::{Approval, Token, TokenId};
use crate::multi_token::utils::{refund_deposit_to_account};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, TreeMap, UnorderedSet};
use near_sdk::json_types::U128;
use near_sdk::{
    assert_one_yocto, env, ext_contract, log, require, AccountId, Balance, BorshStorageKey,
    CryptoHash, Gas, IntoStorageKey, PromiseOrValue, PromiseResult, StorageUsage,
};
use std::collections::HashMap;

pub const GAS_FOR_RESOLVE_TRANSFER: Gas = Gas(5_000_000_000_000);
pub const GAS_FOR_MT_TRANSFER_CALL: Gas = Gas(25_000_000_000_000 + GAS_FOR_RESOLVE_TRANSFER.0);

const NO_DEPOSIT: Balance = 0;

#[ext_contract(ext_self)]
trait MtResolver {
    fn resolve_transfer(
        &mut self,
        sender_id: AccountId,
        receiver: AccountId,
        token_id: TokenId,
        approvals: Option<HashMap<AccountId, Approval>>,
    ) -> Vector<Balance>;
}

#[ext_contract(ext_receiver)]
pub trait MultiTokenReceiver {
    fn on_transfer(
        &mut self,
        sender_id: AccountId,
        previous_owner_id: AccountId,
        token_ids: TokenId,
        amounts: Balance,
        msg: String,
    ) -> PromiseOrValue<Balance>;
}

/// Implementation of the multi-token standard
/// Allows to include NEP-246 compatible tokens to any contract.
/// There are next traits that any contract may implement:
///     - MultiTokenCore -- interface with transfer methods. MultiToken provides methods for it.
///     - MultiTokenApproval -- interface with approve methods. MultiToken provides methods for it.
///     - MultiTokenEnumeration -- interface for getting lists of tokens. MultiToken provides methods for it.
///     - MultiTokenMetadata -- return metadata for the token in NEP-246, up to contract to implement.
#[derive(BorshDeserialize, BorshSerialize)]
pub struct MultiToken {
    /// Owner of contract
    pub owner_id: AccountId,

    /// How much storage takes every token
    pub extra_storage_in_bytes_per_emission: StorageUsage,

    /// Owner of each token
    pub owner_by_id: TreeMap<TokenId, AccountId>,

    /// Total supply for each token
    pub total_supply: LookupMap<TokenId, Balance>,

    /// Metadata for each token
    pub token_metadata_by_id: Option<LookupMap<TokenId, TokenMetadata>>,

    /// All tokens owned by user
    pub tokens_per_owner: Option<LookupMap<AccountId, UnorderedSet<TokenId>>>,

    /// Balance of user for given token
    pub balances_per_token: LookupMap<TokenId, LookupMap<AccountId, u128>>,

    /// All approvals of user
    pub approvals_by_id: Option<LookupMap<TokenId, HashMap<AccountId, Approval>>>,

    /// Next id of approval
    pub next_approval_id_by_id: Option<LookupMap<TokenId, u64>>,

    /// Next id for token
    pub next_token_id: u64,
}

#[derive(BorshStorageKey, BorshSerialize)]
pub enum StorageKey {
    PerOwner,
    TokensPerOwner { account_hash: Vec<u8> },
    TokenPerOwnerInner { account_id_hash: CryptoHash },
    OwnerById,
    OwnerByIdInner { account_id_hash: CryptoHash },
    TokenMetadata,
    Approvals,
    ApprovalById,
    ApprovalsInner { account_id_hash: CryptoHash },
    TotalSupply { supply: u128 },
    Balances,
    BalancesInner { token_id: Vec<u8> },
}

impl MultiToken {
    pub fn new<Q, R, S, T>(
        owner_by_id_prefix: Q,
        owner_id: AccountId,
        token_metadata_prefix: Option<R>,
        enumeration_prefix: Option<S>,
        approval_prefix: Option<T>,
    ) -> Self
    where
        Q: IntoStorageKey,
        R: IntoStorageKey,
        S: IntoStorageKey,
        T: IntoStorageKey,
    {
        let (approvals_by_id, next_approval_id_by_id) = if let Some(prefix) = approval_prefix {
            let prefix: Vec<u8> = prefix.into_storage_key();
            (
                Some(LookupMap::new(prefix.clone())),
                Some(LookupMap::new([prefix, "n".into()].concat())),
            )
        } else {
            (None, None)
        };

        Self {
            owner_id,
            extra_storage_in_bytes_per_emission: 0,
            owner_by_id: TreeMap::new(StorageKey::OwnerById),
            total_supply: LookupMap::new(StorageKey::TotalSupply { supply: u128::MAX }),
            token_metadata_by_id: token_metadata_prefix.map(LookupMap::new),
            tokens_per_owner: enumeration_prefix.map(LookupMap::new),
            balances_per_token: LookupMap::new(StorageKey::Balances),
            approvals_by_id,
            next_approval_id_by_id,
            next_token_id: 0,
        }
    }

    /// Used to get balance of specified account in specified token
    pub fn internal_unwrap_balance_of(
        &self,
        token_id: &TokenId,
        account_id: &AccountId,
    ) -> Balance {
        match self
            .balances_per_token
            .get(token_id)
            .expect("This token does not exist")
            .get(account_id)
        {
            Some(balance) => balance,
            None => {
                env::panic_str(format!("The account {} is not registered", account_id).as_str())
            }
        }
    }

    /// Add to balance of user specified amount
    pub fn internal_deposit(
        &mut self,
        token_id: &TokenId,
        account_id: &AccountId,
        amount: Balance,
    ) {
        let balance = self.internal_unwrap_balance_of(token_id, account_id);
        if let Some(new) = balance.checked_add(amount) {
            let mut balances = self.balances_per_token.get(token_id).unwrap();
            balances.insert(account_id, &new);
            self.total_supply.insert(
                token_id,
                &self
                    .total_supply
                    .get(token_id)
                    .unwrap()
                    .checked_add(amount)
                    .unwrap_or_else(|| env::panic_str("Total supply overflow")),
            );
        } else {
            env::panic_str("Balance overflow");
        }
    }

    /// Subtract specified amount from user account in given token
    pub fn internal_withdraw(
        &mut self,
        token_id: &TokenId,
        account_id: &AccountId,
        amount: Balance,
    ) {
        let balance = self.internal_unwrap_balance_of(token_id, account_id);
        if let Some(new) = balance.checked_sub(amount) {
            let mut balances = self.balances_per_token.get(token_id).unwrap();
            balances.insert(account_id, &new);
            self.total_supply.insert(
                token_id,
                &self
                    .total_supply
                    .get(token_id)
                    .unwrap()
                    .checked_sub(amount)
                    .unwrap_or_else(|| env::panic_str("Total supply overflow")),
            );
        } else {
            env::panic_str("The account doesn't have enough balance");
        }
    }

    pub fn internal_transfer(
        &mut self,
        sender_id: &AccountId,
        receiver_id: &AccountId,
        token_id: &TokenId,
        approval_id: u64,
        amount: Balance,
    ) -> (AccountId, HashMap<AccountId, Approval>) {
        // Safety checks
        require!(sender_id != receiver_id);
        require!(amount > 0);

        // Get owner
        let owner_id = self.owner_by_id.get(token_id).expect("Token not found");
        // This will be reverted in case of panic
        let approvals = self
            .approvals_by_id
            .as_mut()
            .and_then(|by_id| by_id.remove(token_id))
            .expect("No such token");

        let sender_id = if sender_id != &owner_id {
            let actual_id = approvals.get(sender_id).expect("Sender not approved");

            require!(
                actual_id.approval_id == approval_id,
                "Approval id differs from the actual"
            );

            Some(sender_id)
        } else {
            Some(sender_id)
        };

        env::log_str(format!("Sender: {:?}", sender_id).as_str());

        require!(
            &owner_id != receiver_id,
            "Current and next owner must differ"
        );

        self.internal_withdraw(token_id, sender_id.unwrap(), amount);
        self.internal_deposit(token_id, receiver_id, amount);

        MultiToken::emit_transfer(&owner_id, receiver_id, token_id, amount, sender_id, None);

        (owner_id, approvals)
    }

    pub fn internal_register_account(&mut self, token_id: &TokenId, account_id: &AccountId) {
        if self
            .balances_per_token
            .get(token_id)
            .unwrap()
            .insert(account_id, &0)
            .is_some()
        {
            env::panic_str("The account is already registered");
        }
    }

    pub fn internal_mint(
        &mut self,
        owner_id: AccountId,
        metadata: Option<TokenMetadata>,
        refund_id: Option<AccountId>,
    ) -> Token {
        let token = self.internal_mint_with_refund(owner_id.clone(), metadata, refund_id);
        MultiToken::emit_mint(&owner_id, &token.token_id, &token.supply, None);

        token
    }

    /// Mint a new token without checking:
    /// * Whether the caller id is equal to the `owner_id`
    /// * `refund_id` will transfer the leftover balance after storage costs are calculated to the provided account.
    ///   Typically, the account will be the owner. If `None`, will not refund. This is useful for delaying refunding
    ///   until multiple tokens have been minted.
    ///
    /// Returns the newly minted token and does not emit the mint event. This allows minting multiple before emitting.
    pub fn internal_mint_with_refund(
        &mut self,
        token_owner_id: AccountId,
        token_metadata: Option<TokenMetadata>,
        refund_id: Option<AccountId>,
    ) -> Token {
        // Remember current storage usage if refund_id is Some
        let initial_storage_usage = refund_id.map(|account_id| (account_id, env::storage_usage()));

        // Panic if contract is using metadata extension and caller must provide it
        if self.token_metadata_by_id.is_some() && token_metadata.is_none() {
            env::panic_str("MUST provide metadata");
        }

        // Increment next id of the token. Panic if it's overflowing u64::MAX
        self.next_token_id
            .checked_add(1)
            .expect("u64 overflow, cannot mint any more tokens");

        let token_id: TokenId = self.next_token_id.to_string();

        // If contract uses approval management create new LookupMap for approvals
        self.next_approval_id_by_id
            .as_mut()
            .and_then(|internal| internal.insert(&token_id, &0));

        // Alias
        let owner_id: AccountId = token_owner_id;

        // Insert new owner
        self.owner_by_id.insert(&token_id, &owner_id);

        // Insert new metadata
        self.token_metadata_by_id
            .as_mut()
            .and_then(|by_id| by_id.insert(&token_id, &token_metadata.clone().unwrap()));

        // Insert new supply
        self.total_supply.insert(&token_id, &u128::MAX);

        // Insert new balance
        let mut new_set: LookupMap<AccountId, u128> = LookupMap::new(StorageKey::BalancesInner {
            token_id: env::sha256(token_id.as_bytes()),
        });
        new_set.insert(&owner_id, &0);
        self.balances_per_token.insert(&token_id, &new_set);

        // Updates enumeration if extension is used
        if let Some(per_owner) = &mut self.tokens_per_owner {
            let mut token_ids = per_owner.get(&owner_id).unwrap_or_else(|| {
                UnorderedSet::new(StorageKey::TokensPerOwner {
                    account_hash: env::sha256(owner_id.as_bytes()),
                })
            });
            token_ids.insert(&token_id);
            per_owner.insert(&owner_id, &token_ids);
        }

        // Stuff for Approval Management extension, also check for presence of it first
        let approved_account_ids = if self.approvals_by_id.is_some() {
            Some(HashMap::new())
        } else {
            None
        };

        if let Some((id, usage)) = initial_storage_usage {
            refund_deposit_to_account(env::storage_usage() - usage, id);
        }

        Token {
            token_id,
            owner_id,
            supply: u128::MAX,
            balances: HashMap::new(),
            metadata: token_metadata,
            approvals: approved_account_ids,
            next_approval_id: Some(0),
        }
    }

    fn emit_transfer(
        owner_id: &AccountId,
        receiver_id: &AccountId,
        token_id: &str,
        amount: Balance,
        sender_id: Option<&AccountId>,
        memo: Option<String>,
    ) {
        MtTransfer {
            old_owner_id: owner_id,
            new_owner_id: receiver_id,
            token_ids: &[token_id],
            amounts: &[&amount.to_string()],
            authorized_id: sender_id.filter(|sender_id| *sender_id == owner_id),
            memo: memo.as_deref(),
        }
        .emit();
    }

    fn emit_mint(owner_id: &AccountId, token_id: &TokenId, amount: &Balance, memo: Option<String>) {
        MtMint {
            owner_id,
            token_ids: &[token_id],
            amounts: &[&amount.to_string()],
            memo: memo.as_deref(),
        }
        .emit()
    }
}

impl MultiTokenCore for MultiToken {
    fn transfer(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        amount: Balance,
        approval: Option<u64>,
    ) {
        assert_one_yocto();
        let sender_id = env::predecessor_account_id();
        env::log_str(format!("Predecessor {}", sender_id).as_str());
        self.internal_transfer(
            &sender_id,
            &receiver_id,
            &token_id,
            approval.unwrap(),
            amount,
        );
    }

    fn transfer_call(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        amount: Balance,
        approval_id: Option<u64>,
        msg: String,
    ) -> PromiseOrValue<bool> {
        assert_one_yocto();
        require!(
            env::prepaid_gas() > GAS_FOR_MT_TRANSFER_CALL + GAS_FOR_RESOLVE_TRANSFER,
            "GAS!GAS!GAS! I gonna to step on the gas"
        );
        let sender_id = env::predecessor_account_id();

        let (old_owner, old_approvals) = self.internal_transfer(
            &sender_id,
            &receiver_id,
            &token_id,
            approval_id.unwrap(),
            amount,
        );

        ext_receiver::on_transfer(
            sender_id,
            old_owner.clone(),
            token_id.clone(),
            amount,
            msg,
            receiver_id.clone(),
            NO_DEPOSIT,
            env::prepaid_gas() - GAS_FOR_MT_TRANSFER_CALL,
        )
        .then(ext_self::resolve_transfer(
            old_owner,
            receiver_id,
            token_id,
            Some(old_approvals),
            env::current_account_id(),
            NO_DEPOSIT,
            GAS_FOR_RESOLVE_TRANSFER,
        ))
        .into()
    }

    fn approval_for_all(&mut self, owner: AccountId, approved: bool) {
        todo!()
    }

    fn balance_of(&self, owner: AccountId, id: Vec<TokenId>) -> Vec<U128> {
        todo!()
    }

    fn token(&self, token_id: TokenId) -> Option<Token> {
        let metadata = if let Some(metadata_by_id) = &self.token_metadata_by_id {
            metadata_by_id.get(&token_id)
        } else {
            None
        };
        let next_approval_id = self.next_approval_id_by_id.as_ref().unwrap().get(&token_id);
        let supply = self.total_supply.get(&token_id)?;
        let owner_id = self.owner_by_id.get(&token_id)?;
        let approved_accounts = self
            .approvals_by_id
            .as_ref()
            .and_then(|by_id| by_id.get(&token_id).or_else(|| Some(HashMap::new())));
        let balances = self.balances_per_token.get(&token_id)?;

        Some(Token {
            token_id,
            owner_id,
            supply,
            balances: HashMap::new(),
            metadata,
            approvals: approved_accounts,
            next_approval_id,
        })
    }
}

impl MultiToken {
    pub fn internal_resolve_transfer(
        &mut self,
        sender_id: &AccountId,
        receiver: AccountId,
        token_id: TokenId,
        amount: U128,
    ) -> (Balance, Balance) {
        let amount: Balance = amount.into();

        let unused = match env::promise_result(0) {
            PromiseResult::NotReady => env::abort(),
            PromiseResult::Successful(value) => {
                if let Ok(unused) = near_sdk::serde_json::from_slice::<U128>(&value) {
                    std::cmp::min(amount, unused.0)
                } else {
                    amount
                }
            }
            PromiseResult::Failed => 0,
        };

        // All this `.get()` will not fail since it would fail before it gets to this call
        if unused > 0 {
            let mut balances = self.balances_per_token.get(&token_id).unwrap();
            let receiver_balance = balances.get(&receiver).unwrap_or(0);

            if receiver_balance > 0 {
                let refund = std::cmp::min(receiver_balance, unused);
                balances.insert(&receiver, &(receiver_balance - refund));

                return if let Some(sender_balance) = balances.get(sender_id) {
                    balances.insert(sender_id, &(sender_balance + refund));
                    log!("Refund {} from {} to {}", refund, receiver, sender_id);
                    (amount - refund, 0)
                } else {
                    *self.total_supply.get(&token_id).as_mut().unwrap() -= refund;
                    log!("The account of the sender was deleted");
                    (amount, refund)
                };
            }
        }
        (amount, 0)
    }
}

impl MultiTokenResolver for MultiToken {
    fn resolve_transfer(
        &mut self,
        sender_id: AccountId,
        receiver: AccountId,
        token_id: TokenId,
        amount: U128,
    ) -> U128 {
        self.internal_resolve_transfer(&sender_id, receiver, token_id, amount)
            .0
            .into()
    }
}
