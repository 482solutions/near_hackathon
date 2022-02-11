import { ApiProperty } from '@nestjs/swagger';
import { Organisation } from 'src/organisation/entities/organisation.entity';
import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    Unique,
} from 'typeorm';
import { EEnergyType } from '../station-energyType.enum';
import { Measurement } from '../../measurements/entities/measurement.entity';

@Entity()
@Unique(['name', 'organisationRegistryNumber'])
export class Station extends BaseEntity {
    @PrimaryColumn()
    name: string;

    @PrimaryColumn()
    organisationRegistryNumber: string;

    @Column()
    @ApiProperty({ example: EEnergyType.SOLAR })
    stationEnergyType: EEnergyType;

    @Column()
    @ApiProperty({ example: '1mW/h' })
    plantPerformance: string;

    @Column()
    @ApiProperty({ example: 'testpsupport' })
    governmentAid: string;

    @Column()
    @ApiProperty({ example: 'testpsupport' })
    investmentAid: string;

    @Column()
    @ApiProperty({ example: new Date().toISOString() })
    exploitationStart: Date;

    @Column()
    @ApiProperty({ example: new Date().toISOString() })
    manufactureDate: Date;

    @ApiProperty({ example: 1 })
    @Column()
    countryId: number;

    @ApiProperty({ example: 1 })
    @Column()
    regionId: number;

    @ApiProperty({ example: 1 })
    @Column()
    manufacturerCountryId: number;

    @ManyToOne((type) => Organisation, (organisation) => organisation.stations, {
        eager: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'organisationRegistryNumber' })
    organisation: Promise<Organisation>;

    @OneToMany((type) => Measurement, (measurement) => measurement.station, {
        eager: false,
    })
    measurements: Promise<Measurement[]>;
}
