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

    /// Get paginated list of [Ask]s for specified user
    ///
    /// # Arguments
    ///
    /// * `account_id`: [AccountId] - which user we search for
    /// * `from`: Starting index
    /// * `limit`: Ending index
    ///
    /// returns: Vec<AskResponse>
    ///
    pub fn get_asks_by_owner_id(
        &self,
        account_id: AccountId,
        from: Option<u128>,
        limit: Option<u64>,
    ) -> Vec<AskResponse> {
        // Get the set of token IDs for sale for the given account ID
        let by_owner_id = self.asks_by_owner_id.get(&account_id);
        // If there was some set, we set the sales variable equal to that set. If there wasn't, sales is set to an empty vector
        let asks = if let Some(by_owner_id) = by_owner_id {
            by_owner_id
        } else {
            return vec![];
        };

        // We'll convert the UnorderedSet into a vector of strings
        let keys = asks.as_vector();

        // Where to start pagination - if we have a from_index, we'll use that - otherwise start from 0 index
        let start = from.unwrap_or(0);

        // Iterate through the keys vector
        keys.iter()
            // Skip to the index we specified in the start variable
            .skip(start as usize)
            // Take the first "limit" elements in the vector. If we didn't specify a limit, use 0
            .take(limit.unwrap_or(0) as usize)
            // We'll map the token IDs which are strings into Sale objects
            .map(|id| {
                log!("Searching id: {}", id);
                let ask = self.asks.get(&id).unwrap();
                AskResponse { id, ask }
            })
            // Since we turned the keys into an iterator, we need to turn it back into a vector to return
            .collect()
    }

    /// Get paginated list of [Bid]s
    ///
    /// # Arguments
    ///
    /// * `from`: Starting index
    /// * `limit`: Ending index
    ///
    /// returns: List of bids
    ///
    pub fn get_bids(&self, from: Option<u128>, limit: Option<u64>) -> Vec<BidResponse> {
        // Where to start pagination - if we have a from_index, we'll use that - otherwise start from 0 index
        let start = from.unwrap_or(0);

        // Iterate through the keys vector
        self.bids
            .iter()
            // Skip to the index we specified in the start variable
            .skip(start as usize)
            // Take the first "limit" elements in the vector. If we didn't specify a limit, use 0
            .take(limit.unwrap_or(0) as usize)
            .map(|(id, bid)| BidResponse { id, bid })
            // Since we turned the keys into an iterator, we need to turn it back into a vector to return
            .collect()
    }

    /// Get paginated list of [Ask]s
    ///
    /// # Arguments
    ///
    /// * `from`: Starting index
    /// * `limit`: Ending index
    ///
    /// returns: List of asks
    ///  
    pub fn get_asks(&self, from: Option<u128>, limit: Option<u64>) -> Vec<AskResponse> {
        let start = from.unwrap_or(0);

        self.asks
            .iter()
            .skip(start as usize)
            .take(limit.unwrap_or(0) as usize)
            .map(|(id, ask)| AskResponse { id, ask })
            .collect()
    }

    /// Get a ask information for a given unique ask ID (contract + DELIMITER + uuid)
    pub fn get_ask(&self, id: &PositionId) -> Option<AskResponse> {
        // Try and get the sale object for the given unique sale ID. Will return an option since
        // We're not guaranteed that the unique sale ID passed in will be valid.
        let ask = self.asks.get(id).unwrap();
        Some(AskResponse {
            id: id.to_owned(),
            ask,
        })
    }

    pub fn get_bid(&self, id: &PositionId) -> Option<BidResponse> {
        let bid = self.bids.get(id).unwrap();
        Some(BidResponse {
            id: id.to_owned(),
            bid,
        })
    }
}
