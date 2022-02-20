use crate::multi_token::token::TokenId;
use near_sdk::{AccountId, Balance};
use std::collections::HashMap;

/// `resolve_transfer` will be called after `on_transfer`
pub trait MultiTokenResolver {
    /// Finalizes chain of cross-contract calls that started from `transfer_call`
    ///
    /// Flow:
    ///
    /// 1. Sender calls `transfer_call` on MT contract
    /// 2. MT contract transfers tokens from sender to receiver
    /// 3. MT contract calls `on_transfer` on receiver contract
    /// 4+. [receiver may make cross-contract calls]
    /// N. MT contract resolves chain with `resolve_transfer` and may do anything
    ///
    /// Requirements:
    /// * Contract MUST forbid calls to this function by any account except self
    /// * If promise chain failed, contract MUST revert tokens transfer
    /// * If promise chain resolves with `true`, contract MUST return tokens to
    ///   `sender_id`
    ///
    /// Arguments:
    /// * `previous_owner_id`: the owner prior to the call to `nft_transfer_call`
    /// * `receiver_id`: the `receiver_id` argument given to `nft_transfer_call`
    /// * `token_id`: the `token_id` argument given to `ft_transfer_call`
    /// * `amount`: the amount of tokens that transfers
    /// * `approvals`: if using Approval Management, contract MUST provide
    ///   set of original approved accounts in this argument, and restore these
    ///   approved accounts in case of revert.
    ///
    /// Returns true if token was successfully transferred to `receiver_id`.
    fn resolve_transfer(
        &mut self,
        previous_owner_id: AccountId,
        receiver: AccountId,
        token_id: TokenId,
        amount: Balance,
        approvals: Option<HashMap<AccountId, u64>>,
    ) -> bool;
}
