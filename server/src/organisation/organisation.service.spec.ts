import { Test } from '@nestjs/testing'
import { OrganisationRepository } from './organisation.repository';
import { OrganisationService } from './organisation.service';

const mockOrganisationRepository = () => ({
    getAllOrganisations: jest.fn(),

});

describe('OrganisationService', () => {
    let organisationService;
    let organisationRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                OrganisationService,
                { provide: OrganisationRepository, useFactory: mockOrganisationRepository }
            ],
        }).compile();

        organisationService = await module.get<OrganisationService>(OrganisationService);
        organisationRepository = await module.get<OrganisationRepository>(OrganisationRepository);
    })

    describe('getAllOrganisations', () => {
        it('get all Organisations from the repository', async () => {
            expect(organisationRepository.getAllOrganisations).not.toHaveBeenCalled();

        })
    })
})