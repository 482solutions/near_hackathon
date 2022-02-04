use crate::*;

/// Used to generate a unique prefix in our storage collections (this is to avoid data collisions)
pub(crate) fn hash_account_id(account_id: &AccountId) -> CryptoHash {
    // Get the default hash
    let mut hash = CryptoHash::default();
    // We hash the account ID and return it
    hash.copy_from_slice(&sha256(account_id.as_bytes()));
    hash
}

impl Contract {
    pub fn internal_place_ask(&mut self, ask: Ask) -> Ask {
        let id = format!("{}.{}", ask.owner_id, "TEST");

        self.asks.insert(&id, &ask);

        let by_owner = self.asks_by_owner_id.get(&ask.owner_id);

        match by_owner {
            Some(mut by_owner) => {
                by_owner.insert(&id);
            }
            None => {
                let mut new_set = UnorderedSet::new(StorageKey::ByOwnerId);
                new_set.insert(&id);
                self.asks_by_owner_id.insert(&ask.owner_id, &new_set);
            }
        }

        ask
    }

    pub fn internal_place_bid(&mut self, bid: Bid) -> Bid {
        let id = format!("{}.{}", bid.owner_id, "TEST");

        self.bids
            .insert(&id, &bid)
            .unwrap_or_else(|| panic_str("Bid already exists"));

        let by_owner = self.bids_by_owner_id.get(&bid.owner_id);

        match by_owner {
            Some(mut by_owner) => {
                by_owner.insert(&id);
            }
            None => {
                let mut new_set = UnorderedSet::new(StorageKey::ByOwnerId);
                new_set.insert(&id);
                self.bids_by_owner_id.insert(&bid.owner_id, &new_set);
            }
        }

        bid
    }

    /// Internal method for removing a ask from the market. This returns the previously removed object
    pub fn internal_remove_ask(&mut self, id: ContractAndId) -> Ask {
        let ask = self.asks.remove(&id).expect("No ask");
        // Get the set of sales for the sale's owner. If there's no sale, panic.
        let mut by_owner_id = self
            .asks_by_owner_id
            .get(&ask.owner_id)
            .expect("No ask by_owner_id");

        // Remove the unique sale ID from the set of sales
        by_owner_id.remove(&id);

        // If the set of sales is now empty after removing the unique sale ID, we simply remove that owner from the map
        if by_owner_id.is_empty() {
            self.asks_by_owner_id.remove(&ask.owner_id);
            // If the set of sales is not empty after removing, we insert the set back into the map for the owner
        } else {
            self.asks_by_owner_id.insert(&ask.owner_id, &by_owner_id);
        }

        ask
    }

    /// Internal method for removing a bid from the market. This returns the previously removed object
    pub fn internal_remove_bid(&mut self, id: ContractAndId) -> Bid {
        // Get the unique sale ID (contract + DELIMITER + token ID)
        // Get the sale object by removing the unique sale ID. If there was no sale, panic
        let bid = self.bids.remove(&id).expect("No ask");
        // Get the set of sales for the sale's owner. If there's no sale, panic.
        let mut by_owner_id = self
            .bids_by_owner_id
            .get(&bid.owner_id)
            .expect("No ask by_owner_id");

        //remove the unique sale ID from the set of sales
        by_owner_id.remove(&id);

        //if the set of sales is now empty after removing the unique sale ID, we simply remove that owner from the map
        if by_owner_id.is_empty() {
            self.bids_by_owner_id.remove(&bid.owner_id);
            //if the set of sales is not empty after removing, we insert the set back into the map for the owner
        } else {
            self.bids_by_owner_id.insert(&bid.owner_id, &by_owner_id);
        }

        bid
    }
}
