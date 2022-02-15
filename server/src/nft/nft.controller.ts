import { Controller, Get, Post, Body, Param, Delete } from "@nestjs/common";
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
  findAll() {
    return this.nftService.findAll();
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
