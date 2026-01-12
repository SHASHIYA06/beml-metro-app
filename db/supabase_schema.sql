-- Supabase schema for BEML Metro Operations Platform
-- Run in your Supabase SQL editor. Ensure pgvector extension is enabled.

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector"; -- pgvector

-- Users
CREATE TABLE IF NOT EXISTS users (
  employee_id varchar PRIMARY KEY,
  name text NOT NULL,
  password text,
  role text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Work entries
CREATE TABLE IF NOT EXISTS work_entries (
  id serial PRIMARY KEY,
  entry_id text UNIQUE NOT NULL,
  employee_id varchar NOT NULL,
  employee_name text,
  depot text,
  trainset text,
  car_no text,
  system text,
  problem text,
  action_taken text,
  remarks text,
  status text DEFAULT 'Pending',
  file_attachment text,
  created_at timestamptz DEFAULT now()
);

-- Documents index
CREATE TABLE IF NOT EXISTS documents (
  id serial PRIMARY KEY,
  doc_id text UNIQUE NOT NULL,
  name text,
  type text,
  category text,
  url text,
  drive_id text,
  last_updated timestamptz
);

-- OCR text storage
CREATE TABLE IF NOT EXISTS document_ocr (
  id serial PRIMARY KEY,
  document_id text REFERENCES documents(doc_id),
  ocr_text text,
  chunks jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Embeddings table (using pgvector)
CREATE TABLE IF NOT EXISTS document_embeddings (
  id serial PRIMARY KEY,
  document_id text REFERENCES documents(doc_id),
  chunk_index integer,
  embedding vector(1536), -- adjust dimension to your embedding model
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Example vector search function (requires vector extension)
CREATE OR REPLACE FUNCTION public.search_documents(search_query text, match_count int DEFAULT 10)
RETURNS TABLE(doc_id text, name text, score float) AS $$
BEGIN
  RETURN QUERY
  SELECT d.doc_id, d.name, 1.0 -- placeholder score
  FROM documents d
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- NOTE: For production RAG search, upload embeddings into document_embeddings and use vector <-> vector distance search.
