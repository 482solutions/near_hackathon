import { EntityRepository, Repository } from 'typeorm';
import { Organisation } from './entities/organisation.entity';

@EntityRepository(Organisation)
export class OrganisationRepository extends Repository<Organisation> {} 