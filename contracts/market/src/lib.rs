//! Market for EACs
//!

use near_contract_standards::non_fungible_token::approval::NonFungibleTokenApprovalReceiver;
use near_contract_standards::non_fungible_token::TokenId;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, UnorderedSet};
use near_sdk::env;
use near_sdk::env::STORAGE_PRICE_PER_BYTE;
use near_sdk::json_types::{U128, U64};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    assert_one_yocto, ext_contract, is_promise_success, log, near_bindgen, require, AccountId,
    Balance, BorshStorageKey, CryptoHash, Gas, PanicOnDefault, Promise, ONE_YOCTO,
};

use utils::utils;

use crate::sale::*;

mod callbacks;
mod external;
mod internal;
pub mod sale;
pub mod sale_views;

use external::*;

// The minimum storage to have a sale on the contract.
pub const STORAGE_PER_SALE: u128 = 1000 * STORAGE_PRICE_PER_BYTE;

pub const NO_DEPOSIT: Balance = 0;

pub const PROCESS_ASK: Gas = Gas(20_000_000_000_000);

pub const CCC: Gas = Gas(20_000_000_000_000);

//Creating custom types to use within the contract. This makes things more readable.
pub type SalePriceInYoctoNear = U128;

pub type PositionId = String;

/// Struct for storing various information about market state
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub owner_id: AccountId,

    /// To keep track of the ask, we map the ContractAndTokenId to a Sale.
    /// the ContractAndTokenId is the unique identifier for every sale. It is made
    /// up of the `contract ID + DELIMITER + UUIDv4`
    pub asks: UnorderedMap<PositionId, Ask>,
    /// Same with bids
    pub bids: UnorderedMap<PositionId, Bid>,

    /// Current id for asks
    pub asks_id: u128,
    /// Current id for bids
    pub bids_id: u128,

    /// Keep track of all the Ask IDs for every account ID
    pub asks_by_owner_id: LookupMap<AccountId, UnorderedSet<PositionId>>,

    /// Keep track of all the Bids IDs for every account ID
    pub bids_by_owner_id: LookupMap<AccountId, UnorderedSet<PositionId>>,

    /// By NFT Token Id
    pub by_nft_token_id: LookupMap<AccountId, UnorderedSet<PositionId>>,

    /// Keep track of the storage that accounts have paid
    pub storage_deposits: LookupMap<AccountId, Balance>,
}

/// Helper structure to for keys of the persistent collections.
#[derive(BorshStorageKey, BorshSerialize)]
pub enum StorageKey {
    Asks,
    Bids,
    AsksByOwnerId,
    BidsByOwnerId,
    ByOwnerIdInner { account_id_hash: CryptoHash },
    ByNftContractId,
    ByNFTContractIdInner { account_id_hash: CryptoHash },
    StorageDeposits,
}

#[near_bindgen]
impl Contract {
    /*
        initialization function (can only be called once).
        this initializes the contract with default data and the owner ID
        that's passed in
    */
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        Self {
            owner_id,
            asks: UnorderedMap::new(StorageKey::Asks),
            asks_id: 0,
            bids: UnorderedMap::new(StorageKey::Bids),
            bids_id: 0,
            asks_by_owner_id: LookupMap::new(StorageKey::AsksByOwnerId),
            bids_by_owner_id: LookupMap::new(StorageKey::BidsByOwnerId),
            storage_deposits: LookupMap::new(StorageKey::StorageDeposits),
            by_nft_token_id: LookupMap::new(StorageKey::ByNftContractId),
        }
    }

    /// Allows users to deposit storage. This is to cover the cost of storing sale objects on the contract
    #[payable]
    pub fn storage_deposit(&mut self, account_id: Option<AccountId>) {
        //get the account ID to pay for storage for
        let storage_account_id = account_id
            //if we didn't specify an account ID, we simply use the caller of the function
            .unwrap_or_else(env::predecessor_account_id);

        let deposit = env::attached_deposit();

        require!(
            deposit >= STORAGE_PER_SALE,
            "Minimum deposit is not provided"
        );

        let mut balance: u128 = self.storage_deposits.get(&storage_account_id).unwrap_or(0);

        balance += deposit;

        self.storage_deposits.insert(&storage_account_id, &balance);
    }

    /// Allows users to withdraw any excess storage that they're not using
    #[payable]
    pub fn storage_withdraw(&mut self) {
        //make sure the user attaches exactly 1 yoctoNEAR for security purposes.
        //this will redirect them to the NEAR wallet (or requires a full access key).
        assert_one_yocto();

        //the account to withdraw storage to is always the function caller
        let owner_id = env::predecessor_account_id();
        //get the amount that the user has by removing them from the map. If they're not in the map, default to 0
        let mut amount = self.storage_deposits.remove(&owner_id).unwrap_or(0);

        //how many sales is that user taking up currently. This returns a set
        let asks = self.asks_by_owner_id.get(&owner_id);
        let bids = self.bids_by_owner_id.get(&owner_id);
        //get the length of that set.
        let bids = bids.map(|s| s.len()).unwrap_or_default();
        let asks = asks.map(|s| s.len()).unwrap_or_default();

        let len = asks + bids;

        //how much NEAR is being used up for all the current sales on the account
        let diff = u128::from(len) * STORAGE_PER_SALE;

        //the excess to withdraw is the total storage paid - storage being used up.
        amount -= diff;

        //if that excess to withdraw is > 0, we transfer the amount to the user.
        if amount > 0 {
            Promise::new(owner_id.clone()).transfer(amount);
        }
        //we need to add back the storage being used up into the map if it's greater than 0.
        //this is so that if the user had 500 sales on the market, we insert that value here so
        //if those sales get taken down, the user can then go and withdraw 500 sales worth of storage.
        if diff > 0 {
            self.storage_deposits.insert(&owner_id, &diff);
        }
    }

    /// Return the minimum storage for 1 sale
    pub fn storage_minimum_balance(&self) -> U128 {
        U128(STORAGE_PER_SALE)
    }

    /// Return how much storage an account has paid for
    pub fn storage_balance_of(&self, account_id: AccountId) -> U128 {
        U128(self.storage_deposits.get(&account_id).unwrap_or(0))
    }
}
