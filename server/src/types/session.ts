import { ConnectConfig, KeyPair, keyStores } from "near-api-js";
import { UnencryptedFileSystemKeyStore } from "near-api-js/lib/key_stores";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { KeyPairEd25519 } from "near-api-js/lib/utils";

const homedir = os.homedir();

const CREDENTIALS_DIR = ".near-credentials";
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);

interface Credentials {
  account_id: string,
  public_key: string,
  private_key: string
}

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

  async addToStore(id: string, pair: KeyPairEd25519) {
    await this.store.setKey("testnet", id, pair);
    const creds: Credentials = {
      account_id: id,
      public_key: pair.publicKey.toString(),
      private_key: pair.secretKey
    }
    fs.writeFileSync(`${credentialsPath}/testnet/${id}.json`, JSON.stringify(creds))
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
