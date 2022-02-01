import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class CreateMeasurementDto {
    @IsNotEmpty({ message: 'Date should not be empty' })
    @IsString()
    @Length(11, 11, {
        message: 'Date must be 9 characters long',
    })
    date: string;

    @IsNotEmpty()
    @IsNumber()
    stationNeeds: number;

    @IsNotEmpty()
    @IsNumber()
    generatedEnergy: number;

    @IsNotEmpty()
    @IsNumber()
    balance: number;
}
