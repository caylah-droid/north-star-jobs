import { NextResponse } from 'next/server'

const CAYLAH_BACKGROUND = `
Name: Caylah
Target roles: Revenue Operations, GTM Operations, Business Operations, Systems Operations
Experience: 7+ years operational leadership across South Africa, USA, and UK
Key achievements:
- Full Zoho One CRM implementation for FundaGlobal and Advoc8se LLC (multi-entity, cross-country)
- Led platform migration from SharePoint and Power BI to custom .NET case management system (FundaMedical)
- Equity shareholder in both FundaGlobal (SA) and Advoc8se LLC (USA) — not just an employee
- Large-scale staff management and legal claims operations
- Consulting brand: Sebba Systems — "Engineering Business Flow"
- LinkedIn presence: The Operator — publishes business systems and operations content
Strengths: Systems thinking, CRM architecture, workflow automation, cross-functional operations, process design, multi-country business context
`

const KYLE_BACKGROUND = `
Name: Kyle
Target roles: Customer Success Manager, Account Manager, Legal Operations, Marketing Operations
Experience: Extensive relationship management across legal and marketing environments
Key achievements:
- Deep experience working with law firms and attorneys — understands legal client culture
- Strong team management and important customer relationship management
- Business development across legal services and marketing companies
- Operational dynamics in high-stakes, high-trust client environments
- Excellent communicator — builds trust quickly with demanding professional clients
Strengths: Relationship building, legal client fluency, team leadership, client retention, operational coordination, marketing agency experience
`

export async function POST(request: Request) {
  const body = await request.json()
  const { user, company, role, description, platform } = body

  const background = user === 'caylah' ? CAYLAH_BACKGROUND : KYLE_BACKGROUND
  const name = user === 'caylah' ? 'Caylah' : 'Kyle'

  const prompt = `
You are a career coach helping ${name} apply for a job.

${name}'s background:
${background}

Job details:
- Company: ${company}
- Role: ${role}
- Platform: ${platform}
- Description: ${description || 'Not provided'}

Generate two things:

1. COVER LETTER — A concise, tailored cover letter (3 short paragraphs). 
- Mirror the company's language
- Lead with the most relevant experience
- End with a clear call to action
- Do not use generic phrases like "I am writing to express my interest"
- Sound like a real person, not a template

2. LINKEDIN OUTREACH — A short LinkedIn message (max 5 sentences) to the hiring manager.
- Personal and specific to the company
- Reference one thing about the company that genuinely interests ${name}
- End with a soft ask — not "can I have a job" but "would love to connect"

Format your response exactly like this:
COVER LETTER:
[cover letter here]

LINKEDIN OUTREACH:
[linkedin message here]
`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      }
    )

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Flexible parsing — handles variations in Gemini's formatting
let coverLetter = ''
let linkedinOutreach = ''

const coverMatch = text.match(/COVER LETTER:?\s*\n([\s\S]*?)(?=LINKEDIN OUTREACH:|$)/i)
const linkedinMatch = text.match(/LINKEDIN OUTREACH:?\s*\n([\s\S]*)/i)

if (coverMatch) coverLetter = coverMatch[1].trim()
if (linkedinMatch) linkedinOutreach = linkedinMatch[1].trim()

// Fallback — if formatting completely different, split by sections
if (!coverLetter && !linkedinOutreach && text.length > 100) {
  const parts = text.split(/\n\n+/)
  coverLetter = parts.slice(0, 3).join('\n\n').trim()
  linkedinOutreach = parts.slice(3).join('\n\n').trim()
}

return NextResponse.json({ coverLetter, linkedinOutreach })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate pitch' }, { status: 500 })
  }
}
