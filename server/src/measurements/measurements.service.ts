import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeasurementRepository } from './measurement.repository';
import { Measurement } from './entities/measurement.entity';
import { Station } from '../station/entities/station.entity';
import { Organisation } from '../organisation/entities/organisation.entity';

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
        const query = this.measurementRepository.createQueryBuilder('measurement');
        try {
            return await query.getMany();
        } catch (error) {
            this.logger.error(`Failed to get all measurements: `, error.stack);
            throw new InternalServerErrorException();
        }
    }

    public async getMeasurementsByOrgAndStation(
        organisationRegistryNumber: string,
        stationName: string,
        organisations: Organisation[],
        stations: Station[],
    ): Promise<Measurement> {
        const query = this.measurementRepository.createQueryBuilder('measurement');
        let found;
        try {
            query.where(
                ' measurement.stationName = :stationName AND' +
                    ' measurement.stationOrganisationRegistryNumber = :organisationRegistryNumber AND' +
                    ' measurement.stationName IN (:...userStationNames) AND' +
                    ' measurement.stationOrganisationRegistryNumber IN (:...userOrganisationRegistryNumbers) AND' +
                    ' measurement.minted = false',
                {
                    stationName: stationName,
                    organisationRegistryNumber: organisationRegistryNumber,
                    userStationNames: stations.reduce((acc, curr) => {
                        return [...acc, curr.name];
                    }, []),
                    userOrganisationRegistryNumbers: organisations.reduce((acc, curr) => {
                        return [...acc, curr.registryNumber];
                    }, []),
                },
            );
            found = await query.getMany();
        } catch (error) {
            this.logger.error(
                `Failed to get measurements from station ${stationName}, org ${organisationRegistryNumber} `,
                error.stack,
            );
            throw new InternalServerErrorException();
        }
        if (!found) {
            throw new NotFoundException(
                `Measurements from station ${stationName}, org ${organisationRegistryNumber} not found`,
            );
        }
        return found;
    }

    public async update(id: number, measurement: Measurement) {
        try {
            await this.measurementRepository
                .createQueryBuilder()
                .update(Measurement)
                .set(measurement)
                .where('id = :id', { id })
                .execute();
        } catch (e) {
            this.logger.error(`Failed to update measurement ${id}`, e.stack);
        }
    }

    findOne(id: number) {
        return `This action returns a #${id} measurement`;
    }

    remove(id: number) {
        return `This action removes a #${id} measurement`;
    }
}
