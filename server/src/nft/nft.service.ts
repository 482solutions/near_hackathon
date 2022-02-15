import { Injectable, Logger } from "@nestjs/common";
import { CreateNftDto } from "./dto/create-nft.dto";
import { ConfigService } from "@nestjs/config";
import { connect, DEFAULT_FUNCTION_CALL_GAS, Near } from "near-api-js";
import { Session } from "./entities/nft.entity";
import { BN } from "bn.js";

const STORAGE_DEPOSIT = new BN("5750000000000000000000", 10);

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

    return await account.connection.provider.txStatus(result.transaction.hash, account.accountId)
  }

  findAll() {
    return `This action returns all nft`;
  }

  findOne(id: number) {
    return `This action returns a #${id} nft`;
  }

  remove(id: number) {
    return `This action removes a #${id} nft`;
  }
}
