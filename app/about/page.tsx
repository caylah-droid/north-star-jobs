export default function AboutPage() {
  return (
    <main className="content">
      <div className="section-block">
        <h1 className="section-title">⭐ North Star</h1>
        <p className="section-sub">
          A system designed to turn job searching into a high-probability, data-driven pipeline.
        </p>
      </div>

      <div className="section-block card">
        <h2 className="section-title">🎯 Objective</h2>
        <p className="section-sub">
          Transition to fully remote income within 6–8 weeks, enabling digital nomad freedom while maintaining R100k/month net income.
        </p>
      </div>

      <div className="section-block card">
        <h2 className="section-title">🚨 Problem</h2>
        <p className="section-sub">
          Traditional job searching relies on high-volume applications through generic platforms, resulting in low response rates and timelines exceeding 3 months.
          Existing tools (Notion, spreadsheets) track activity but do not improve outcomes.
        </p>
      </div>

      <div className="section-block card">
        <h2 className="section-title">🧠 Approach</h2>
        <p className="section-sub">
          North Star treats job acquisition as an operational pipeline rather than a passive search.
          Focus is placed on high-probability targets, structured execution, and measurable conversion rates.
        </p>

        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          <li>Target a curated set of high-value remote-first companies</li>
          <li>Prioritize roles with strong salary and async compatibility</li>
          <li>Use outreach and referrals instead of relying on applications alone</li>
          <li>Track every step from prospect → offer</li>
        </ul>
      </div>

      <div className="section-block card">
        <h2 className="section-title">📊 Data-Backed Strategy</h2>

        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          <li>Only 4–12% of roles are fully remote (Robert Half)</li>
          <li>60–70% of high-paying roles are filled via networks (LinkedIn)</li>
          <li>Elite platforms show significantly higher placement rates</li>
          <li>Average response rate ~10% → optimized targeting increases this</li>
        </ul>

        <p style={{ marginTop: 12 }} className="section-sub">
          The system focuses on channels and behaviors with the highest observed conversion rates.
        </p>
      </div>

      <div className="section-block card">
        <h2 className="section-title">⚙️ System Design</h2>

        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          <li>Kanban pipeline: Prospect → Applied → Interview → Offer</li>
          <li>Daily action engine to enforce execution discipline</li>
          <li>Company targeting with prioritization</li>
          <li>Metrics tracking: response rate, interview rate, outreach conversion</li>
        </ul>
      </div>

      <div className="section-block card">
        <h2 className="section-title">🤖 Automation Layer (Planned)</h2>

        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          <li>AI-generated cover letters and tailored CV adjustments</li>
          <li>Outreach message generation based on company context</li>
          <li>Priority scoring of opportunities</li>
          <li>Automated follow-up reminders</li>
        </ul>
      </div>

      <div className="section-block card">
        <h2 className="section-title">🎯 Targets</h2>

        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          <li>Partner 1: Operations roles (~$9k/month)</li>
          <li>Partner 2: BDM / CSM roles (~$5k/month)</li>
          <li>Combined target: ~$14k/month → R100k net</li>
        </ul>
      </div>

      <div className="section-block card">
        <h2 className="section-title">🛤️ Execution Timeline</h2>

        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          <li>Week 1–2: Pipeline build + initial interviews</li>
          <li>Week 3–4: Increased interview volume</li>
          <li>Week 5–6: Offer stage</li>
          <li>Week 8: Transition to remote work</li>
        </ul>
      </div>

      <div className="section-block card">
        <h2 className="section-title">💻 Tech Stack</h2>

        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          <li>Next.js (App Router)</li>
          <li>Neon PostgreSQL</li>
          <li>Prisma ORM</li>
          <li>Vercel deployment</li>
        </ul>
      </div>

      <div className="section-block card">
        <h2 className="section-title">🚀 Outcome</h2>
        <p className="section-sub">
          North Star is both a personal system and a proof-of-execution project—demonstrating the ability to design, build, and operate a high-performance workflow that produces real-world results.
        </p>
      </div>
    </main>
  )
}
