import { Controller, Delete, Get, Logger, Param, Patch, Post, Req } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { Measurement } from './entities/measurement.entity';
import { StationService } from '../station/station.service';
import { GetMeasurement } from './dto/get-measurement-decorator';
import { GetUser } from '../auth/get-user.decorator';
import { OrganisationService } from '../organisation/organisation.service';

@Controller('measurements')
export class MeasurementsController {
    private logger = new Logger('MeasurementsController');

    constructor(
        private measurementsService: MeasurementsService,
        private stationService: StationService,
        private organisationService: OrganisationService,
    ) {}

    @Post()
    async create(@GetMeasurement() measurement: Measurement): Promise<Measurement> {
        this.logger.verbose(`Adding new measurement. Data : ${JSON.stringify(measurement)}`);
        return this.measurementsService.create(measurement);
    }

    @Get()
    findAll(): Promise<Measurement[]> {
        this.logger.verbose(`Retrieving all Measurements`);
        return this.measurementsService.findAll();
    }

    @Get('/:organisation/:station')
    async getMeasurementsByOrgAndStation(
        @Param('organisation') organisation: string,
        @Param('station') station: string,
        @GetUser() publicKey: string,
    ): Promise<Measurement> {
        this.logger.verbose(`Retrieving Measurements from station ${station}, org ${organisation}`);
        let userOrganisations = await this.organisationService.getAllOrganisations(publicKey);
        let userStations = [];
        for (const org of userOrganisations) {
            for (const station of await org.stations) {
                userStations.push(station);
            }
        }
        return this.measurementsService.getMeasurementsByOrgAndStation(
            organisation,
            station,
            userOrganisations,
            userStations,
        );
    }

    @Patch()
    async updateMeasurements(@Req() req) {
        for (const mes of req.body.measurements) {
            await this.measurementsService.update(mes.id, { ...mes, minted: true });
        }
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.measurementsService.findOne(+id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.measurementsService.remove(+id);
    }
}
