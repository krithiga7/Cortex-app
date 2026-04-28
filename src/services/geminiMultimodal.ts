import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Multiple models for fallback (in priority order)
// Only use models that support generateContent and multimodal input
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash'
];

let currentModelIndex = 0;

function getGenAI(): GoogleGenerativeAI {
  return new GoogleGenerativeAI(API_KEY);
}

function getModel() {
  const model = GEMINI_MODELS[currentModelIndex];
  const genAI = getGenAI();
  return genAI.getGenerativeModel({ model });
}

function tryNextModel(): boolean {
  if (currentModelIndex < GEMINI_MODELS.length - 1) {
    currentModelIndex++;
    console.log(`🔄 Switching to model: ${GEMINI_MODELS[currentModelIndex]}`);
    return true;
  }
  return false;
}

function resetModelIndex() {
  currentModelIndex = 0;
}

export interface MultimodalResponse {
  inputType: 'text' | 'image' | 'audio';
  extractedText: string;
  status: 'success' | 'error';
  error?: string;
}

/**
 * Process text input through Gemini
 */
export async function processTextInput(text: string): Promise<MultimodalResponse> {
  try {
    const model = getModel();
    
    const prompt = `Clean and structure this emergency request text. Return only the cleaned text without any additional explanation.

Original text:
"${text}"

Return ONLY the cleaned and structured version:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const extractedText = response.text().trim();

    // Reset model index on success
    resetModelIndex();

    return {
      inputType: 'text',
      extractedText,
      status: 'success'
    };
  } catch (error) {
    console.error('Text processing error:', error);
    
    // Check if 503/404 and try next model
    const errorMessage = error instanceof Error ? error.message : '';
    if ((errorMessage.includes('503') || errorMessage.includes('404') || errorMessage.includes('high demand')) && tryNextModel()) {
      console.log('⚠️ Retrying with different model...');
      return processTextInput(text); // Retry with new model
    }
    
    return {
      inputType: 'text',
      extractedText: text,
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to process text'
    };
  }
}

/**
 * Process image input through Gemini Vision
 */
export async function processImageInput(imageBase64: string): Promise<MultimodalResponse> {
  try {
    const model = getModel();
    
    // Remove data URL prefix if present
    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;
    
    // Get MIME type from data URL or default to jpeg
    const mimeType = imageBase64.includes('data:') 
      ? imageBase64.split(',')[0].split(':')[1].split(';')[0] 
      : 'image/jpeg';

    const prompt = 'Extract text from this image including handwritten or printed text and return only the extracted content.';

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    const extractedText = response.text().trim();

    // Reset model index on success
    resetModelIndex();

    return {
      inputType: 'image',
      extractedText,
      status: 'success'
    };
  } catch (error) {
    console.error('Image processing error:', error);
    
    // Check if 503/404 and try next model
    const errorMessage = error instanceof Error ? error.message : '';
    if ((errorMessage.includes('503') || errorMessage.includes('404') || errorMessage.includes('high demand')) && tryNextModel()) {
      console.log('⚠️ Retrying image processing with different model...');
      return processImageInput(imageBase64); // Retry with new model
    }
    
    return {
      inputType: 'image',
      extractedText: '',
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to process image'
    };
  }
}

/**
 * Process audio input through Gemini
 */
export async function processAudioInput(audioBase64: string): Promise<MultimodalResponse> {
  try {
    const model = getModel();
    
    // Remove data URL prefix if present
    const base64Data = audioBase64.includes(',') 
      ? audioBase64.split(',')[1] 
      : audioBase64;
    
    // Get MIME type from data URL or default to mp3
    const mimeType = audioBase64.includes('data:') 
      ? audioBase64.split(',')[0].split(':')[1].split(';')[0] 
      : 'audio/mp3';

    const prompt = 'Transcribe this audio and return only the spoken text.';

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    const extractedText = response.text().trim();

    // Reset model index on success
    resetModelIndex();

    return {
      inputType: 'audio',
      extractedText,
      status: 'success'
    };
  } catch (error) {
    console.error('Audio processing error:', error);
    
    // Check if 503/404 and try next model
    const errorMessage = error instanceof Error ? error.message : '';
    if ((errorMessage.includes('503') || errorMessage.includes('404') || errorMessage.includes('high demand')) && tryNextModel()) {
      console.log('⚠️ Retrying audio processing with different model...');
      return processAudioInput(audioBase64); // Retry with new model
    }
    
    return {
      inputType: 'audio',
      extractedText: '',
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to process audio'
    };
  }
}

/**
 * Convert file to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
