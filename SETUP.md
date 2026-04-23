# Setup Instructions

## 1. Enable GitHub Pages
- Go to Settings → Pages
- Source: Deploy from a branch
- Branch: main, Folder: / (root)
- Save

## 2. Deploy Edge Function
```bash
supabase functions deploy biden-rag
```

## 3. Set Environment Variables
In Supabase Edge Function settings:
- `GROQ_API_KEY`
- `GOOGLE_API_KEY`
- `SUPABASE_URL`
- `SERVICE_ROLE_KEY`

## 4. Create Database Table
Run in Supabase SQL Editor:
```sql
create extension if not exists vector;

create table if not exists biden_speech_chunks (
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
```

## 5. Ingest Speech Data
```bash
cd scripts
node ingest-biden-speech.mjs
```

## 6. Test
Open: https://akhilchibber.github.io/RAG-BidenSpeech/

Try: "What did Biden say about job creation?"
