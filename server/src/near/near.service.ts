import { Injectable, Logger } from "@nestjs/common";
import { Session } from "../types/session";
import { ConfigService } from "@nestjs/config";
import { Account, connect, Near } from "near-api-js";
import { BN } from "bn.js";
import { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { ViewStateResult } from "near-api-js/lib/providers/provider";
import { KeyPairEd25519 } from "near-api-js/lib/utils";

export const NO_DEPOSIT = new BN("0", 10);
export const DEFAULT_GAS = new BN("300000000000000", 10);
const INITIAL_BALANCE = new BN("3464010000000000000000000", 10);


@Injectable()
export class NearService {
  private readonly logger = new Logger("NearService");
  private readonly session: Session;
  private near: Near
  private ownerAccount: Account;

  constructor(private configService: ConfigService) {
    this.logger.log("Creating session");
    this.session = new Session(configService.get("ID"), configService.get("PRIVATE_KEY"));
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

  async contract_state(id: string): Promise<ViewStateResult> {
    return await this.near.connection.provider.query({
      request_type: "view_state",
      finality: "final",
      account_id: id,
      prefix_base64: "",
    })
  }

  async deploy(id: string, contract: Uint8Array): Promise<Account> {
    const account = `${id}.${this.session.id}`;
    const keyPair = KeyPairEd25519.fromRandom();
    await this.session.addToStore(account, keyPair);
    return await this.ownerAccount.createAndDeployContract(account, keyPair.getPublicKey(), contract, INITIAL_BALANCE);
  }

  async initContract(account: Account, method: string, args: object): Promise<FinalExecutionOutcome> {
      return await account.functionCall({
        contractId: account.accountId,
        methodName: method,
        args,
        gas: DEFAULT_GAS,
        attachedDeposit: NO_DEPOSIT
      })
  }

  async createSubAccount(id: string): Promise<Account> {
    const account = `${id}.${this.session.id}`;
    const keyPair = KeyPairEd25519.fromRandom();
    const publicKey = keyPair.getPublicKey();

    await this.session.addToStore(id, keyPair);
    await this.ownerAccount.createAccount(account, publicKey, INITIAL_BALANCE);
    await this.ownerAccount.addKey(publicKey, id)

    return await this.subAccount(id);
  }
}
