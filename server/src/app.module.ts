import { Module } from '@nestjs/common';
import { StationModule } from './station/station.module';
import { OrganisationModule } from './organisation/organisation.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { MeasurementsModule } from './measurements/measurements.module';


@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), StationModule, OrganisationModule, MeasurementsModule],
})
export class AppModule { }
