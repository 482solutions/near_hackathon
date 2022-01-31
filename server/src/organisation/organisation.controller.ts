import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    Post,
    ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { Organisation } from './dto/organisation.entity';
import { OrganisationService } from './organisation.service';

@Controller('organisation')
// @UseGuards(AuthGuard())
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
        @Param('id') id: number,
        @GetUser() publicKey: string,
    ): Promise<Organisation> {
        return this.organisationService.getOrganisationById(id, publicKey);
    }

    @Post()
    createOrganisation(
        @Body(ValidationPipe) createOrganisationDto: CreateOrganisationDto,
        @GetUser() publicKey,
    ): Promise<Organisation> {
        return this.organisationService.createOrganisation(
            createOrganisationDto,
            publicKey,
        );
    }

    @Delete(':id')
    deleteOrganisation(
        @Param('id') id: number,
        @GetUser() publicKey,
    ): Promise<void> {
        return this.organisationService.deleteOrganisation(id, publicKey);
    }
}
