import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { url } = body

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    const html = await res.text()

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch?.[1]?.replace(/\s+/g, ' ').trim() || ''

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)
    const metaDesc = descMatch?.[1] || ''

    // Extract OG data
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] || ''
    const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] || ''
    const ogSiteName = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)?.[1] || ''

    // Try to extract company and role from title
    const cleanTitle = (ogTitle || title)
      .replace(/\s*[-|]\s*.+$/, '')
      .replace(/jobs?\s*at\s*/i, '')
      .trim()

    // Detect platform
    let platform = 'Other'
    if (url.includes('linkedin.com')) platform = 'LinkedIn'
    else if (url.includes('indeed.com')) platform = 'Indeed'
    else if (url.includes('glassdoor.com')) platform = 'Glassdoor'
    else if (url.includes('weworkremotely.com')) platform = 'We Work Remotely'
    else if (url.includes('remotive.com')) platform = 'Remotive'
    else if (ogSiteName) platform = ogSiteName

    const description = ogDesc || metaDesc || ''

    return NextResponse.json({
      title: cleanTitle,
      description: description.slice(0, 500),
      platform,
      detected: true,
    })
  } catch {
    return NextResponse.json({
      title: '',
      description: '',
      platform: 'Other',
      detected: false,
    })
  }
}
