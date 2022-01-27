import { ConflictException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { EntityRepository, Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { User } from "./user.entity";
import { randomBytes } from 'crypto';
import { privateKeyVerify } from 'secp256k1';

@EntityRepository(User)
export class UserRepository extends Repository<User>{

}