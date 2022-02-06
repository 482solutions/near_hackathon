use crate::*;
use near_sdk::env::current_account_id;
use near_sdk::ONE_YOCTO;
use token_factory::prices::NO_DEPOSIT;

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
    pub sale_conditions: SalePriceInYoctoNear,
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
    pub sale_conditions: SalePriceInYoctoNear,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub enum Position {
    Ask,
    Bid,
}

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn add_position(
        &mut self,
        amount: Balance,
        conditions: SalePriceInYoctoNear,
        position: Position,
    ) {
        let caller = predecessor_account_id();

        match position {
            Position::Ask => {
                let ft_contract = AccountId::new_unchecked(format!("ft.{}", caller));
                let ask = Ask {
                    owner_id: caller,
                    ft_contract_id: ft_contract,
                    amount,
                    sale_conditions: conditions,
                };
                log!("Creating new ask: {:?}", ask);
                self.internal_place_ask(ask);
            }
            Position::Bid => {
                let bid = Bid {
                    owner_id: caller,
                    amount,
                    sale_conditions: conditions,
                };
                log!("Creating new bid: {:?}", bid);

                self.internal_place_bid(bid);
            }
        }
    }

    /// Removes a sale from the market.
    #[payable]
    pub fn remove_position(&mut self, id: ContractAndId, position: Position) {
        //assert that the user has attached exactly 1 yoctoNEAR (for security reasons)
        assert_one_yocto();

        //get the predecessor of the call and make sure they're the owner of the sale
        let owner_id = predecessor_account_id();

        //get the sale object as the return value from removing the sale internally
        // TODO: Replace internal_remove_sale with implementation that removed ask/bid
        match position {
            //if this fails, the remove will revert
            Position::Ask => {
                let ask = self.internal_remove_ask(id);
                require!(owner_id == ask.owner_id, "Must be sale owner");
            }
            Position::Bid => {
                let bid = self.internal_remove_bid(id);
                require!(owner_id == bid.owner_id, "Must be sale owner");
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

                ask.sale_conditions = price;

                self.asks.insert(&id, &ask);
            }
            Position::Bid => {
                let mut bid = self.bids.get(&id).expect("No bids");
                require!(owner_id == bid.owner_id, "Must be bid owner");

                bid.sale_conditions = price;

                self.bids.insert(&id, &bid);
            }
        }
    }

    /// Place an order on a specific sale. The sale will go through as long as your deposit is greater than or equal to the list price
    #[payable]
    pub fn buy(&mut self, id: ContractAndId) {
        // Get the attached deposit and make sure it's greater than 0
        let deposit = attached_deposit();
        require!(deposit > 0, "Attached deposit must be greater than 0");

        // Get ask object, panic if not exists
        let ask = self.asks.get(&id).expect("No sale");

        // Get the buyer ID which is the person who called the function and make sure they're not the owner of the sale
        let buyer_id = predecessor_account_id();
        require!(ask.owner_id != buyer_id, "Cannot bid on your own sale.");

        // Get the u128 price of the token (dot 0 converts from U128 to u128)
        let price = ask.sale_conditions.0;

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
        let sale = self.get_ask(id.clone()).expect("This ask does not exist");

        // Transfer $NEAR to seller
        let transfer_near =
            Promise::new(sale.owner_id).transfer(Balance::from(sale.sale_conditions));

        ext_contract::ft_transfer_wrapped(
            buyer_id,
            U128::from(sale.amount),
            None,
            sale.ft_contract_id,
            ONE_YOCTO,
            FACTORY_CROSS_CALL,
        )
        .then(transfer_near)
        .then(ext_self::resolve_purchase(
            id,
            current_account_id(),
            ONE_YOCTO,
            FACTORY_CROSS_CALL,
        ))
    }

    #[private]
    #[payable]
    pub fn resolve_purchase(&mut self, id: ContractAndId) {
        self.remove_position(id, Position::Ask);
    }
}

//this is the cross contract call that we call on our own contract.
// Fired as a last promise in the chain of buy method. In such way we only remove sale if all previous promises succeeded
#[ext_contract(ext_self)]
trait ExtSelf {
    fn resolve_purchase(&mut self, id: ContractAndId) -> Promise;
}
