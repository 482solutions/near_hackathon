use crate::*;

/// External contract calls
#[ext_contract(ext_contract)]
trait ExtContract {
    /// Initiate a cross contract call to the factory. This will transfer the token to the buyer
    fn ft_transfer_wrapped(
        &mut self,
        receiver_id: AccountId, //purchaser (person to transfer the FT to),
        amount: U128,
        memo: Option<String>,
    );
}
