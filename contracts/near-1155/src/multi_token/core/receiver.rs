use crate::multi_token::token::TokenId;
use near_sdk::{AccountId, Balance, PromiseOrValue};

/// Used when a MT is transferred using `transfer_call`. This trait should be implemented on receiving contract
pub trait MultiTokenReceiver {
    /// Take some action after receiving a multi-token's
    ///
    /// ## Requirements:
    /// * Contract MUST restrict calls to this function to a set of whitelisted NFT
    ///   contracts
    ///
    /// ## Arguments:
    /// * `sender_id`: the sender of `transfer_call`
    /// * `previous_owner_id`: the account that owned the NFT prior to it being
    ///   transferred to this contract, which can differ from `sender_id` if using
    ///   Approval Management extension
    /// * `token_id`: the `token_id` argument given to `nft_transfer_call`
    /// * `msg`: information necessary for this contract to know how to process the
    ///   request. This may include method names and/or arguments.
    ///
    /// Returns true if token should be returned to `sender_id`
    fn on_transfer(
        &mut self,
        sender_id: AccountId,
        previous_owner_id: AccountId,
        token_id: TokenId,
        amount: Balance,
        msg: String,
    ) -> PromiseOrValue<bool>;
}
