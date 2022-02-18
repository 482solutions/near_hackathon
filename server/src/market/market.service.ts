import { Injectable, Logger } from "@nestjs/common";
import { NearService } from "../near/near.service";
import { Contract } from "near-api-js";
import { AskResponse, BidResponse } from "./entities/market.entity";
import { BN } from "bn.js";

const GAS_FOR_CALL = new BN("300000000000000", 10);

@Injectable()
export class MarketService {
    private readonly logger = new Logger(MarketService.name);
    private readonly contract: Contract;
    private readonly near: NearService;


    constructor(near: NearService) {
        const owner = near.owner();
        const market = `market.${owner.accountId}`;
        this.contract = new Contract(owner, market, {
            changeMethods: ["process_bid"],
            viewMethods: ["get_bids", "get_asks"]
        });
        this.near = near;
    }

    async update_market() {
        const bids: BidResponse[] = await this.contract["get_bids"]({
            from: 0,
            limit: 100
        });
        const asks: AskResponse[] = await this.contract["get_asks"]({
            from: 0,
            limit: 100
        });


        for (const bid of bids) {
            const ask = asks.find(pred => pred.ask.sale_conditions === bid.bid.sale_conditions);

            if (ask !== undefined) {
                this.logger.log(`Processing ask #${ask.id} for bid #${bid.id}`)
                await this.contract["process_bid"]({
                    ask_id: ask.id,
                    bid_id: bid.id
                }, GAS_FOR_CALL);
                break;
            }
        }
    }

}
