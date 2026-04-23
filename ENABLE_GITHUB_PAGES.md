# Enable GitHub Pages - Step by Step

Your RAG Biden Speech code has been pushed to GitHub. Now you need to enable GitHub Pages to make the demo live.

## Steps to Enable GitHub Pages

### 1. Go to Repository Settings
- Open https://github.com/akhilchibber/RAG-BidenSpeech
- Click on **Settings** tab (top right)

### 2. Navigate to Pages Section
- In the left sidebar, scroll down and click **Pages**
- You should see "GitHub Pages" section

### 3. Configure GitHub Pages
- Under "Source", select **Deploy from a branch**
- Under "Branch", select:
  - Branch: **main**
  - Folder: **/ (root)**
- Click **Save**

### 4. Wait for Deployment
- GitHub will start building your site
- This usually takes 1-2 minutes
- You'll see a green checkmark when it's done
- The URL will be: `https://akhilchibber.github.io/RAG-BidenSpeech/`

### 5. Verify It's Live
- Wait 2-3 minutes
- Open https://akhilchibber.github.io/RAG-BidenSpeech/
- You should see the chat interface

## Troubleshooting

### Still seeing 404?
- Wait a few more minutes (GitHub Pages can take up to 5 minutes)
- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Check that GitHub Pages is enabled in Settings → Pages

### GitHub Pages not showing in Settings?
- Make sure you're on the main branch
- Check that index.html is in the root directory
- Try refreshing the Settings page

### Site loads but chat doesn't work?
- Check browser console for errors (F12)
- Verify Supabase Edge Function is deployed
- Check that environment variables are set in Supabase

## What's Next?

Once GitHub Pages is live:

1. **Deploy Supabase Edge Function**
   ```bash
   supabase functions deploy biden-rag
   ```

2. **Set Environment Variables** in Supabase:
   - Go to Supabase → Edge Functions → biden-rag → Settings
   - Add:
     - `GROQ_API_KEY`
     - `GOOGLE_API_KEY`
     - `SUPABASE_URL`
     - `SERVICE_ROLE_KEY`

3. **Ingest Speech Data**
   ```bash
   cd scripts
   node ingest-biden-speech.mjs
   ```

4. **Test the Demo**
   - Open https://akhilchibber.github.io/RAG-BidenSpeech/
   - Try a sample question
   - Verify it works

## Visual Guide

```
GitHub Repository
    ↓
Settings Tab
    ↓
Pages (left sidebar)
    ↓
Source: Deploy from a branch
    ↓
Branch: main, Folder: / (root)
    ↓
Save
    ↓
Wait 2-3 minutes
    ↓
https://akhilchibber.github.io/RAG-BidenSpeech/ ✅ LIVE
```

## Need Help?

- Check SETUP_GUIDE.md for detailed setup instructions
- Check QUICKSTART.md for quick reference
- Review DEPLOYMENT_CHECKLIST.md for verification steps

---

**Note**: GitHub Pages deployment is automatic once enabled. The site will update whenever you push changes to the main branch.
