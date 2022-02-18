use crate::*;

impl Contract {
    pub fn internal_place_ask(&mut self, ask: Ask) -> Ask {
        // Increment id
        self.asks_id += 1;

        let id = self.asks_id.to_string();

        self.asks.insert(&id, &ask);

        let by_owner = self.asks_by_owner_id.get(&ask.owner_id);

        match by_owner {
            Some(mut by_owner) => {
                log!("By owner: {:?}", &by_owner.to_vec());
                by_owner.insert(&id);

                self.asks_by_owner_id.insert(&ask.owner_id, &by_owner);
            }
            None => {
                log!("Creating new set");
                let mut new_set = UnorderedSet::new(StorageKey::ByOwnerIdInner {
                    account_hash: env::sha256(ask.owner_id.as_bytes()),
                });
                log!("New set: {:?}. Inserting {} into it", new_set, id);
                new_set.insert(&id);
                self.asks_by_owner_id.insert(&ask.owner_id, &new_set);
            }
        }

        ask
    }

    pub fn internal_place_bid(&mut self, bid: Bid) -> Bid {
        // Increment id
        self.bids_id += 1;

        let id = self.bids_id.to_string();

        require!(self.bids.insert(&id, &bid).is_none(), "Bid already exist");

        bid
    }

    /// Internal method for removing an ask from the market. This returns the previously removed object
    pub fn internal_remove_ask(&mut self, id: TokenId) -> Ask {
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
    pub fn internal_remove_bid(&mut self, id: TokenId) -> Bid {
        // Get the unique sale ID (contract + DELIMITER + token ID)
        // Get the sale object by removing the unique sale ID. If there was no sale, panic
        let bid = self.bids.remove(&id).expect("No bid");

        bid
    }
}
