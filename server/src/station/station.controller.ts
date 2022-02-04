import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    Post,
    Req,
    ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { Country } from './country.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { Region } from './region.entity';
import { Station } from './station.entity';
import { StationService } from './station.service';
import { OrganisationService } from '../organisation/organisation.service';

@Controller('station')
// @UseGuards(AuthGuard())
@ApiTags('Stations')
export class StationController {
    private logger = new Logger('StationController');

    constructor(
        private stationService: StationService,
        private organisationService: OrganisationService,
    ) {}

    @Get('/region')
    getAllRegions(): Promise<Region[]> {
        return this.stationService.getAllRegions();
    }

    @Get('/country')
    getAllCountries(): Promise<Country[]> {
        return this.stationService.getAllCountries();
    }

    @Get()
    async getAllStations(@GetUser() publicKey: string): Promise<Station[]> {
        this.logger.verbose(`Retrieving all Stations`);
        let userOrganisations =
            await this.organisationService.getAllOrganisations(publicKey);
        let stations = [];
        for (const org of userOrganisations) {
            for (const station of await org.stations) {
                stations.push(station);
            }
        }
        return stations;
    }

    @Get('/:organisation/:name')
    async getStationById(
        @Param('organisation') organisation: string,
        @Param('name') name: string,
        @GetUser() publicKey: string,
    ): Promise<Station> {
        this.logger.verbose(`Retrieving Station by name   + ${name}`);
        let org = await this.organisationService.getAllOrganisations(publicKey);
        return this.stationService.getStationById(organisation, name, org);
    }

    @Post()
    // @ApiBearerAuth('access-token')
    async createStation(
        @Body(ValidationPipe) createStationDto: CreateStationDto,
        @GetUser() publicKey: string,
        @Req() req,
    ): Promise<Station> {
        this.logger.verbose(
            `Creating new Station. Data : ${JSON.stringify(createStationDto)}`,
        );
        let org = await this.organisationService.getOrganisationById(
            req.body.organisation,
            publicKey,
        );
        return this.stationService.createStation(createStationDto, org);
    }

    @Delete('/:organisation/:name')
    async deleteStation(
        @Param('organisation') organisation: string,
        @Param('name') name: string,
        @GetUser() publicKey: string,
    ): Promise<void> {
        this.logger.verbose(`Deleting Station by name   + ${name}`);
        let org = await this.organisationService.getAllOrganisations(publicKey);
        return this.stationService.deleteStation(organisation, name, org);
    }

    @Post('/country')
    createCountry(
        @Body(ValidationPipe) createCountryDto: Country,
    ): Promise<Country> {
        this.logger.verbose(
            `Creating new Country. Data : ${JSON.stringify(createCountryDto)}`,
        );
        return this.stationService.createCountry(createCountryDto);
    }

    @Get('/country/:id')
    getCountryById(@Param('id') id: number): Promise<Country> {
        this.logger.verbose(`Retrieving Country by ID   + ${id}`);
        return this.stationService.getCountryById(id);
    }

    @Delete('/country/:id')
    deleteCountry(@Param('id') id: number): Promise<void> {
        console.log(id);
        this.logger.verbose(`Deleting Country by ID   + ${id}`);
        return this.stationService.deleteCountry(id);
    }

    @Post('/region')
    createRegion(
        @Body(ValidationPipe) createRegionDto: Region,
    ): Promise<Region> {
        this.logger.verbose(
            `Creating new region. Data : ${JSON.stringify(createRegionDto)}`,
        );
        return this.stationService.createRegion(createRegionDto);
    }

    @Delete('/region/:id')
    deleteRegion(@Param('id') id: number): Promise<void> {
        console.log(id);
        this.logger.verbose(`Deleting Region by ID   + ${id}`);
        return this.stationService.deleteRegion(id);
    }

    @Get('/region/:id')
    getRegionById(@Param('id') id: number): Promise<Region> {
        this.logger.verbose(`Retrieving Region by ID   + ${id}`);
        return this.stationService.getRegionById(id);
    }
}
