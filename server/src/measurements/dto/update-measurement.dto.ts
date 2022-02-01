import { PartialType } from '@nestjs/swagger';
import { CreateMeasurementDto } from './create-measurement.dto';

export class UpdateMeasurementDto extends PartialType(CreateMeasurementDto) {}
