import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeasurementRepository } from './measurement.repository';
import { Measurement } from './entities/measurement.entity';

@Injectable()
export class MeasurementsService {
    private logger = new Logger('MeasurementService');

    constructor(
        @InjectRepository(MeasurementRepository)
        private measurementRepository: MeasurementRepository,
    ) {}

    public async create(measurementDto: Measurement): Promise<Measurement> {
        let measurement;
        try {
            measurement = await this.measurementRepository
                .createQueryBuilder()
                .insert()
                .into(Measurement)
                .values({
                    ...measurementDto,
                })
                .execute();
        } catch (e) {
            this.logger.error(`Failed to create new measurement: `, e.stack);
            throw new InternalServerErrorException();
        }
        return measurement.raw;
    }

    public async findAll(): Promise<Measurement[]> {
        const query = this.measurementRepository.createQueryBuilder('measurements');
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

    remove(id: number) {
        return `This action removes a #${id} measurement`;
    }
}
