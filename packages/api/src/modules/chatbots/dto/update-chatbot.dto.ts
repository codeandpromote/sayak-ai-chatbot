import { IsString, IsOptional, IsBoolean, IsEnum, MaxLength } from 'class-validator';
import { LLMProvider } from '@prisma/client';

export class UpdateChatbotDto {
  @IsString() @IsOptional() @MaxLength(100) name?: string;
  @IsString() @IsOptional() @MaxLength(500) description?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsEnum(LLMProvider) @IsOptional() llmProvider?: LLMProvider;
  @IsString() @IsOptional() llmModel?: string;
  @IsString() @IsOptional() widgetPosition?: string;
  @IsString() @IsOptional() primaryColor?: string;
  @IsString() @IsOptional() welcomeMessage?: string;
  @IsString() @IsOptional() placeholderText?: string;
  @IsString() @IsOptional() avatarUrl?: string;
  @IsBoolean() @IsOptional() leadCaptureEnabled?: boolean;
  @IsBoolean() @IsOptional() appointmentEnabled?: boolean;
  @IsBoolean() @IsOptional() handoffEnabled?: boolean;
}
