import { Injectable, Logger } from "@nestjs/common";
import { CreateNftDto } from "./dto/create-nft.dto";
import { UpdateNftDto } from "./dto/update-nft.dto";
import { ConfigService } from "@nestjs/config";
import { connect, Near } from "near-api-js";
import { Session } from "./entities/nft.entity";

@Injectable()
export class NftService {
  private logger = new Logger('NftService');
  public connection: Near;
  private readonly session: Session;

  constructor(private configService: ConfigService) {
    this.logger.log("Constructing NftService");
    this.session = new Session(configService.get("PRIVATE_KEY"));
  }

  public async connect() {
    this.logger.log("Connecting to NEAR");
    const config = this.session.defaultConfig();

    this.connection = await connect(config);
  }

  create(createNftDto: CreateNftDto) {
    return 'This action adds a new nft';
  }

  findAll() {
    return `This action returns all nft`;
  }

  findOne(id: number) {
    return `This action returns a #${id} nft`;
  }

  update(id: number, updateNftDto: UpdateNftDto) {
    return `This action updates a #${id} nft`;
  }

  remove(id: number) {
    return `This action removes a #${id} nft`;
  }
}
