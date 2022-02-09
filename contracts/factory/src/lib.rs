//! Token Factory
//!
//! This module is used for creating sub accounts for use by companies.

use near_contract_standards::fungible_token::metadata::{FungibleTokenMetadata, FT_METADATA_SPEC};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::env::sha256;
use near_sdk::json_types::{Base64VecU8, U128};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::serde_json::json;
use near_sdk::{
    env, ext_contract, log, near_bindgen, require, AccountId, Balance, BorshStorageKey,
    PanicOnDefault, Promise,
};
use utils::utils;

mod external;

use external::*;

/* TODO: I should definitely later dive deeper into economics of NEAR
    to better understand how i can calc fee
*/

pub mod prices {
    use near_sdk::{Balance, Gas};

    pub const NO_DEPOSIT: Balance = 0;

    pub const FACTORY_CROSS_CALL: Gas = Gas(2_428_023_852_964);

    /// Gas to initialize Token contract.
    pub const TOKEN_NEW: Gas = Gas(10_000_000_000_000);

    /// Price per 1 byte of usage mainnet genesis config.
    pub const STORAGE_PRICE_PER_BYTE: Balance = 10_000_000_000_000_000_000; // 1e19yN, 0.00001N

    /// Initial balance for the Token contract to cover usage and related.
    pub const TOKEN_INIT_BALANCE: Balance = 3_000_000_000_000_000_000_000_000; // 3e24yN, 3N
}

use prices::*;

static CODE: &[u8] = include_bytes!("../../out/fungible_token.wasm");

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    Tokens,
}

/// Used for deploying child contracts and keeping track of them
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct FactoryContract {
    pub tokens: UnorderedMap<AccountId, TokenArgs>,
}

#[derive(Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct TokenArgs {
    owner_id: AccountId,
    total_supply: U128,
    metadata: FungibleTokenMetadata,
}

/// Smart-contract that used for: creating ft, transferring FT and $NEAR
#[near_bindgen]
impl FactoryContract {
    #[init]
    pub fn new() -> Self {
        Self {
            tokens: UnorderedMap::new(StorageKey::Tokens),
        }
    }

    /// Creates subaccount for user
    ///
    /// # Arguments
    ///
    /// * `account_id` - Name of account that wants to create FT, should be in format user.testnet/mainnet
    ///
    #[payable]
    pub fn create_ft(&mut self, name: String, reference: String) -> Promise {
        let account_id = env::current_account_id();
        let owner_id = env::predecessor_account_id();

        let subaccount_id = get_token_account_id(&owner_id);

        log!(
            "Trying to create subaccount: {}. {} yoctoNEAR required as deposit",
            &subaccount_id,
            TOKEN_INIT_BALANCE
        );

        let initial_usage = env::storage_usage() as u128;
        let current_usage = env::storage_usage() as u128;

        require!(
            env::attached_deposit()
                >= TOKEN_INIT_BALANCE + STORAGE_PRICE_PER_BYTE * (current_usage - initial_usage),
            "Not enough attached deposit to complete token creation"
        );

        require!(
            self.tokens.get(&subaccount_id).is_none(),
            "Token already exists"
        );

        let hashed = sha256(&reference.bytes().collect::<Vec<u8>>());
        let base64vec = Base64VecU8::from(hashed);
        log!("Reference: {}, Base64 of hash: {:?}", &reference, base64vec);

        let metadata = FungibleTokenMetadata {
            spec: FT_METADATA_SPEC.to_string(),
            name,
            symbol: "IREC".to_string(),
            icon: None,
            reference: Some(reference),
            reference_hash: Some(base64vec),
            decimals: 24,
        };

        let args = TokenArgs {
            owner_id,
            total_supply: U128(0),
            metadata: metadata.clone(),
        };

        self.tokens.insert(&subaccount_id, &args);

        // We need to pass account_id to "owner_id" field so user can interact with it from his account
        Promise::new(subaccount_id)
            .create_account()
            .transfer(TOKEN_INIT_BALANCE)
            .deploy_contract(CODE.to_vec())
            .function_call(
                "new".to_string(),
                json!({ "owner_id": account_id, "metadata": metadata })
                    .to_string()
                    .as_bytes()
                    .to_vec(),
                NO_DEPOSIT,
                TOKEN_NEW,
            )
    }

    #[private]
    pub fn force_transfer(
        &self,
        sender_id: AccountId,
        receiver_id: AccountId,
        amount: Balance,
    ) -> Promise {
        let ft = self.get_token(&sender_id);

        require!(ft.is_none(), "This FT does not exist");

        let ft_contract = get_token_account_id(&sender_id);

        // Initiate cross-contract call
        ext_contract::transfer(
            sender_id,
            receiver_id,
            amount,
            ft_contract,
            NO_DEPOSIT,
            FACTORY_CROSS_CALL,
        )
    }

    pub fn get_number_of_tokens(&self) -> u64 {
        self.tokens.len()
    }

    pub fn get_tokens(&self, from_index: u64, limit: u64) -> Vec<TokenArgs> {
        let tokens = self.tokens.values_as_vector();
        (from_index..std::cmp::min(from_index + limit, tokens.len()))
            .filter_map(|index| tokens.get(index))
            .collect()
    }

    pub fn get_token(&self, account_id: &AccountId) -> Option<TokenArgs> {
        self.tokens.get(&get_token_account_id(account_id))
    }
}

pub fn get_token_account_id(account_id: &AccountId) -> AccountId {
    // Split account by '.'
    // Example i3ima.testnet -> ["i3ima", "testnet"]
    let split = utils::split_account(&account_id);
    // Get prefix for subaccount
    let prefix = split[0].to_string();

    AccountId::new_unchecked(format!("{}.{}", prefix, env::current_account_id()))
}
