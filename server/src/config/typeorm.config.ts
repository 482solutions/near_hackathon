import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Organisation } from '../organisation/entities/organisation.entity';
import { Measurement } from '../measurements/entities/measurement.entity';
import { Station } from '../station/entities/station.entity';
import { Country } from '../station/entities/country.entity';
import { Region } from '../station/entities/region.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'near_eac',
    entities: [Organisation, Station, Measurement, Country, Region],
    synchronize: true,
};
