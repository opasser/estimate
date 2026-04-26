import { Test, TestingModule } from '@nestjs/testing';
import { PerformerController } from './performer.controller';
import { PerformerService } from '../service/performer.service';

describe('PerformersController', () => {
  let controller: PerformerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PerformerController],
      providers: [PerformerService],
    }).compile();

    controller = module.get<PerformerController>(PerformerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
