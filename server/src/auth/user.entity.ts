import {
    BaseEntity,
    Column,
    Entity,
    IsNull,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    Unique
} from "typeorm";
import * as bcrypt from 'bcrypt';
import { IsOptional } from "class-validator";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    publicKey: string;

    @Column()
    privateKey: string;
}