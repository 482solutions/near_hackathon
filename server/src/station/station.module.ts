import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationController } from './station.controller';
import { CountryRepository, RegionRepository, StationRepository } from './station.repository';
import { StationService } from './station.service';
import { OrganisationModule } from '../organisation/organisation.module';

@Module({
  imports: [
    OrganisationModule,
    TypeOrmModule.forFeature([StationRepository, CountryRepository, RegionRepository]),
  ],
  exports:[StationService],
  controllers: [StationController],
  providers: [StationService]
})
export class StationModule { }
