import { Controller, Delete, Get, Logger, Param, Post } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { Measurement } from './entities/measurement.entity';
import { StationService } from '../station/station.service';
import { GetMeasurement } from './dto/get-measurement-decorator';

@Controller('measurements')
export class MeasurementsController {
    private logger = new Logger('MeasurementsController');

    constructor(
        private measurementsService: MeasurementsService,
        private stationService: StationService,
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

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.measurementsService.findOne(+id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.measurementsService.remove(+id);
    }
}
