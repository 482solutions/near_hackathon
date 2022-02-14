/*! Multi-Token Implementation (ERC-1155)

*/

use crate::multi_token::token::TokenId;
use near_sdk::collections::Vector;
use near_sdk::json_types::U128;
use near_sdk::{AccountId, Balance};

/// Describes functionality according to this - https://eips.ethereum.org/EIPS/eip-1155
/// And this - https://github.com/shipsgold/NEPs/blob/master/specs/Standards/MultiToken/Core.md
pub trait MultiTokenCore {
    /// Make a single transfer
    ///
    /// # Arguments
    ///
    /// * `from`:
    /// * `to`:
    /// * `id`:
    /// * `amount`:
    ///
    /// returns: ()
    ///
    fn transfer(
        &mut self,
        to: AccountId,
        id: Vector<TokenId>,
        amount: Vector<Balance>,
        approval: Option<u128>,
    );

    fn approval_for_all(&mut self, owner: AccountId, approved: bool);

    fn balance_of(&self, owner: AccountId, id: Vector<TokenId>) -> Vector<Balance>;
}
