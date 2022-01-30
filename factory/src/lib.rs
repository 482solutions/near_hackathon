//! Token Factory
//!
//! This module is used for creating sub accounts for use by companies.
//! And also to keep track of them

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedSet;
use near_sdk::{env, near_bindgen, require, AccountId, Balance, Gas, PanicOnDefault, Promise};

const NO_DEPOSIT: Balance = 0;

/// Gas to initialize Token contract.
const TOKEN_NEW: Gas = Gas(10_000_000_000_000);

const CODE: &'static [u8] = include_bytes!("../../out/fungible_token.wasm");

/// Used for deploying child contracts and keeping track of them
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub deployed: UnorderedSet<AccountId>,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new() -> Self {
        Self {
            deployed: UnorderedSet::new(b"d".to_vec()),
        }
    }

    // TODO: Add gas charges based on storage usage
    // https://github.com/aurora-is-near/rainbow-token-connector/blob/ce7640da144f000e0a93b6d9373bbc2514e37f3b/bridge-token-factory/src/lib.rs#L323
    pub fn create_ft(&mut self, prefix: AccountId, reference: String) -> Promise {
        let subaccount_id =
            AccountId::new_unchecked(format!("{}.{}", prefix, env::current_account_id()));

        require!(
            !self.deployed.contains(&prefix),
            "Token contract already exists"
        );

        self.deployed.insert(&prefix);

        Promise::new(subaccount_id)
            .create_account()
            .add_full_access_key(env::signer_account_pk())
            .deploy_contract(CODE.to_vec())
            .function_call(
                "new".to_string(),
                format!("{{ 'reference': '{}' }}", reference)
                    .bytes()
                    .collect(),
                NO_DEPOSIT,
                TOKEN_NEW,
            )
    }

    pub fn get_token_account_id(&self, prefix: AccountId) -> AccountId {
        require!(
            self.deployed.contains(&prefix),
            "Token with such prefix does not exists"
        );

        let account_id =
            AccountId::new_unchecked(format!("{}.{}", prefix, env::current_account_id()));
        account_id
    }

    #[private]
    pub fn give_to(&self, from: AccountId, to: AccountId, amount: Balance) {
        let current = env::current_account_id();

        let from = AccountId::new_unchecked(format!("{}.{}", from, current));
        let to = AccountId::new_unchecked(format!("{}.{}", to, current));

        // TODO: Add cross-contract call to transfer FT
        let transfer_tokens = Promise::new(from);
        let transfer_near = Promise::new(to).transfer(amount);

        transfer_near.then(transfer_tokens);
    }
}
