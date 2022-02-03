use near_sdk::ext_contract;

/// External contract calls
#[ext_contract(ext_contract)]
pub trait ExtContract {
    /// Initiate a cross contract call to the factory. This will transfer the token to the buyer
    fn ft_transfer(
        &mut self,
        receiver_id: AccountId, //purchaser (person to transfer the FT to),
        amount: Balance,
    );
}
