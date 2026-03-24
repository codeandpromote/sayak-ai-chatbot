export enum KnowledgeSourceType {
  URL = 'URL',
  PDF = 'PDF',
  DOCX = 'DOCX',
  TEXT = 'TEXT',
}

export enum IngestionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface KnowledgeSource {
  id: string;
  chatbotId: string;
  type: KnowledgeSourceType;
  name: string;
  sourceUrl?: string;
  fileName?: string;
  fileSize?: number;
  status: IngestionStatus;
  chunkCount: number;
}
