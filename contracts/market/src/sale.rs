use crate::internal::get_token_account_id;
use crate::*;
use near_sdk::env::{current_account_id, prepaid_gas, used_gas};
use near_sdk::{is_promise_success, ONE_YOCTO};

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

#[near_bindgen]
impl Contract {
    pub fn place_ask(&mut self, amount: Balance, conditions: U128) {
        let caller = predecessor_account_id();
        let ft = get_token_account_id(&caller);

        let ask = Ask {
            owner_id: caller,
            ft_contract_id: ft,
            amount,
            sale_conditions: conditions.into(),
        };
        log!("Creating new ask: {:?}", ask);
        self.internal_place_ask(ask);
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
    #[payable]
    pub fn remove_position(&mut self, id: ContractAndId, position: Position) {
        //assert that the user has attached exactly 1 yoctoNEAR (for security reasons)
        assert_one_yocto();

        //get the predecessor of the call and make sure they're the owner of the sale
        let caller = predecessor_account_id();

        //get the sale object as the return value from removing the sale internally
        // TODO: Replace internal_remove_sale with implementation that removed ask/bid
        match position {
            //if this fails, the remove will revert
            Position::Ask => {
                let ask = self.internal_remove_ask(id);
                require!(
                    caller == ask.owner_id || caller == self.owner_id,
                    "Must be sale owner"
                );
            }
            Position::Bid => {
                let bid = self.internal_remove_bid(id);
                Promise::new(bid.owner_id.clone()).transfer(bid.sale_conditions);
                require!(
                    caller == bid.owner_id || caller == self.owner_id,
                    "Must be sale owner"
                );
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
    #[private]
    pub fn process_bid(&mut self, ask_id: ContractAndId, bid_id: ContractAndId) -> Promise {
        let ask = self.get_ask(&ask_id).expect("This ask does not exist");
        let bid = self.get_bid(&bid_id).expect("This bid does not exist");

        require!(
            ask.sale_conditions.eq(&bid.sale_conditions),
            "Sale conditions don't match"
        );

        self.managed_ask_sell(ask_id, bid.owner_id)
            .then(ext_self::resolve_position(
                bid_id,
                Position::Bid,
                current_account_id(),
                ONE_YOCTO,
                PROCESS_ASK,
            ))
    }

    #[private]
    pub fn managed_ask_sell(&mut self, id: ContractAndId, buyer: AccountId) -> Promise {
        self.process_purchase(id, buyer)
    }

    /// Process ask - makes necessary checks, then transfers FT to buyer and $NEAR to seller
    #[payable]
    pub fn direct_ask_sell(&mut self, id: ContractAndId) {
        // Get the attached deposit and make sure it's greater than 0
        let deposit = attached_deposit();
        require!(deposit > 0, "Attached deposit must be greater than 0");

        // Get ask object, panic if not exists
        let ask = self.asks.get(&id).expect("No sale");

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
        self.process_purchase(id, buyer_id);
    }

    /// Private function used when a sale is purchased.
    /// This will remove the sale, transfer and get the payout from the nft contract, and then distribute royalties
    #[private]
    pub fn process_purchase(&mut self, id: ContractAndId, buyer_id: AccountId) -> Promise {
        //get the ask object
        let sale = self.get_ask(&id).expect("This ask does not exist");

        // Transfer $NEAR to seller
        let transfer_near = Promise::new(sale.owner_id.clone()).transfer(sale.sale_conditions);

        ext_ft::transfer(
            sale.owner_id,
            buyer_id,
            sale.amount,
            sale.ft_contract_id,
            NO_DEPOSIT,
            PROCESS_ASK,
        )
        .then(transfer_near)
        .then(ext_self::resolve_position(
            id,
            Position::Ask,
            current_account_id(),
            ONE_YOCTO,
            PROCESS_ASK,
        ))
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
trait ExtSelf {
    fn resolve_position(&mut self, id: ContractAndId, position: Position) -> Promise;
}
