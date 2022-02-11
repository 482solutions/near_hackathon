//! Token Factory
//!
//! This module is used for creating sub accounts

use near_contract_standards::fungible_token::metadata::{FungibleTokenMetadata, FT_METADATA_SPEC};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::env::{sha256, signer_account_id};
use near_sdk::json_types::{Base64VecU8, U128};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::serde_json::json;
use near_sdk::{
    env, ext_contract, log, near_bindgen, require, AccountId, Balance, BorshStorageKey,
    PanicOnDefault, Promise,
};
use std::cmp::min;
use utils::utils;

mod external;

use external::*;

pub mod prices {
    use near_sdk::{Balance, Gas};

    pub const NO_DEPOSIT: Balance = 0;

    pub const FACTORY_CROSS_CALL: Gas = Gas(12_428_023_852_964);

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
    pub owner: AccountId,
    pub tokens: UnorderedMap<AccountId, TokenArgs>,
}

/// Structure to hold info about token
#[derive(Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct TokenArgs {
    owner_id: AccountId,
    total_supply: U128,
    metadata: FungibleTokenMetadata,
}

/// Token object that combines [AccountId] name and [TokenArgs]
#[derive(Serialize, Deserialize, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Token {
    account: AccountId,
    args: TokenArgs,
}

/// Smart-contract that used for: creating ft, transferring FT and $NEAR
#[near_bindgen]
impl FactoryContract {
    #[init]
    pub fn new(owner: AccountId) -> Self {
        Self {
            owner,
            tokens: UnorderedMap::new(StorageKey::Tokens),
        }
    }

    /// Create FT sub-account for user
    ///
    /// # Arguments
    ///
    /// * `name`: unique name (company name, for example)
    /// * `reference`: CID from IPFS
    ///
    /// returns: Promise
    ///
    #[payable]
    pub fn create_ft(&mut self, name: String, reference: String) -> Promise {
        let owner = env::current_account_id();
        let caller = env::predecessor_account_id();

        let subaccount_id = get_token_account_id(&caller);

        let initial_usage = env::storage_usage() as u128;
        let current_usage = env::storage_usage() as u128;

        let required =
            TOKEN_INIT_BALANCE + STORAGE_PRICE_PER_BYTE * (current_usage - initial_usage);

        log!(
            "Trying to create subaccount: {}. {} yoctoNEAR required as deposit",
            subaccount_id,
            required
        );

        require!(
            env::attached_deposit() >= required,
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
            owner_id: caller,
            total_supply: U128(0),
            metadata: metadata.clone(),
        };

        self.tokens.insert(&subaccount_id, &args);

        // We need to pass account_id to "owner_id" field so user can interact with it from his account
        Promise::new(subaccount_id.clone())
            .create_account()
            .transfer(TOKEN_INIT_BALANCE)
            .deploy_contract(CODE.to_vec())
            .function_call(
                "new".to_string(),
                json!({ "owner_id": owner.clone(), "metadata": metadata })
                    .to_string()
                    .as_bytes()
                    .to_vec(),
                NO_DEPOSIT,
                TOKEN_NEW,
            )
            .then(ext_self::get_token(
                subaccount_id,
                owner,
                NO_DEPOSIT,
                FACTORY_CROSS_CALL,
            ))
    }

    /// Makes transfer of FT by hand , can used only by owner of contract
    ///
    /// # Arguments
    ///
    /// * `sender_id`:
    /// * `receiver_id`:
    /// * `amount`:
    ///
    /// returns: Promise that transfers tokens
    ///
    pub fn force_transfer(
        &self,
        sender_id: AccountId,
        receiver_id: AccountId,
        amount: Balance,
    ) -> Promise {
        require!(
            self.owner == signer_account_id(),
            "You are not allowed to do that"
        );

        require!(
            self.get_token(&sender_id).is_some(),
            "This FT does not exist"
        );

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

    /// Get tokens with pagination
    ///
    /// # Arguments
    ///
    /// * `from_index`: Where to start pagination
    /// * `limit`: How many elements to include
    ///
    /// returns: List of tokens
    ///
    pub fn get_tokens(&self, from_index: u64, limit: u64) -> Vec<Token> {
        self.tokens
            .iter()
            .map(|(account, args)| Token { account, args })
            .collect()
    }

    /// Get token by account
    ///
    /// # Arguments
    ///
    /// * `account_id`:
    ///
    /// returns: [Token] object
    ///
    pub fn get_token(&self, account_id: &AccountId) -> Option<Token> {
        let ft = get_token_account_id(&account_id);

        Some(Token {
            args: self.tokens.get(&ft).expect("Token not found"),
            account: get_token_account_id(&ft),
        })
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

//this is the cross contract call that we call on our own contract.
// Fired as a last promise in the chain of create_ft method.
#[ext_contract(ext_self)]
trait ExtSelf {
    fn get_token(&mut self, account_id: AccountId) -> Option<Token>;
}
