import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Measurement extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    stationNeeds: number;

    @Column()
    generatedEnergy: string;

    @Column()
    balance: number;
}
