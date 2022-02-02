import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';
import { MeasurementRepository } from './measurementRepository';
import { Measurement } from './entities/measurement.entity';

@Injectable()
export class MeasurementsService {
    private logger = new Logger('MeasurementService');

    constructor(
        @InjectRepository(MeasurementRepository)
        private measurementRepository: MeasurementRepository,
    ) {}

    create(createMeasurementDto: CreateMeasurementDto) {
        return 'This action adds a new measurement';
    }

    public async findAll(): Promise<Measurement[]> {
        const query =
            this.measurementRepository.createQueryBuilder('measurements');
        try {
            return await query.getMany();
        } catch (error) {
            this.logger.error(`Failed to get all stations: `, error.stack);
            throw new InternalServerErrorException();
        }
    }

    findOne(id: number) {
        return `This action returns a #${id} measurement`;
    }

    update(id: number, updateMeasurementDto: UpdateMeasurementDto) {
        return `This action updates a #${id} measurement`;
    }

    remove(id: number) {
        return `This action removes a #${id} measurement`;
    }
}
