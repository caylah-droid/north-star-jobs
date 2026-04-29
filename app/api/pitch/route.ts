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

export async function POST(request: Request) {
  const body = await request.json()
  const { user, company, role, description } = body

  const background = user === 'caylah' ? CAYLAH_BACKGROUND : KYLE_BACKGROUND
  const name = user === 'caylah' ? 'Caylah' : 'Kyle'

  const prompt = `Write a job application pitch for ${name} applying to ${role} at ${company}.

${name}'s background: ${background}

Job description: ${description || 'Not provided'}

Return a JSON object only, no other text:
{
  "coverLetter": "3 short paragraphs tailored specifically to this company and role using the job description",
  "linkedinOutreach": "max 4 sentences, warm, specific to this company"
}`

  try {
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

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

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
