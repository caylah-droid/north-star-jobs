import { NextResponse } from 'next/server'

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`

// ─── BACKGROUNDS ─────────────────────────────────────────────

const CAYLAH_BACKGROUND = `
7+ years operational leadership across South Africa, USA, and UK.
Led full Zoho One CRM implementation and multi-country operations scaling.
Directed platform migration from SharePoint and Power BI to custom .NET systems.
Experience supporting 150+ staff, 180 law firms, and high-volume operational environments.
Consulting focus: systems, automation, and operational execution.
Skills: Systems thinking, CRM architecture, workflow automation, process design.
`

const KYLE_BACKGROUND = `
Extensive relationship management across legal and marketing environments.
Deep experience working with law firms and attorneys.
Strong team management and customer relationship management.
Business development across legal services and marketing companies.
Skills: Relationship building, legal client fluency, team leadership, client retention.
`

// ─── HELPER: GEMINI CALL ─────────────────────────────────────

async function callGemini(prompt: string) {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 800,
      },
    }),
  })

  const data = await res.json()

  if (data.error) throw new Error(data.error.message)

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  return text
}

// ─── HELPER: CLEAN JSON ──────────────────────────────────────

function safeJSONParse(text: string) {
  try {
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

// ─── MAIN ROUTE ──────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user, company, role, description } = body

    const background =
      user === 'caylah' ? CAYLAH_BACKGROUND : KYLE_BACKGROUND
    const name = user === 'caylah' ? 'Caylah' : 'Kyle'

    // ─── STEP 1: EXTRACT JOB DATA ────────────────────────────

    const extractPrompt = `
Extract structured information from this job description.

Return JSON only:
{
  "required_skills": [],
  "seniority": "",
  "focus_areas": [],
  "company_type": ""
}

Job description:
${description || 'Not provided'}
`

    const extractText = await callGemini(extractPrompt)
    const jobData =
      safeJSONParse(extractText) || {
        required_skills: [],
        seniority: '',
        focus_areas: [],
        company_type: '',
      }

    // ─── STEP 2: MATCH ANALYSIS ─────────────────────────────

    const matchPrompt = `
Given this candidate and job, return:

{
  "matchScore": number,
  "topStrengths": [],
  "gaps": [],
  "positioning": ""
}

Candidate:
${background}

Job requirements:
${JSON.stringify(jobData)}
`

    const matchText = await callGemini(matchPrompt)
    const match =
      safeJSONParse(matchText) || {
        matchScore: 75,
        topStrengths: [],
        gaps: [],
        positioning: 'strong operational candidate',
      }

    // ─── STEP 3: GENERATE OUTPUT ────────────────────────────

    const finalPrompt = `
Write a job application pitch for ${name} applying to ${role} at ${company}.

Candidate background:
${background}

Job insights:
- Required skills: ${jobData.required_skills.join(', ')}
- Seniority: ${jobData.seniority}
- Focus: ${jobData.focus_areas.join(', ')}

Match analysis:
- Match score: ${match.matchScore}%
- Top strengths: ${match.topStrengths.join(', ')}
- Gaps: ${match.gaps.join(', ')}
- Positioning: ${match.positioning}

Instructions:
- Be highly specific to the company and role
- Lead with strongest alignment
- Smoothly handle gaps without highlighting weakness
- Keep tone confident, sharp, and natural

Return JSON:
{
  "coverLetter": "3 short paragraphs",
  "linkedinOutreach": "max 4 sentences"
}
`

    const finalText = await callGemini(finalPrompt)
    const parsed = safeJSONParse(finalText)

    return NextResponse.json({
      coverLetter: parsed?.coverLetter || '',
      linkedinOutreach: parsed?.linkedinOutreach || '',
      matchScore: match.matchScore,
      strengths: match.topStrengths,
      gaps: match.gaps,
    })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
