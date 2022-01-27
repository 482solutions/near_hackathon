import {  IsNotEmpty,  IsString, MaxLength } from "class-validator";
export class CreateCountryDto {

    @IsNotEmpty({message:"Country should not be empty"})
    @IsString()
    @MaxLength(100)
    name: string;
}