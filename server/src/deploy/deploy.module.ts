import { Module } from '@nestjs/common';
import { DeployService } from './deploy.service';
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  providers: [DeployService]
})
export class DeployModule {}
