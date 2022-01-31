import { ApiProperty } from '@nestjs/swagger';
import { Organisation } from 'src/organisation/dto/organisation.entity';
import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { EEnergyType } from './station-energyType.enum';

@Entity()
export class Station extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 'testName' })
    @Column()
    name: string;

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
    organisation: Promise<Organisation>;
}
