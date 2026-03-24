import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AvailabilityService } from './availability.service';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller()
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService, private availabilityService: AvailabilityService) {}

  @Get('appointments')
  findAll(@CurrentTenant() tenantId: string) { return this.appointmentsService.findAll(tenantId); }

  @Patch('appointments/:id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) { return this.appointmentsService.updateStatus(id, status); }

  @Public()
  @Get('widget/chatbots/:chatbotId/availability')
  getAvailability(@Param('chatbotId') chatbotId: string, @Query('date') date: string) { return this.availabilityService.getAvailableSlots(chatbotId, date); }

  @Public()
  @Post('widget/appointments')
  book(@Body() dto: { chatbotId: string; visitorName: string; visitorEmail: string; visitorPhone?: string; startTime: string; notes?: string }) { return this.appointmentsService.book(dto); }

  @Post('chatbots/:chatbotId/booking-config')
  updateBookingConfig(@CurrentTenant() tenantId: string, @Param('chatbotId') chatbotId: string, @Body() dto: any) { return this.appointmentsService.upsertBookingConfig(tenantId, chatbotId, dto); }
}
