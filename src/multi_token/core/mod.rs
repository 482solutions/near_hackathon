/*! Multi-Token Implementation (ERC-1155)

*/

mod core_impl;
mod receiver;
mod resolver;

pub use self::core_impl::*;

pub use self::receiver::*;
pub use self::resolver::*;

use crate::multi_token::token::TokenId;
use near_sdk::{AccountId, Balance, PromiseOrValue};

use super::token::Token;

/// Describes functionality according to this - https://eips.ethereum.org/EIPS/eip-1155
/// And this - <https://github.com/shipsgold/NEPs/blob/master/specs/Standards/MultiToken/Core.md>
pub trait MultiTokenCore {
    /// Make a single transfer
    ///
    /// # Arguments
    ///
    /// * `receiver_id`: Receiver of tokens
    /// * `token_id`: ID of token to send from
    /// * `amount`: How much to send
    ///
    /// returns: ()
    ///
    fn transfer(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        amount: Balance,
        approval: Option<u64>,
    );

    /// Transfer MT and call a method on receiver contract. A successful
    /// workflow will end in a success execution outcome to the callback on the MT
    /// contract at the method `resolve_transfer`.
    ///
    /// # Arguments
    ///
    /// * `receiver_id`: NEAR account receiving MT
    /// * `token_id`: Token to send
    /// * `amount`: How much to send
    /// * `approval_id`: ID of approval for signer
    /// * `memo`: Used as context
    /// * `msg`: Additional msg that will be passed to receiving contract
    ///
    /// returns: PromiseOrValue<bool>
    ///
    fn transfer_call(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        amount: Balance,
        approval_id: Option<u64>,
        msg: String,
    ) -> PromiseOrValue<bool>;

    fn approval_for_all(&mut self, owner: AccountId, approved: bool);

    /// Get balance of user in specified tokens
    ///
    /// # Arguments
    /// 
    /// * `owner`: Account to check
    /// # `id`: Vector of token IDs
    fn balance_of(&self, owner: AccountId, id: Vec<TokenId>) -> Vec<u128>;


    /// Get all possible info about token
    fn token(&self, token_id: TokenId) -> Option<Token>;
}
