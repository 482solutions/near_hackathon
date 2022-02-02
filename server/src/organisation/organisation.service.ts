import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { Organisation } from './dto/organisation.entity';
import { OrganisationRepository } from './organisation.repository';

@Injectable()
export class OrganisationService {
    private logger = new Logger('OrganisationService');

    constructor(
        @InjectRepository(OrganisationRepository)
        private organisationRepository: OrganisationRepository,
    ) {}

    public async getAllOrganisations(userId: string): Promise<Organisation[]> {
        const query =
            this.organisationRepository.createQueryBuilder('organisation');
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
            this.logger.error(
                `Failed to get organisation ${registryNumber}: `,
                error.stack,
            );
            throw new InternalServerErrorException();
        }
        if (!found) {
            throw new NotFoundException(
                `Organisation ${registryNumber} not found`,
            );
        }
        return found;
    }

    public async createOrganisation(
        organisationInput: CreateOrganisationDto,
        userId: string,
    ): Promise<Organisation> {
        let organisation =
            this.organisationRepository.create(organisationInput);
        organisation.userId = userId;
        try {
            await organisation.save();
        } catch (error) {
            if (error.code === '23505') {
                //duplicate in organisation userId
                throw new ConflictException(
                    `User must be have one organisation`,
                );
            } else {
                throw new InternalServerErrorException(
                    "Organisation don't save",
                );
            }
        }
        return organisation;
    }

    public async deleteOrganisation(
        registryNumber: string,
        userId: string,
    ): Promise<void> {
        try {
            this.organisationRepository
                .createQueryBuilder('organisation')
                .delete()
                .where(
                    'registryNumber = :registryNumber AND userId = :userId',
                    {
                        registryNumber,
                        userId,
                    },
                )
                .execute();
        } catch (error) {
            this.logger.error(
                `Failed to delete organisation ${registryNumber}`,
                error.stack,
            );
            throw new InternalServerErrorException();
        }
    }
}
