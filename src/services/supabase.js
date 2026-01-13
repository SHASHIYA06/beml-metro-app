import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

class SupabaseService {
  constructor() {
    this.client = supabase;
  }

  // Real-time subscriptions
  subscribeToEntries(callback) {
    return this.client
      .channel('entries')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'work_entries' },
        callback
      )
      .subscribe();
  }

  subscribeToDocuments(callback) {
    return this.client
      .channel('documents')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        callback
      )
      .subscribe();
  }

  // Backup entries to Supabase
  async backupEntry(entryData) {
    try {
      const { data, error } = await this.client
        .from('work_entries')
        .insert([entryData]);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Backup entry error:', error);
      return { success: false, error: error.message };
    }
  }

  // Store OCR text
  async storeOCRText(documentId, ocrText, chunks) {
    try {
      const { data, error } = await this.client
        .from('document_ocr')
        .upsert([{
          document_id: documentId,
          ocr_text: ocrText,
          chunks: chunks,
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Store OCR error:', error);
      return { success: false, error: error.message };
    }
  }

  // Vector search for RAG
  async searchDocuments(query, limit = 10) {
    try {
      const { data, error } = await this.client.rpc('search_documents', {
        search_query: query,
        match_count: limit
      });

      if (error) throw error;
      return { success: true, results: data };
    } catch (error) {
      console.error('Document search error:', error);
      return { success: false, error: error.message };
    }
  }

  // Store embeddings
  async storeEmbedding(documentId, chunkIndex, embedding, metadata) {
    try {
      const { data, error } = await this.client
        .from('document_embeddings')
        .insert([{
          document_id: documentId,
          chunk_index: chunkIndex,
          embedding: embedding,
          metadata: metadata
        }]);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Store embedding error:', error);
      return { success: false, error: error.message };
    }
  }
}

export const supabaseService = new SupabaseService();
export { supabase }; // Export supabase client for direct use in components