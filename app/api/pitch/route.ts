import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { user, company, role } = body

  const prompt = `Write a 2 sentence cover letter for ${user} applying to ${role} at ${company}.`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )

    const data = await res.json()
    
    // Return the raw Gemini response so we can see what's happening
    return NextResponse.json({
      debug: data,
      coverLetter: data.candidates?.[0]?.content?.parts?.[0]?.text || 'empty',
      linkedinOutreach: 'test',
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
