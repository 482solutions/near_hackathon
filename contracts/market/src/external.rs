use crate::*;

/// Used in cross-contract call to the NFT contract.
/// Transfer the token to the buyer, return payout, transfer funds to seller
#[ext_contract(ext_contract)]
trait ExtContract {
    fn nft_transfer_pay(
        &mut self,
        received_id: AccountId,
        token_id: TokenId,
        approval_id: u64,
        memo: String,
        balance: U128,
        max_len_payout: u32,
    );

    fn nft_transfer(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: Option<u64>,
        memo: Option<String>,
    );

    fn nft_is_approved(
        &self,
        token_id: TokenId,
        approved_account_id: AccountId,
        approval_id: Option<u64>,
    ) -> bool;

    fn nft_revoke(&mut self, token_id: TokenId, account_id: AccountId);
}
