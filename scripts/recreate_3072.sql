-- Recreate Biden SOTU 2023 chunk table + search function at 3072 dimensions
-- (matches Google gemini-embedding-001 output and the deployed biden-rag function)

create extension if not exists vector;

drop function if exists match_biden_chunks(vector, float, int);
drop table if exists biden_speech_chunks;

create table biden_speech_chunks (
  id bigserial primary key,
  content text not null,
  embedding vector(3072),
  metadata jsonb,
  created_at timestamp default now()
);

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
as $$
  select
    id,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from biden_speech_chunks
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by (embedding <=> query_embedding) asc
  limit match_count;
$$;
