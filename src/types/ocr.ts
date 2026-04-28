// OCR Service Types & Interfaces

export interface OCRFileMetadata {
  file: File;
  previewUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
}

export interface OCRProgress {
  status: 'loading' | 'recognizing' | 'done' | 'error';
  progress: number; // 0-100
  message: string;
}

export interface OCRResult {
  extractedText: string;
  confidence: number; // 0-100
  language: string;
  processingTime: number; // milliseconds
  metadata: OCRFileMetadata;
}

export interface GeminiAnalysisResult {
  type: 'Medical' | 'Food' | 'Shelter' | 'Water' | 'Clothes' | 'Document';
  urgency: 'High' | 'Medium' | 'Low';
  urgencyScore: number; // 1-10
  severityScore: number; // 1-10
  locationRiskScore: number; // 1-10
  overallPriorityScore: number; // 0-100
  description: string;
  location: string;
  peopleCount: number;
  recommendedVolunteer: string;
  confidence: number; // 0-100
  explanation: string;
  keyEntities: string[];
}

export type SupportedFileType = 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';

export const SUPPORTED_FILE_TYPES: SupportedFileType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
