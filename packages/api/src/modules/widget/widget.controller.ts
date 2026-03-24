import { Controller, Get, Param } from '@nestjs/common';
import { WidgetService } from './widget.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('widget')
export class WidgetController {
  constructor(private widgetService: WidgetService) {}

  @Public()
  @Get('config/:chatbotId')
  getConfig(@Param('chatbotId') chatbotId: string) { return this.widgetService.getConfig(chatbotId); }
}
