//! Token Factory
//!
//! This module is used for creating sub accounts for use by companies.

use crate::prices::TOKEN_INIT_BALANCE;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde_json::json;
use near_sdk::{
    env, ext_contract, log, near_bindgen, require, AccountId, Balance, Gas, PanicOnDefault, Promise,
};
use utils::utils;

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

static CODE: &[u8] = include_bytes!("../../out/fungible_token.wasm");

use prices::*;

#[ext_contract(ext_self)]
pub trait ExtSelf {
    fn callback_register() -> bool;
}

#[ext_contract(ext_ft)]
pub trait FT {
    fn is_registered(&self, account_id: AccountId) -> bool;
    fn register(&self, account_id: AccountId);
}

/// Used for deploying child contracts and keeping track of them
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct FactoryContract {}

/// Smart-contract that used for: creating ft, transferring FT and $NEAR
#[near_bindgen]
impl FactoryContract {
    /// Creates subaccount for user
    ///
    /// # Arguments
    ///
    /// * `account_id` - Name of account that wants to create FT, should be in format user.testnet/mainnet
    ///
    #[init]
    #[payable]
    pub fn create_ft(&mut self, reference: String) -> Promise {
        let account_id = env::current_account_id();

        let subaccount_id = self.get_token_account_id();

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

        // We need to pass account_id to "owner_id" field so user can interact with it from his acccount
        Promise::new(subaccount_id)
            .create_account()
            .transfer(TOKEN_INIT_BALANCE)
            .add_full_access_key(env::signer_account_pk())
            .deploy_contract(CODE.to_vec())
            .function_call(
                "new_with_reference".to_string(),
                json!({ "owner_id": account_id, "reference": reference })
                    .to_string()
                    .as_bytes()
                    .to_vec(),
                NO_DEPOSIT,
                TOKEN_NEW,
            )
    }

    /// Will make cross-contract call to FT contract
    pub fn check_registered(&mut self, to_check: AccountId) -> Promise {
        let current_account = env::current_account_id();
        let ft_contract = self.get_token_account_id();
        ext_ft::is_registered(to_check, ft_contract, NO_DEPOSIT, FACTORY_CROSS_CALL).then(
            ext_self::callback_register(current_account, NO_DEPOSIT, FACTORY_CROSS_CALL),
        )
    }

    /// Callback to resolve Promise result and pass it on
    #[private]
    pub fn callback_register(&mut self) -> bool {
        utils::resolve_promise_bool()
    }

    pub fn get_token_account_id(&self) -> AccountId {
        AccountId::new_unchecked(format!("{}.{}", "ft", env::current_account_id()))
    }

    /// Used to transfer $NEAR to buyer and transfer FT to seller
    ///
    /// Typically, should be cross-contract called by market.
    ///
    /// # Arguments
    ///
    /// * `buyer` - Account to transfer FT to, should contain postfix
    /// * `seller` - Account to tranfer $NEAR to, should contain prefix
    /// * `amount_near` - Amount of $NEAR to transfer
    /// * `amount_ft` - Respectively amount of FT to transfer
    ///
    #[private]
    pub fn give_to(
        &mut self,
        buyer: AccountId,
        seller: AccountId,
        amount_near: Balance,
        amount_ft: Balance,
    ) -> Promise {
        let splitted = utils::split_account(&seller);

        let prefix = AccountId::new_unchecked(splitted[0].to_string());

        let seller_subaccount = self.get_token_account_id();

        // First we check if buyer is registered in seller FT contract
        // and if not - register him
        let check_register = self.check_registered(buyer.clone()).then(ext_ft::register(
            buyer,
            seller_subaccount,
            NO_DEPOSIT,
            FACTORY_CROSS_CALL,
        ));

        // TODO: Add actual Promise for that
        // Then we can transfer FT to buyer

        // Transfers $NEAR to seller
        let transfer_near = Promise::new(seller).transfer(amount_near);

        check_register.then(transfer_near)
    }
}
