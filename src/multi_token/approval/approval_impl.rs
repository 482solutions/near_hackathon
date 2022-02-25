

use near_sdk::{assert_one_yocto, env, ext_contract, AccountId, Balance, Promise, require};


use crate::multi_token::{
    core::{MultiToken, GAS_FOR_MT_TRANSFER_CALL},
    token::{Approval, TokenId},
    utils::{bytes_for_approved_account_id, expect_approval, refund_deposit, Entity, unauthorized_assert},
};

use super::MultiTokenApproval;

const NO_DEPOSIT: Balance = 0;

#[ext_contract(ext_approval_receiver)]
pub trait MultiTokenReceiver {
    fn on_approve(&mut self, tokens: Vec<TokenId>, owner_id: AccountId, approval_id: u64, msg: String);
}

impl MultiTokenApproval for MultiToken {
    fn approve(
        &mut self,
        account_id: AccountId,
        token_id: TokenId,
        amount: Balance,
        msg: Option<String>,
    ) -> Option<Promise> {
        // Get actual owner and caller
        let owner_id = self.owner_by_id.get(&token_id).expect("This token does not exist");

        // Check if caller is authorized
        unauthorized_assert(&owner_id);

        // Get the balance to check if user have enough tokens
        let balance = self.balances_per_token.get(&token_id).unwrap().get(&owner_id).unwrap_or(0);

        require!(balance >= amount, "Not enough balance to approve");

        // Unwrap to check if approval supported
        let approvals_by_id = expect_approval(self.approvals_by_id.as_mut(), Entity::Token);

        // Get some IDs and check if approval management supported both for contract & token
        let next_id = expect_approval(self.next_approval_id_by_id.as_mut(), Entity::Token);
        let mut current_next_id =
            expect_approval(next_id.get(&token_id), Entity::Token);

        let new_approval = Approval { amount, approval_id: current_next_id };
        env::log_str(format!("New approva: {:?}", new_approval).as_str());

        // Get approvals for this token
        let approvals = &mut approvals_by_id.get(&token_id).unwrap_or_default();
        let old_approval_id = approvals.insert(account_id.clone(), new_approval);

        approvals_by_id.insert(&token_id, approvals);

        env::log_str(format!("Updated approvals by id: {:?}", old_approval_id).as_str());

        let used_storage =
            if old_approval_id.is_none() { bytes_for_approved_account_id(&account_id) } else { 0 };

        refund_deposit(used_storage);

        current_next_id += 1;

        msg.map(|msg| {
            ext_approval_receiver::on_approve(
                vec![token_id],
                owner_id,
                current_next_id,
                msg,
                account_id,
                NO_DEPOSIT,
                env::prepaid_gas() - GAS_FOR_MT_TRANSFER_CALL,
            )
        })
    }

    fn revoke(&mut self, token: TokenId, account: AccountId) {
        assert_one_yocto();
        
        // It's impossible that token does not have owner, so i'll just unwrap the value
        let owner = self.owner_by_id.get(&token).unwrap();

        unauthorized_assert(&owner);

        // Get all approvals for token, will panic if approval extension is not used for contract or token
        let approvals = expect_approval(self.approvals_by_id.as_mut(), Entity::Contract);
        let mut approvals_by_token = expect_approval(approvals.get(&token), Entity::Token);

        // Remove approval for user & also clean map to save space it it's empty
        approvals_by_token.remove(&account);
        
        if approvals_by_token.is_empty() {
            approvals.remove(&token);
        }
    }

    fn revoke_all(&mut self, token: TokenId) {
        todo!()
    }

    fn is_approved(
        &self,
        token: TokenId,
        approved_account: AccountId,
        amount: Balance,
        approval: Option<u64>,
    ) -> bool {
        let approvals = expect_approval(self.approvals_by_id.as_ref(), Entity::Contract);


        env::log_str(format!("{:?}", approvals).as_str());

        let by_token = approvals.get(&token).unwrap_or_default();

        match by_token.get(&approved_account) {
            Some(approve) => {
                if approve.amount.eq(&amount) {
                    match approval {
                        Some(approval) => approve.approval_id.eq(&approval),
                        None => true,
                    }
                } else {
                    false
                }
            },
            None => false
        } 
    }
}
