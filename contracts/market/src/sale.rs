use crate::internal::get_token_account_id;
use crate::*;

/// Ask struct, defines who sells, how much, and on what conditions
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct Ask {
    /// Owner of the ask
    pub owner_id: AccountId,
    /// FT contract where the token was minted
    pub ft_contract_id: AccountId,

    pub amount: Balance,

    /// Sale prices in yoctoNEAR that the token is listed for
    pub sale_conditions: Balance,
}

/// Bid struct defines who want to buy, how much, and on what conditions
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct Bid {
    /// Owner of the bid
    pub owner_id: AccountId,

    pub amount: Balance,

    /// Sale prices in yoctoNEAR that the token is listed for.
    /// Acts as a trigger
    pub sale_conditions: Balance,
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
    pub fn place_ask(&mut self, amount: Balance, conditions: U128) -> Promise {
        let caller = predecessor_account_id();
        let current = current_account_id();
        let ft = get_token_account_id(&caller);

        let ask = Ask {
            owner_id: caller,
            ft_contract_id: ft.clone(),
            amount,
            sale_conditions: conditions.into(),
        };
        log!("Creating new ask: {:?}", ask);
        self.internal_place_ask(ask);

        log!("Transferring FT to market (hold)");
        ext_ft::ft_transfer_by_signer(current, amount.into(), None, ft, ONE_YOCTO, CCC)
    }

    /// Method for placing Bid. Attached deposit will be treated as sale condition
    #[payable]
    pub fn place_bid(&mut self, amount: Balance, conditions: U128) {
        let deposit = attached_deposit();
        let caller = predecessor_account_id();

        log!("Caller: {}, Deposit: {:?}", caller, deposit);

        require!(
            conditions.eq(&deposit.into()),
            "Sale conditions and deposit don't match"
        );

        let bid = Bid {
            owner_id: predecessor_account_id(),
            amount,
            sale_conditions: attached_deposit(),
        };
        log!("Creating new bid: {:?}", bid);

        self.internal_place_bid(bid);
    }

    /// Removes ask from the market.
    #[private]
    pub fn remove_position(&mut self, id: ContractAndId, position: Position) {
        //get the sale object as the return value from removing the sale internally
        // TODO: Replace internal_remove_sale with implementation that removed ask/bid
        match position {
            //if this fails, the remove will revert
            Position::Ask => {
                self.internal_remove_ask(id);
            }
            Position::Bid => {
                self.internal_remove_bid(id);
            }
        }
    }

    pub fn cancel_position(&mut self, id: ContractAndId, position: Position) -> Promise {
        let caller = predecessor_account_id();

        match position {
            //if this fails, the remove will revert
            Position::Ask => {
                let ask = self.internal_remove_ask(id);
                require!(caller == ask.owner_id, "You cannot do that!");
                ext_ft::ft_transfer_safe(
                    ask.owner_id,
                    ask.amount.into(),
                    None,
                    ask.ft_contract_id,
                    ONE_YOCTO,
                    CCC,
                )
            }
            Position::Bid => {
                let bid = self.internal_remove_bid(id);
                require!(caller == bid.owner_id, "You cannot do that!");
                Promise::new(bid.owner_id).transfer(bid.sale_conditions)
            }
        }
    }

    /// Updates the price for a sale on the market
    #[payable]
    pub fn update_price(&mut self, id: ContractAndId, price: U128, position: Position) {
        //assert that the user has attached exactly 1 yoctoNEAR (for security reasons)
        assert_one_yocto();

        let owner_id = predecessor_account_id();

        match position {
            // Also assert that the caller of the function is the sale owner
            Position::Ask => {
                //get the ask object from the unique ask ID. If there is no => panic.
                let mut ask = self.asks.get(&id).expect("No asks");
                require!(owner_id == ask.owner_id, "Must be ask owner");

                ask.sale_conditions = price.into();

                self.asks.insert(&id, &ask);
            }
            Position::Bid => {
                panic_str("You cannot update price of Bid, for now");
                // TODO: Because it can cause abuse, it'll be temporarily disabled
                // let mut bid = self.bids.get(&id).expect("No bids");
                // require!(owner_id == bid.owner_id, "Must be bid owner");
                //
                // bid.sale_conditions = price.into();
                //
                // self.bids.insert(&id, &bid);
            }
        }
    }

    /// Method only for backend. Requires significant amount of Gas (2 * PROCESS_ASK)
    pub fn process_bid(&mut self, ask_id: ContractAndId, bid_id: ContractAndId) -> Promise {
        // I don't want to deal with sub-account names too much
        require!(
            predecessor_account_id() == self.owner_id,
            "You are not allowed to do that"
        );

        let ask = self.get_ask(&ask_id).expect("This ask does not exist");
        let bid = self.get_bid(&bid_id).expect("This bid does not exist");

        require!(
            ask.sale_conditions.eq(&bid.sale_conditions),
            "Sale conditions don't match"
        );

        require!(ask.owner_id != bid.owner_id, "Cannot bid on your own sale.");

        let transfer_ft = ext_ft::force_transfer(
            ask.owner_id.clone(),
            bid.owner_id,
            ask.amount,
            self.owner_id.clone(),
            NO_DEPOSIT,
            PROCESS_ASK,
        );

        let remove_ask =
            ext_self::resolve_position(ask_id, Position::Ask, current_account_id(), ONE_YOCTO, CCC);
        let remove_bid =
            ext_self::resolve_position(bid_id, Position::Bid, current_account_id(), ONE_YOCTO, CCC);

        transfer_ft
            .then(remove_ask)
            .then(remove_bid)
            .then(Promise::new(ask.owner_id).transfer(ask.sale_conditions))
    }

    /// Process ask - makes necessary checks, then transfers FT to buyer and $NEAR to seller
    #[payable]
    pub fn direct_ask_sell(&mut self, id: ContractAndId) -> Promise {
        // Get the attached deposit and make sure it's greater than 0
        let deposit = attached_deposit();
        require!(deposit > 0, "Attached deposit must be greater than 0");

        // Get ask object, panic if not exists
        let ask = self.asks.get(&id).expect("No such ask");

        // Get the buyer ID which is the person who called the function and make sure they're not the owner of the sale
        let buyer_id = predecessor_account_id();

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
        let transfer_near = Promise::new(ask.owner_id.clone()).transfer(price);
        let transfer_ft = ext_ft::ft_transfer_safe(
            buyer_id,
            ask.amount.into(),
            None,
            ask.ft_contract_id,
            ONE_YOCTO,
            CCC,
        );
        let remove_ask =
            ext_self::resolve_position(id, Position::Ask, current_account_id(), ONE_YOCTO, CCC);

        transfer_ft.then(remove_ask).then(transfer_near)
    }

    #[private]
    #[payable]
    pub fn resolve_position(&mut self, id: ContractAndId, position: Position) {
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
    fn resolve_position(&mut self, id: ContractAndId, position: Position) -> Promise;
}
