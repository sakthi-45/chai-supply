import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routePaths } from './routes/routePaths.js'
import { useToast } from './hooks/useToast.js'
import { useAuth, getDashboardPage } from './hooks/useAuth.js'
import { useProducts } from './hooks/useProducts.js'
import { useCart } from './hooks/useCart.js'
import { useOrders } from './hooks/useOrders.js'
import { AppRoutes } from './components/AppRoutes.jsx'
import { Toast } from './components/Toast.jsx'
import ChatBot from './components/chatbot.jsx'

export function App() {
  const routerNavigate = useNavigate()
  const { toast, notify } = useToast()
  const [faqOpen, setFaqOpen] = useState(0)
  const [, setProfileVersion] = useState(0)

  // Products
  const {
    productList,
    selectedProduct,
    detailQuantity,
    setDetailQuantity,
    category,
    setCategory,
    query,
    setQuery,
    filteredProducts,
    openProduct,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
  } = useProducts(notify)

  // Cart
  const {
    cart,
    setCart,
    cartCount,
    cartProducts,
    subtotal,
    addToCart,
    changeQuantity,
  } = useCart(productList, notify)

  // Central Navigation
  function navigate(nextPage) {
    const path = routePaths[nextPage]
    if (!path) {
      throw new Error(`Unknown page route: ${nextPage}`)
    }
    routerNavigate(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Auth
  const {
    role,
    authUser,
    authReady,
    completeAuth,
    logOut,
  } = useAuth((user) => {
    fetchOrders(user)
  })

  // Orders
  const {
    orders,
    ordersError,
    isSubmittingOrder,
    checkoutError,
    selectedOrder,
    orderFilter,
    setOrderFilter,
    fetchOrders,
    placeOrder,
    payWithStripe,
    openOrder,
    handleUpdateOrderStatus,
  } = useOrders({
    role,
    authUser,
    cart,
    cartProducts,
    subtotal,
    setCart,
    notify,
    navigate,
    routerNavigate,
  })

  const startShopping = () => navigate('catalogue')
  const dashboardPage = getDashboardPage(role)
  const dashboardPath = routePaths[dashboardPage]
  const roleName =
    authUser?.displayName ||
    authUser?.email?.split('@')[0] ||
    (role === 'admin' ? 'Marketplace admin' : 'Ravi Kumar')

  const homeProps = {
    cartCount,
    faqOpen,
    setFaqOpen,
    startShopping,
    openAuth: () => navigate('login'),
    openCreateAccount: () => navigate('createAccount'),
    onSignOut: () => logOut(navigate),
    openProduct: (product) => openProduct(product, navigate),
    addToCart,
    navigate,
  }

  const authProps = {
    onSubmit: (userRole, userId, fallbackUser) =>
      completeAuth(userRole, userId, fallbackUser, navigate, notify),
    onCreateAccount: (userRole, userId, fallbackUser) =>
      completeAuth(userRole, userId, fallbackUser, navigate, notify),
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
    openProduct: (product) => openProduct(product, navigate),
    addToCart,
    selectedProduct,
    detailQuantity,
    setDetailQuantity,
    cart,
    cartProducts,
    subtotal,
    changeQuantity,
    orders,
    ordersError,
    isSubmittingOrder,
    checkoutError,
    selectedOrder,
    onPlaceOrder: placeOrder,
    onPayWithStripe: payWithStripe,
    onOpenOrder: openOrder,
    onRefreshOrders: () => fetchOrders(),
    orderFilter,
    setOrderFilter,
    products: productList,
    onAddProduct: (prod) => handleAddProduct(prod, authUser),
    onEditProduct: (prod) => handleEditProduct(prod, authUser),
    onDeleteProduct: (prodId) => handleDeleteProduct(prodId, authUser),
    onUpdateOrderStatus: handleUpdateOrderStatus,
    navigate,
    notify,
    onProfileUpdated: () => setProfileVersion((v) => v + 1),
    onSignOut: () => logOut(navigate),
  }

  return (
    <div className="app-shell [--brown:#6f3e25] [--brown-dark:#522d19] [--orange:#d9822b] [--green:#3f7d58] [--cream:#fff9f1] [--warm:#f8f4f0] [--card:#fff] [--ink:#252525] [--muted:#77716c] [--border:#e8ded2] [--shadow:0_8px_24px_rgba(66,_42,_26,_.07)] font-sans text-[#252525] bg-[#fff9f1] [min-height:100vh] [font-synthesis:none] [text-rendering:optimizeLegibility] antialiased [font-optical-sizing:auto] font-normal">
      {!authReady ? (
        <div className="[min-height:100vh] [display:flex] [align-items:center] [justify-content:center] [color:var(--brown)] [font-size:14px] [font-weight:600]">
          Loading ChaiSupply...
        </div>
      ) : (
        <AppRoutes
          homeProps={homeProps}
          authProps={authProps}
          workspaceProps={workspaceProps}
          authReady={authReady}
          authUser={authUser}
          role={role}
          dashboardPath={dashboardPath}
          dashboardPage={dashboardPage}
          navigate={navigate}
        />
      )}
      <Toast message={toast} />
      <ChatBot />
    </div>
  )
}

export default App
