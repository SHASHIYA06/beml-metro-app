import { config } from '../config';
import { supabaseService } from './supabase';

class AISearchService {
  constructor() {
    this.geminiApiKey = config.geminiApiKey;
    this.apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.geminiApiKey}`;
  }

  // Generate embeddings
  async generateEmbedding(text) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/embedding-001:embedContent?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'models/embedding-001',
            content: { parts: [{ text }] }
          })
        }
      );

      const data = await response.json();
      return {
        success: true,
        embedding: data.embedding.values
      };
    } catch (error) {
      console.error('Embedding error:', error);
      return { success: false, error: error.message };
    }
  }

  // RAG Search
  async ragSearch(query, context = []) {
    try {
      // Step 1: Get relevant documents from vector store
      const searchResults = await supabaseService.searchDocuments(query);
      
      if (!searchResults.success) {
        throw new Error('Vector search failed');
      }

      // Step 2: Build context from retrieved documents
      const retrievedContext = searchResults.results
        .map(doc => `Document: ${doc.name}\n${doc.content}`)
        .join('\n\n');

      // Step 3: Generate response with context
      const prompt = `Based on the following documents and context, answer the question.\n\nContext:\n${retrievedContext}\n\nQuestion: ${query}\n\nPlease provide a detailed answer with citations to the source documents.`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]) {
        return {
          success: true,
          answer: data.candidates[0].content.parts[0].text,
          sources: searchResults.results
        };
      }

      throw new Error('No response generated');
    } catch (error) {
      console.error('RAG search error:', error);
      return { success: false, error: error.message };
    }
  }

  // Multi-agent search
  async multiAgentSearch(query, agents = ['document', 'fault', 'recommendation']) {
    try {
      const results = {};

      // Document Retrieval Agent
      if (agents.includes('document')) {
        results.documents = await this.ragSearch(query);
      }

      // Fault Pattern Agent
      if (agents.includes('fault')) {
        results.faultPatterns = await this.analyzeFaultPatterns(query);
      }

      // Recommendation Agent
      if (agents.includes('recommendation')) {
        results.recommendations = await this.generateRecommendations(query, results);
      }

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Multi-agent search error:', error);
      return { success: false, error: error.message };
    }
  }

  // Analyze fault patterns
  async analyzeFaultPatterns(query) {
    const prompt = `Analyze the following maintenance issue and identify potential fault patterns:\n\nIssue: ${query}\n\nProvide:\n1. Similar historical issues\n2. Common root causes\n3. Frequency analysis\n4. Affected systems`;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]) {
        return {
          success: true,
          analysis: data.candidates[0].content.parts[0].text
        };
      }

      throw new Error('No analysis generated');
    } catch (error) {
      console.error('Fault analysis error:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate recommendations
  async generateRecommendations(query, context) {
    const prompt = `Based on the maintenance issue and analysis, provide actionable recommendations:\n\nIssue: ${query}\n\nContext:\n${JSON.stringify(context, null, 2)}\n\nProvide:\n1. Immediate actions\n2. Preventive measures\n3. Required parts/tools\n4. Estimated time\n5. Safety precautions`;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]) {
        return {
          success: true,
          recommendations: data.candidates[0].content.parts[0].text
        };
      }

      throw new Error('No recommendations generated');
    } catch (error) {
      console.error('Recommendation error:', error);
      return { success: false, error: error.message };
    }
  }
}

export const aiSearchService = new AISearchService();