export interface Bid {
    owner_id: string,
    sale_conditions: number
}

export interface BidResponse {
    id: string,
    bid: Bid
}

export interface Ask {
    owner_id: string,
    nft_contract_id: string,

    token_id: string,
    approval_id: number,

    sale_conditions: number
}

export interface AskResponse {
    id: string,
    ask: Ask
}