import { Station } from 'src/station/station.entity';
import {
    BaseEntity,
    Column,
    Entity,
    JoinTable,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';

@Unique(['userId'])
@Entity()
export class Organisation extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    registerNumber: string;

    @Column()
    userId: string;

    @Column()
    businessType: string;

    @Column()
    signatoryAddress: string;

    @Column()
    signatoryTelephone: string;

    @Column()
    organizationAddress: string;

    @Column()
    signatoryFullName: string;

    @Column()
    signatoryEmail: string;

    @OneToMany((type) => Station, (station) => station.organisation, {
        eager: false,
    })
    @JoinTable()
    stations: Promise<Station[]>;
}
