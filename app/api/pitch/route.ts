import { NextResponse } from 'next/server'

const CAYLAH_BACKGROUND = `
7+ years operational leadership across South Africa, USA, and UK.
Led full Zoho One CRM implementations and built scalable operational systems.
Specialist in systems thinking, workflow automation, and process architecture.
Experience across legal and medical sectors handling high-volume, regulated environments.
Strength: turning fragmented manual processes into structured, automated systems.
`

const KYLE_BACKGROUND = `
Extensive relationship management across legal and marketing environments.
Strong experience working with law firms and attorneys.
Skilled in team leadership, client communication, and retention.
Background in business development and client-facing operations.
`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user, company, role, description } = body

    const background = user === 'caylah' ? CAYLAH_BACKGROUND : KYLE_BACKGROUND
    const name = user === 'caylah' ? 'Caylah' : 'Kyle'

    const prompt = `
You are writing a high-impact job application for a top 1% candidate.

Candidate: ${name}
Background:
${background}

Company: ${company}
Role: ${role}
Job Description:
${description || 'Not provided'}

OBJECTIVE:
Write like a senior operator, not a job seeker.

RULES:
- No fluff, no buzzwords, no generic phrasing
- No “I am excited”, “I believe”, or corporate filler
- Be direct, confident, and specific
- Focus on systems, scale, and business impact
- Make the candidate sound like someone who solves structural problems, not executes tasks
- Tailor clearly to the company and role

STYLE:
- Sharp, concise, high-signal writing
- Slightly opinionated is GOOD
- Sound like a strategic hire, not a safe hire

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "coverLetter": "3 paragraphs, 160–220 words total. Tight, direct, differentiated. Strong opening and decisive closing.",
  "linkedinOutreach": "Max 3 sentences. Natural, confident, not salesy. Reference the company/role."
}
`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600,
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

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Clean Gemini formatting
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    try {
      const parsed = JSON.parse(cleaned)

      return NextResponse.json({
        coverLetter: parsed.coverLetter || '',
        linkedinOutreach: parsed.linkedinOutreach || '',
      })
    } catch {
      // fallback if JSON fails
      return NextResponse.json({
        coverLetter: cleaned,
        linkedinOutreach: '',
      })
    }
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}