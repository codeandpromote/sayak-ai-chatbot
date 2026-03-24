import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { EventTrackerService } from './event-tracker.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, EventTrackerService],
  exports: [AnalyticsService, EventTrackerService],
})
export class AnalyticsModule {}
