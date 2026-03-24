import { Injectable, Logger } from '@nestjs/common';
import mammoth from 'mammoth';

@Injectable()
export class DocxParserProcessor {
  private readonly logger = new Logger(DocxParserProcessor.name);

  async parse(filePath: string): Promise<string> {
    this.logger.log(`Parsing DOCX: ${filePath}`);
    const result = await mammoth.extractRawText({ path: filePath });
    this.logger.log(`Parsed DOCX: ${result.value.length} characters`);
    return result.value;
  }
}
