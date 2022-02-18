use crate::*;
use near_sdk::PromiseOrValue;
use std::ops::Sub;

/// Ask struct, defines who sells, how much, and on what conditions
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct Ask {
    /// Owner of the ask
    pub owner_id: AccountId,
    /// FT contract where the token was minted
    pub nft_contract_id: AccountId,

    /// NFT token Id
    pub token_id: TokenId,
    /// ID of approval
    pub approval_id: u64,

    /// Sale prices in yoctoNEAR that the token is listed for
    pub sale_conditions: Balance,
}

/// Struct that `nft_on_approve` will receive and use for Ask creating
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct AskArgs {
    /// Sale prices in yoctoNEAR that the token is listed for
    pub sale_conditions: String,
}

/// Bid struct defines who want to buy, how much, and on what conditions
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct Bid {
    /// Owner of the bid
    pub owner_id: AccountId,

    /// Sale prices in yoctoNEAR that the token is listed for.
    /// Acts as a trigger
    pub sale_conditions: Balance,

    /// Field for storing serialized object with any info
    pub extra: String,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub enum Position {
    Ask,
    Bid,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub enum Method {
    Direct,
    Managed,
}

#[near_bindgen]
impl Contract {
    /// Place [Bid] on a market
    ///
    /// # Arguments
    ///
    /// * `amount`: How much to buy
    /// * `conditions`: For how much $NEAR
    ///
    /// returns: Bid that was created
    ///
    #[payable]
    pub fn place_bid(&mut self, conditions: U128, extra: String) -> Bid {
        let deposit = env::attached_deposit();
        let caller = env::predecessor_account_id();

        log!("Caller: {}, Deposit: {:?}", caller, deposit);

        require!(
            conditions.eq(&deposit.into()),
            "Sale conditions and deposit don't match"
        );

        let bid = Bid {
            owner_id: env::predecessor_account_id(),
            sale_conditions: deposit,
            extra,
        };
        log!("Creating new bid: {:?}", bid);

        self.internal_place_bid(bid)
    }

    /// Removes ask from the market.
    #[private]
    pub fn remove_position(&mut self, id: PositionId, position: Position) {
        //get the sale object as the return value from removing the sale internally
        match position {
            // if this fails, the remove will revert
            Position::Ask => {
                self.internal_remove_ask(id);
            }
            Position::Bid => {
                self.internal_remove_bid(id);
            }
        }
    }

    /// Cancels position from "user-mode"
    /// After this call front-end should revoke access to token
    ///
    /// # Arguments
    ///
    /// * `id`: [ContractAndId] of position
    /// * `position`: [Position] type
    ///
    /// returns: Promise that transfers $NEAR or removed [Ask]
    ///
    #[payable]
    pub fn cancel_position(&mut self, id: PositionId, position: Position) -> PromiseOrValue<Ask> {
        let caller = env::predecessor_account_id();
        assert_one_yocto();

        match position {
            //if this fails, the remove will revert
            Position::Ask => {
                let ask = self.get_ask(&id).expect("This ask does not exist");
                require!(caller == ask.ask.owner_id, "You cannot do that!");
                let ask: Ask = self.internal_remove_ask(id);
                PromiseOrValue::Value(ask)
            }
            Position::Bid => {
                let bid = self.internal_remove_bid(id);
                require!(caller == bid.owner_id, "You cannot do that!");
                PromiseOrValue::Promise(Promise::new(bid.owner_id).transfer(bid.sale_conditions))
            }
        }
    }

    /// Updates the price for a sale on the market
    #[payable]
    pub fn update_price(&mut self, id: PositionId, price: U128, position: Position) {
        //assert that the user has attached exactly 1 yoctoNEAR (for security reasons)
        let deposit = env::attached_deposit();
        require!(deposit >= 1, "Required 1 YoctoNEAR to be attached");

        let owner_id = env::predecessor_account_id();

        match position {
            // Also assert that the caller of the function is the sale owner
            Position::Ask => {
                //get the ask object from the unique ask ID. If there is no => panic.
                let mut ask = self.asks.get(&id).expect("No asks");
                require!(owner_id == ask.owner_id, "Must be ask owner");

                let price: u128 = price.into();

                match ask.sale_conditions.checked_sub(price) {
                    Some(_) => {
                        log!("Updating price to: {}", price);
                        ask.sale_conditions = price;
                        self.asks.insert(&id, &ask);
                    }
                    None => {
                        env::panic_str("You cannot update Ask sale_conditions to be negative");
                    }
                }
            }
            Position::Bid => {
                let mut bid = self.bids.get(&id).expect("No bids");
                require!(owner_id == bid.owner_id, "Must be bid owner");

                let price: u128 = price.into();

                log!("New price: {}", price);

                match price >= bid.sale_conditions {
                    true => {
                        let needed = price.sub(bid.sale_conditions);
                        assert_eq!(
                            deposit,
                            needed + ONE_YOCTO,
                            "You need to attach {} to update price",
                            needed
                        );
                        log!("Updating price to: {}", price);
                        bid.sale_conditions = price;
                        self.bids.insert(&id, &bid);
                    }
                    false => {
                        let returned = bid.sale_conditions.checked_sub(price);

                        match returned {
                            Some(left) => {
                                log!("Updating price to: {}", price);
                                bid.sale_conditions = price;
                                self.bids.insert(&id, &bid);
                                Promise::new(bid.owner_id).transfer(left);
                            }
                            None => env::panic_str(&*format!(
                                "You cannot update bid sale conditions to be negative, current is: {}",
                                bid.sale_conditions
                            )),
                        }
                    }
                }
            }
        }
    }

    /// Process Bid. Can be used only by owner (for back-end)
    ///
    /// # Arguments
    ///
    /// * `ask_id`: [Ask]
    /// * `bid_id`: [Bid]
    ///
    /// returns: Promise
    ///
    #[payable]
    pub fn process_bid(&mut self, ask_id: PositionId, bid_id: PositionId) -> Promise {
        // I don't want to deal with sub-account names too much
        require!(
            env::signer_account_id() == self.owner_id,
            "You are not allowed to do that"
        );

        let ask = self.get_ask(&ask_id).expect("This ask does not exist").ask;
        let bid = self.get_bid(&bid_id).expect("This bid does not exist").bid;

        log!(
            "Ask sale conditions: {}, Bid sale condition: {}",
            ask.sale_conditions,
            bid.sale_conditions
        );

        require!(
            ask.sale_conditions.eq(&bid.sale_conditions),
            "Sale conditions don't match"
        );

        require!(ask.owner_id != bid.owner_id, "Cannot bid on your own sale.");

        let transfer_nft = ext_contract::nft_transfer(
            bid.owner_id,
            ask.token_id,
            Some(ask.approval_id),
            None,
            ask.nft_contract_id,
            ONE_YOCTO,
            PROCESS_ASK,
        );

        let current = env::current_account_id();

        let remove_ask =
            ext_self::resolve_position(ask_id, Position::Ask, current.clone(), ONE_YOCTO, CCC);
        let remove_bid = ext_self::resolve_position(bid_id, Position::Bid, current, ONE_YOCTO, CCC);

        transfer_nft
            .then(remove_ask)
            .then(remove_bid)
            .then(Promise::new(ask.owner_id).transfer(ask.sale_conditions))
    }

    /// Make direct sell of ask (by user)
    ///
    /// # Arguments
    ///
    /// * `id`: [ContractAndId]
    ///
    /// returns: Promise
    ///
    #[payable]
    pub fn direct_ask_sell(&mut self, id: TokenId) -> Promise {
        // Get the attached deposit and make sure it's greater than 0
        let deposit = env::attached_deposit();
        require!(deposit > 0, "Attached deposit must be greater than 0");

        require!(
            deposit > ONE_YOCTO * 2,
            "Requires 2 YoctoNEAR to be attached"
        );

        // Get ask object, panic if not exists
        let ask = self.asks.get(&id).expect("No such ask");

        // Get the buyer ID which is the person who called the function and make sure they're not the owner of the sale
        let buyer_id = env::predecessor_account_id();

        require!(ask.owner_id != buyer_id, "Cannot bid on your own sale.");

        // Get the u128 price of the token (dot 0 converts from U128 to u128)
        let price = ask.sale_conditions;

        //make sure the deposit is greater than the price
        log!("Current price: {:?}", price);
        require!(
            deposit >= price,
            "Attached deposit must be greater than or equal to the current price: {:?}"
        );

        // Process the purchase (which will remove the ask, transfer and get the payout from the ft contract)
        let transfer_nft = ext_contract::nft_transfer(
            buyer_id,
            ask.token_id,
            Some(ask.approval_id),
            None,
            ask.nft_contract_id,
            ONE_YOCTO,
            CCC,
        );
        let remove_ask = ext_self::resolve_position(
            id,
            Position::Ask,
            env::current_account_id(),
            ONE_YOCTO,
            CCC,
        );

        transfer_nft
            .then(remove_ask)
            .then(Promise::new(ask.owner_id).transfer(ask.sale_conditions))
    }

    #[private]
    #[payable]
    pub fn resolve_position(&mut self, id: TokenId, position: Position) {
        require!(
            is_promise_success(),
            "Previous promise in chain not succeeded"
        );
        self.remove_position(id, position);
    }
}

//this is the cross contract call that we call on our own contract.
// Fired as a last promise in the chain of buy method. In such way we only remove sale if all previous promises succeeded
#[ext_contract(ext_self)]
pub trait ExtSelf {
    fn resolve_position(&mut self, id: TokenId, position: Position) -> Promise;
    fn resolve_place(&mut self, ask: Option<Ask>, bid: Option<Bid>, position: Position);
}
