import { Module } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { MeasurementsController } from './measurements.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasurementRepository } from './measurementRepository';

@Module({
    imports: [TypeOrmModule.forFeature([MeasurementRepository])],
    controllers: [MeasurementsController],
    providers: [MeasurementsService],
})
export class MeasurementsModule {}
