import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useRoutes } from 'react-router-dom'
import { getIdTokenResult, onAuthStateChanged, signOut } from 'firebase/auth'
import { products } from './data/marketplace.js'
import { HomePage } from './pages/public/HomePage.jsx'
import { AboutPage } from './pages/public/AboutPage.jsx'
import { Login } from './pages/auth/login.jsx'
import { CreateAccount } from './pages/auth/createaccount.jsx'
import { Workspace } from './components/Workspace.jsx'
import { createPublicRoutes } from './routes/PublicRoutes.jsx'
import { createAuthRoutes } from './routes/AuthRoutes.jsx'
import { createBuyerRoutes } from './routes/BuyerRoutes.jsx'
import { createSellerRoutes } from './routes/SellerRoutes.jsx'
import { createAdminRoutes } from './routes/AdminRoutes.jsx'
import { createSharedRoutes } from './routes/SharedRoutes.jsx'
import { routePaths } from './routes/routePaths.js'
import { auth } from '../config/firebase.js'

function getDashboardPage(userRole) {
  if (userRole === 'admin') return 'adminDashboard'
  return userRole === 'supplier' ? 'supplierDashboard' : 'buyerDashboard'
}

function getStoredUserRole(userId) {
  const storedRole = window.localStorage.getItem(`chai-supply:role:${userId}`)
  return storedRole === 'buyer' || storedRole === 'supplier' ? storedRole : null
}

export function App() {
  const [role, setRole] = useState('buyer')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [cart, setCart] = useState({ milk: 10, tea: 2, sugar: 1, biscuits: 2 })
  const [selectedProduct, setSelectedProduct] = useState(products[0])
  const [detailQuantity, setDetailQuantity] = useState(1)
  const [faqOpen, setFaqOpen] = useState(0)
  const [toast, setToast] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderFilter, setOrderFilter] = useState('All')
  const [authUser, setAuthUser] = useState(auth.currentUser)
  const [authReady, setAuthReady] = useState(false)
  const routerNavigate = useNavigate()

  useEffect(() => {
    let active = true
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user)
      setAuthReady(false)

      if (!user) {
        setRole('buyer')
        setAuthReady(true)
        return
      }

      try {
        const { claims } = await getIdTokenResult(user, true)
        if (!active || auth.currentUser?.uid !== user.uid) return
        setRole(claims.admin === true ? 'admin' : getStoredUserRole(user.uid) || 'buyer')
      } catch (error) {
        console.error('Unable to verify the signed-in user role:', error)
        if (!active || auth.currentUser?.uid !== user.uid) return
        setRole(getStoredUserRole(user.uid) || 'buyer')
      }

      if (active && auth.currentUser?.uid === user.uid) {
        setAuthReady(true)
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
  const cartProducts = products.filter((product) => cart[product.id])
  const subtotal = cartProducts.reduce((sum, product) => sum + product.price * cart[product.id], 0)
  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = category === 'All' || product.category === category
    const matchesQuery = `${product.name} ${product.detail} ${product.category}`.toLowerCase().includes(query.toLowerCase())
    return matchesCategory && matchesQuery
  }), [category, query])

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  function navigate(nextPage) {
    const path = routePaths[nextPage]
    if (!path) {
      throw new Error(`Unknown page route: ${nextPage}`)
    }
    routerNavigate(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function logOut() {
    try {
      await signOut(auth)
      navigate('home')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  function addToCart(product, quantity = 1) {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] || 0) + quantity }))
    notify(`${product.name} added to your cart`)
  }

  function changeQuantity(productId, difference) {
    setCart((current) => {
      const quantity = (current[productId] || 0) + difference
      if (quantity <= 0) {
        const next = { ...current }
        delete next[productId]
        return next
      }
      return { ...current, [productId]: quantity }
    })
  }

  function openProduct(product) {
    setSelectedProduct(product)
    setDetailQuantity(1)
    navigate('product')
  }

  const startShopping = () => navigate('catalogue')
  const dashboardPage = getDashboardPage(role)
  const dashboardPath = routePaths[dashboardPage]
  const roleName = authUser?.displayName || authUser?.email?.split('@')[0] ||
    (role === 'admin' ? 'Marketplace admin' : role === 'supplier' ? 'FreshFarm Dairy' : 'Ravi Kumar')
  async function completeAuth(userRole, userId) {
    const user = auth.currentUser
    if (!user || user.uid !== userId) {
      throw new Error('The signed-in account could not be verified.')
    }

    const { claims } = await getIdTokenResult(user, true)
    const effectiveRole = claims.admin === true ? 'admin' : userRole
    if (effectiveRole === 'admin') {
      window.localStorage.removeItem(`chai-supply:role:${userId}`)
    } else {
      window.localStorage.setItem(`chai-supply:role:${userId}`, effectiveRole)
    }
    setRole(effectiveRole)
    navigate(getDashboardPage(effectiveRole))
    notify(`Welcome to ChaiSupply, ${roleName}`)
  }
  const homeProps = {
    cartCount,
    faqOpen,
    setFaqOpen,
    startShopping,
    openAuth: () => navigate('login'),
    openCreateAccount: () => navigate('createAccount'),
    onSignOut: logOut,
    openProduct,
    addToCart,
    navigate,
  }
  const authProps = {
    role,
    setRole,
    onSubmit: completeAuth,
    onCreateAccount: completeAuth,
    navigate,
  }
  const workspaceProps = {
    role,
    roleName,
    authUser,
    cartCount,
    query,
    setQuery,
    category,
    setCategory,
    filteredProducts,
    openProduct,
    addToCart,
    selectedProduct,
    detailQuantity,
    setDetailQuantity,
    cart,
    cartProducts,
    subtotal,
    changeQuantity,
    orderPlaced,
    setOrderPlaced,
    orderFilter,
    setOrderFilter,
    navigate,
    notify,
    onSignOut: logOut,
  }
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
  const pageContent = useRoutes([
    ...createPublicRoutes({ HomePage, AboutPage, homeProps, navigate, authReady, authUser, dashboardPath: routePaths[dashboardPage] }),
    ...createAuthRoutes({ Login, CreateAccount, authProps, authReady, authUser, dashboardPath: routePaths[dashboardPage] }),
    ...createBuyerRoutes(workspaceElement),
    ...createSellerRoutes(workspaceElement),
    ...createAdminRoutes(workspaceElement),
    ...createSharedRoutes(workspaceElement),
    { path: '*', element: <Navigate to="/" replace /> },
  ])

  return (
    <div className="app-shell [--brown:#6f3e25] [--brown-dark:#522d19] [--orange:#d9822b] [--green:#3f7d58] [--cream:#fff9f1] [--warm:#f8f4f0] [--card:#fff] [--ink:#252525] [--muted:#77716c] [--border:#e8ded2] [--shadow:0_8px_24px_rgba(66,_42,_26,_.07)] font-sans text-[#252525] bg-[#fff9f1] [min-height:100vh] [font-synthesis:none] [text-rendering:optimizeLegibility] antialiased [font-optical-sizing:auto] font-normal">
      {pageContent}
      {toast && <div className="toast [position:fixed] [z-index:10] [right:22px] [bottom:22px] [display:flex] [align-items:center] [gap:9px] [padding:12px_17px] [border:1px_solid_#e7ddd1] [border-radius:8px] [background:white] [color:#423329] [box-shadow:0_8px_30px_#33231224] [font-size:12px]" role="status"><span className="toast-check [display:grid] [width:20px] [height:20px] [place-items:center] [border-radius:50%] [color:white] [background:var(--green)] [font-size:12px]">✓</span>{toast}</div>}
    </div>
  )
}

export default App
