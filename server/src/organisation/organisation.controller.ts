import { Body, Controller, Delete, Get, Logger, Param, Post, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { Organisation } from './entities/organisation.entity';
import { OrganisationService } from './organisation.service';

@Controller('organisation')
@ApiTags('Organisation')
export class OrganisationController {
    private logger = new Logger('OrganisationController');

    constructor(private organisationService: OrganisationService) {}

    @Get()
    getAllOrganisations(@GetUser() publicKey: string): Promise<Organisation[]> {
        return this.organisationService.getAllOrganisations(publicKey);
    }

    @Get(':id')
    getOrganisationById(
        @Param('id') registryNumber: string,
        @GetUser() publicKey: string,
    ): Promise<Organisation> {
        this.logger.verbose(`Retrieving Organisation ${registryNumber}`);
        return this.organisationService.getOrganisationById(registryNumber, publicKey);
    }

    @Post()
    createOrganisation(
        @Body(ValidationPipe) createOrganisationDto: CreateOrganisationDto,
        @GetUser() publicKey,
    ): Promise<Organisation> {
        this.logger.verbose(
            `Creating new Organisation. Data : ${JSON.stringify(createOrganisationDto)}`,
        );
        return this.organisationService.createOrganisation(createOrganisationDto, publicKey);
    }

    @Delete(':id')
    deleteOrganisation(@Param('id') registryNumber: string, @GetUser() publicKey): Promise<void> {
        return this.organisationService.deleteOrganisation(registryNumber, publicKey);
    }
}
