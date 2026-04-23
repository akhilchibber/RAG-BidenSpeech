# RAG Biden Speech - Setup Guide

This guide walks you through setting up the RAG-based Biden SOTU 2023 Assistant.

## Prerequisites

- Node.js 16+ (for running ingestion script)
- Supabase account (free tier works)
- Groq API key
- Google AI Studio API key
- GitHub account (for GitHub Pages deployment)

## Step 1: Get API Keys

### Groq API Key
1. Go to https://console.groq.com
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy and save it

### Google AI Studio API Key
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy and save it

### Supabase Credentials
1. Go to https://supabase.com
2. Create a new project or use existing one
3. Go to Project Settings → API
4. Copy:
   - Project URL
   - Service Role Key (for ingestion)
   - Anon Key (for frontend)

## Step 2: Create Database Table

1. In Supabase, go to SQL Editor
2. Create a new query
3. Copy and paste the SQL from `supabase/migrations/20240011_biden_speech_rag.sql`
4. Run the query

Or use Supabase CLI:
```bash
supabase migration up
```

## Step 3: Ingest Speech into Vector Database

1. Navigate to the scripts directory:
```bash
cd scripts
```

2. Update the API keys in `ingest-biden-speech.mjs`:
```javascript
const SUPABASE_URL = 'your_supabase_url'
const SUPABASE_SERVICE_KEY = 'your_service_role_key'
const GOOGLE_API_KEY = 'your_google_api_key'
```

3. Run the ingestion script:
```bash
node ingest-biden-speech.mjs
```

This will:
- Read the speech file
- Split into chunks
- Generate embeddings
- Store in Supabase
- Show progress for each chunk

Expected output:
```
📄 XX chunks to embed:
  1. First chunk text...
  2. Second chunk text...
  ...

🗑️  Cleared existing chunks

🔢 Embedding 1/XX... dim: 3072
  ✅ Inserted chunk 1
🔢 Embedding 2/XX... dim: 3072
  ✅ Inserted chunk 2
...

🎉 Done! All chunks embedded with Google gemini-embedding-001 and stored in Supabase.
```

## Step 4: Deploy Edge Function

### Option A: Using Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link your project:
```bash
supabase link --project-ref your_project_ref
```

3. Deploy the function:
```bash
supabase functions deploy biden-rag
```

### Option B: Manual Deployment

1. In Supabase, go to Edge Functions
2. Create a new function named `biden-rag`
3. Copy the code from `supabase/functions/biden-rag/index.ts`
4. Paste it into the editor
5. Click Deploy

## Step 5: Set Environment Variables

In Supabase Edge Function settings:

1. Go to Edge Functions → biden-rag → Settings
2. Add environment variables:
   - `GROQ_API_KEY`: Your Groq API key
   - `GOOGLE_API_KEY`: Your Google AI Studio API key
   - `SUPABASE_URL`: Your Supabase project URL
   - `SERVICE_ROLE_KEY`: Your Supabase service role key

## Step 6: Deploy Frontend to GitHub Pages

1. Push your changes to GitHub:
```bash
git add .
git commit -m "Add RAG implementation"
git push origin main
```

2. In GitHub repository settings:
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
   - Click Save

3. Your demo will be available at:
```
https://akhilchibber.github.io/RAG-BidenSpeech/
```

## Step 7: Test the System

1. Open the live demo URL
2. Try one of the sample questions
3. Or ask your own question about the speech

Example questions:
- "What did Biden say about job creation?"
- "What is the CHIPS and Science Act?"
- "What are the plans for infrastructure?"
- "What did Biden say about healthcare costs?"

## Troubleshooting

### Issue: "No question provided" error
- Make sure you're typing a question in the input field
- Check browser console for errors

### Issue: "This information is not available in the speech"
- The question might not be related to the speech
- Try rephrasing your question
- Check if the speech chunks were properly ingested

### Issue: Slow responses
- Check Groq API status at https://status.groq.com
- Verify your internet connection
- Check Supabase dashboard for any issues

### Issue: Embedding errors during ingestion
- Verify Google API key is correct
- Check if you have API quota remaining
- Ensure network connectivity

### Issue: Edge Function not responding
- Verify environment variables are set correctly
- Check Supabase Edge Function logs
- Ensure the function was deployed successfully

## Verification Checklist

- [ ] Supabase table created (`biden_speech_chunks`)
- [ ] Speech chunks ingested (check row count in Supabase)
- [ ] Edge Function deployed and responding
- [ ] Environment variables set in Edge Function
- [ ] Frontend deployed to GitHub Pages
- [ ] Sample questions work correctly
- [ ] Custom questions return relevant answers

## Next Steps

1. Customize sample questions in `index.html`
2. Adjust search threshold in Edge Function
3. Add more speeches to the database
4. Implement caching for faster responses
5. Add analytics to track popular questions

## Support

For issues or questions:
1. Check the ARCHITECTURE.md for technical details
2. Review the troubleshooting section above
3. Check Supabase and Groq documentation
4. Open an issue on GitHub

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Groq API Documentation](https://console.groq.com/docs)
- [Google AI Studio](https://makersuite.google.com)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
