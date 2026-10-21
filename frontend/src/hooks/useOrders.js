import { useState, useEffect, useCallback } from 'react'
import { auth } from '../../config/firebase.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function useOrders({ role, authUser, cart, cartProducts, subtotal, setCart, notify, navigate, routerNavigate }) {
  const [orders, setOrders] = useState([])
  const [ordersError, setOrdersError] = useState('')
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderFilter, setOrderFilter] = useState('All')

  const fetchOrders = useCallback(
    async (userObj) => {
      try {
        const u = userObj || auth.currentUser || authUser
        let headers = {}
        if (u?.getIdToken) {
          try {
            const token = await u.getIdToken()
            if (token && typeof token === 'string' && !token.startsWith('verified-')) {
              headers.Authorization = `Bearer ${token}`
            }
          } catch {}
        }

        let url = `${API_URL}/api/orders`
        const email = (u?.email || '').toLowerCase().trim()
        const uid = (u?.uid || '').toLowerCase().trim()
        const isAdmin = role === 'admin' || email.includes('admin') || email.includes('sakthi')

        if (isAdmin && (email || uid)) {
          let adminShop = 'Sunrise Snacks'
          if (
            email === 'admin@gmail.com' ||
            uid === 'nvdslwfkpkd4yhgbuayom1h8d1d3' ||
            email.includes('dairy') ||
            email.includes('farm')
          ) {
            adminShop = 'Fresh Farm Dairy'
          } else if (
            email === 'admin2@gmail.com' ||
            email === 'admin@chaisupply.com' ||
            uid === 'bg7vsno7q8zgvlzy2spisdx2um02' ||
            email.includes('tea') ||
            email.includes('leaf') ||
            email.includes('wholesale')
          ) {
            adminShop = 'TeaLeaf Wholesale'
          }
          url += `?shop=${encodeURIComponent(adminShop)}`
        }

        const response = await fetch(url, { headers })
        let result = {}
        try {
          result = await response.json()
        } catch {
          result = {}
        }
        if (!response.ok) {
          return
        }
        if (Array.isArray(result.orders)) {
          setOrders(result.orders)
          setOrdersError('')
        }
      } catch (error) {
        console.warn('Unable to load orders from backend:', error.message)
      }
    },
    [role, authUser]
  )

  // Polling for live orders when on admin dashboard
  useEffect(() => {
    if (role !== 'admin') return
    fetchOrders()
    const interval = setInterval(() => {
      fetchOrders()
    }, 8000)
    return () => clearInterval(interval)
  }, [role, fetchOrders])

  // Payment callback listener (?payment=success&session_id=... / cancelled)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paymentStatus = params.get('payment')
    const sessionId = params.get('session_id')

    if (paymentStatus === 'success' && sessionId) {
      window.history.replaceState({}, document.title, window.location.pathname)

      // Verify and persist payment user data into MongoDB
      fetch(`${API_URL}/api/verify-session?session_id=${encodeURIComponent(sessionId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const amountStr = data.payment?.amount ? ` of ₹${data.payment.amount}` : ''
            if (notify) notify(`💳 Online payment${amountStr} verified! Stored in database.`)
          } else {
            if (notify) notify('Online payment successful! Your wholesale order has been confirmed.')
          }
          if (setCart) setCart({})
          fetchOrders(authUser)
        })
        .catch((err) => {
          console.warn('Payment verification error:', err)
          if (notify) notify('Online payment successful! Your wholesale order has been confirmed.')
          if (setCart) setCart({})
          fetchOrders(authUser)
        })
    } else if (paymentStatus === 'success') {
      if (notify) notify('Online payment successful! Your wholesale order has been confirmed.')
      if (setCart) setCart({})
      fetchOrders(authUser)
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (paymentStatus === 'cancelled') {
      if (notify) notify('Payment was cancelled. Your cart items are preserved.')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [notify, setCart, fetchOrders, authUser])

  async function placeOrder(customPaymentMethod = 'Pay on Drop') {
    if (!authUser || !cartProducts.length) {
      if (notify) notify('Add products to your cart before placing an order')
      return
    }

    setIsSubmittingOrder(true)
    setCheckoutError('')
    try {
      const token = await authUser.getIdToken()
      const items = cartProducts.map((product) => {
        let sName = product.shopName || product.detail
        const cat = (product.category || '').toLowerCase()
        const pName = (product.name || product.id || '').toLowerCase()
        if (!sName || sName === 'ChaiSupply Wholesale') {
          if (cat.includes('dairy') || /milk|dairy|butter|cheese|curd|ghee|paneer/.test(pName)) {
            sName = 'Fresh Farm Dairy'
          } else if (cat.includes('snack') || /biscuit|samosa|bun|rusk|khari|puff|cookie/.test(pName)) {
            sName = 'Sunrise Snacks'
          } else {
            sName = 'TeaLeaf Wholesale'
          }
        }
        return {
          id: product.id,
          name: product.name,
          quantity: cart[product.id],
          unit: product.unit || 'unit',
          price: product.price || 0,
          category: product.category || '',
          shopName: sName,
          detail: sName,
          image: product.image,
        }
      })
      const shops = Array.from(new Set(items.map((i) => i.shopName).filter(Boolean)))
      const shopName = shops[0] || 'TeaLeaf Wholesale'

      const effectivePaymentMethod =
        typeof customPaymentMethod === 'string' && customPaymentMethod.trim()
          ? customPaymentMethod.trim()
          : 'Pay on Drop'

      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shops,
          shopName,
          subtotal,
          deliveryFee: 30,
          platformFee: 12,
          total: subtotal + 42,
          paymentMethod: effectivePaymentMethod,
          paymentStatus: 'Due on Drop',
          buyer: authUser.displayName || authUser.email?.split('@')[0] || 'Tea Shop Owner',
          buyerEmail: authUser.email || '',
          userId: authUser.uid,
        }),
      })
      let result = {}
      try {
        result = await response.json()
      } catch {
        result = {}
      }
      if (!response.ok) {
        throw new Error(result.error || 'Failed to place order')
      }

      setOrders((current) => [result.order, ...current])
      if (setCart) setCart({})
      if (notify) notify('📦 Wholesale order placed! Payment is marked as Pay on Drop.')
      if (navigate) navigate('orders')
      fetchOrders(authUser)
    } catch (error) {
      console.error('Unable to place order:', error.message)
      setCheckoutError(error.message || 'Unable to place your order. Please try again.')
      if (notify) notify('Your order was not placed. Please check the message and try again.')
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  async function payWithStripe() {
    if (!authUser || !cartProducts.length) {
      if (notify) notify('Add products to your cart before proceeding to payment')
      return
    }

    setIsSubmittingOrder(true)
    setCheckoutError('')
    try {
      const buyerName =
        authUser.displayName || authUser.name || (authUser.email ? authUser.email.split('@')[0] : 'Tea Stall Owner')
      const buyerEmail = (authUser.email || '').trim()
      const userId = (authUser.uid || '').trim()
      const deliveryFee = 30
      const platformFee = 12
      const calcTotal = Number(subtotal || 0) + deliveryFee + platformFee

      const items = cartProducts.map((product) => {
        let sName = product.shopName || product.detail
        const cat = (product.category || '').toLowerCase()
        const pName = (product.name || product.id || '').toLowerCase()
        if (!sName || sName === 'ChaiSupply Wholesale') {
          if (cat.includes('dairy') || /milk|dairy|butter|cheese|curd|ghee|paneer/.test(pName)) {
            sName = 'Fresh Farm Dairy'
          } else if (cat.includes('snack') || /biscuit|samosa|bun|rusk|khari|puff|cookie/.test(pName)) {
            sName = 'Sunrise Snacks'
          } else {
            sName = 'TeaLeaf Wholesale'
          }
        }
        return {
          id: product.id,
          name: product.name,
          quantity: cart[product.id] || 1,
          unit: product.unit || 'unit',
          price: product.price || 0,
          category: product.category || '',
          shopName: sName,
          detail: sName,
          image: product.image,
        }
      })

      const shops = Array.from(new Set(items.map((i) => i.shopName).filter(Boolean)))
      const shopName = shops[0] || 'TeaLeaf Wholesale'

      const response = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: items,
          userId,
          buyerName,
          buyerEmail,
          subtotal,
          deliveryFee,
          platformFee,
          total: calcTotal,
          shopName,
          shops,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Failed to initialize payment session')
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Payment initiation error:', error.message)
      setCheckoutError(error.message || 'Payment initiation failed. Please try again.')
      if (notify) notify(error.message || 'Payment initiation failed.')
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  function openOrder(order) {
    setSelectedOrder(order)
    if (routerNavigate) {
      routerNavigate(`/buyer/orders/${encodeURIComponent(order.id)}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function handleUpdateOrderStatus(orderId, newStatus, newPaymentStatus) {
    setOrders((current) =>
      current.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            ...(newStatus ? { status: newStatus } : {}),
            ...(newPaymentStatus ? { paymentStatus: newPaymentStatus } : {}),
          }
        }
        return order
      })
    )
    if (notify) {
      if (newPaymentStatus) {
        notify(`Payment for order #${orderId} marked as ${newPaymentStatus}`)
      } else {
        notify(`Order #${orderId} marked as ${newStatus}`)
      }
    }
    try {
      const payload = {}
      if (newStatus) payload.status = newStatus
      if (newPaymentStatus) payload.paymentStatus = newPaymentStatus
      await fetch(`${API_URL}/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {
      // Local state is updated
    }
  }

  return {
    orders,
    setOrders,
    ordersError,
    setOrdersError,
    isSubmittingOrder,
    checkoutError,
    selectedOrder,
    setSelectedOrder,
    orderFilter,
    setOrderFilter,
    fetchOrders,
    placeOrder,
    payWithStripe,
    openOrder,
    handleUpdateOrderStatus,
  }
}
