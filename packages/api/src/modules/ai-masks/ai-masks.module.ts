import { Module } from '@nestjs/common';
import { AiMasksController } from './ai-masks.controller';
import { AiMasksService } from './ai-masks.service';

@Module({
  controllers: [AiMasksController],
  providers: [AiMasksService],
  exports: [AiMasksService],
})
export class AiMasksModule {}
