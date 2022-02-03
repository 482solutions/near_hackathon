import { ApiProperty } from '@nestjs/swagger';
import { Organisation } from 'src/organisation/dto/organisation.entity';
import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
} from 'typeorm';
import { EEnergyType } from './station-energyType.enum';
import { Measurement } from '../measurements/entities/measurement.entity';

@Entity()
export class Station extends BaseEntity {
    @PrimaryColumn()
    name: string;

    @PrimaryColumn()
    organisationRegistryNumber: string;

    @Column()
    @ApiProperty({ example: EEnergyType.SOLAR })
    stationEnergyType: EEnergyType;

    @Column()
    @ApiProperty({ example: 'testplacements' })
    placement: string;

    @Column()
    @ApiProperty({ example: 'testpsupport' })
    supportGovernment: string;

    @Column()
    @ApiProperty({ example: 'testpsupport' })
    supportInvestment: string;

    @Column()
    @ApiProperty({ example: new Date().toISOString() })
    exploitationStart: Date;

    @Column()
    @ApiProperty({ example: new Date().toISOString() })
    creationStart: Date;

    @ApiProperty({ example: 1 })
    @Column()
    countryId: Number;

    @ApiProperty({ example: 1 })
    @Column()
    regionId: Number;

    @ManyToOne(
        (type) => Organisation,
        (organisation) => organisation.stations,
        { eager: false, onDelete: 'CASCADE' },
    )
    @JoinColumn({ name: 'organisationRegistryNumber' })
    organisation: Promise<Organisation>;

    @OneToMany((type) => Measurement, (measurement) => measurement.station, {
        eager: false,
    })
    @JoinTable()
    measurements: Promise<Measurement[]>;
}
