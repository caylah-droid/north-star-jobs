'use client'

type Props = {
  activeUser: 'caylah' | 'kyle'
  setActiveUser: (user: 'caylah' | 'kyle') => void
}

export default function Header({ activeUser, setActiveUser }: Props) {
  return (
    <div>
      <div className="header">
        <div>
          <h1>⭐ North Star</h1>
          <p>Job acquisition system</p>
        </div>
        <div className="user-toggle">
          <button
            onClick={() => setActiveUser('caylah')}
            className={`toggle-btn ${activeUser === 'caylah' ? 'active-caylah' : ''}`}
          >
            Caylah
          </button>
          <button
            onClick={() => setActiveUser('kyle')}
            className={`toggle-btn ${activeUser === 'kyle' ? 'active-kyle' : ''}`}
          >
            Kyle
          </button>
        </div>
      </div>
      <div className={`accent-bar ${activeUser === 'caylah' ? 'accent-caylah' : 'accent-kyle'}`} />
    </div>
  )
}
