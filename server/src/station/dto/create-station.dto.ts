import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateStationDto {
    @IsNotEmpty({ message: 'Name should not be empty' })
    @IsString()
    @MaxLength(50, {
        message: 'Name must be shorter than or equal to 50 characters',
    })
    name: string;

    @IsNotEmpty({ message: 'Placement should not be empty' })
    @IsString()
    @MaxLength(50, {
        message: 'Placement must be shorter than or equal to 50 characters',
    })
    placement: string;

    @IsNotEmpty({ message: 'Government aid should not be empty' })
    @IsString()
    @MaxLength(80, {
        message: 'Placement must be shorter than or equal to 80 characters',
    })
    supportGovernment: string;

    @IsNotEmpty({ message: 'Investment aid should not be empty' })
    @IsString()
    @MaxLength(80, {
        message: 'Placement must be shorter than or equal to 80 characters',
    })
    supportInvestment: string;

    @IsNotEmpty({ message: 'Exploitation Start date should not be empty' })
    exploitationStart: Date;

    @IsNotEmpty({ message: 'Creation Date should not be empty' })
    creationStart: Date;

    @IsNotEmpty({ message: 'Country should not be empty' })
    countryId: number;

    @IsNotEmpty({ message: 'Region should not be empty' })
    regionId: number;
}
