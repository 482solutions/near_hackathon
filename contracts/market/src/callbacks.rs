use crate::*;
use near_sdk::PromiseOrValue;

/// Callback that places [Ask] on `nft_approve`
#[near_bindgen]
impl NonFungibleTokenApprovalReceiver for Contract {
    fn nft_on_approve(
        &mut self,
        token_id: TokenId,
        owner_id: AccountId,
        approval_id: u64,
        msg: String,
    ) -> PromiseOrValue<String> {
        let nft_contract_id = env::predecessor_account_id();
        let signer_id = env::signer_account_id();
        let deposit = env::attached_deposit();

        // Safety check
        require!(
            nft_contract_id != signer_id,
            "nft_on_approve should only be called via cross-contract call"
        );

        // Another one
        require!(owner_id == signer_id, "owner_id should be signer_id");

        let mut balance: u128 = self.storage_deposits.get(&signer_id).unwrap_or(0);

        balance += deposit;

        self.storage_deposits.insert(&signer_id, &balance);

        // Calculate needed storage
        let storage_amount = self.storage_minimum_balance().0;
        let owner_paid_storage = self.storage_deposits.get(&signer_id).unwrap_or(0);
        let signer_storage_required =
            (self.get_supply_by_owner_id(signer_id, Position::Ask).0 + 1) as u128 * storage_amount;

        // Check user paid for storage
        assert!(
            owner_paid_storage >= signer_storage_required,
            "Insufficient storage paid: {}, for {} sales at {} rate of per sale",
            owner_paid_storage,
            signer_storage_required / STORAGE_PER_SALE,
            STORAGE_PER_SALE
        );

        // Deserialize msg to get sale conditions
        let AskArgs { sale_conditions } =
            near_sdk::serde_json::from_str(&msg).expect("Not valid AskArgs");

        let ask = near_sdk::serde_json::to_string(&self.internal_place_ask(Ask {
            owner_id,        //owner of the sale / token
            approval_id,     //approval ID for that token that was given to the market
            nft_contract_id, //NFT contract the token was minted on
            token_id,        //the actual token ID
            sale_conditions, //the sale conditions
        }));

        PromiseOrValue::Value(ask.unwrap())
    }
}
