import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';
import { Measurement } from './entities/measurement.entity';

@Controller('measurements')
export class MeasurementsController {
    constructor(private readonly measurementsService: MeasurementsService) {}

    @Post()
    create(@Body() createMeasurementDto: CreateMeasurementDto) {
        return this.measurementsService.create(createMeasurementDto);
    }

    @Get()
    findAll(): Promise<Measurement[]> {
        return this.measurementsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.measurementsService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateMeasurementDto: UpdateMeasurementDto,
    ) {
        return this.measurementsService.update(+id, updateMeasurementDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.measurementsService.remove(+id);
    }
}
