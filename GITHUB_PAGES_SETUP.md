# GitHub Pages Setup Instructions

Your RAG Biden Speech code has been successfully pushed to GitHub. Follow these steps to enable GitHub Pages and make your demo live.

## ✅ What's Been Done

- ✅ All RAG implementation files created
- ✅ Code committed to GitHub
- ✅ Changes pushed to main branch
- ✅ Ready for GitHub Pages deployment

## 🚀 Enable GitHub Pages (5 minutes)

### Step 1: Open Repository Settings
1. Go to https://github.com/akhilchibber/RAG-BidenSpeech
2. Click the **Settings** tab (top navigation)

### Step 2: Navigate to Pages
1. In the left sidebar, scroll down
2. Click **Pages** (under "Code and automation")

### Step 3: Configure Source
1. Under "Source", select **Deploy from a branch**
2. Under "Branch":
   - Select **main** from the dropdown
   - Select **/ (root)** from the folder dropdown
3. Click **Save**

### Step 4: Wait for Deployment
- GitHub will start building your site
- You'll see a blue banner saying "Your site is live at..."
- This usually takes 1-2 minutes
- The URL will be: **https://akhilchibber.github.io/RAG-BidenSpeech/**

### Step 5: Verify It's Live
- Wait 2-3 minutes
- Open https://akhilchibber.github.io/RAG-BidenSpeech/
- You should see the chat interface

## 📋 Verification Checklist

- [ ] GitHub Pages enabled in Settings → Pages
- [ ] Source set to "Deploy from a branch"
- [ ] Branch set to "main"
- [ ] Folder set to "/ (root)"
- [ ] Site is live at https://akhilchibber.github.io/RAG-BidenSpeech/
- [ ] Chat interface loads without errors
- [ ] Download button is visible

## 🔧 Next Steps After GitHub Pages is Live

### 1. Deploy Supabase Edge Function
```bash
supabase functions deploy biden-rag
```

### 2. Set Environment Variables
In Supabase Dashboard:
1. Go to Edge Functions → biden-rag → Settings
2. Add environment variables:
   - `GROQ_API_KEY`: Your Groq API key
   - `GOOGLE_API_KEY`: Your Google AI Studio API key
   - `SUPABASE_URL`: Your Supabase project URL
   - `SERVICE_ROLE_KEY`: Your Supabase service role key

### 3. Create Database Table
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

### 4. Ingest Speech Data
```bash
cd scripts
# Edit ingest-biden-speech.mjs and add your API keys
node ingest-biden-speech.mjs
```

### 5. Test the Demo
1. Open https://akhilchibber.github.io/RAG-BidenSpeech/
2. Try a sample question: "What did Biden say about job creation?"
3. Verify you get a response

## 🐛 Troubleshooting

### Still seeing 404?
**Solution**: 
- Wait 5 minutes (GitHub Pages can take time)
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check Settings → Pages to confirm it's enabled

### GitHub Pages option not visible in Settings?
**Solution**:
- Make sure you're on the main branch
- Verify index.html exists in the root directory
- Try refreshing the Settings page

### Site loads but chat doesn't work?
**Solution**:
- Open browser console (F12)
- Check for error messages
- Verify Supabase Edge Function is deployed
- Verify environment variables are set
- Check that speech chunks are ingested in database

### "Cannot find module" errors?
**Solution**:
- Make sure you're running ingestion script from correct directory
- Verify Node.js is installed (node --version)
- Check that all API keys are correct

## 📊 What Happens After You Enable GitHub Pages

1. **Automatic Deployment**
   - GitHub automatically deploys index.html
   - Site is live at https://akhilchibber.github.io/RAG-BidenSpeech/

2. **Automatic Updates**
   - Any changes pushed to main branch are automatically deployed
   - Updates usually take 1-2 minutes

3. **HTTPS by Default**
   - Your site is automatically served over HTTPS
   - No additional configuration needed

## 🎯 Full Deployment Timeline

```
Now:
├─ Enable GitHub Pages (5 min)
│  └─ Site goes live at https://akhilchibber.github.io/RAG-BidenSpeech/
│
Then:
├─ Deploy Edge Function (5 min)
├─ Set Environment Variables (2 min)
├─ Create Database Table (2 min)
├─ Ingest Speech Data (5-10 min)
└─ Test Demo (2 min)

Total Time: ~20-30 minutes
```

## 📚 Documentation Reference

- **QUICKSTART.md**: 5-minute quick start
- **SETUP_GUIDE.md**: Detailed setup instructions
- **ARCHITECTURE.md**: Technical architecture
- **DEPLOYMENT_CHECKLIST.md**: Deployment verification
- **ENABLE_GITHUB_PAGES.md**: GitHub Pages setup

## ✨ Success Indicators

✅ GitHub Pages enabled
✅ Site is live at https://akhilchibber.github.io/RAG-BidenSpeech/
✅ Chat interface loads
✅ Sample questions work
✅ Responses are relevant
✅ Download button works

## 🎉 You're Almost There!

Once GitHub Pages is enabled, your demo will be live. Then follow the next steps to complete the RAG system setup.

---

**Current Status**: ✅ Code pushed to GitHub, ready for GitHub Pages enablement

**Next Action**: Enable GitHub Pages in repository settings

**Estimated Time**: 5 minutes to enable, 20-30 minutes for full setup
