import { config } from '../config';
import { apiService } from './api';

class AISearchService {
  constructor() {
    this.geminiApiKey = config.geminiApiKey;
    // We delegate to backend for actual storage/search
  }

  // RAG Search
  async ragSearch(query) {
    try {
      // Delegate to centralized API service (Apps Script Backend)
      const response = await apiService.aiSearch(query);
      if (response && response.success) {
        return {
          success: true,
          answer: response.answer || response.results?.[0]?.snippet || 'No direct answer generated, please check related documents.',
          sources: response.sources || response.results || []
        };
      }
      return { success: false, error: response?.error || 'AI Search failed' };
    } catch (error) {
      console.error('RAG search error:', error);
      return { success: false, error: error.message };
    }
  }

  // Multi-agent search (Simplified for centralized backend)
  async multiAgentSearch(query) {
    return this.ragSearch(query);
  }
}

export const aiSearchService = new AISearchService();