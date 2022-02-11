import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { Organisation } from './entities/organisation.entity';
import { OrganisationRepository } from './organisation.repository';

@Injectable()
export class OrganisationService {
    private logger = new Logger('OrganisationService');

    constructor(
        @InjectRepository(OrganisationRepository)
        private organisationRepository: OrganisationRepository,
    ) {}

    public async getAllOrganisations(userId: string): Promise<Organisation[]> {
        const query = this.organisationRepository.createQueryBuilder('organisation');
        try {
            query.where('organisation.userId = :userId', { userId: userId });
            return await query.getMany();
        } catch (error) {
            this.logger.error(`Failed to get all stations: `, error.stack);
            throw new InternalServerErrorException();
        }
    }

    public async getOrganisationById(
        registryNumber: string,
        userId: string,
    ): Promise<Organisation> {
        let found;
        try {
            found = await this.organisationRepository.findOne({
                where: { registryNumber: registryNumber, userId: userId },
            });
        } catch (error) {
            this.logger.error(`Failed to get organisation ${registryNumber}: `, error.stack);
            throw new InternalServerErrorException();
        }
        if (!found) {
            throw new NotFoundException(`Organisation ${registryNumber} not found`);
        }
        return found;
    }

    public async createOrganisation(
        organisationInput: CreateOrganisationDto,
        userId: string,
    ): Promise<Organisation> {
        let found = await this.organisationRepository.findOne({
            where: { registryNumber: organisationInput.registryNumber },
        });
        if (found) throw new UnprocessableEntityException('Organisation already exists');

        let organisation = this.organisationRepository.create(organisationInput);
        try {
            organisation.userId = userId;
            await organisation.save();
        } catch (error) {
            throw new InternalServerErrorException('Organisation creation failed');
        }
        return organisation;
    }

    public async deleteOrganisation(registryNumber: string, userId: string): Promise<void> {
        try {
            await this.organisationRepository
                .createQueryBuilder('organisation')
                .delete()
                .where('registryNumber = :registryNumber AND userId = :userId', {
                    registryNumber,
                    userId,
                })
                .execute();
        } catch (error) {
            this.logger.error(`Failed to delete organisation ${registryNumber}`, error.stack);
            throw new InternalServerErrorException();
        }
    }
}
