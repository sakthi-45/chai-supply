import { Navigate } from 'react-router-dom'

export function createPublicRoutes({ HomePage, AboutPage, homeProps, navigate, authReady, authUser, dashboardPath }) {
  const publicRedirect = authUser ? <Navigate to={dashboardPath} replace /> : null

  return [
    { path: '/', element: !authReady ? null : publicRedirect || <HomePage {...homeProps} /> },
    { path: '/home', element: !authReady ? null : publicRedirect || <HomePage {...homeProps} /> },
    { path: '/homepage', element: !authReady ? null : publicRedirect || <HomePage {...homeProps} /> },
    { path: '/about', element: !authReady ? null : publicRedirect || <AboutPage navigate={navigate} /> },
  ]
}
