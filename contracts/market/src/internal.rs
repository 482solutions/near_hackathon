use crate::*;
use near_contract_standards::non_fungible_token::hash_account_id;

impl Contract {
    pub fn internal_place_ask(&mut self, ask: Ask) -> Ask {
        // Increment id
        self.asks_id += 1;

        let id = self.asks_id.to_string();

        self.asks.insert(&id, &ask);

        let by_owner = self.asks_by_owner_id.get(&ask.owner_id);

        match by_owner {
            Some(mut by_owner) => {
                by_owner.insert(&id);
            }
            None => {
                let mut new_set = UnorderedSet::new(StorageKey::AsksByOwnerId);
                new_set.insert(&id);
                self.asks_by_owner_id.insert(&ask.owner_id, &new_set);
            }
        }

        let mut by_nft_contract_id = self
            .by_nft_token_id
            .get(&ask.nft_contract_id)
            .unwrap_or_else(|| {
                UnorderedSet::new(
                    StorageKey::ByNFTContractIdInner {
                        // Hash the owner to avoid collisions
                        account_id_hash: hash_account_id(&ask.nft_contract_id),
                    }
                    .try_to_vec()
                    .unwrap(),
                )
            });

        by_nft_contract_id.insert(&ask.token_id);
        self.by_nft_token_id
            .insert(&ask.nft_contract_id, &by_nft_contract_id);

        ask
    }

    pub fn internal_place_bid(&mut self, bid: Bid) -> Bid {
        // Increment id
        self.bids_id += 1;

        let id = self.bids_id.to_string();

        require!(self.bids.insert(&id, &bid).is_none(), "Bid already exist");

        let by_owner = self.bids_by_owner_id.get(&bid.owner_id);

        match by_owner {
            Some(mut by_owner) => {
                by_owner.insert(&id);
            }
            None => {
                let mut new_set = UnorderedSet::new(StorageKey::BidsByOwnerId);
                new_set.insert(&id);
                self.bids_by_owner_id.insert(&bid.owner_id, &new_set);
            }
        }

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

        let mut by_nft_contract_id = self.by_nft_token_id.get(&ask.nft_contract_id).unwrap();

        by_nft_contract_id.remove(&id);
        self.by_nft_token_id
            .insert(&ask.nft_contract_id, &by_nft_contract_id);

        ask
    }

    /// Internal method for removing a bid from the market. This returns the previously removed object
    pub fn internal_remove_bid(&mut self, id: TokenId) -> Bid {
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

pub fn get_token_account_id(account_id: &AccountId) -> AccountId {
    // Split account by '.'
    // Example i3ima.testnet -> ["i3ima", "testnet"]
    let split = utils::split_account(account_id);
    // Get prefix for subaccount
    let prefix = split[0].to_string();

    let current = env::current_account_id();

    let split_current = utils::split_account(&current);

    let postfix = split_current[1].to_string();

    AccountId::new_unchecked(format!("{}.{}", prefix, postfix))
}
