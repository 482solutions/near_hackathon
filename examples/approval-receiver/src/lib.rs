use near_sdk::{near_bindgen, borsh::{self, BorshDeserialize, BorshSerialize}, PanicOnDefault, AccountId, env, PromiseOrValue};
use nep_246::multi_token::{approval::MultiTokenApprovalReceiver, token::TokenId};


#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    
}

#[near_bindgen]
impl Contract {
    /*
        initialization function (can only be called once).
        this initializes the contract with default data and the owner ID
        that's passed in
    */
    #[init]
    pub fn new() -> Self {
        Self {
            
        }
    }
}

#[near_bindgen]
impl MultiTokenApprovalReceiver for Contract {
    fn on_approve(
        &mut self,
        tokens: Vec<TokenId>,
        owner_id: AccountId,
        approval_id: u64,
        msg: String,
    ) -> PromiseOrValue<String> {

        env::log_str(format!("Tokens: {:?} Owner: {}, approval_id: {}", tokens, owner_id, approval_id).as_str());
        env::log_str(&msg);

        PromiseOrValue::Value("yeeeeeeeeeeeeeeee".to_string())
    }
}