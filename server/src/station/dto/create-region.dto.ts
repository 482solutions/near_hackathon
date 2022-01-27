import { IsNotEmpty, IsString, MaxLength } from "class-validator";
export class CreateRegionDto {

    @IsNotEmpty({message:"Region should not be empty"})
    @IsString()
    @MaxLength(100)
    name: string;
}