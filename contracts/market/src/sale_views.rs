use crate::*;

/// Response for ask views
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct AskResponse {
    pub id: TokenId,
    pub ask: Ask,
}

/// Response for bid views
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct BidResponse {
    pub id: TokenId,
    pub bid: Bid,
}

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

    /// Get number of [Position]s by [AccountId]
    ///
    /// # Arguments
    ///
    /// * `account_id`:
    /// * `position`: [Position]
    ///
    /// returns: U64
    ///
    pub fn get_supply_by_owner_id(&self, account_id: AccountId, position: Position) -> U64 {
        let by_owner_id: Option<UnorderedSet<TokenId>>;
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

    /// Get paginated list of [Ask]s for specified user
    ///
    /// # Arguments
    ///
    /// * `account_id`: [AccountId]
    /// * `from`:
    /// * `limit`:
    ///
    /// returns: Vec<Ask, Global>
    ///
    pub fn get_asks_by_owner_id(
        &self,
        account_id: AccountId,
        from: Option<u128>,
        limit: Option<u64>,
    ) -> Vec<AskResponse> {
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
        let start = from.unwrap_or(0);

        //iterate through the keys vector
        keys.iter()
            //skip to the index we specified in the start variable
            .skip(start as usize)
            //take the first "limit" elements in the vector. If we didn't specify a limit, use 0
            .take(limit.unwrap_or(0) as usize)
            //we'll map the token IDs which are strings into Sale objects
            .map(|id| {
                log!("Searching id: {}", id);
                let ask = self.asks.get(&id).unwrap();
                AskResponse { id, ask }
            })
            //since we turned the keys into an iterator, we need to turn it back into a vector to return
            .collect()
    }

    /// Get paginated list of [Bid]s
    ///
    /// # Arguments
    ///
    /// * `from`:
    /// * `limit`i:
    ///
    /// returns: List of bids
    ///
    pub fn get_bids(&self, from: Option<u128>, limit: Option<u64>) -> Vec<BidResponse> {
        //where to start pagination - if we have a from_index, we'll use that - otherwise start from 0 index
        let start = from.unwrap_or(0);

        //iterate through the keys vector
        self.bids
            .iter()
            //skip to the index we specified in the start variable
            .skip(start as usize)
            //take the first "limit" elements in the vector. If we didn't specify a limit, use 0
            .take(limit.unwrap_or(0) as usize)
            .map(|(id, bid)| BidResponse { id, bid })
            //since we turned the keys into an iterator, we need to turn it back into a vector to return
            .collect()
    }

    /// Get paginated list of [Ask]s
    ///
    /// # Arguments
    ///
    /// * `from`:
    /// * `limit`:
    ///
    /// returns: List of asks
    ///  
    pub fn get_asks(&self, from: Option<u128>, limit: Option<u64>) -> Vec<AskResponse> {
        //where to start pagination - if we have a from_index, we'll use that - otherwise start from 0 index
        let start = from.unwrap_or(0);

        //iterate through the keys vector
        self.asks
            .iter()
            //skip to the index we specified in the start variable
            .skip(start as usize)
            //take the first "limit" elements in the vector. If we didn't specify a limit, use 0
            .take(limit.unwrap_or(0) as usize)
            .map(|(id, ask)| AskResponse { id, ask })
            //since we turned the keys into an iterator, we need to turn it back into a vector to return
            .collect()
    }

    /// Get paginated list of [Bid]s for specified user
    ///
    /// # Arguments
    ///
    /// * `account_id`: [AccountId]
    /// * `from`:
    /// * `limit`:
    ///
    /// returns: Vec<Ask, Global>
    ///
    pub fn get_bids_by_owner_id(
        &self,
        account_id: AccountId,
        from: Option<u128>,
        limit: Option<u64>,
    ) -> Vec<BidResponse> {
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
        let start = from.unwrap_or(0);

        let limit = (limit.unwrap_or(0)) as usize;

        //iterate through the keys vector
        keys.iter()
            //skip to the index we specified in the start variable
            .skip(start as usize)
            //take the first "limit" elements in the vector. If we didn't specify a limit, use 0
            .take(limit)
            //we'll map the token IDs which are strings into Sale objects
            .map(|id| {
                log!("Searching id: {}", id);
                let bid = self.bids.get(&id).unwrap();
                BidResponse { id, bid }
            })
            //since we turned the keys into an iterator, we need to turn it back into a vector to return
            .collect()
    }

    /// Get a ask information for a given unique ask ID (contract + DELIMITER + uuid)
    pub fn get_ask(&self, id: &TokenId) -> Option<AskResponse> {
        //try and get the sale object for the given unique sale ID. Will return an option since
        //we're not guaranteed that the unique sale ID passed in will be valid.
        let ask = self.asks.get(id).unwrap();
        Some(AskResponse {
            id: id.to_owned(),
            ask,
        })
    }

    /// Get a bid information for a given unique bid ID (contract + DELIMITER + uuid)
    pub fn get_bid(&self, id: &TokenId) -> Option<BidResponse> {
        //try and get the sale object for the given unique sale ID. Will return an option since
        //we're not guaranteed that the unique sale ID passed in will be valid.
        let bid = self.bids.get(id).unwrap();
        Some(BidResponse {
            id: id.to_owned(),
            bid,
        })
    }
}
