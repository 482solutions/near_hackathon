import { EntityRepository, Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { Region } from './entities/region.entity';
import { Station } from './entities/station.entity';

@EntityRepository(Station)
export class StationRepository extends Repository<Station> {} 

@EntityRepository(Country)
export class CountryRepository extends Repository<Country>{

} 

@EntityRepository(Region)
export class RegionRepository extends Repository<Region>{

} 