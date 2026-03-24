import { Injectable } from '@nestjs/common';

@Injectable()
export class TextParserProcessor {
  parse(text: string): string {
    return text.trim();
  }
}
