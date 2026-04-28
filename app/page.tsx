export default function AboutPage() {
  return (
    <main className="content">

      {/* HEADER */}
      <div className="section-block">
        <h1 className="section-title">⭐ North Star System</h1>
        <p className="section-sub">
          A focused, data-driven system to secure high-paying remote roles quickly and consistently.
        </p>
      </div>

      {/* VISUAL FLOW */}
      <div className="section-block card">
        <h2 className="section-title">🧭 How This Works (Daily Flow)</h2>

        <div style={{ marginTop: 16, lineHeight: 1.8 }}>
          <strong>1. Identify</strong> → Target only high-probability roles & companies<br />
          <strong>2. Apply</strong> → Submit focused, high-quality applications<br />
          <strong>3. Outreach</strong> → Contact hiring managers / relevant team members<br />
          <strong>4. Follow Up</strong> → Stay visible and increase response rate<br />
          <strong>5. Track</strong> → Move roles through pipeline stages<br />
          <strong>6. Improve</strong> → Adjust based on response + interview rate
        </div>

        <div style={{ marginTop: 20, fontSize: 13, color: '#94a3b8' }}>
          This loop repeats daily. Consistency drives results.
        </div>
      </div>

      {/* PIPELINE */}
      <div className="section-block card">
        <h2 className="section-title">📊 Pipeline Model</h2>

        <div style={{ marginTop: 16, fontSize: 14 }}>
          Prospect → Applied → Interview → Offer
        </div>

        <p className="section-sub" style={{ marginTop: 12 }}>
          Every opportunity moves through a defined system. No guessing, no lost opportunities.
        </p>
      </div>

      {/* WHY THIS APPROACH */}
      <div className="section-block card">
        <h2 className="section-title">🧠 Why This Approach Works</h2>

        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          <li>Most high-paying roles are not filled through job boards alone</li>
          <li>Direct outreach significantly increases visibility and response</li>
          <li>Focusing on fewer, better opportunities improves conversion rates</li>
          <li>Tracking progress ensures nothing slips through the cracks</li>
        </ul>
      </div>

      {/* WHAT WE AVOID */}
      <div className="section-block card">
        <h2 className="section-title">🚫 What We Avoid</h2>

        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          <li>Mass applying to hundreds of roles</li>
          <li>Relying only on LinkedIn / job boards</li>
          <li>Tracking without improving outcomes</li>
          <li>Unstructured or inconsistent effort</li>
        </ul>
      </div>

      {/* WHY NOT NOTION */}
      <div className="section-block card">
        <h2 className="section-title">⚙️ Why Not Notion / Spreadsheets</h2>

        <p className="section-sub">
          Traditional tools track information but do not drive action.
        </p>

        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          <li>No prioritisation of high-value opportunities</li>
          <li>No structured daily execution</li>
          <li>No automation or system guidance</li>
          <li>Easy to lose momentum</li>
        </ul>
      </div>

      {/* WHAT THIS SYSTEM DOES */}
      <div className="section-block card">
        <h2 className="section-title">🚀 What North Star Does</h2>

        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          <li>Centralises all opportunities in one place</li>
          <li>Forces consistent daily execution</li>
          <li>Tracks real outcomes (not just activity)</li>
          <li>Creates a clear path from application → offer</li>
        </ul>
      </div>

      {/* TARGET */}
      <div className="section-block card">
        <h2 className="section-title">🎯 Target Outcome</h2>

        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          <li>Secure high-quality remote roles</li>
          <li>Achieve stable combined income</li>
          <li>Enable location independence</li>
        </ul>

        <p className="section-sub" style={{ marginTop: 12 }}>
          The system is designed for speed, focus, and repeatable success.
        </p>
      </div>

    </main>
  )
}
