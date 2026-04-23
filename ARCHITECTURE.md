# RAG-based Biden Speech Assistant Architecture

## System Overview

This document describes the architecture of the RAG-based Biden SOTU 2023 Assistant system. The system uses Retrieval-Augmented Generation to answer questions about President Biden's 2023 State of the Union address with high accuracy and grounding in the actual speech content.

## Components

### 1. Document Ingestion Layer
- Biden's 2023 SOTU speech (`biden-sotu-2023-planned-official.txt`) is used as the baseline
- Documents are chunked into meaningful paragraphs
- Chunks are converted into vector embeddings using Google AI Studio embeddings API (gemini-embedding-001)
- Embeddings are 3072-dimensional vectors for semantic understanding

### 2. Vector Database (Supabase + pgvector)
- Stores all speech document chunks and their embeddings
- Table: `biden_speech_chunks` with columns:
  - `id`: Primary key
  - `content`: Text chunk from the speech
  - `embedding`: 3072-dimensional vector
  - `metadata`: Source information
  - `created_at`: Timestamp
- Enables semantic search capabilities using cosine similarity
- Provides fast retrieval of relevant speech sections

### 3. Retrieval Engine
- Accepts user queries
- Converts queries to embeddings using Google's gemini-embedding-001 model
- Performs semantic search to find top-k relevant speech chunks
- Uses cosine similarity with configurable threshold (0.65)
- Returns context for the generation layer

### 4. Generation Layer
- Receives user query and retrieved context
- Uses Groq LLM (llama-3.3-70b-versatile) to generate responses
- Ensures answers are grounded in actual speech content
- Implements question classification:
  - **BIDEN**: Speech-related questions → Semantic search + LLM generation
  - **GENERAL**: Non-speech questions → Natural response with redirection

### 5. API Layer
- Supabase Edge Functions for serverless execution
- REST endpoint: `/functions/v1/biden-rag`
- Handles CORS for cross-origin requests
- Response formatting and delivery

### 6. Frontend
- GitHub Pages static HTML interface
- Real-time chat interface with message history
- Sample questions for quick exploration
- Download transcript functionality
- Identical UI/UX to HR Assistant for consistency

## Data Flow

```
User Question
    ↓
[Frontend] Send to Edge Function
    ↓
[Edge Function] Classify: BIDEN or GENERAL?
    ├─ GENERAL → Respond naturally & redirect
    └─ BIDEN → Continue
    ↓
[Google API] Embed question (3072 dims)
    ↓
[Supabase] Semantic search (cosine similarity)
    ↓
[Retrieve] Top-3 speech chunks
    ↓
[Groq LLM] Generate answer with context
    ↓
[Frontend] Display response
```

## Database Schema

### biden_speech_chunks table
```sql
CREATE TABLE biden_speech_chunks (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(3072),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION match_biden_chunks(
  query_embedding vector(3072),
  match_threshold float default 0.65,
  match_count int default 5
)
RETURNS TABLE (
  id bigint,
  content text,
  similarity float
)
LANGUAGE sql stable
AS $
  SELECT
    id,
    content,
    1 - (embedding <=> query_embedding) as similarity
  FROM biden_speech_chunks
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY (embedding <=> query_embedding) asc
  LIMIT match_count;
$;
```

## Deployment

### Frontend
- **Platform**: GitHub Pages
- **URL**: https://akhilchibber.github.io/RAG-BidenSpeech/
- **Files**: `index.html` (static HTML with embedded JavaScript)

### Backend
- **Platform**: Supabase Edge Functions
- **Function**: `supabase/functions/biden-rag/index.ts`
- **Runtime**: Deno

### Database
- **Platform**: Supabase PostgreSQL
- **Extension**: pgvector for vector operations
- **Table**: `biden_speech_chunks`

### APIs
- **Groq**: LLM inference (llama-3.3-70b-versatile)
- **Google AI Studio**: Embeddings (gemini-embedding-001)
- **Supabase**: Vector database and Edge Functions

## Setup Instructions

### 1. Create Supabase Table
Run the migration:
```bash
supabase migration up
```

Or manually run the SQL in `supabase/migrations/20240011_biden_speech_rag.sql`

### 2. Ingest Speech into Vector Database
```bash
cd scripts
node ingest-biden-speech.mjs
```

This script will:
- Read `biden-sotu-2023-planned-official.txt`
- Split into paragraphs
- Generate embeddings using Google API
- Store in Supabase with metadata

### 3. Deploy Edge Function
```bash
supabase functions deploy biden-rag
```

### 4. Set Environment Variables
In Supabase Edge Function settings, set:
- `GROQ_API_KEY`: Your Groq API key
- `GOOGLE_API_KEY`: Your Google AI Studio API key
- `SUPABASE_URL`: Your Supabase project URL
- `SERVICE_ROLE_KEY`: Your Supabase service role key

### 5. Deploy Frontend
Push to GitHub and enable GitHub Pages on the `main` branch.

## Security Considerations

- API keys stored in Supabase environment variables (not in code)
- CORS headers configured for cross-origin requests
- Supabase Row Level Security (RLS) for access control
- Rate limiting on API endpoints (via Supabase)
- No sensitive data stored in frontend
- All API calls use HTTPS

## Performance Characteristics

- **Embedding Generation**: ~1-2 seconds per query (Google API)
- **Semantic Search**: <100ms (Supabase pgvector)
- **LLM Generation**: ~2-5 seconds (Groq API)
- **Total Response Time**: ~5-8 seconds
- **Concurrent Users**: Unlimited (serverless auto-scaling)

## Scalability

- Serverless architecture auto-scales with demand
- Vector database optimized for semantic search
- No infrastructure management required
- Handles thousands of concurrent users
- Minimal latency for global users

## Customization

### Change Embedding Model
Update in `ingest-biden-speech.mjs` and `supabase/functions/biden-rag/index.ts`:
```javascript
model: 'models/gemini-embedding-001' // Change this
```

### Change LLM Model
Update in `supabase/functions/biden-rag/index.ts`:
```typescript
model: 'llama-3.3-70b-versatile' // Change this
```

### Adjust Search Threshold
Update in `supabase/functions/biden-rag/index.ts`:
```typescript
match_threshold: 0.65 // Increase for stricter matching
```

### Change Number of Retrieved Chunks
Update in `supabase/functions/biden-rag/index.ts`:
```typescript
match_count: 3 // Increase for more context
```

## Troubleshooting

### No results returned
- Check if speech chunks are ingested: `SELECT COUNT(*) FROM biden_speech_chunks;`
- Verify embedding dimensions match (should be 3072)
- Lower the `match_threshold` value

### Slow responses
- Check Groq API status
- Verify network connectivity
- Monitor Supabase query performance

### Incorrect answers
- Verify speech chunks are properly ingested
- Check if question is actually related to the speech
- Review retrieved chunks for relevance

## Future Enhancements

- Add support for multiple speeches
- Implement caching for frequently asked questions
- Add source citations with timestamps
- Support for follow-up questions
- Multi-language support
- Analytics dashboard for query insights
