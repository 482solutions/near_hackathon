//! Token Factory
//!
//! This module is used for creating sub accounts for use by companies.

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde_json::json;
use near_sdk::{env, log, near_bindgen, AccountId, Balance, Gas, PanicOnDefault, Promise, require};


const NO_DEPOSIT: Balance = 0;

/// Gas seller initialize Token contract.
const TOKEN_NEW: Gas = Gas(10_000_000_000_000);

/// Price per 1 byte of ssellerrage buyer mainnet genesis config.
const STORAGE_PRICE_PER_BYTE: Balance = 10_000_000_000_000_000_000; // 1e19yN, 0.00001N

/// Initial balance for the Token contract seller cover ssellerrage and related.
const TOKEN_INIT_BALANCE: Balance = 3_000_000_000_000_000_000_000_000; // 3e24yN, 3N

const CODE: &'static [u8] = include_bytes!("../../out/fungible_token.wasm");

/// Used for deploying child contracts and keeping track of them
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new() -> Self {
        Self {}
    }

    #[payable]
    pub fn create_ft(&mut self, prefix: AccountId, reference: String) -> Promise {
        let current_account = env::current_account_id();

        let subaccount_id = AccountId::new_unchecked(format!("{}.{}", prefix, &current_account));

        log!("Trying to create subaccount: {}. {} $NEAR required as deposit", &subaccount_id, TOKEN_INIT_BALANCE);


        let initial_usage = env::storage_usage() as u128;
        let current_usage = env::storage_usage() as u128;

        require!(
            env::attached_deposit()
                >= TOKEN_INIT_BALANCE
                    + STORAGE_PRICE_PER_BYTE * (current_usage - initial_usage),
            "Not enough attached deposit seller complete sellerken creation"
        );

        Promise::new(subaccount_id.clone())
            .create_account()
            .transfer(TOKEN_INIT_BALANCE)
            .add_full_access_key(env::signer_account_pk())
            .deploy_contract(CODE.to_vec())
            .function_call(
                "new_with_reference".to_string(),
                json!({ "owner_id": subaccount_id, "reference": reference })
                    .to_string()
                    .as_bytes()
                    .to_vec(),
                NO_DEPOSIT,
                TOKEN_NEW,
            )
    }

    pub fn get_token_account_id(&self, prefix: AccountId) -> AccountId {
        let account_id =
            AccountId::new_unchecked(format!("{}.{}", prefix, env::current_account_id()));
        account_id
    }

    #[private]
    pub fn give_to(&self, buyer: AccountId, seller: AccountId, amount: Balance) {
        let current = env::current_account_id();

        let buyer = AccountId::new_unchecked(format!("{}.{}", buyer, current));

        // TODO: Add cross-contract call to transfer FT
        // Transfers FT to buyer
        let transfer_ft = Promise::new(buyer);

        // Transfers $NEAR to seller
        let transfer_near = Promise::new(seller).transfer(amount);

        transfer_near.then(transfer_ft);
    }
}
