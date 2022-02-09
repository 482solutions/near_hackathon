use crate::*;

/// External contract calls
#[ext_contract(ext_ft)]
trait ExtContract {
    /// Initiate a cross contract call to the factory. This will transfer the token to the buyer
    fn force_transfer(
        &mut self,
        sender_id: AccountId, // seller of FT, used to check if this account really possess this amount of tokens
        receiver_id: AccountId, // purchaser (person to transfer the FT to),
        amount: Balance,
    ) -> Promise;
}
