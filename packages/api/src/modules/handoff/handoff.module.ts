import { Module } from '@nestjs/common';
import { HandoffController } from './handoff.controller';
import { HandoffGateway } from './handoff.gateway';
import { HandoffService } from './handoff.service';

@Module({
  controllers: [HandoffController],
  providers: [HandoffGateway, HandoffService],
  exports: [HandoffService],
})
export class HandoffModule {}
