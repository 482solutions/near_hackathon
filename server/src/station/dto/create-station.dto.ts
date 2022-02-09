import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateStationDto {
    @IsNotEmpty({ message: 'Name should not be empty' })
    @IsString()
    @MaxLength(50, {
        message: 'Name must be shorter than or equal to 50 characters',
    })
    name: string;

    @IsNotEmpty({ message: 'Performance should not be empty' })
    @IsString()
    @MaxLength(50, {
        message: 'Performance must be shorter than or equal to 50 characters',
    })
    plantPerformance: string;

    @IsNotEmpty({ message: 'Government aid should not be empty' })
    @IsString()
    @MaxLength(80, {
        message: 'Government aid must be shorter than or equal to 80 characters',
    })
    governmentAid: string;

    @IsNotEmpty({ message: 'Investment aid should not be empty' })
    @IsString()
    @MaxLength(80, {
        message: 'Investment aid be shorter than or equal to 80 characters',
    })
    investmentAid: string;

    @IsNotEmpty({ message: 'Exploitation Start date should not be empty' })
    exploitationStart: Date;

    @IsNotEmpty({ message: 'Creation Date should not be empty' })
    creationStart: Date;

    @IsNotEmpty({ message: 'Country should not be empty' })
    countryId: number;

    @IsNotEmpty({ message: 'Region should not be empty' })
    regionId: number;

    @IsNumber()
    manufacturerCountryId: number;
}
