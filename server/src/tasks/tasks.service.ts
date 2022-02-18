import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { MarketService } from "../market/market.service";

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private readonly market: MarketService;

  constructor(market: MarketService) {
    this.market = market;
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async updateMarket() {
    this.logger.log("Executing market update task");
    await this.market.update_market()
  }
}
