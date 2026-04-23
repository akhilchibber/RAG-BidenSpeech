-- Create table for Biden SOTU 2023 speech chunks with 3072-dimensional embeddings
create table if not exists biden_speech_chunks (
  id bigserial primary key,
  content text not null,
  embedding vector(3072),
  metadata jsonb,
  created_at timestamp default now()
);

-- Create function for semantic search
create or replace function match_biden_chunks(
  query_embedding vector(3072),
  match_threshold float default 0.65,
  match_count int default 5
)
returns table (
  id bigint,
  content text,
  similarity float
)
language sql stable
as $
  select
    id,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from biden_speech_chunks
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by (embedding <=> query_embedding) asc
  limit match_count;
$;
