import { Injectable, Logger } from "@nestjs/common";
import { CreateNftDto } from "./dto/create-nft.dto";
import { ConfigService } from "@nestjs/config";
import { connect, DEFAULT_FUNCTION_CALL_GAS, Near } from "near-api-js";
import { Pagination, Session } from "./entities/nft.entity";
import { BN } from "bn.js";
import { ExecutionStatus } from "near-api-js/lib/providers/provider";
import { atob } from "buffer";

const STORAGE_DEPOSIT = new BN("5750000000000000000000", 10);
const DEFAULT_GAS = new BN("300000000000000", 10);

@Injectable()
export class NftService {
  private logger = new Logger("NftService");
  private readonly session: Session;
  public connection: Near;

  constructor(private configService: ConfigService) {
    this.logger.log("Constructing NftService");
    this.session = new Session(configService.get("PRIVATE_KEY"), configService.get("ID"));
  }

  async create(data: CreateNftDto) {
    const { owner, metadata } = data;
    const config = this.session.defaultConfig();

    const near = await connect(config);

    const account = await near.account(this.session.id);

    const result = await account.functionCall({
      methodName: "nft_mint",
      contractId: account.accountId,
      args: {
        token_owner_id: owner,
        token_metadata: metadata
      },
      gas: DEFAULT_FUNCTION_CALL_GAS,
      attachedDeposit: STORAGE_DEPOSIT
    });

    const value = await account.connection.provider.txStatus(result.transaction_outcome.id, account.accountId)
      .then(resp => resp.status) as ExecutionStatus;

    return atob(value.SuccessValue);
  }

  async findAll(params: Pagination) {
    const config = this.session.defaultConfig();
    const { from_index, limit } = params;

    const near = await connect(config);

    const account = await near.account(this.session.id);

    try {
      const result = await account.functionCall({
        methodName: "nft_tokens",
        contractId: account.accountId,
        args: {
          from_index,
          limit
        },
        gas: DEFAULT_GAS
      });

      const value = await account.connection.provider.txStatus(result.transaction_outcome.id, account.accountId)
        .then(resp => resp.status) as ExecutionStatus;

      return atob(value.SuccessValue)
    } catch (e) {
      return e.message
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} nft`;
  }

  remove(id: number) {
    return `This action removes a #${id} nft`;
  }
}
