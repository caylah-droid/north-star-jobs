import { NextResponse } from 'next/server'

const CAYLAH_BACKGROUND = `
7+ years operational leadership across South Africa, USA, and UK.
Full Zoho One CRM implementation for FundaGlobal and Advoc8se LLC.
Led platform migration from SharePoint and Power BI to custom .NET system.
Equity shareholder in FundaGlobal (SA) and Advoc8se LLC (USA).
Consulting brand: Sebba Systems. LinkedIn: The Operator.
Skills: Systems thinking, CRM architecture, workflow automation, process design.
`

const KYLE_BACKGROUND = `
Extensive relationship management across legal and marketing environments.
Deep experience working with law firms and attorneys.
Strong team management and customer relationship management.
Business development across legal services and marketing companies.
Skills: Relationship building, legal client fluency, team leadership, client retention.
`

const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-pro',
]

async function tryGemini(model: string, prompt: string, apiKey: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
      }),
    }
  )
  const data = await res.json()
  if (data.error) return null
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null
}

export async function POST(request: Request) {
  const body = await request.json()
  const { user, company, role, description } = body

  const background = user === 'caylah' ? CAYLAH_BACKGROUND : KYLE_BACKGROUND
  const name = user === 'caylah' ? 'Caylah' : 'Kyle'

  const prompt = `Write a job application pitch for ${name} applying to ${role} at ${company}.

Background: ${background}
Job description: ${description || 'Not provided'}

Return JSON only with these two fields:
{
  "coverLetter": "3 short paragraphs tailored to this role",
  "linkedinOutreach": "max 4 sentences, warm and specific"
}`

  const apiKey = process.env.GEMINI_API_KEY || ''
  let text = null
  let usedModel = ''

  for (const model of MODELS) {
    text = await tryGemini(model, prompt, apiKey)
    if (text) {
      usedModel = model
      break
    }
  }

  if (!text) {
    return NextResponse.json(
      { error: 'No Gemini model available. Please check your API key.' },
      { status: 500 }
    )
  }

  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

  try {
    const parsed = JSON.parse(cleaned)
    return NextResponse.json({
      coverLetter: parsed.coverLetter || '',
      linkedinOutreach: parsed.linkedinOutreach || '',
      model: usedModel,
    })
  } catch {
    return NextResponse.json({
      coverLetter: cleaned,
      linkedinOutreach: '',
      model: usedModel,
    })
  }
}
