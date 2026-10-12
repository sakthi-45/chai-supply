import { Navigate } from 'react-router-dom'

export function createAuthRoutes({ Login, CreateAccount, authProps, authReady, authUser, dashboardPath }) {
  const authRedirect = authUser ? <Navigate to={dashboardPath} replace /> : null

  return [
    { path: '/login', element: !authReady ? null : authRedirect || <Login {...authProps} /> },
    { path: '/create-account', element: !authReady ? null : authRedirect || <CreateAccount {...authProps} /> },
  ]
}
