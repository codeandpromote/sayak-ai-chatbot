import { Injectable } from '@nestjs/common';

export interface TextChunk {
  content: string;
  metadata: { chunkIndex: number };
  tokenCount: number;
}

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

@Injectable()
export class ChunkingService {
  private separators = ['\n\n', '\n', '. ', ', ', ' ', ''];

  async splitText(text: string): Promise<TextChunk[]> {
    const chunks = this.recursiveSplit(text, this.separators);
    return chunks.map((content, index) => ({
      content,
      metadata: { chunkIndex: index },
      tokenCount: this.estimateTokens(content),
    }));
  }

  private recursiveSplit(text: string, separators: string[]): string[] {
    const finalChunks: string[] = [];
    let separator = separators[separators.length - 1];

    for (let i = 0; i < separators.length; i++) {
      if (separators[i] === '' || text.includes(separators[i])) {
        separator = separators[i];
        break;
      }
    }

    const splits = separator ? text.split(separator) : [text];
    let currentChunk: string[] = [];
    let currentLength = 0;

    for (const split of splits) {
      const piece = split + (separator || '');
      const pieceLength = this.estimateTokens(piece);

      if (currentLength + pieceLength > CHUNK_SIZE && currentChunk.length > 0) {
        const chunk = currentChunk.join('').trim();
        if (chunk) finalChunks.push(chunk);

        // Keep overlap
        while (currentLength > CHUNK_OVERLAP && currentChunk.length > 1) {
          const removed = currentChunk.shift()!;
          currentLength -= this.estimateTokens(removed);
        }
      }

      currentChunk.push(piece);
      currentLength += pieceLength;
    }

    const lastChunk = currentChunk.join('').trim();
    if (lastChunk) finalChunks.push(lastChunk);

    return finalChunks;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
