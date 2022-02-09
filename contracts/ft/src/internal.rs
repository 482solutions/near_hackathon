use crate::*;

impl Contract {
    pub fn register_resolve(&mut self, account_id: &AccountId) {
        require!(
            is_valid_account_id(account_id.as_bytes()),
            "Account id is not valid"
        );
        log!("User {} is not registered yet. Doing it now", account_id);
        self.token.internal_register_account(account_id);
    }
}
