import Tesseract from 'tesseract.js';
import { config } from '../config';

class OCRService {
  constructor() {
    this.geminiApiKey = config.geminiApiKey;
  }

  // Extract text from image using Tesseract
  async extractTextFromImage(imageFile) {
    try {
      const result = await Tesseract.recognize(imageFile, 'eng', {
        logger: m => console.log(m)
      });
      
      return {
        success: true,
        text: result.data.text,
        confidence: result.data.confidence
      };
    } catch (error) {
      console.error('OCR error:', error);
      return { success: false, error: error.message };
    }
  }

  // Extract text from PDF using Gemini Vision API
  async extractTextFromPDF(pdfFile) {
    try {
      // Convert PDF to base64
      const base64 = await this.fileToBase64(pdfFile);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: 'Extract all text from this document. Preserve formatting and structure.' },
                { inline_data: { mime_type: pdfFile.type, data: base64.split(',')[1] } }
              ]
            }]
          })
        }
      );

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]) {
        return {
          success: true,
          text: data.candidates[0].content.parts[0].text
        };
      }
      
      throw new Error('No text extracted');
    } catch (error) {
      console.error('PDF OCR error:', error);
      return { success: false, error: error.message };
    }
  }

  // Main OCR function
  async extractText(file) {
    if (file.type.startsWith('image/')) {
      return this.extractTextFromImage(file);
    } else if (file.type === 'application/pdf') {
      return this.extractTextFromPDF(file);
    } else {
      return { success: false, error: 'Unsupported file type' };
    }
  }

  // Chunk text for RAG
  chunkText(text, chunkSize = 500, overlap = 50) {
    const words = text.split(/\s+/);
    const chunks = [];
    
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      chunks.push({
        text: chunk,
        index: Math.floor(i / (chunkSize - overlap)),
        wordStart: i,
        wordEnd: Math.min(i + chunkSize, words.length)
      });
    }
    
    return chunks;
  }

  // Helper: Convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
}

export const ocrService = new OCRService();