use crate::multi_token::metadata::TokenMetadata;
use near_sdk::serde::{Deserialize, Serialize};
pub use near_sdk::{AccountId, Balance};
use std::collections::HashMap;

/// Type alias for convenience
pub type TokenId = String;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub struct Approval {
    amount: u128,
    approval_id: u128,
}

/// Info on individual token
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(crate = "near_sdk::serde")]
pub struct Token {
    pub token_id: String,
    pub owner_id: AccountId,
    /// Total amount generated
    pub supply: u128,
    pub balances: HashMap<AccountId, Balance>,
    pub metadata: Option<TokenMetadata>,
    pub approvals: Option<HashMap<AccountId, Approval>>,
    pub next_approval_id: u128,
}
