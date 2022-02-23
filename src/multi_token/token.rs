use crate::multi_token::metadata::TokenMetadata;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
pub use near_sdk::{AccountId, Balance};
use std::collections::HashMap;

/// Type alias for convenience
pub type TokenId = String;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, BorshDeserialize, BorshSerialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Approval {
    pub amount: u128,
    pub approval_id: u64,
}

/// Info on individual token
#[derive(Debug, BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
pub struct Token {
    pub token_id: String,
    pub owner_id: AccountId,
    /// Total amount generated
    pub supply: u128,
    pub balances: HashMap<AccountId, Balance>,
    pub metadata: Option<TokenMetadata>,
    pub approvals: Option<HashMap<AccountId, Approval>>,
    pub next_approval_id: Option<u64>,
}
