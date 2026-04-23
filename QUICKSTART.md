# Quick Start Guide

Get the RAG Biden Speech Assistant up and running in 5 minutes.

## Prerequisites

- Node.js 16+
- Supabase account
- Groq API key
- Google AI Studio API key

## 5-Minute Setup

### 1. Get Your API Keys (2 min)

**Groq**: https://console.groq.com → API Keys → Create Key

**Google**: https://makersuite.google.com/app/apikey → Create API Key

**Supabase**: https://supabase.com → New Project → Settings → API

### 2. Create Database Table (1 min)

In Supabase SQL Editor, run:
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

### 3. Ingest Speech (1 min)

```bash
cd scripts
# Edit ingest-biden-speech.mjs and add your API keys
node ingest-biden-speech.mjs
```

### 4. Deploy Edge Function (1 min)

```bash
supabase functions deploy biden-rag
```

Then in Supabase, set environment variables:
- `GROQ_API_KEY`
- `GOOGLE_API_KEY`
- `SUPABASE_URL`
- `SERVICE_ROLE_KEY`

### 5. Deploy Frontend (0 min)

Push to GitHub and enable GitHub Pages. Done!

## Test It

Open: https://akhilchibber.github.io/RAG-BidenSpeech/

Try: "What did Biden say about jobs?"

## Common Issues

**"No results"** → Check if speech chunks are in database
```sql
SELECT COUNT(*) FROM biden_speech_chunks;
```

**"Slow responses"** → Check Groq API status

**"Embedding errors"** → Verify Google API key and quota

## Full Documentation

- **Setup**: See `SETUP_GUIDE.md`
- **Architecture**: See `ARCHITECTURE.md`
- **Implementation**: See `IMPLEMENTATION_SUMMARY.md`

## Need Help?

1. Check the troubleshooting section in `SETUP_GUIDE.md`
2. Review `ARCHITECTURE.md` for technical details
3. Check Supabase and Groq documentation
4. Open an issue on GitHub

---

**That's it!** Your RAG Biden Speech Assistant is ready to use.
