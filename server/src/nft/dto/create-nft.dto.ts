export class Metadata {
    title: string;
    description: string | null;
    expires_at: string | null;
    starts_at: string | null;
    extra: string;
}

export class CreateNftDto {
    token_owner_id: string;
    token_metadata: Metadata;
}
