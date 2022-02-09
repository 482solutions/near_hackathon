/*! FungibleToken contract for EACs trading platform
 * Fungible Token implementation with JSON serialization.
NOTES:
  - The maximum balance value is limited by U128 (2**128 - 1).
  - JSON calls should pass U128 as a base-10 string. E.g. "100".
  - The contract optimizes the inner trie structure by hashing account IDs. It will prevent some
    abuse of deep tries. Shouldn't be an issue, once NEAR clients implement full hashing of keys.
  - The contract tracks the change in storage before and after the call. If the storage increases,
    the contract requires the caller of the contract to attach enough deposit to the function call
    to cover the storage cost.
    This is done to prevent a denial of service attack on the contract by taking all available storage.
    If the storage decreases, the contract will issue a refund for the cost of the released storage.
    The unused tokens from the attached deposit are also refunded, so it's safe to
    attach more deposit than required.
  - To prevent the deployed contract from being modified or deleted, it should not have any access
    keys on its account.
*/
use near_contract_standards::fungible_token::metadata::{
    FungibleTokenMetadata, FungibleTokenMetadataProvider,
};
use near_contract_standards::fungible_token::FungibleToken;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LazyOption;
use near_sdk::env;
use near_sdk::env::{is_valid_account_id, predecessor_account_id};
use near_sdk::json_types::U128;
use near_sdk::log;
use near_sdk::near_bindgen;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{require, AccountId, Balance, BorshStorageKey, PanicOnDefault, PromiseOrValue};

use utils::utils;

mod internal;

/// Enum for token type
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum Type {
    GO,
    REC,
    IREC,
}

// TODO: Describe this better (create sub-types)
// Also. It seems to be pretty a lot of data to send every time. It looks garbage
/// Metadata we provide
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct Metadata {
    pub eac_id: String,

    // TODO: Ask if this really needed
    pub ft_type: Type,
    pub energy_source: String,
    pub prod_start_date: String,

    // Tf if that?
    pub aid_scheme_type: String,
    pub applies_to_cooling_energy: bool,
    pub applies_to_electricity: bool,
    pub applies_to_heating_energy: bool,
    pub commissioning_date: String,
    pub issue_date: String,
    pub issuing_country: String,
    pub plant_location: String,
    pub plant_name: String,
    pub plant_performance: String,
    pub plant_received_investment_aid: bool,
    pub plant_received_national_aid: bool,
    pub plant_type: String,
    // Is it really should be an integer ?
    pub plant_uid: u128,
    pub prod_end_date: String,
    // And what it is ??
    pub received_investment_aid: String,
    pub received_national_aid: String,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    token: FungibleToken,
    metadata: LazyOption<FungibleTokenMetadata>,
    owner: AccountId,
}

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    FungibleToken,
    Metadata,
}

#[near_bindgen]
impl Contract {
    /// Initializes the contract with the given total supply owned by the given `owner_id` with
    /// the given fungible token metadata.
    #[init]
    pub fn new(owner_id: AccountId, metadata: FungibleTokenMetadata) -> Self {
        require!(!env::state_exists(), "Already initialized");
        metadata.assert_valid();
        let mut this = Self {
            token: FungibleToken::new(StorageKey::FungibleToken),
            metadata: LazyOption::new(StorageKey::Metadata, Some(&metadata)),
            owner: owner_id.clone(),
        };
        this.token.internal_register_account(&owner_id);
        // We don't want to give user tokens from start
        // this.token.internal_deposit(&owner_id, total_supply.into());
        this
    }

    /// Used to manually transfer FT. Safe because of check below
    pub fn transfer(&mut self, sender_id: AccountId, receiver_id: AccountId, amount: Balance) {
        require!(
            self.owner == predecessor_account_id(),
            "You are not allowed to do that"
        );

        if !self.is_registered(&receiver_id) {
            self.register_resolve(&receiver_id);
        }

        log!(
            "Transferring from: {}, to: {}, amount: {}",
            sender_id,
            receiver_id,
            amount
        );

        self.token
            .internal_transfer(&sender_id, &receiver_id, amount, None);
    }

    /// Used in cross-contract call to add account of unregistered user
    pub fn register(&mut self, account_id: AccountId) {
        let registered = utils::resolve_promise_bool();
        if !registered {
            self.register_resolve(&account_id);
        }
    }

    pub fn is_registered(&self, account_id: &AccountId) -> bool {
        self.token.accounts.contains_key(account_id)
    }

    /// Gives FT to user that called/deployed contract
    pub fn ft_mint(&mut self, account_id: AccountId, amount: Balance, metadata: Metadata) -> U128 {
        require!(
            self.owner == env::predecessor_account_id(),
            "You are not allowed to do that"
        );

        if !self.is_registered(&account_id) {
            self.register_resolve(&account_id);
        }

        log!("Metadata: {:?}", metadata);

        // Increase total supply if not enough
        match self.token.total_supply.checked_sub(amount) {
            Some(_) => {
                log!("Decreasing total supply by {}", amount);
                self.token.total_supply -= amount;
            }
            None => {
                log!("Increasing total supply by {}", amount);
                self.token.total_supply += amount
            }
        }

        self.token.internal_deposit(&account_id, amount);

        self.ft_balance_of(account_id)
    }

    fn on_account_closed(&mut self, account_id: AccountId, balance: Balance) {
        log!("Closed @{} with {}", account_id, balance);
    }

    fn on_tokens_burned(&mut self, account_id: AccountId, amount: Balance) {
        log!("Account @{} burned {}", account_id, amount);
    }
}

near_contract_standards::impl_fungible_token_core!(Contract, token, on_tokens_burned);
near_contract_standards::impl_fungible_token_storage!(Contract, token, on_account_closed);

#[near_bindgen]
impl FungibleTokenMetadataProvider for Contract {
    fn ft_metadata(&self) -> FungibleTokenMetadata {
        self.metadata.get().unwrap()
    }
}
