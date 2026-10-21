import { Navigate, useRoutes } from 'react-router-dom'
import { HomePage } from '../pages/public/HomePage.jsx'
import { AboutPage } from '../pages/public/AboutPage.jsx'
import { Login } from '../pages/auth/login.jsx'
import { CreateAccount } from '../pages/auth/createaccount.jsx'
import { ForgotPassword } from '../pages/auth/forgotpassword.jsx'
import { NotFoundPage } from '../pages/error/NotFoundPage.jsx'
import { Workspace } from './Workspace.jsx'
import { createPublicRoutes } from '../routes/PublicRoutes.jsx'
import { createAuthRoutes } from '../routes/AuthRoutes.jsx'
import { createBuyerRoutes } from '../routes/BuyerRoutes.jsx'
import { createAdminRoutes } from '../routes/AdminRoutes.jsx'
import { createSharedRoutes } from '../routes/SharedRoutes.jsx'

export function AppRoutes({
  homeProps,
  authProps,
  workspaceProps,
  authReady,
  authUser,
  role,
  dashboardPath,
  dashboardPage,
  navigate,
}) {
  function workspaceElement(page, allowedRole) {
    if (!authReady) {
      return null
    }
    if (!authUser) {
      return <Navigate to="/login" replace />
    }
    if (allowedRole && role !== allowedRole) {
      return <Navigate to={dashboardPath} replace />
    }
    return <Workspace {...workspaceProps} page={page} />
  }

  return useRoutes([
    ...createPublicRoutes({ HomePage, AboutPage, homeProps, navigate, authReady, authUser, dashboardPath }),
    ...createAuthRoutes({ Login, CreateAccount, ForgotPassword, authProps, authReady, authUser, dashboardPath }),
    ...createBuyerRoutes(workspaceElement),
    ...createAdminRoutes(workspaceElement),
    ...createSharedRoutes(workspaceElement),
    {
      path: '*',
      element: <NotFoundPage navigate={(page) => navigate(page === 'dashboard' ? dashboardPage : page)} />,
    },
  ])
}
