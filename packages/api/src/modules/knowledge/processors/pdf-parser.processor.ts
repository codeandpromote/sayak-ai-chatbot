import { Injectable, Logger } from '@nestjs/common';
import { createReadStream } from 'fs';

@Injectable()
export class PdfParserProcessor {
  private readonly logger = new Logger(PdfParserProcessor.name);

  async parse(filePath: string): Promise<string> {
    this.logger.log(`Parsing PDF: ${filePath}`);

    // Read file as buffer in chunks to manage memory
    const chunks: Buffer[] = [];
    const stream = createReadStream(filePath, { highWaterMark: 64 * 1024 });

    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }

    const buffer = Buffer.concat(chunks);
    chunks.length = 0; // Free individual chunks

    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(buffer);

    this.logger.log(`Parsed PDF: ${result.numpages} pages, ${result.text.length} characters`);
    return result.text;
  }
}
