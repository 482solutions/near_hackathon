mod approval_impl;
mod receiver;

pub use approval_impl::*;
pub use receiver::*;

use crate::multi_token::token::TokenId;
use near_sdk::{AccountId, Balance, Promise};

/// Trait used in approval management
/// Specs - https://github.com/shipsgold/NEPs/blob/master/specs/Standards/MultiToken/ApprovalManagement.md
pub trait MultiTokenApproval {
    /// Add an approved account for a specific set of tokens
    fn approve(
        &mut self,
        account_id: AccountId,
        token_id: TokenId,
        amount: Balance,
        msg: Option<String>
    ) -> Option<Promise>;

    /// Revoke an approve for specific token
    fn revoke(&mut self, token: TokenId, account: AccountId);

    /// Revoke all approves for a token
    fn revoke_all(&mut self, token: TokenId);

    /// Check if account have access to transfer tokens
    fn is_approved(
        &self,
        token: TokenId,
        approved_account: AccountId,
        amount: Balance,
        approval: Option<u64>,
    ) -> bool;
}
