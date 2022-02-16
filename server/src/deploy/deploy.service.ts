import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as fs from "fs";
import { NearService } from "../near/near.service";

const NFT_PATH = "../contracts/out/nft.wasm";
const MARKET_PATH = "../contracts/out/market.wasm";


@Injectable()
export class DeployService implements OnModuleInit {
  private logger = new Logger("DeployService");
  private near: NearService;

  constructor(near: NearService) {
    this.near = near;
  }

  async onModuleInit(): Promise<void> {
    const nftContract = fs.readFileSync(NFT_PATH);
    const marketContract = fs.readFileSync(NFT_PATH);
    const ownerId = this.near.owner().accountId;

    let market = await this.near.subAccount("market");
    const nft = this.near.owner();

    const marketState = await market.state().catch(async e => {
      /* TODO: Replace this dumb handling based on message on
       another dumb handling based on error code */
      if (e.message.includes("does not exist while viewing")) {
        this.logger.error("Market sub-account does not exist, creating it now and deploying");
        market = await this.near.deploy("market", marketContract);
        await this.near.initContract(market, "new", { owner_id: ownerId });
        return await market.state();

      }
    });

    const nftState = await nft.state();

    if (!isDeployed(marketState.code_hash)) {
      this.logger.warn("Market contract is not deployed");
      /* TODO: Not sure what to do rn, because cannot figure out how to properly store
       creds after account creation (probably need to manually create JSON-file */
      await this.near.deploy("market", marketContract);
    } else {
      this.logger.log("Market already deployed");
    }

    if (!isDeployed(nftState.code_hash)) {
      this.logger.warn("NFT contract is not deployed");

      await nft.deployContract(nftContract);
    } else {
      this.logger.log("NFT already deployed");

      // const result = await this.near.initContract(nft, "new_default_meta", { owner_id: ownerId });

      // this.logger.log(result);
    }

  }
}

const isDeployed = (hash: string): boolean => {
  for (const c of hash) {
    if (c !== "1") return true;
  }
  return false;
};