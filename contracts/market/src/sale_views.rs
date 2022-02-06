use crate::*;

/// Views. Used to retrieve information from market
#[near_bindgen]
impl Contract {
    /// Returns the number of sales the marketplace has up (as a string)
    pub fn get_supply_asks(&self) -> U64 {
        //returns the sales object length wrapped as a U64
        U64(self.asks.len())
    }

    /// Returns the number of sales the marketplace has up (as a string)
    pub fn get_supply_bids(&self) -> U64 {
        //returns the sales object length wrapped as a U64
        U64(self.bids.len())
    }

    /// Returns the number of asks for a given account (result is a string)
    pub fn get_supply_by_owner_id(&self, account_id: AccountId, position: Position) -> U64 {
        let by_owner_id: Option<UnorderedSet<ContractAndId>>;
        //get the set of sales for the given owner Id

        match position {
            Position::Ask => {
                by_owner_id = self.asks_by_owner_id.get(&account_id);
            }
            Position::Bid => {
                by_owner_id = self.bids_by_owner_id.get(&account_id);
            }
        }

        //if their as some set, we return the length but if there wasn't a set, we return 0
        if let Some(by_owner_id) = by_owner_id {
            U64(by_owner_id.len())
        } else {
            U64(0)
        }
    }

    /// Returns paginated ask objects for a given account. (result is a vector of ask)
    pub fn get_asks_by_owner_id(
        &self,
        account_id: AccountId,
        from_index: Option<U128>,
        limit: Option<u64>,
    ) -> Vec<Ask> {
        //get the set of token IDs for sale for the given account ID
        let by_owner_id = self.asks_by_owner_id.get(&account_id);
        //if there was some set, we set the sales variable equal to that set. If there wasn't, sales is set to an empty vector
        let asks = if let Some(by_owner_id) = by_owner_id {
            by_owner_id
        } else {
            return vec![];
        };

        //we'll convert the UnorderedSet into a vector of strings
        let keys = asks.as_vector();

        //where to start pagination - if we have a from_index, we'll use that - otherwise start from 0 index
        let start = u128::from(from_index.unwrap_or(U128(0)));

        //iterate through the keys vector
        keys.iter()
            //skip to the index we specified in the start variable
            .skip(start as usize)
            //take the first "limit" elements in the vector. If we didn't specify a limit, use 0
            .take(limit.unwrap_or(0) as usize)
            //we'll map the token IDs which are strings into Sale objects
            .map(|id| self.asks.get(&id).unwrap())
            //since we turned the keys into an iterator, we need to turn it back into a vector to return
            .collect()
    }

    /// Returns paginated bids objects for a given account. (result is a vector of bid)
    pub fn get_bids_by_owner_id(
        &self,
        account_id: AccountId,
        from_index: Option<U128>,
        limit: Option<u64>,
    ) -> Vec<Bid> {
        //get the set of token IDs for sale for the given account ID
        let by_owner_id = self.bids_by_owner_id.get(&account_id);
        //if there was some set, we set the sales variable equal to that set. If there wasn't, sales is set to an empty vector
        let bids = if let Some(by_owner_id) = by_owner_id {
            by_owner_id
        } else {
            return vec![];
        };

        //we'll convert the UnorderedSet into a vector of strings
        let keys = bids.as_vector();

        //where to start pagination - if we have a from_index, we'll use that - otherwise start from 0 index
        let start = u128::from(from_index.unwrap_or(U128(0)));

        //iterate through the keys vector
        keys.iter()
            //skip to the index we specified in the start variable
            .skip(start as usize)
            //take the first "limit" elements in the vector. If we didn't specify a limit, use 0
            .take(limit.unwrap_or(0) as usize)
            //we'll map the token IDs which are strings into Sale objects
            .map(|id| self.bids.get(&id).unwrap())
            //since we turned the keys into an iterator, we need to turn it back into a vector to return
            .collect()
    }

    /// Get a ask information for a given unique ask ID (contract + DELIMITER + uuid)
    pub fn get_ask(&self, id: ContractAndId) -> Option<Ask> {
        //try and get the sale object for the given unique sale ID. Will return an option since
        //we're not guaranteed that the unique sale ID passed in will be valid.
        self.asks.get(&id)
    }

    /// Get a bid information for a given unique bid ID (contract + DELIMITER + uuid)
    pub fn get_bid(&self, id: ContractAndId) -> Option<Bid> {
        //try and get the sale object for the given unique sale ID. Will return an option since
        //we're not guaranteed that the unique sale ID passed in will be valid.
        self.bids.get(&id)
    }
}
