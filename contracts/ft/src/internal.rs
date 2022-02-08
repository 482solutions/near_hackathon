use crate::*;

impl Contract {
    pub fn register_resolve(&mut self, account_id: &AccountId) {
        log!("User {} is not registered yet. Doing it now", account_id);
        self.token.internal_register_account(account_id);
    }
}
