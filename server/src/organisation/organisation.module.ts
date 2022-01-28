import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganisationRepository } from './organisation.repository';
import { OrganisationController } from './organisation.controller';
import { OrganisationService } from './organisation.service';
import { UserRepository } from 'src/auth/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganisationRepository, UserRepository]),
  ],
  exports: [OrganisationService],
  controllers: [OrganisationController],
  providers: [OrganisationService]
})
export class OrganisationModule {}
