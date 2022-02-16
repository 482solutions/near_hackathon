import { Injectable, Logger } from "@nestjs/common";
import { Session } from "../types/session";
import { ConfigService } from "@nestjs/config";
import { Account, connect, KeyPair, Near } from "near-api-js";
import { BN } from "bn.js";

const INITIAL_BALANCE = new BN("3464010000000000000000000", 10);

@Injectable()
export class NearService {
  private logger = new Logger("NearService");
  private readonly session: Session;
  private near: Near
  private ownerAccount: Account;

  constructor(private configService: ConfigService) {
    this.logger.log("Creating session");
    this.session = new Session(configService.get("ID"));
    this.init();
  }

  async init() {
    this.near = await connect(this.session.defaultConfig());
    this.ownerAccount = await this.near.account(this.session.id);
  }

  owner(): Account {
    return this.ownerAccount;
  }

  async subAccount(id: string): Promise<Account> {
    return await this.near.account(`${id}.${this.session.id}`)
  }

  async deploy(id: string, contract: Uint8Array): Promise<Account> {
    const account = `${id}.${this.session.id}`;
    const keyPair = KeyPair.fromRandom("ed25519");
    return await this.ownerAccount.createAndDeployContract(account, keyPair.getPublicKey(), contract, INITIAL_BALANCE)
  }

  // TODO: Add saving of keyPair to JSON-file
  async createSubAccount(id: string): Promise<Account> {
    const account = `${id}.${this.session.id}`;
    const keyPair = KeyPair.fromRandom("ed25519");
    const publicKey = keyPair.getPublicKey();

    await this.session.addToStore(id, keyPair);
    await this.ownerAccount.createAccount(account, publicKey, INITIAL_BALANCE);
    await this.ownerAccount.addKey(publicKey)

    return await this.subAccount(id);
  }
}
