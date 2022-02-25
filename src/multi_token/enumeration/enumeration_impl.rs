use std::collections::HashMap;

use near_sdk::{AccountId, require};

use crate::multi_token::{core::MultiToken, token::{Token, TokenId}};

use super::MultiTokenEnumeration;

impl MultiToken {
    fn enum_get_token(&self, owner_id: AccountId, token_id: TokenId) -> Token {
        let metadata = self.token_metadata_by_id.as_ref().unwrap().get(&token_id);
        let approved_account_ids =
            Some(self.approvals_by_id.as_ref().unwrap().get(&token_id).unwrap_or_default());
        let supply = self.total_supply.get(&token_id).unwrap();
        let approvals = self.approvals_by_id.as_ref().unwrap().get(&token_id);
        let next_approval_id = self.next_approval_id_by_id.as_ref().unwrap().get(&token_id);

        Token { token_id, owner_id, metadata, approvals, supply, balances: HashMap::new(), next_approval_id }
    }
}

impl MultiTokenEnumeration for MultiToken {
    fn tokens(&self, from_index: Option<u64>, limit: u64) -> Vec<Token> {
        let from_index = from_index.unwrap_or(0);

        require!(self.owner_by_id.len() > from_index, "Out of bounds");

        require!(limit !=0, "Limit cannot be 0");

        self.owner_by_id
        .iter()
        .skip(from_index as usize)
        .take(limit as usize)
        .map(|(token_id, owner_id)| self.enum_get_token(owner_id, token_id))
        .collect()
    }

    fn token_by_owner(&self, account_id: AccountId, from_index: Option<u64>, limit: u64) -> Vec<Token> {
        let tokens_per_owner = self.tokens_per_owner.as_ref().expect("Could not find field");

        let token_set = if let Some(set) = tokens_per_owner.get(&account_id) {
            set
        } else {
            return vec![];
        };

        require!(limit != 0, "Limit cannot be 0");
        let from_index = from_index.unwrap_or(0);

        require!(token_set.len() > from_index, "Out of bounds");

        token_set
        .iter()
        .skip(from_index as usize)
        .take(limit as usize)
        .map(|token_id| self.enum_get_token(account_id.clone(), token_id))
        .collect()
    }
}