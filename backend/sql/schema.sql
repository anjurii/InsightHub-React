CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS customers (
  workspace_id text NOT NULL,
  id text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  total_spend numeric NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('Active', 'Inactive', 'Pending')),
  created_at timestamptz NOT NULL,
  PRIMARY KEY (workspace_id, id),
  UNIQUE (workspace_id, email)
);

CREATE INDEX IF NOT EXISTS customers_workspace_name_idx
  ON customers (workspace_id, lower(name));

CREATE UNIQUE INDEX IF NOT EXISTS customers_workspace_email_ci_idx
  ON customers (workspace_id, lower(email));

CREATE TABLE IF NOT EXISTS orders (
  workspace_id text NOT NULL,
  id text NOT NULL,
  customer_name text NOT NULL,
  product text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL CHECK (status IN ('Completed', 'Processing', 'Refunded')),
  created_at timestamptz NOT NULL,
  PRIMARY KEY (workspace_id, id)
);

CREATE INDEX IF NOT EXISTS orders_workspace_created_at_idx
  ON orders (workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  workspace_id text NOT NULL,
  document_id text NOT NULL,
  chunk_index integer NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  source text NOT NULL,
  embedding vector NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, document_id, chunk_index)
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = 'knowledge_chunks'::regclass
      AND attname = 'embedding'
      AND atttypmod <> -1
      AND NOT attisdropped
  ) THEN
    DROP INDEX IF EXISTS knowledge_chunks_embedding_idx;
    ALTER TABLE knowledge_chunks
      ALTER COLUMN embedding TYPE vector USING embedding::vector;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS knowledge_chunks_workspace_idx
  ON knowledge_chunks (workspace_id);
