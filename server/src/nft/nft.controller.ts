import { Controller, Get, Post, Body, Param, Delete } from "@nestjs/common";
import { NftService } from "./nft.service";
import { CreateNftDto } from "./dto/create-nft.dto";
import { Pagination } from "./entities/nft.entity";

@Controller("nft")
export class NftController {
  constructor(private readonly nftService: NftService) {
  }

  @Post()
  create(@Body() data: CreateNftDto) {
    return this.nftService.create(data);
  }

  @Get()
  findAll(@Body() params: Pagination) {
    return this.nftService.findAll(params);
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
