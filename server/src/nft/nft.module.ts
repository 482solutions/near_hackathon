import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { NftService } from './nft.service';
import { NftController } from './nft.controller';

@Module({
  imports: [ConfigModule],
  controllers: [NftController],
  providers: [NftService]
})
export class NftModule {}
