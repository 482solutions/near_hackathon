import { Station } from "src/station/station.entity";
import { BaseEntity, Column, Entity, JoinTable, OneToMany, PrimaryColumn } from "typeorm";

// @Unique(['userId'])
@Entity()
export class Organisation extends BaseEntity {
    @PrimaryColumn()
    registryNumber: string;

    @Column()
    name: string;

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
