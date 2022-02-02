import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganisationRepository } from './organisation.repository';
import { OrganisationController } from './organisation.controller';
import { OrganisationService } from './organisation.service';

@Module({
    imports: [TypeOrmModule.forFeature([OrganisationRepository])],
    exports: [OrganisationService],
    controllers: [OrganisationController],
    providers: [OrganisationService],
})
export class OrganisationModule {}
