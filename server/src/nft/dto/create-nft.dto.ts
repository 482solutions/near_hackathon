export interface Metadata {
    title: string;
    description: string | null;
    expires_at: string | null;
    starts_at: string | null;
    extra: string;
}

export interface CreateNftDto {
    owner: string;
    metadata: Metadata;
}
