import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { LLMProvider } from '@prisma/client';

export class CreateChatbotDto {
  @IsString() @MaxLength(100) name: string;
  @IsString() @IsOptional() @MaxLength(500) description?: string;
  @IsEnum(LLMProvider) @IsOptional() llmProvider?: LLMProvider;
  @IsString() @IsOptional() primaryColor?: string;
  @IsString() @IsOptional() welcomeMessage?: string;
  @IsString() @IsOptional() placeholderText?: string;
}
