import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Station } from '../../station/station.entity';

@Entity()
export class Measurement extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ update: true })
    stationName: string;

    @Column({ update: true })
    stationOrganisationRegistryNumber: string;

    @Column()
    startDate: string;

    @Column()
    endDate: string;

    @Column()
    generatedEnergy: number;

    @Column({ default: false })
    minted: boolean;

    @ManyToOne((type) => Station, (station) => station.measurements, {
        eager: false,
        onDelete: 'CASCADE',
    })
    station: Promise<Station>;
}
