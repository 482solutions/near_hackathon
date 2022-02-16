export class Nft {
    title: string | null;
    description: string | null;
    media: string | null;
    media_hash: string | null;
    copies: number | null;
    issued_at: string | null;
    expires_at: string | null;
    starts_at: string | null;
    updated_at: string | null;
    extra: string | null;
    reference: string | null
    reference_hash: string | null
}

export interface Pagination {
    from_index: string,
    limit: number
}