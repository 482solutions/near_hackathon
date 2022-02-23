/// The core methods for a basic multi token. Extension standards may be
/// added in addition to this macro.
#[macro_export]
macro_rules! impl_multi_token_core {
    ($contract: ident, $token: ident) => {
        use $crate::multi_token::core::MultiTokenCore;
        use $crate::multi_token::core::MultiTokenResolver;

        #[near_bindgen]
        impl MultiTokenCore for $contract {
            #[payable]
            fn transfer(
                &mut self,
                receiver_id: AccountId,
                token_id: TokenId,
                amount: Balance,
                approval: Option<u64>,
            ) {
                self.$token.transfer(receiver_id, token_id, amount, approval)
            }

            #[payable]
            fn transfer_call(
                &mut self,
                receiver_id: AccountId,
                token_id: TokenId,
                amount: Balance,
                approval_id: Option<u64>,
                msg: String,
            ) -> PromiseOrValue<bool> {
                self.$token.transfer_call(receiver_id, token_id, amount, approval_id, msg)
            }

            fn token(&self, token_id: TokenId) -> Option<Token> {
                self.$token.token(token_id)
            }
            
            fn balance_of(&self, owner: AccountId, id: Vec<TokenId>) -> Vec<U128> { todo!() }
            
            fn approval_for_all(&mut self, owner_id: AccountId, approved: bool) { todo!() }
        }



        #[near_bindgen]
        impl MultiTokenResolver for $contract {
            #[private]
            fn resolve_transfer(
                &mut self,
                sender_id: AccountId,
                receiver_id: AccountId,
                token_id: TokenId,
                amount: U128
            ) -> U128 {
                self.$token.resolve_transfer(
                    sender_id,
                    receiver_id,
                    token_id,
                    amount
                )
            }
        }
    };
}

/// Multi token approval management allows for an escrow system where
/// multiple approvals per token exist.
#[macro_export]
macro_rules! impl_multi_token_approval {
    ($contract: ident, $token: ident) => {
        use $crate::multi_token::approval::MultiTokenApproval;

        #[near_bindgen]
        impl MultiTokenApproval for $contract {
            #[payable]
            fn approve(
                &mut self,
                account_id: AccountId,
                token_id: TokenId,
                amount: Balance,
                msg: Option<String>,
            ) -> Option<Promise> {
                self.$token.approve(account_id, token_id, amount, msg)
            }

            #[payable]
            fn revoke(&mut self, token_id: TokenId, account_id: AccountId) {
                self.$token.revoke(token_id, account_id)
            }

            #[payable]
            fn revoke_all(&mut self, token_id: TokenId) {
                self.$token.revoke_all(token_id)
            }

            fn is_approved(
                &self,
                token_id: TokenId,
                approved_account_id: AccountId,
                amount: Balance,
                approval: Option<u64>,
            ) -> bool {
                self.$token.is_approved(token_id, approved_account_id, amount, approval)
            }
        }
    };
}

// TODO: Enumeration impl macro