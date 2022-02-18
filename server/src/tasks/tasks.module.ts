import { Module } from '@nestjs/common';
import { TasksService } from "./tasks.service";
import { MarketModule } from "../market/market.module";

@Module({
  imports: [MarketModule],
  providers: [TasksService],
})
export class TasksModule {}
