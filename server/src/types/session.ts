import { ConnectConfig, KeyPair, keyStores } from "near-api-js";
import { UnencryptedFileSystemKeyStore } from "near-api-js/lib/key_stores";
import * as os from "os";
import * as path from "path";

const homedir = os.homedir();

const CREDENTIALS_DIR = ".near";
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);

export class Session {
  public readonly id: string;
  private readonly store: UnencryptedFileSystemKeyStore;

  defaultConfig(): ConnectConfig {
    return {
      headers: {},
      networkId: "testnet",
      keyStore: this.store,
      nodeUrl: "https://rpc.testnet.near.org",
      walletUrl: "https://wallet.testnet.near.org",
      helperUrl: "https://helper.testnet.near.org"
    };
  }

  async addToStore(id: string, pair: KeyPair) {
    await this.store.setKey("testnet", id, pair);
  }

  getStore() {
    return this.store;
  }

  constructor(id: string, pk: string) {
    const pair = KeyPair.fromString(pk);
    const store = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);
    store.setKey("testnet", id, pair);

    this.id = id;
    this.store = store
  }
}
