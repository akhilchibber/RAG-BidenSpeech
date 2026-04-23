# Deployment Checklist

Use this checklist to ensure everything is properly deployed.

## Pre-Deployment

- [ ] All API keys obtained:
  - [ ] Groq API key
  - [ ] Google AI Studio API key
  - [ ] Supabase URL
  - [ ] Supabase Service Role Key
  - [ ] Supabase Anon Key

- [ ] Repository cloned locally
- [ ] Node.js 16+ installed
- [ ] Supabase CLI installed (optional but recommended)

## Database Setup

- [ ] Supabase project created
- [ ] pgvector extension enabled
- [ ] Migration applied:
  ```bash
  supabase migration up
  ```
  Or manually run SQL from `supabase/migrations/20240011_biden_speech_rag.sql`

- [ ] Verify table created:
  ```sql
  SELECT * FROM biden_speech_chunks LIMIT 1;
  ```

## Ingestion

- [ ] Update API keys in `scripts/ingest-biden-speech.mjs`:
  ```javascript
  const SUPABASE_URL = 'your_url'
  const SUPABASE_SERVICE_KEY = 'your_key'
  const GOOGLE_API_KEY = 'your_key'
  ```

- [ ] Run ingestion script:
  ```bash
  cd scripts
  node ingest-biden-speech.mjs
  ```

- [ ] Verify chunks ingested:
  ```sql
  SELECT COUNT(*) FROM biden_speech_chunks;
  ```
  Should return a number > 0

- [ ] Check embedding dimensions:
  ```sql
  SELECT array_length(embedding, 1) FROM biden_speech_chunks LIMIT 1;
  ```
  Should return 3072

## Edge Function Deployment

### Option A: Using Supabase CLI

- [ ] Link Supabase project:
  ```bash
  supabase link --project-ref your_project_ref
  ```

- [ ] Deploy function:
  ```bash
  supabase functions deploy biden-rag
  ```

### Option B: Manual Deployment

- [ ] Go to Supabase → Edge Functions
- [ ] Create new function: `biden-rag`
- [ ] Copy code from `supabase/functions/biden-rag/index.ts`
- [ ] Paste into editor
- [ ] Click Deploy

## Environment Variables

In Supabase Edge Function settings:

- [ ] Set `GROQ_API_KEY`
- [ ] Set `GOOGLE_API_KEY`
- [ ] Set `SUPABASE_URL`
- [ ] Set `SERVICE_ROLE_KEY`

Verify in function settings that all variables are set.

## Frontend Deployment

### GitHub Pages Setup

- [ ] Commit all changes:
  ```bash
  git add .
  git commit -m "Implement RAG for Biden Speech"
  ```

- [ ] Push to GitHub:
  ```bash
  git push origin main
  ```

- [ ] Go to GitHub repository → Settings → Pages
- [ ] Source: Deploy from a branch
- [ ] Branch: main
- [ ] Folder: / (root)
- [ ] Click Save

- [ ] Wait for deployment (usually 1-2 minutes)
- [ ] Verify site is live at:
  ```
  https://akhilchibber.github.io/RAG-BidenSpeech/
  ```

## Testing

### Frontend Testing

- [ ] Open https://akhilchibber.github.io/RAG-BidenSpeech/
- [ ] Page loads without errors
- [ ] Chat interface is visible
- [ ] Sample questions are displayed
- [ ] Download button works

### Functionality Testing

- [ ] Click sample question: "What did Biden say about job creation?"
  - [ ] Question appears in chat
  - [ ] Loading indicator shows
  - [ ] Response appears within 10 seconds
  - [ ] Response is relevant to the question

- [ ] Try another sample question
  - [ ] Verify different response
  - [ ] Check relevance

- [ ] Ask a custom question:
  - [ ] Type: "What is the CHIPS Act?"
  - [ ] Verify response is accurate

- [ ] Ask off-topic question:
  - [ ] Type: "What is the weather?"
  - [ ] Verify it redirects to speech topics

- [ ] Test download button:
  - [ ] Click "Download Transcript"
  - [ ] File downloads successfully

### Error Handling

- [ ] Test with empty question (press send without typing)
  - [ ] Should show error or do nothing

- [ ] Test with very long question
  - [ ] Should handle gracefully

- [ ] Disconnect internet and try to send message
  - [ ] Should show connection error

## Performance Verification

- [ ] Response time is reasonable (5-10 seconds)
- [ ] No console errors in browser
- [ ] Chat scrolls smoothly
- [ ] UI is responsive

## Browser Compatibility

- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test on mobile (responsive design)

## Monitoring

- [ ] Check Supabase dashboard:
  - [ ] Edge Function logs show successful calls
  - [ ] No errors in logs
  - [ ] Database queries are fast

- [ ] Check Groq API:
  - [ ] API calls are successful
  - [ ] No rate limiting issues

- [ ] Check Google API:
  - [ ] Embedding calls are successful
  - [ ] No quota issues

## Documentation

- [ ] README.md is up to date
- [ ] ARCHITECTURE.md is accurate
- [ ] SETUP_GUIDE.md is complete
- [ ] QUICKSTART.md is helpful
- [ ] IMPLEMENTATION_SUMMARY.md is accurate

## Post-Deployment

- [ ] Share live demo URL
- [ ] Update GitHub repository description
- [ ] Add link to live demo in README
- [ ] Monitor for issues
- [ ] Collect user feedback

## Rollback Plan

If issues occur:

1. **Frontend Issues**
   - Revert `index.html` to previous version
   - Push to GitHub
   - GitHub Pages will update automatically

2. **Edge Function Issues**
   - Redeploy previous version
   - Or disable function temporarily

3. **Database Issues**
   - Restore from backup
   - Re-run ingestion script

## Success Criteria

- [ ] Frontend loads without errors
- [ ] Sample questions return relevant answers
- [ ] Custom questions work correctly
- [ ] Off-topic questions are handled gracefully
- [ ] Download functionality works
- [ ] Response times are acceptable
- [ ] No console errors
- [ ] All documentation is accurate

## Sign-Off

- [ ] All checklist items completed
- [ ] System tested and working
- [ ] Ready for production use

---

**Deployment Date**: _______________

**Deployed By**: _______________

**Notes**: _______________________________________________

