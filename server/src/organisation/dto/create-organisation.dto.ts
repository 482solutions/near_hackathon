import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateOrganisationDto {

    @IsNotEmpty({message : "Name should not be empty"})
    @IsString()
    @MaxLength(50,{message:"Name must be shorter than or equal to 50 characters"})
    name: string;

    @IsNotEmpty({message : "Trade register number should not be empty"})
    @IsString()
    @MaxLength(50,{message:"Trade register number must be shorter than or equal to 50 characters"})
    registerNumber: string;

    @IsNotEmpty({message : "Business Type should not be empty"})
    @IsString()
    @MaxLength(50,{message:"Business Type must be shorter than or equal to 50 characters"})
    businessType: string;

    @IsNotEmpty({message : "Signatory Address should not be empty"})
    @IsString()
    @MaxLength(50,{message:"Signatory Address must be shorter than or equal to 50 characters"})
    signatoryAddress: string;

    @IsNotEmpty({message : "Signatory Telephone should not be empty"})
    @IsString()
    @MaxLength(50,{message:"Signatory Telephone must be shorter than or equal to 50 characters"})
    signatoryTelephone: string;

    @IsNotEmpty({message : "Organization Address should not be empty"})
    @IsString()
    @MaxLength(50,{message:"Organization Address must be shorter than or equal to 50 characters"})
    organizationAddress: string;

    @IsNotEmpty({message : "Signatory Full Name should not be empty"})
    @IsString()
    @MaxLength(50,{message:"Signatory Full Name must be shorter than or equal to 50 characters"})
    signatoryFullName: string;

    @IsNotEmpty({message : "Signatory Email should not be empty"})
    @IsString()
    @MaxLength(50,{message:"Signatory Email must be shorter than or equal to 50 characters"})
    signatoryEmail: string;
}