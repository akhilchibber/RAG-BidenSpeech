import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function callGroq(apiKey: string, prompt: string, maxTokens = 400, temperature = 0.0) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature
    })
  })
  if (!res.ok) throw new Error(`Groq failed: ${await res.text()}`)
  const data = await res.json()
  return data.choices[0].message.content.trim()
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { question } = await req.json()
    if (!question?.trim()) {
      return new Response(JSON.stringify({ error: 'No question provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
      })
    }

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')!
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!

    // Step 1: Classify the question — Biden speech related or general?
    const classifyPrompt = `You are a classifier. Determine if the following message is related to President Biden's 2023 State of the Union address, including topics like economy, jobs, infrastructure, healthcare, climate, education, immigration, gun safety, democracy, or any other topics mentioned in the speech.

Reply with ONLY one word: "BIDEN" if it is related to the speech, or "GENERAL" if it is not.

Message: "${question}"

Reply:`

    const classification = await callGroq(GROQ_API_KEY, classifyPrompt, 5, 0.0)
    const isBiden = classification.trim().toUpperCase().startsWith('BIDEN')

    // Step 2a: General question — respond naturally and redirect
    if (!isBiden) {
      const generalPrompt = `You are a friendly chatbot assistant. The user asked something that is not related to President Biden's 2023 State of the Union address: "${question}".

Respond naturally and helpfully in 2-3 sentences. Acknowledge what they said, then gently let them know that your expertise is in the 2023 State of the Union speech and invite them to ask anything about the topics covered in that speech.`

      const answer = await callGroq(GROQ_API_KEY, generalPrompt, 120, 0.7)
      return new Response(JSON.stringify({ answer }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Step 2b: Biden speech question — search the speech document
    // Embed the question using Google gemini-embedding-001
    const embedRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/gemini-embedding-001',
          content: { parts: [{ text: question }] }
        })
      }
    )
    if (!embedRes.ok) throw new Error(`Google embed failed: ${await embedRes.text()}`)
    const embedData = await embedRes.json()
    const embedding = embedData.embedding.values

    // Search Supabase for relevant chunks
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const { data: chunks, error } = await supabase.rpc('match_biden_chunks', {
      query_embedding: embedding,
      match_threshold: 0.65,
      match_count: 3
    })
    if (error) throw error

    if (!chunks || chunks.length === 0) {
      return new Response(JSON.stringify({
        answer: 'This information is not available in the 2023 State of the Union speech.'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Build context and generate answer
    const context = chunks.map((c: any) => c.content).join('\n\n---\n\n')

    const answerPrompt = `You are a helpful assistant answering questions about President Biden's 2023 State of the Union address. Answer the user's question using ONLY the information in the speech excerpts below.

Rules:
- Answer directly and concisely in plain English
- If the answer depends on a condition or context, explain it clearly
- If the information is genuinely not in the speech, respond with exactly: "This information is not available in the 2023 State of the Union speech."
- Never make up information or use outside knowledge
- Provide context when relevant

Speech Excerpts:
${context}

User Question: ${question}

Answer:`

    const answer = await callGroq(GROQ_API_KEY, answerPrompt, 400, 0.0)

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500
    })
  }
})
