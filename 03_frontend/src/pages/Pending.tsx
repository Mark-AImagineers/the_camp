import { useLocation, Link } from 'react-router-dom'

export default function Pending() {
  const location = useLocation()
  const handle = (location.state as { handle?: string })?.handle

  return (
    <div className="auth-page">
      <h1 className="auth-title">THE CAMP</h1>
      <div className="pending-content">
        <p className="pending-status">Your account has been registered.</p>
        {handle && <p className="pending-handle">{handle}</p>}
        <p className="pending-body">
          Access is currently by approval only.
        </p>
        <p className="pending-body">
          The gates are not open to everyone. When your name comes up, we'll let you in.
        </p>
        <p className="pending-quiet">
          Until then — wait. Like everyone else does.
        </p>
      </div>
      <p className="auth-link">
        <Link to="/login">Back to login</Link>
      </p>
    </div>
  )
}
