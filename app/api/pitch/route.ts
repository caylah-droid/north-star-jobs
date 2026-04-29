import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { user, company, role, description } = body

  const isCaylah = user === 'caylah'
  const name = isCaylah ? 'Caylah' : 'Kyle'

  // Extract key terms from job description
  const desc = description || ''
  const isOps = /operations|process|systems|workflow|crm/i.test(desc)
  const isRevOps = /revenue|gtm|sales ops|go.to.market/i.test(desc)
  const isLegal = /legal|law firm|attorney|compliance/i.test(desc)
  const isCS = /customer success|client success|account/i.test(desc)
  const isRemote = /remote|distributed/i.test(desc)

  let coverLetter = ''
  let linkedinOutreach = ''

  if (isCaylah) {
    const focus = isRevOps
      ? `My work building revenue operations infrastructure at FundaGlobal and Advoc8se LLC — including a full Zoho One CRM implementation across two countries — maps directly to what ${company} needs.`
      : isOps
      ? `My track record of designing and implementing operational systems — from a full Zoho One CRM build to a custom .NET platform migration at FundaMedical — is exactly the kind of hands-on systems experience ${company} is looking for.`
      : `My experience leading operations across South Africa, the USA, and the UK, combined with deep CRM and process automation expertise, positions me well for this role at ${company}.`

    coverLetter = `Dear Hiring Team at ${company},

${focus} As a founding operator and equity stakeholder in two businesses, I understand what it means to build operational infrastructure from scratch — not just manage it.

At FundaGlobal and Advoc8se LLC, I led the end-to-end implementation of Zoho One across sales, operations, and finance — reducing manual reporting overhead and creating a single source of truth for a multi-entity, cross-country business. At FundaMedical, I drove a full platform migration from SharePoint and Power BI to a custom .NET case management system, managing both the technical and change management process. These weren't projects I oversaw — they were systems I architected and delivered.

I would welcome the opportunity to discuss how my background in ${isRevOps ? 'revenue operations and GTM systems' : 'operational systems and process design'} can contribute to ${company}'s next phase. I'm available for a conversation at your convenience.

Warm regards,
Caylah`

    linkedinOutreach = `Hi [Name], I came across the ${role} role at ${company} and it immediately caught my attention — the operational challenges you're describing are exactly the kind I've spent the last seven years solving across South Africa, the USA, and the UK. I've built CRM systems, migrated platforms, and designed processes for businesses at different stages of scale. I'd love to connect and learn more about what you're building. Would you be open to a quick conversation?`

  } else {
    const focus = isLegal
      ? `Having spent years working directly with law firms and attorneys, I understand how legal professionals think, what they need from their tools, and how to build the kind of trust that makes those relationships last.`
      : isCS
      ? `My background in managing high-value client relationships — particularly in demanding professional environments — maps directly to what a Customer Success role at ${company} requires.`
      : `My experience building and managing relationships in high-stakes professional environments gives me a strong foundation for this role at ${company}.`

    coverLetter = `Dear Hiring Team at ${company},

${focus} Client relationships aren't just something I manage — they're something I invest in. The law firms and professional services clients I've worked with are demanding, detail-oriented, and value trust above everything else. I've learned to speak their language and deliver results on their terms.

Throughout my career I've managed important customer relationships, led teams, and driven business development across legal and marketing environments. I bring operational awareness that most relationship-focused candidates don't have — I understand not just how to win a client, but how to build the systems that keep them. At ${company}, I see an opportunity to bring both of those strengths to bear.

I'd welcome the chance to discuss how my background in ${isLegal ? 'legal client relationships and operations' : 'client success and account management'} can contribute to ${company}'s growth. I'm available for a conversation at your convenience.

Warm regards,
Kyle`

    linkedinOutreach = `Hi [Name], I came across the ${role} role at ${company} and it's a strong fit for my background — I've spent years managing relationships with law firms and professional services clients, and I understand the trust and operational precision those environments demand. I'd love to connect and learn more about what success looks like in this role. Would you be open to a quick chat?`
  }

  return NextResponse.json({ coverLetter, linkedinOutreach })
}
