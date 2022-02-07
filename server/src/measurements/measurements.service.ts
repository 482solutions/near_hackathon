import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { MeasurementRepository } from './measurement.repository';
import { Measurement } from './entities/measurement.entity';
import { Station } from '../station/station.entity';

@Injectable()
export class MeasurementsService {
    private logger = new Logger('MeasurementService');

    constructor(
        @InjectRepository(MeasurementRepository)
        private measurementRepository: MeasurementRepository,
    ) {}

    public async create(
        measurementDto: CreateMeasurementDto,
        station: Station,
    ): Promise<Measurement> {
        let measurement;
        try {
            measurement = await this.measurementRepository
                .createQueryBuilder()
                .insert()
                .into(Measurement)
                .values({
                    ...measurementDto,
                    stationName: station.name,
                    stationOrganisationRegistryNumber:
                        station.organisationRegistryNumber,
                })
                .execute();
        } catch (e) {
            this.logger.error(`Failed to create new measurement: `, e.stack);
            throw new InternalServerErrorException();
        }
        return measurement.records[0];
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

    remove(id: number) {
        return `This action removes a #${id} measurement`;
    }
}
