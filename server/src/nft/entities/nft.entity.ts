import { ConnectConfig, KeyPair, keyStores } from "near-api-js";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";

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

export class Session {
    public readonly id: string;
    private readonly store: InMemoryKeyStore;

    defaultConfig(): ConnectConfig {
        return {
            headers: {},
            networkId: "testnet",
            keyStore: this.store,
            nodeUrl: "https://rpc.testnet.near.org",
            walletUrl: "https://wallet.testnet.near.org",
            helperUrl: "https://helper.testnet.near.org"
        }
    }

    constructor(pk: string, id: string) {
        this.id = id;
        const keyPair = KeyPair.fromString(pk);
        const store = new keyStores.InMemoryKeyStore();
        store.setKey("testnet", id, keyPair);
        this.store = store;
    }
}