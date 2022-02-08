import { Module } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { MeasurementsController } from './measurements.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasurementRepository } from './measurement.repository';
import { StationModule } from '../station/station.module';
import { OrganisationModule } from '../organisation/organisation.module';

@Module({
    imports: [StationModule, OrganisationModule, TypeOrmModule.forFeature([MeasurementRepository])],
    controllers: [MeasurementsController],
    providers: [MeasurementsService],
})
export class MeasurementsModule {}
