mod receiver;

use crate::multi_token::token::TokenId;
use near_sdk::collections::Vector;
use near_sdk::{AccountId, Balance, PromiseOrValue};

use receiver::*;

/// Trait used in approval management
/// Specs - https://github.com/shipsgold/NEPs/blob/master/specs/Standards/MultiToken/ApprovalManagement.md
pub trait MultiTokenApproval {
    /// Add an approved account for a specific set of tokens
    fn approve(
        &mut self,
        account: AccountId,
        tokens: Vector<TokenId>,
        amounts: Vector<Balance>,
    ) -> PromiseOrValue<()>;

    /// Revoke an approve for specific token
    fn revoke(&mut self, tokens: Vector<TokenId>, account: AccountId);

    /// Revoke all approves for a token
    fn revoke_all(&mut self, tokens: Vector<TokenId>);

    /// Check if account have access to transfer tokens
    fn is_approved(
        &self,
        tokens: Vector<TokenId>,
        approved_account: AccountId,
        amounts: Vector<Balance>,
        approvals: Vector<Option<u128>>,
    ) -> bool;
}
