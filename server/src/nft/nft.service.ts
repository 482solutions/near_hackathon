import { Injectable, Logger } from "@nestjs/common";
import { CreateNftDto } from "./dto/create-nft.dto";
import { DEFAULT_FUNCTION_CALL_GAS } from "near-api-js";
import { Pagination } from "./entities/nft.entity";
import { BN } from "bn.js";
import { ExecutionStatus } from "near-api-js/lib/providers/provider";
import { NearService } from "../near/near.service";

const STORAGE_DEPOSIT = new BN("9750000000000000000000", 10);
const DEFAULT_GAS = new BN("300000000000000", 10);

@Injectable()
export class NftService {
  private logger = new Logger("NftService");
  private near: NearService;

  constructor(near: NearService) {
    this.logger.log("Constructing NftService");
    this.near = near;
  }

  async create(data: CreateNftDto) {
    const { owner, metadata } = data;

    const account = this.near.owner();

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

    return Buffer.from(value.SuccessValue, "base64")
  }

  async findAll(params: Pagination) {
    const { from_index, limit } = params;

    const account = this.near.owner();

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

      return Buffer.from(value.SuccessValue, "base64")
    } catch (e) {
      return e.message;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} nft`;
  }

  remove(id: number) {
    return `This action removes a #${id} nft`;
  }
}
