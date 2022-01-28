//! # FT 
//! 
//! Smart-contract for transfering tokens and storing metadata

use near_contract_standards::fungible_token::metadata::{
    FungibleTokenMetadata, FungibleTokenMetadataProvider, FT_METADATA_SPEC,
};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, LookupMap, UnorderedMap};
use near_sdk::json_types::U128;
use near_sdk::{
    env, log, near_bindgen, require, AccountId, Balance, IntoStorageKey, PanicOnDefault,
    StorageUsage,
};

/// Struct for storing origin of given tokens
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault, Clone)]
pub struct Origin {
    /// Acoount that produced tokens
    pub id: AccountId,
    pub station: String,
}

/// Struct for storing infromation about the produces quantity and origin
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault, Clone)]
pub struct Batch {
    /// Amount of tokens that was given
    amount: Balance,

    /// What station and company produced it
    origin: Origin,
}

/// Struct for storing info about user balances and total supply of tokens
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Token {
    // AccountId -> { id -> Batch }
    pub accounts: LookupMap<AccountId, UnorderedMap<u64, Batch>>,

    pub total_supply: Balance,
    /// The storage size in bytes for one account.
    pub account_storage_usage: StorageUsage,
}

impl Token {
    pub fn new<S>(prefix: S) -> Self
    where
        S: IntoStorageKey,
    {
        let mut this = Self {
            accounts: LookupMap::new(prefix),
            total_supply: 0,
            account_storage_usage: 0,
        };
        this.measure_account_storage_usage();
        this
    }

    fn measure_account_storage_usage(&mut self) {
        let initial_storage_usage = env::storage_usage();
        let tmp_account_id = AccountId::new_unchecked("a".repeat(64));
        let mut tmp_map = UnorderedMap::new(b"a".to_vec());
        tmp_map.insert(
            &1,
            &Batch {
                amount: 1,
                origin: Origin {
                    id: tmp_account_id.clone(),
                    station: "".to_string(),
                },
            },
        );

        self.accounts.insert(&tmp_account_id, &tmp_map);
        self.account_storage_usage = env::storage_usage() - initial_storage_usage;
        self.accounts.remove(&tmp_account_id);
    }

    pub fn internal_unwrap_balance_of(&self, account_id: &AccountId) -> Balance {
        match self.accounts.get(account_id) {
            Some(balance) => balance
                .iter()
                .fold(0, |total, (_, batch)| total + batch.amount),
            None => {
                env::panic_str(format!("The account {} is not registered", &account_id).as_str())
            }
        }
    }

    pub fn internal_deposit(&mut self, account_id: &AccountId, batch: &Batch, id: u64) {
        let balance = self.internal_unwrap_balance_of(account_id);
        match balance.checked_add(batch.amount) {
            Some(_) => {
                self.accounts.get(account_id).unwrap().insert(&id, &batch);
                self.total_supply = self
                    .total_supply
                    .checked_add(batch.amount)
                    .unwrap_or_else(|| env::panic_str("Total supply overflow"));
            }
            None => {
                env::panic_str("Balance overflow");
            }
        }
    }

    pub fn calc_remain(&mut self, batch: &Batch, amount: Balance) -> Option<u128> {
        batch.amount.checked_sub(amount)
    }

    pub fn internal_withdraw(&mut self, account_id: &AccountId, batch_id: u64, amount: Balance) {
        let batch = self
            .accounts
            .get(account_id)
            .unwrap()
            .get(&batch_id)
            .unwrap_or_else(|| env::panic_str("No such batch"));
        match self.calc_remain(&batch, amount) {
            Some(left) => {
                if left == 0 {
                    self.accounts.get(account_id).unwrap().remove(&batch_id);
                } else {
                    self.accounts
                        .get(account_id)
                        .unwrap()
                        .get(&batch_id)
                        .unwrap()
                        .amount = left
                }
                // TODO: should i sub from total supply after that ?
            }
            None => env::panic_str("Not enough tokens in batch"),
        }
    }

    pub fn internal_transfer(
        &mut self,
        sender_id: &AccountId,
        receiver_id: &AccountId,
        amount: Balance,
        batch_id: u64,
        memo: Option<String>,
    ) {
        require!(
            sender_id != receiver_id,
            "Sender and receiver should be different"
        );
        require!(amount > 0, "The amount should be a positive number");
        // TODO: How id should be picked ???

        let batch = &self
            .accounts
            .get(sender_id)
            .unwrap()
            .get(&batch_id)
            .unwrap();
        let remains = self.calc_remain(batch, amount);

        match remains {
            Some(left) => {
                // TODO: Id should be different to not cause interferrence
             
                let mut new_batch = batch.clone();
                new_batch.amount = left;
                self.internal_deposit(receiver_id, &new_batch, batch_id);
                self.internal_withdraw(sender_id, batch_id, amount)
            }
            None => env::panic_str("Sender batch does not have tokens"),
        }

        log!("Transfer {} of batch {} from {} to {}", amount, batch_id, sender_id, receiver_id);
        if let Some(memo) = memo {
            log!("Memo: {}", memo);
        }
    }

    pub fn internal_register_account(&mut self, account_id: &AccountId) {
        if self
            .accounts
            .insert(account_id, &UnorderedMap::new(b"b".to_vec()))
            .is_some()
        {
            env::panic_str("The account is already registered");
        }
    }
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    token: Token,
    metadata: LazyOption<FungibleTokenMetadata>,
}

#[near_bindgen]
impl Contract {
    /// Initializes the contract with the given total supply owned by the given `owner_id` with
    /// default metadata (for example purposes only).
    #[init]
    pub fn new_default_meta(owner_id: AccountId, total_supply: U128) -> Self {
        Self::new(
            owner_id,
            total_supply,
            FungibleTokenMetadata {
                spec: FT_METADATA_SPEC.to_string(),
                name: "MWh NEAR Fungible token".to_string(),
                symbol: "MWh".to_string(),
                // TODO: Add icon
                icon: None,
                reference: None,
                reference_hash: None,
                decimals: 24,
            },
        )
    }

    /// Initializes the contract with the given total supply owned by the given `owner_id` with
    /// the given fungible token metadata.
    #[init]
    pub fn new(owner_id: AccountId, total_supply: U128, metadata: FungibleTokenMetadata) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        metadata.assert_valid();
        let mut this = Self {
            token: Token::new(b"a".to_vec()),
            metadata: LazyOption::new(b"m".to_vec(), Some(&metadata)),
        };
        this.token.internal_register_account(&owner_id);
        this.token.internal_deposit(
            &owner_id,
            &Batch {
                amount: total_supply.into(),
                origin: Origin {
                    id: owner_id.clone(),
                    station: "test".to_string(),
                },
            },
            1,
        );
        this
    }

    fn on_account_closed(&mut self, account_id: AccountId, balance: Balance) {
        log!("Closed @{} with {}", account_id, balance);
    }

    fn on_tokens_burned(&mut self, account_id: AccountId, amount: Balance) {
        log!("Account @{} burned {}", account_id, amount);
    }
}

#[near_bindgen]
impl FungibleTokenMetadataProvider for Contract {
    fn ft_metadata(&self) -> FungibleTokenMetadata {
        self.metadata.get().unwrap()
    }
}
