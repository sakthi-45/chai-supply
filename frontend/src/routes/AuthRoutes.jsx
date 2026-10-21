import { Navigate } from 'react-router-dom'

export function createAuthRoutes({ Login, CreateAccount, ForgotPassword, authProps, authReady, authUser, dashboardPath }) {
  const authRedirect = authUser ? <Navigate to={dashboardPath} replace /> : null

  return [
    { path: '/login', element: !authReady ? null : authRedirect || <Login {...authProps} /> },
    { path: '/create-account', element: !authReady ? null : authRedirect || <CreateAccount {...authProps} /> },
    { path: '/forgot-password', element: !authReady ? null : authRedirect || (ForgotPassword ? <ForgotPassword {...authProps} /> : null) },
  ]
}
