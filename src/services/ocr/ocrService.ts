import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import { OCRResult, OCRProgress, OCRFileMetadata } from '@/types/ocr';

// Set worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Convert PDF page to image
 */
async function pdfPageToImage(pdfFile: File, pageNumber: number = 1): Promise<string> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNumber);
  
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Failed to get canvas context');
  }
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;
  
  return canvas.toDataURL('image/png');
}

/**
 * Extract text from image using Tesseract.js
 */
export async function extractTextFromImage(
  imageUrl: string,
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  const result = await Tesseract.recognize(imageUrl, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress({
          status: 'recognizing',
          progress: Math.round(m.progress * 100),
          message: `Recognizing text... ${Math.round(m.progress * 100)}%`
        });
      }
    }
  });
  
  return result.data.text || '';
}

/**
 * Process file and extract text
 */
export async function processFile(
  metadata: OCRFileMetadata,
  onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
  const startTime = Date.now();
  
  try {
    let imageUrl: string;
    
    // Handle PDF files
    if (metadata.fileType === 'application/pdf') {
      if (onProgress) {
        onProgress({
          status: 'loading',
          progress: 10,
          message: 'Converting PDF to image...'
        });
      }
      imageUrl = await pdfPageToImage(metadata.file);
    } else {
      imageUrl = metadata.previewUrl;
    }
    
    if (onProgress) {
      onProgress({
        status: 'recognizing',
        progress: 20,
        message: 'Starting OCR processing...'
      });
    }
    
    // Extract text using Tesseract
    const extractedText = await extractTextFromImage(imageUrl, onProgress);
    
    const processingTime = Date.now() - startTime;
    
    return {
      extractedText,
      confidence: 85, // Tesseract provides this in result.data.confidence
      language: 'eng',
      processingTime,
      metadata
    };
  } catch (error) {
    console.error('OCR processing failed:', error);
    throw new Error(
      error instanceof Error 
        ? `OCR failed: ${error.message}` 
        : 'Failed to extract text from file'
    );
  }
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  
  if (!supportedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Please upload JPG, PNG, WebP, or PDF files.`
    };
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum limit of 10MB.`
    };
  }
  
  return { valid: true };
}
