import { Controller, Get, Post, Body, Param, Delete, Query } from "@nestjs/common";
import { NftService } from "./nft.service";
import { CreateNftDto } from "./dto/create-nft.dto";

@Controller("nft")
export class NftController {
  constructor(private readonly nftService: NftService) {
  }

  @Post()
  create(@Body() data: CreateNftDto) {
    return this.nftService.create(data);
  }

  @Get()
  findAll(@Query("from") from: string, @Query("limit") limit: number, @Query("owner") owner: string) {
    return this.nftService.findAll({ from_index: from, limit: +limit, owner_id: owner });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.nftService.findOne(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.nftService.remove(+id);
  }
}
