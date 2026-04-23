import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://whtggoqezzijocarqavj.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndodGdnb3Flenppam9jYXJxYXZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQ3MTc2NywiZXhwIjoyMDkxMDQ3NzY3fQ.ZHHKXV7LAi8b-QYGqtjO1qtNdrLvHPJCo00lVIiCDlU'
const GOOGLE_API_KEY = 'AIzaSyCQZFIhz-YSOsWjms6Wug7QwxlgIyTY80I'

function chunkDocument(text) {
  // Split by paragraphs (double newlines) and filter out empty chunks
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 50)
  return paragraphs
}

async function embed(text) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] }
      })
    }
  )
  if (!res.ok) throw new Error(`Google embed error: ${await res.text()}`)
  const d = await res.json()
  return d.embedding.values
}

async function main() {
  const doc = readFileSync('./biden-sotu-2023-planned-official.txt', 'utf-8')
  const chunks = chunkDocument(doc)
  console.log(`📄 ${chunks.length} chunks to embed:`)
  chunks.forEach((c, i) => console.log(`  ${i+1}. ${c.slice(0, 80).replace(/\n/g, ' ')}...`))

  // Clear existing
  const delRes = await fetch(`${SUPABASE_URL}/rest/v1/biden_speech_chunks?id=gte.0`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`, 'apikey': SUPABASE_SERVICE_KEY }
  })
  console.log('\n🗑️  Cleared existing chunks')

  // Embed and insert one by one
  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`🔢 Embedding ${i+1}/${chunks.length}... `)
    const embedding = await embed(chunks[i])
    console.log(`dim: ${embedding.length}`)

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/biden_speech_chunks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ content: chunks[i], embedding, metadata: { source: 'biden-sotu-2023-planned-official.txt' } })
    })
    if (!insertRes.ok) throw new Error(`Insert failed: ${await insertRes.text()}`)
    console.log(`  ✅ Inserted chunk ${i+1}`)
  }

  console.log('\n🎉 Done! All chunks embedded with Google gemini-embedding-001 and stored in Supabase.')
}

main().catch(console.error)
