import { EntityRepository, Repository } from "typeorm";
import { Country } from "./country.entity";
import { Region } from "./region.entity";
import { Station } from "./station.entity";



@EntityRepository(Station)
export class StationRepository extends Repository<Station>{

} 

@EntityRepository(Country)
export class CountryRepository extends Repository<Country>{

} 

@EntityRepository(Region)
export class RegionRepository extends Repository<Region>{

} 