import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/auth/user.entity";
import { UserRepository } from "src/auth/user.repository";
import { CreateOrganisationDto } from "./dto/create-organisation.dto";
import { Organisation } from "./dto/organisation.entity";
import { OrganisationRepository } from "./organisation.repository";

@Injectable()
export class OrganisationService {
    private logger = new Logger('OrganisationService');

    constructor(@InjectRepository(UserRepository)
    private userRepository: UserRepository, @InjectRepository(OrganisationRepository,)
        private organisationRepository: OrganisationRepository) { }

    public async getAllOrganisations(userId: string): Promise<Organisation[]> {
        const query = this.organisationRepository.createQueryBuilder('organisation');
        query.where('organisation.userId = :userId', { userId: userId })
        return await query.getMany();
    }

    public async getOrganisationById(id: number, userId: string): Promise<Organisation> {
        const found = await this.organisationRepository.findOne({ where: { id, userId: userId } });
        if (!found) {
            throw new NotFoundException(`Organisation with ${id} not found `);
        }
        return found;
    }

    public async createOrganisation(organisationInput: CreateOrganisationDto, userId: string): Promise<Organisation> {
        let organisation = this.organisationRepository.create(organisationInput);
        organisation.userId = userId;
        try {
            await organisation.save();
        } catch (error) {
            if (error.code === '23505') {//duplicate in organisation userId
                throw new ConflictException(`User must be have one organisation`);
            }
            else {
                console.log(error);
                console.log(error.stack);

                throw new InternalServerErrorException("Organisation don't save");
            }
        }
        return organisation;
    }

    public async deleteOrganisation(id: number): Promise<void> {
        const result = await this.organisationRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Organisation with ID "${id}" not found`)
        }
    }
}
