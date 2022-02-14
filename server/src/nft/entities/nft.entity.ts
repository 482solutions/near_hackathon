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

export class Session {
    private readonly pk: string;
    public readonly id: string;
    private store: InMemoryKeyStore;

    get privateKey() {
        return this.pk

    }

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

    init() {
        const keyStore = new keyStores.InMemoryKeyStore();
        const keyPair = KeyPair.fromString(this.privateKey);
        keyStore.setKey("testnet", this.id, keyPair);

        this.store = keyStore;
    }

    constructor(pk: string) {
        this.pk = pk
    }
}