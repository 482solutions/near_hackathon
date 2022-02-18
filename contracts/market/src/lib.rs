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
    Balance, BorshStorageKey, Gas, PanicOnDefault, Promise, ONE_YOCTO,
};

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
}

/// Helper structure to for keys of the persistent collections.
#[derive(BorshStorageKey, BorshSerialize, Debug)]
pub enum StorageKey {
    Asks,
    Bids,
    AsksByOwnerId,
    ByOwnerIdInner { account_hash: Vec<u8> },
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
        }
    }
}
