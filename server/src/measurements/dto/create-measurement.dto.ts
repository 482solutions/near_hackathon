import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMeasurementDto {
    @IsNotEmpty({ message: 'Start Date should not be empty' })
    @IsString()
    startDate: string;

    @IsNotEmpty({ message: 'End Date should not be empty' })
    @IsString()
    endDate: string;

    @IsNotEmpty()
    @IsNumber()
    generatedEnergy: number;
}
