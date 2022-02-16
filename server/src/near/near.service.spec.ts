import { Test, TestingModule } from '@nestjs/testing';
import { NearService } from './near.service';

describe('NearService', () => {
  let service: NearService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NearService],
    }).compile();

    service = module.get<NearService>(NearService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
