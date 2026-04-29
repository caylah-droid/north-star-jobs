import { NextResponse } from 'next/server'

const CAYLAH_BACKGROUND = `
7+ years operational leadership across South Africa, USA, and UK.
Led full Zoho One CRM implementations and operational systems.
Built scalable workflows, automation pipelines, and reporting systems.
Experience across legal, medical, and high-volume operational environments.
Skills: systems thinking, operations strategy, automation, CRM architecture, process design.
`

const KYLE_BACKGROUND = `
Extensive relationship management across legal and marketing environments.
Strong experience working with law firms and attorneys.
Team leadership and client relationship management.
Business development across legal services and marketing companies.
Skills: relationship building, client management, team leadership.
`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user, company, role, description } = body

    const background =
      user === 'caylah' ? CAYLAH_BACKGROUND : KYLE_BACKGROUND

    const name = user === 'caylah' ? 'Caylah' : 'Kyle'

    const prompt = `
You are writing a highly tailored job application.

Candidate: ${name}
Background: ${background}

Company: ${company}
Role: ${role}
Job Description: ${description || 'Not provided'}

Write:

1. A strong, tailored 3-paragraph cover letter:
- Specific to the company and role
- Confident, direct, not generic
- Focus on operations, systems, and impact
- No fluff

2. A short LinkedIn outreach message:
- Max 3–4 sentences
- Warm, direct, specific

Format EXACTLY like this:

COVER LETTER:
<text>

LINKEDIN:
<text>
`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message },
        { status: 500 }
      )
    }

    // ✅ SAFE TEXT EXTRACTION
    const parts = data.candidates?.[0]?.content?.parts || []
    const text = parts.map((p: any) => p.text || '').join('').trim()

    // ✅ SAFE PARSING (NO JSON DEPENDENCY)
    let coverLetter = ''
    let linkedinOutreach = ''

    if (text.includes('COVER LETTER:')) {
      const split1 = text.split('COVER LETTER:')[1]
      const split2 = split1.split('LINKEDIN:')

      coverLetter = split2[0]?.trim() || ''
      linkedinOutreach = split2[1]?.trim() || ''
    } else {
      // fallback if model ignores format
      coverLetter = text
    }

    return NextResponse.json({
      coverLetter,
      linkedinOutreach,
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}