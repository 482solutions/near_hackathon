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
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { Measurement } from './entities/measurement.entity';
import { StationService } from '../station/station.service';

@Controller('measurements')
export class MeasurementsController {
    private logger = new Logger('MeasurementsController');

    constructor(
        private measurementsService: MeasurementsService,
        private stationService: StationService,
    ) {}

    @Post()
    async create(
        @Body(ValidationPipe) createMeasurementDto: CreateMeasurementDto,
        @Req() req,
    ): Promise<Measurement> {
        this.logger.verbose(
            `Adding new measurement. Data : ${JSON.stringify(
                createMeasurementDto,
            )}`,
        );
        let station = await this.stationService.getStation(
            req.body.organisation,
            req.body.station,
        );
        return this.measurementsService.create(createMeasurementDto, station);
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
