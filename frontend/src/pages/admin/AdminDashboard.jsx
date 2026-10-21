import { useState, useMemo, useEffect, useCallback } from 'react'
import { PageTitle } from '../../components/PageTitle.jsx'
import { StatusBadge } from '../../components/StatusBadge.jsx'
import { Icon } from '../../components/Icon.jsx'
import { money, productImages, products as defaultProducts, DEFAULT_SHOPS } from '../../data/marketplace.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const ADMIN_DEFAULT_SHOPS = {
  // Admin 1 -> Sunrise Snacks
  'sakthivelmurugadss@gmail.com': 'Sunrise Snacks',
  'sakthivelmurugadass@gmail.com': 'Sunrise Snacks',
  'fvq8a8rlozorfjqe9mb3uzu7ijr2': 'Sunrise Snacks',

  // Admin 2 -> Fresh Farm Dairy
  'admin@gmail.com': 'Fresh Farm Dairy',
  'nvdslwfkpkd4yhgbuayom1h8d1d3': 'Fresh Farm Dairy',

  // Admin 3 -> TeaLeaf Wholesale
  'admin2@gmail.com': 'TeaLeaf Wholesale',
  'admin@chaisupply.com': 'TeaLeaf Wholesale',
  'bg7vsno7q8zgvlzy2spisdx2um02': 'TeaLeaf Wholesale',
}

export function normalizeShopName(shop) {
  if (!shop) return ''
  const s = String(shop).trim().toLowerCase().replace(/[\s\-_]+/g, '')
  if (s.includes('fresh') || s.includes('dairy') || s.includes('farm')) return 'Fresh Farm Dairy'
  if (s.includes('sunrise') || s.includes('snack')) return 'Sunrise Snacks'
  if (s.includes('tea') || s.includes('leaf') || s.includes('wholesale') || s.includes('citypack') || s.includes('pack')) return 'TeaLeaf Wholesale'
  return shop
}

export function isSameShop(a, b) {
  if (!a || !b) return false
  if (a === 'All' || b === 'All') return true
  const normA = normalizeShopName(a)
  const normB = normalizeShopName(b)
  if (normA && normB && normA.toLowerCase() === normB.toLowerCase()) return true
  const cleanA = String(a).toLowerCase().replace(/[\s\-_]+/g, '')
  const cleanB = String(b).toLowerCase().replace(/[\s\-_]+/g, '')
  return cleanA === cleanB || cleanA.includes(cleanB) || cleanB.includes(cleanA)
}

const initialUsers = [
  { id: 'user-1', name: 'Ravi Kumar', email: 'ravi@example.com', role: 'Buyer', status: 'Active' },
  { id: 'user-2', name: 'Anita Sharma', email: 'anita@example.com', role: 'Buyer', status: 'Active' },
  { id: 'user-3', name: 'Suresh Patel (Chai Stall)', email: 'suresh@example.com', role: 'Buyer', status: 'Active' },
  { id: 'user-4', name: 'Sunrise Snacks Admin (Sakthivel)', email: 'sakthivelmurugadss@gmail.com', role: 'Admin', status: 'Active' },
  { id: 'user-5', name: 'Fresh Farm Dairy Admin', email: 'admin@gmail.com', role: 'Admin', status: 'Active' },
  { id: 'user-6', name: 'TeaLeaf Wholesale Admin', email: 'admin2@gmail.com', role: 'Admin', status: 'Active' },
]

const fallbackSampleOrders = [
  {
    id: 'CS-2046',
    buyer: 'Suresh Patel (Kolkata Chai Stall)',
    buyerEmail: 'suresh@example.com',
    shopName: 'Sunrise Snacks',
    shops: ['Sunrise Snacks'],
    total: 960,
    status: 'Pending',
    date: '12 Oct 2026',
    items: [
      { id: 'biscuits', name: 'Glucose biscuits', shopName: 'Sunrise Snacks', quantity: 2, unit: 'carton', price: 480 },
    ],
  },
  {
    id: 'CS-2048',
    buyer: 'Ravi Kumar (Sharma Special Chai)',
    buyerEmail: 'ravi@example.com',
    shopName: 'Fresh Farm Dairy',
    shops: ['Fresh Farm Dairy'],
    total: 1740,
    status: 'Processing',
    date: 'Today, 5:30 AM',
    items: [
      { id: 'milk', name: 'Fresh dairy milk', shopName: 'Fresh Farm Dairy', quantity: 30, unit: 'litre', price: 58 },
    ],
  },
  {
    id: 'CS-2047',
    buyer: 'Anita Sharma (Chai Point Corner)',
    buyerEmail: 'anita@example.com',
    shopName: 'TeaLeaf Wholesale',
    shops: ['TeaLeaf Wholesale'],
    total: 2100,
    status: 'Delivered',
    date: 'Yesterday',
    items: [
      { id: 'tea', name: 'Premium Assam tea powder', shopName: 'TeaLeaf Wholesale', quantity: 5, unit: 'kg', price: 420 },
    ],
  },
]

const adminSections = {
  adminDashboard: 'Overview',
  adminProducts: 'Products',
  adminOrders: 'Orders',
  adminPayments: 'All Payments',
  adminUsers: 'Users',
}

export function AdminDashboard({
  page = 'adminDashboard',
  notify,
  orders: buyerOrders = [],
  products: marketProducts = defaultProducts,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onRefreshOrders,
  navigate,
  authUser,
}) {
  const [users, setUsers] = useState(initialUsers)
  const [localProductStatus, setLocalProductStatus] = useState(() =>
    Object.fromEntries(marketProducts.map((product) => [product.id, product.stock === 'Out of stock' ? 'Out of stock' : 'Available'])),
  )
  const [localOrders, setLocalOrders] = useState([])
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [activeOrderDetails, setActiveOrderDetails] = useState(null)
  const [productCategoryFilter, setProductCategoryFilter] = useState('All')
  const [orderStatusFilter, setOrderStatusFilter] = useState('All')

  // Payments State (Stripe & Pay on Drop)
  const [payments, setPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentSearch, setPaymentSearch] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All')
  const [activePaymentDetails, setActivePaymentDetails] = useState(null)

  // STRICT ADMIN ASSIGNMENT: Each admin is strictly and exclusively assigned to their own store.
  const currentAdminShop = useMemo(() => {
    if (authUser?.shopName) return normalizeShopName(authUser.shopName)
    const email = (authUser?.email || '').toLowerCase().trim()
    const uid = (authUser?.uid || '').toLowerCase().trim()
    if (ADMIN_DEFAULT_SHOPS[email]) return ADMIN_DEFAULT_SHOPS[email]
    if (ADMIN_DEFAULT_SHOPS[uid]) return ADMIN_DEFAULT_SHOPS[uid]
    if (email.includes('dairy') || email.includes('farm')) return 'Fresh Farm Dairy'
    if (email.includes('snack') || email.includes('sakthi')) return 'Sunrise Snacks'
    if (email.includes('tea') || email.includes('leaf') || email.includes('wholesale')) return 'TeaLeaf Wholesale'
    return 'Sunrise Snacks'
  }, [authUser])

  // Add Product form state
  const [newProductName, setNewProductName] = useState('')
  const [newProductCategory, setNewProductCategory] = useState(
    currentAdminShop === 'Fresh Farm Dairy'
      ? 'Milk & dairy'
      : currentAdminShop === 'Sunrise Snacks'
      ? 'Snacks'
      : 'Tea ingredients'
  )
  const [newProductPrice, setNewProductPrice] = useState('')
  const [newProductUnit, setNewProductUnit] = useState(currentAdminShop === 'Fresh Farm Dairy' ? 'litre' : 'kg')
  const [newProductMin, setNewProductMin] = useState(currentAdminShop === 'Fresh Farm Dairy' ? '10 L' : '1 kg')
  const [newProductStock, setNewProductStock] = useState('In stock')
  const [newProductTag, setNewProductTag] = useState('Fresh arrival')
  const [newProductDescription, setNewProductDescription] = useState('')
  const [newProductImage, setNewProductImage] = useState('')
  const [newProductImageMode, setNewProductImageMode] = useState('upload')

  // Edit Product form state
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState('Tea ingredients')
  const [editPrice, setEditPrice] = useState('')
  const [editUnit, setEditUnit] = useState('kg')
  const [editMin, setEditMin] = useState('1 kg')
  const [editStock, setEditStock] = useState('In stock')
  const [editAvailability, setEditAvailability] = useState('Available')
  const [editTag, setEditTag] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editImage, setEditImage] = useState('')
  const [editImageMode, setEditImageMode] = useState('upload')

  function handleImageFile(file, setter) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      if (notify) notify('Please upload a valid image file (PNG, JPG, WEBP).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      if (notify) notify('Image file must be under 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setter(event.target.result)
      if (notify) notify('Product image attached!')
    }
    reader.readAsDataURL(file)
  }

  const section = adminSections[page] || 'Overview'

  // Combine real buyer orders with sample orders, preserving exact item shops
  const allOrders = useMemo(() => {
    const live = buyerOrders.map((bo) => {
      const local = localOrders.find((lo) => lo.id === bo.id)
      const primaryShop = bo.shopName || bo.items?.[0]?.shopName || 'TeaLeaf Wholesale'
      const orderShops = Array.isArray(bo.shops) && bo.shops.length
        ? bo.shops
        : Array.isArray(bo.items)
        ? [...new Set(bo.items.map((i) => i.shopName || i.detail).filter(Boolean))]
        : [primaryShop]

      const items = Array.isArray(bo.items)
        ? bo.items.map((i) => {
            const detectedShop = normalizeShopName(i.shopName || i.detail) || primaryShop
            return {
              ...i,
              shopName: detectedShop,
              detail: detectedShop,
            }
          })
        : []

      return {
        id: bo.id,
        buyer: bo.buyer || 'Ravi Kumar (Tea Shop)',
        buyerEmail: bo.buyerEmail || 'ravi@example.com',
        shopName: primaryShop,
        shops: orderShops.length ? orderShops : [primaryShop],
        total: typeof bo.total === 'number' ? bo.total : 0,
        subtotal: typeof bo.subtotal === 'number' ? bo.subtotal : 0,
        status: local?.status || bo.status || 'Pending',
        paymentStatus: bo.paymentStatus || 'Pending',
        paymentMethod: bo.paymentMethod || 'Cash on Delivery',
        stripeSessionId: bo.stripeSessionId || '',
        stripePaymentIntentId: bo.stripePaymentIntentId || '',
        paymentId: bo.paymentId || '',
        date: bo.date || 'Recent',
        items,
        isLiveBuyerOrder: true,
      }
    })

    const sample = fallbackSampleOrders
      .filter((so) => !live.some((lo) => lo.id === so.id))
      .map((so) => {
        const local = localOrders.find((lo) => lo.id === so.id)
        return {
          ...so,
          status: local?.status || so.status,
          isLiveBuyerOrder: false,
        }
      })

    return [...live, ...sample]
  }, [buyerOrders, localOrders])

  // STRICT SHOP ISOLATION & PRODUCT FILTERING:
  // 1. Admin ONLY sees orders containing products from their shop.
  // 2. In each order, admin ONLY sees the products ordered from their shop and the amount for their products!
  const visibleOrders = useMemo(() => {
    return allOrders
      .map((order) => {
        // Filter items belonging ONLY to this admin's shop
        const myItems = (order.items || []).filter((item) => {
          const itemShop = normalizeShopName(item.shopName || item.detail)
          if (isSameShop(itemShop, currentAdminShop)) return true
          // Fallback category matching
          if (currentAdminShop === 'Fresh Farm Dairy') {
            if (item.category === 'Milk & dairy') return true
            if (/milk|butter|cheese|curd|ghee|paneer|dairy/i.test(item.name || item.id)) return true
          }
          if (currentAdminShop === 'Sunrise Snacks') {
            if (item.category === 'Snacks') return true
            if (/biscuit|samosa|bun|rusk|khari|puff/i.test(item.name || item.id)) return true
          }
          if (currentAdminShop === 'TeaLeaf Wholesale') {
            if (item.category === 'Tea ingredients' || item.category === 'Packaging' || item.category === 'Cleaning & hygiene') return true
            if (/tea|sugar|spice|cardamom|clove|cinnamon|ginger|cup|spoon|straw|disinfectant/i.test(item.name || item.id)) return true
          }
          return false
        })

        // If the order has NO items for this admin's shop, do not show it to this admin!
        if (myItems.length === 0) return null

        // Calculate total and subtotal ONLY for this admin's products
        const mySubtotal = myItems.reduce(
          (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
          0
        )

        return {
          ...order,
          shopName: currentAdminShop,
          shops: [currentAdminShop],
          items: myItems,
          subtotal: mySubtotal,
          total: mySubtotal,
          fullOrderTotal: order.total,
        }
      })
      .filter(Boolean)
  }, [allOrders, currentAdminShop])

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'All') return visibleOrders
    return visibleOrders.filter((order) => order.status.toLowerCase() === orderStatusFilter.toLowerCase())
  }, [visibleOrders, orderStatusFilter])

  // Admin catalogue: only shows products belonging to this admin's shop
  const filteredProducts = useMemo(() => {
    return marketProducts.filter((product) => {
      const prodShop = product.shopName || product.detail || ''
      const matchesShop = isSameShop(prodShop, currentAdminShop)
      const matchesCategory = productCategoryFilter === 'All' || product.category === productCategoryFilter
      return matchesShop && matchesCategory
    })
  }, [marketProducts, currentAdminShop, productCategoryFilter])

  // Fetch Stripe Payments from MongoDB
  const fetchPayments = useCallback(async () => {
    try {
      setPaymentsLoading(true)
      const queryParam = currentAdminShop ? `?shop=${encodeURIComponent(currentAdminShop)}` : ''
      const res = await fetch(`${API_URL}/api/payments${queryParam}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.payments)) {
        setPayments(data.payments)
      }
    } catch (err) {
      console.warn('Failed to load payments from database:', err)
    } finally {
      setPaymentsLoading(false)
    }
  }, [currentAdminShop])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const stripePayments = useMemo(() => {
    return payments.filter((p) => p.isStripe || String(p.paymentMethod || '').toLowerCase().includes('stripe'))
  }, [payments])

  const podPayments = useMemo(() => {
    return payments.filter((p) => !p.isStripe && !String(p.paymentMethod || '').toLowerCase().includes('stripe'))
  }, [payments])

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const isStripe = p.isStripe || String(p.paymentMethod || '').toLowerCase().includes('stripe')
      const matchesMethod =
        paymentMethodFilter === 'All' ||
        (paymentMethodFilter === 'stripe' && isStripe) ||
        (paymentMethodFilter === 'pod' && !isStripe)

      const matchesStatus =
        paymentStatusFilter === 'All' ||
        (paymentStatusFilter === 'succeeded' && p.status === 'succeeded') ||
        (paymentStatusFilter === 'pending' && (p.status === 'pending' || p.status === 'initiated')) ||
        (p.status && p.status.toLowerCase() === paymentStatusFilter.toLowerCase())

      const s = paymentSearch.trim().toLowerCase()
      if (!s) return matchesMethod && matchesStatus

      const matchesSearch =
        (p.paymentId || '').toLowerCase().includes(s) ||
        (p.stripeSessionId || '').toLowerCase().includes(s) ||
        (p.stripePaymentIntentId || '').toLowerCase().includes(s) ||
        (p.orderId || '').toLowerCase().includes(s) ||
        (p.buyerName || '').toLowerCase().includes(s) ||
        (p.buyerEmail || '').toLowerCase().includes(s) ||
        (p.userId || '').toLowerCase().includes(s) ||
        (p.paymentMethod || '').toLowerCase().includes(s)

      return matchesMethod && matchesStatus && matchesSearch
    })
  }, [payments, paymentMethodFilter, paymentStatusFilter, paymentSearch])

  const totalStripeRevenue = useMemo(() => {
    return stripePayments
      .filter((p) => p.status === 'succeeded')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  }, [stripePayments])

  const podCollectedRevenue = useMemo(() => {
    return podPayments
      .filter((p) => p.status === 'succeeded')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  }, [podPayments])

  const podPendingRevenue = useMemo(() => {
    return podPayments
      .filter((p) => p.status !== 'succeeded')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  }, [podPayments])

  const totalCollectedRevenue = useMemo(() => {
    return totalStripeRevenue + podCollectedRevenue
  }, [totalStripeRevenue, podCollectedRevenue])

  const succeededPaymentsCount = useMemo(() => {
    return payments.filter((p) => p.status === 'succeeded').length
  }, [payments])

  const uniquePayingUsersCount = useMemo(() => {
    const userEmails = payments
      .map((p) => p.buyerEmail || p.userId)
      .filter(Boolean)
    return new Set(userEmails).size
  }, [payments])

  async function handleMarkPaymentCollected(paymentRecord) {
    try {
      const id = paymentRecord.paymentId || paymentRecord.id || paymentRecord.orderId
      const res = await fetch(`${API_URL}/api/payments/${encodeURIComponent(id)}/collect`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (res.ok && data.success) {
        if (notify) notify(`✓ Cash payment collected for order #${paymentRecord.orderId || id}!`)
        fetchPayments()
        if (onRefreshOrders) onRefreshOrders()
        if (activePaymentDetails && (activePaymentDetails.id === id || activePaymentDetails.paymentId === id)) {
          setActivePaymentDetails((prev) => (prev ? { ...prev, status: 'succeeded' } : null))
        }
      } else {
        throw new Error(data.error || 'Failed to update payment status')
      }
    } catch (err) {
      if (notify) notify(`Could not update payment: ${err.message}`)
    }
  }

  function handleMarkOrderCashCollected(orderId) {
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(orderId, undefined, 'Paid')
    }
    fetch(`${API_URL}/api/payments/${encodeURIComponent(orderId)}/collect`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(() => {
        fetchPayments()
        if (onRefreshOrders) onRefreshOrders()
      })
      .catch(() => {})
    if (notify) notify(`✓ Cash collected for order #${orderId}!`)
  }

  function toggleUserStatus(userId) {
    setUsers((currentUsers) =>
      currentUsers.map((user) => {
        if (user.id !== userId) return user
        const status = user.status === 'Active' ? 'Suspended' : 'Active'
        if (notify) notify(`${user.name} is now ${status.toLowerCase()}`)
        return { ...user, status }
      }),
    )
  }

  function toggleProductAvailability(id, name) {
    const current = localProductStatus[id] || 'Available'
    const newStatus = current === 'Available' ? 'Out of stock' : 'Available'
    setLocalProductStatus((prev) => ({ ...prev, [id]: newStatus }))
    if (onEditProduct) {
      onEditProduct({ id, stock: newStatus === 'Available' ? 'In stock' : 'Out of stock' })
    }
    if (notify) notify(`${name} marked as ${newStatus.toLowerCase()}`)
  }

  function updateStatus(orderId, newStatus) {
    setLocalOrders((prev) => {
      const filtered = prev.filter((o) => o.id !== orderId)
      return [...filtered, { id: orderId, status: newStatus }]
    })
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(orderId, newStatus)
    }
    if (activeOrderDetails && activeOrderDetails.id === orderId) {
      setActiveOrderDetails((prev) => (prev ? { ...prev, status: newStatus } : null))
    }
    if (notify) {
      notify(`Order #${orderId} marked as ${newStatus}`)
    }
  }

  function handleCreateProduct(e) {
    e.preventDefault()
    if (!newProductName.trim() || !newProductPrice) {
      if (notify) notify('Please enter a product name and price.')
      return
    }

    const defaultEmoji =
      newProductCategory === 'Milk & dairy'
        ? '🥛'
        : newProductCategory === 'Snacks'
        ? '🍪'
        : newProductCategory === 'Packaging'
        ? '🥤'
        : '🍃'

    const assignedShop = currentAdminShop

    const createdProduct = {
      id: `prod-${Date.now()}`,
      name: newProductName.trim(),
      shopName: assignedShop,
      detail: assignedShop,
      category: newProductCategory,
      price: Number(newProductPrice) || 0,
      unit: newProductUnit,
      min: newProductMin || `1 ${newProductUnit}`,
      tag: newProductTag || 'Fresh arrival',
      stock: newProductStock,
      tint: 'peach',
      image: newProductImage.trim() || defaultEmoji,
      description: newProductDescription.trim() || 'Wholesale marketplace supply product ready for immediate order.',
    }

    if (onAddProduct) {
      onAddProduct(createdProduct)
    }
    setLocalProductStatus((prev) => ({ ...prev, [createdProduct.id]: 'Available' }))

    // Reset form
    setNewProductName('')
    setNewProductPrice('')
    setNewProductDescription('')
    setNewProductImage('')
    setIsAddingProduct(false)

    if (notify) notify(`"${createdProduct.name}" added to ${assignedShop}!`)
  }

  function openEditModal(product) {
    setEditingProduct(product)
    setEditName(product.name || '')
    setEditCategory(product.category || 'Tea ingredients')
    setEditPrice(product.price ? String(product.price) : '')
    setEditUnit(product.unit || 'kg')
    setEditMin(product.min || '1 kg')
    setEditStock(product.stock || 'In stock')
    setEditAvailability(localProductStatus[product.id] || 'Available')
    setEditTag(product.tag || '')
    setEditDescription(product.description || '')
    setEditImage(product.image || '')
    setEditImageMode(
      product.image && (product.image.startsWith('http') || product.image.startsWith('/')) ? 'url' : 'upload'
    )
  }

  function handleSaveEdit(e) {
    e.preventDefault()
    if (!editingProduct) return

    const updatedShop = currentAdminShop

    const updated = {
      ...editingProduct,
      name: editName.trim() || editingProduct.name,
      category: editCategory,
      shopName: updatedShop,
      detail: updatedShop,
      price: Number(editPrice) || editingProduct.price,
      unit: editUnit || editingProduct.unit,
      min: editMin || editingProduct.min,
      stock: editAvailability === 'Out of stock' ? 'Out of stock' : editStock,
      tag: editTag,
      description: editDescription,
      image: editImage.trim() || editingProduct.image || '📦',
    }

    if (onEditProduct) {
      onEditProduct(updated)
    }
    setLocalProductStatus((prev) => ({ ...prev, [updated.id]: editAvailability }))
    setEditingProduct(null)
    if (notify) notify(`"${updated.name}" updated successfully!`)
  }

  function handleDelete(product) {
    if (window.confirm(`Are you sure you want to remove "${product.name}" from the catalogue?`)) {
      if (onDeleteProduct) {
        onDeleteProduct(product.id)
      }
      if (notify) notify(`"${product.name}" deleted from marketplace.`)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <PageTitle
          eyebrow="MARKETPLACE ADMINISTRATION"
          title={section}
          text="Manage products, set prices and stock, inspect buyer orders, and control statuses."
        />
        <div className="flex items-center gap-2">
          {onRefreshOrders && (
            <button
              onClick={() => {
                onRefreshOrders()
                if (notify) notify('Refreshing orders from server...')
              }}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-[#d8c3af] bg-[#faf5ef] px-3.5 text-[10px] font-bold text-[#6f3e25] shadow-xs transition-colors hover:bg-[#f2e7db]"
              type="button"
            >
              ↻ Refresh Orders
            </button>
          )}
          {page === 'adminProducts' && (
            <button
              onClick={() => setIsAddingProduct(true)}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-[#6f3e25] px-3.5 text-[10px] font-bold text-white shadow-sm transition-colors hover:bg-[#522d19]"
              type="button"
            >
              + Add new product
            </button>
          )}
          {page === 'adminOrders' && (
            <button
              onClick={() => {
                const pending = visibleOrders.filter((o) => o.status === 'Pending' || o.status === 'Processing')
                pending.forEach((o) => updateStatus(o.id, 'Accepted'))
                if (notify && pending.length) notify(`Accepted ${pending.length} pending orders for ${currentAdminShop}!`)
              }}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-[#39734f] px-3.5 text-[10px] font-bold text-white shadow-sm transition-colors hover:bg-[#2c593d]"
              type="button"
            >
              ✓ Accept pending orders ({visibleOrders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length})
            </button>
          )}
        </div>
      </div>

      {/* Store Portal Banner & Isolation Selector */}
      <section className="mb-5 rounded-xl border border-[#d8c3af] bg-gradient-to-r from-[#fcf7f1] via-[#fffdfb] to-[#f6ede3] p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#6f3e25] text-xl shadow-xs text-white">
              🏪
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9e642e]">
                  Store Admin Portal
                </span>
                <span className="rounded-full bg-[#eee4d8] px-2 py-0.5 text-[9px] font-bold text-[#5c4a3e]">
                  {authUser?.email || 'Logged in Admin'}
                </span>
                <span className="rounded-full bg-[#e7f3ea] px-2 py-0.5 text-[9px] font-bold text-[#2d6840]">
                  ● Orders Isolated
                </span>
              </div>
              <h2 className="font-serif text-[18px] font-bold text-[#3c2718]">
                {currentAdminShop}
              </h2>
              <p className="text-[10px] text-[#7a6f65]">
                Strict Store Admin Isolation: You are managing <strong>{currentAdminShop}</strong>. Only orders containing your store's products are visible, and you can only see the items ordered from your store. Access to other stores' orders is strictly prohibited.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-[#c8b6a3] bg-white px-3 py-1.5 shadow-xs">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase tracking-wider text-[#9e642e]">Assigned Store Portal</span>
                <span className="text-[11px] font-extrabold text-[#3c2718]">🏪 {currentAdminShop}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add Product Modal */}
      {isAddingProduct && (
        <section className="mb-6 rounded-xl border border-[#e8ded2] bg-[#fffaf5] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-[#eee4da] pb-3">
            <div>
              <h2 className="font-serif text-[18px] font-bold text-[#432d1f]">Add Product to Marketplace</h2>
              <p className="text-[10px] text-[#81776e]">
                New products appear immediately in the buyer catalogue under their designated shop.
              </p>
            </div>
            <button
              onClick={() => setIsAddingProduct(false)}
              className="rounded-md border border-[#e8ded2] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#6f3e25] hover:bg-[#fbf4ee]"
              type="button"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateProduct} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Product name *</label>
              <input
                type="text"
                required
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="e.g. Cardamom Tea Premix"
                className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Category *</label>
              <select
                value={newProductCategory}
                onChange={(e) => setNewProductCategory(e.target.value)}
                className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
              >
                <option value="Tea ingredients">Tea ingredients</option>
                <option value="Milk & dairy">Milk & dairy</option>
                <option value="Snacks">Snacks</option>
                <option value="Packaging">Packaging</option>
                <option value="Cleaning & hygiene">Cleaning & hygiene</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Shop / Vendor</label>
              <input
                type="text"
                readOnly
                value={currentAdminShop}
                className="w-full rounded-md border border-[#e8ded2] bg-[#fbf5ee] px-3 py-2 text-[11px] font-semibold text-[#6f3e25] outline-none cursor-not-allowed"
              />
              <span className="text-[8px] text-[#81776e]">Fixed to your assigned store</span>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Price (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                placeholder="e.g. 350"
                className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Selling Unit</label>
              <input
                type="text"
                value={newProductUnit}
                onChange={(e) => setNewProductUnit(e.target.value)}
                placeholder="e.g. kg, litre, carton, 100 pcs"
                className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Minimum Order (MOQ)</label>
              <input
                type="text"
                value={newProductMin}
                onChange={(e) => setNewProductMin(e.target.value)}
                placeholder="e.g. 2 kg, 10 L, 1 carton"
                className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Stock status</label>
              <select
                value={newProductStock}
                onChange={(e) => setNewProductStock(e.target.value)}
                className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
              >
                <option value="In stock">In stock</option>
                <option value="Low stock">Low stock</option>
                <option value="Out of stock">Out of stock</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Product description</label>
              <input
                type="text"
                value={newProductDescription}
                onChange={(e) => setNewProductDescription(e.target.value)}
                placeholder="Brief description of the product quality and packaging"
                className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Badge / Tag</label>
              <input
                type="text"
                value={newProductTag}
                onChange={(e) => setNewProductTag(e.target.value)}
                placeholder="e.g. Fresh stock, Popular choice"
                className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
              />
            </div>

            {/* Product Image Input Feature */}
            <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-[#eee4da] bg-white p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <label className="text-[11px] font-bold text-[#4e3a2d] flex items-center gap-1.5">
                    <span>Product Image</span>
                    <span className="text-[9px] font-normal text-[#8a7f75]">(Upload file, paste image URL, or pick icon)</span>
                  </label>
                </div>
                <div className="flex rounded-md bg-[#f7f2eb] p-0.5 text-[9px] font-bold">
                  <button
                    type="button"
                    onClick={() => setNewProductImageMode('upload')}
                    className={`px-3 py-1 rounded transition-colors ${
                      newProductImageMode === 'upload'
                        ? 'bg-white text-[#6f3e25] shadow-xs'
                        : 'text-[#85796f] hover:text-[#432d1f]'
                    }`}
                  >
                    📁 Upload photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProductImageMode('url')}
                    className={`px-3 py-1 rounded transition-colors ${
                      newProductImageMode === 'url'
                        ? 'bg-white text-[#6f3e25] shadow-xs'
                        : 'text-[#85796f] hover:text-[#432d1f]'
                    }`}
                  >
                    🔗 Image URL
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Live Image Preview */}
                <div className="size-20 shrink-0 rounded-lg border-2 border-dashed border-[#dfd5ca] bg-[#fdfcfb] flex items-center justify-center overflow-hidden relative shadow-inner">
                  {newProductImage ? (
                    newProductImage.startsWith('http') || newProductImage.startsWith('data:') || newProductImage.startsWith('/') ? (
                      <img
                        src={newProductImage}
                        alt="Preview"
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = '<span class="text-xs text-red-500 font-semibold p-1 text-center">Invalid image URL</span>'
                        }}
                      />
                    ) : (
                      <span className="text-3xl drop-shadow-sm">{newProductImage}</span>
                    )
                  ) : (
                    <div className="text-center p-2 text-[#a89b8f]">
                      <span className="text-2xl block leading-none">📷</span>
                      <span className="text-[8px] font-semibold block mt-1">Preview</span>
                    </div>
                  )}
                </div>

                {/* Input Controls */}
                <div className="flex-1 w-full space-y-2.5">
                  {newProductImageMode === 'upload' ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFile(e.target.files?.[0], setNewProductImage)}
                        id="new-product-file"
                        className="hidden"
                      />
                      <label
                        htmlFor="new-product-file"
                        className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#cfaa89] bg-[#fffaf5] px-3.5 py-1.5 text-[10px] font-bold text-[#6f3e25] hover:bg-[#faefe3] transition"
                      >
                        <span>📁 Choose file from computer</span>
                      </label>
                      <span className="text-[9px] text-[#8a7f75] ml-2.5">PNG, JPG, WEBP (under 5MB)</span>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        value={newProductImage}
                        onChange={(e) => setNewProductImage(e.target.value)}
                        placeholder="https://images.unsplash.com/... or https://domain.com/photo.jpg"
                        className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
                      />
                      <span className="text-[8px] text-[#8a7f75] mt-1 block">Paste any direct public image URL</span>
                    </div>
                  )}

                  {/* Preset Quick Select Icons */}
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    <span className="text-[8px] font-bold text-[#7f7367]">Or quick icons:</span>
                    {['🍃', '🥛', '🍪', '🥤', '☕', '🫚', '📦', '🍯', '🧈', '🧼', '🍋', '🍵'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewProductImage(emoji)}
                        className={`size-6 rounded border text-[13px] flex items-center justify-center transition cursor-pointer ${
                          newProductImage === emoji
                            ? 'bg-[#faefe3] border-[#6f3e25] shadow-xs'
                            : 'bg-white border-[#e8ded2] hover:bg-[#fbf4ee]'
                        }`}
                        title={`Select ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                    {newProductImage && (
                      <button
                        type="button"
                        onClick={() => setNewProductImage('')}
                        className="ml-auto text-[9px] font-bold text-red-600 hover:underline"
                      >
                        ✕ Remove image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 md:col-span-2 lg:col-span-3">
              <button
                type="submit"
                className="inline-flex min-h-[38px] items-center gap-2 rounded-md bg-[#6f3e25] px-5 text-[11px] font-bold text-white shadow-sm hover:bg-[#522d19]"
              >
                Publish product to marketplace
              </button>
              <button
                type="button"
                onClick={() => setIsAddingProduct(false)}
                className="text-[11px] font-semibold text-[#82776d] hover:text-[#4e3a2d]"
              >
                Discard
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#e8ded2] bg-[#fffcf9] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#eee4da] pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#9e642e]">EDIT PRODUCT</span>
                <h2 className="font-serif text-[20px] font-bold text-[#432d1f]">{editingProduct.name}</h2>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="rounded-md border border-[#e8ded2] bg-white px-2.5 py-1 text-[11px] font-bold text-[#6f3e25] hover:bg-[#fbf4ee]"
                type="button"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Product name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Category *</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
                >
                  <option value="Tea ingredients">Tea ingredients</option>
                  <option value="Milk & dairy">Milk & dairy</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Cleaning & hygiene">Cleaning & hygiene</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Shop / Vendor</label>
                <input
                  type="text"
                  readOnly
                  value={currentAdminShop}
                  className="w-full rounded-md border border-[#e8ded2] bg-[#fbf5ee] px-3 py-2 text-[11px] font-semibold text-[#6f3e25] outline-none cursor-not-allowed"
                />
                <span className="text-[8px] text-[#81776e]">Fixed to your assigned store</span>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Selling Unit</label>
                <input
                  type="text"
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Minimum Order (MOQ)</label>
                <input
                  type="text"
                  value={editMin}
                  onChange={(e) => setEditMin(e.target.value)}
                  className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Stock status</label>
                <select
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
                >
                  <option value="In stock">In stock</option>
                  <option value="Low stock">Low stock</option>
                  <option value="Out of stock">Out of stock</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Availability</label>
                <select
                  value={editAvailability}
                  onChange={(e) => setEditAvailability(e.target.value)}
                  className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
                >
                  <option value="Available">Available (Live in catalogue)</option>
                  <option value="Out of stock">Out of stock (Unavailable)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Tag / Badge</label>
                <input
                  type="text"
                  value={editTag}
                  onChange={(e) => setEditTag(e.target.value)}
                  className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-[10px] font-bold text-[#4e3a2d]">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-2 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
                />
              </div>

              {/* Edit Product Image Input */}
              <div className="sm:col-span-2 rounded-xl border border-[#eee4da] bg-white p-3.5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <label className="text-[10px] font-bold text-[#4e3a2d]">Product Image</label>
                  <div className="flex rounded-md bg-[#f7f2eb] p-0.5 text-[9px] font-bold">
                    <button
                      type="button"
                      onClick={() => setEditImageMode('upload')}
                      className={`px-2.5 py-0.5 rounded transition-colors ${
                        editImageMode === 'upload' ? 'bg-white text-[#6f3e25] shadow-xs' : 'text-[#85796f]'
                      }`}
                    >
                      📁 Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditImageMode('url')}
                      className={`px-2.5 py-0.5 rounded transition-colors ${
                        editImageMode === 'url' ? 'bg-white text-[#6f3e25] shadow-xs' : 'text-[#85796f]'
                      }`}
                    >
                      🔗 URL
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-16 shrink-0 rounded-lg border border-[#dfd5ca] bg-[#fdfcfb] flex items-center justify-center overflow-hidden">
                    {editImage ? (
                      editImage.startsWith('http') || editImage.startsWith('data:') || editImage.startsWith('/') ? (
                        <img src={editImage} alt="Preview" className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-2xl">{editImage}</span>
                      )
                    ) : (
                      <span className="text-xl text-[#a89b8f]">📷</span>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    {editImageMode === 'upload' ? (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFile(e.target.files?.[0], setEditImage)}
                          id="edit-product-file"
                          className="hidden"
                        />
                        <label
                          htmlFor="edit-product-file"
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[#cfaa89] bg-[#fffaf5] px-3 py-1 text-[10px] font-bold text-[#6f3e25] hover:bg-[#faefe3]"
                        >
                          Choose new photo
                        </label>
                      </div>
                    ) : (
                      <input
                        type="url"
                        value={editImage}
                        onChange={(e) => setEditImage(e.target.value)}
                        placeholder="https://images.unsplash.com/... or image link"
                        className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-1.5 text-[11px] text-[#252525] outline-none focus:border-[#6f3e25]"
                      />
                    )}

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['🍃', '🥛', '🍪', '🥤', '☕', '🫚', '📦', '🍯', '🧈', '🧼'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setEditImage(emoji)}
                          className="size-5 rounded border border-[#e8ded2] bg-white hover:bg-[#fbf4ee] text-[11px] flex items-center justify-center"
                        >
                          {emoji}
                        </button>
                      ))}
                      {editImage && (
                        <button
                          type="button"
                          onClick={() => setEditImage('')}
                          className="text-[9px] text-red-600 hover:underline ml-auto font-medium"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex min-h-[38px] items-center gap-2 rounded-md bg-[#6f3e25] px-5 text-[11px] font-bold text-white shadow-sm hover:bg-[#522d19]"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="text-[11px] font-semibold text-[#82776d] hover:text-[#4e3a2d]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {activeOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[#e8ded2] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eee4da] pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#9e642e]">ORDER DETAILS</span>
                <h2 className="font-serif text-[20px] font-bold text-[#432d1f]">Order #{activeOrderDetails.id}</h2>
                <p className="text-[9px] text-[#81776e]">Placed on {activeOrderDetails.date}</p>
              </div>
              <button
                onClick={() => setActiveOrderDetails(null)}
                className="rounded-md border border-[#e8ded2] bg-[#fbf6f0] px-2.5 py-1 text-[11px] font-bold text-[#6f3e25] hover:bg-[#f3eae0]"
                type="button"
              >
                ✕ Close
              </button>
            </div>

            <div className="mt-4 space-y-4 text-[11px]">
              {/* Buyer info */}
              <div className="rounded-lg border border-[#f0ebe5] bg-[#faf7f4] p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-wide text-[#7b6d61]">Buyer Details</h3>
                  <span className="rounded bg-[#f0e6dc] px-2 py-0.5 text-[8px] font-bold text-[#6f3e25]">
                    🏪 {activeOrderDetails.shopName || (activeOrderDetails.shops && activeOrderDetails.shops.join(', ')) || 'ChaiSupply Wholesale'}
                  </span>
                </div>
                <p className="font-bold text-[#3e3126]">{activeOrderDetails.buyer}</p>
                <p className="text-[10px] text-[#71655b]">Email: {activeOrderDetails.buyerEmail || 'Not specified'}</p>
                <p className="text-[10px] text-[#71655b]">Delivery: Tomorrow, 5:00 AM wholesale drop</p>
              </div>

              {/* Payment Info */}
              <div className="rounded-lg border border-[#e8ded2] bg-[#f9fbf9] p-3.5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="block text-[8px] font-bold uppercase tracking-wider text-[#7b6d61]">Payment Information</span>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {String(activeOrderDetails.paymentMethod || '').toLowerCase().includes('stripe') ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#ede9fe] border border-[#ddd6fe] px-2.5 py-0.5 text-[9px] font-bold text-[#6b21a8]">
                        💳 Online (Stripe)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] border border-[#fde68a] px-2.5 py-0.5 text-[9px] font-bold text-[#92400e]">
                        💵 Pay on Drop (Cash)
                      </span>
                    )}

                    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[8px] font-bold ${
                      activeOrderDetails.paymentStatus === 'Paid'
                        ? 'bg-[#e8f5e9] text-[#2e7d32]'
                        : 'bg-[#fff8e1] text-[#b45309]'
                    }`}>
                      {activeOrderDetails.paymentStatus === 'Paid' ? '✓ Paid / Collected' : '⏳ Pending / Due on Drop'}
                    </span>

                    {activeOrderDetails.paymentId && (
                      <span className="text-[8px] text-[#6f3e25] font-mono">Ref: {activeOrderDetails.paymentId}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!String(activeOrderDetails.paymentMethod || '').toLowerCase().includes('stripe') && activeOrderDetails.paymentStatus !== 'Paid' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleMarkOrderCashCollected(activeOrderDetails.id)
                        setActiveOrderDetails((prev) => prev ? { ...prev, paymentStatus: 'Paid' } : null)
                      }}
                      className="rounded bg-[#2e7d32] px-2.5 py-1 text-[8px] font-bold text-white hover:bg-[#1b5e20] shadow-xs"
                    >
                      ✓ Mark Cash as Collected
                    </button>
                  )}
                  {activeOrderDetails.stripeSessionId && (
                    <span className="text-[8px] text-[#8a7f75] font-mono truncate max-w-[180px]" title={activeOrderDetails.stripeSessionId}>
                      Stripe: {activeOrderDetails.stripeSessionId.slice(0, 16)}...
                    </span>
                  )}
                </div>
              </div>

              {/* Status and quick controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e8ded2] p-3.5">
                <div>
                  <span className="block text-[9px] font-semibold text-[#8a7f76]">Current Order Status</span>
                  <div className="mt-1">
                    <StatusBadge status={activeOrderDetails.status} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => updateStatus(activeOrderDetails.id, 'Accepted')}
                    className="rounded bg-[#39734f] px-2.5 py-1 text-[9px] font-bold text-white hover:bg-[#2c593d]"
                    type="button"
                  >
                    ✓ Accept
                  </button>
                  <button
                    onClick={() => updateStatus(activeOrderDetails.id, 'Processing')}
                    className="rounded bg-[#d9822b] px-2.5 py-1 text-[9px] font-bold text-white hover:bg-[#b5671a]"
                    type="button"
                  >
                    Processing
                  </button>
                  <button
                    onClick={() => updateStatus(activeOrderDetails.id, 'Shipped')}
                    className="rounded bg-[#466884] px-2.5 py-1 text-[9px] font-bold text-white hover:bg-[#345168]"
                    type="button"
                  >
                    🚚 Shipped
                  </button>
                  <button
                    onClick={() => updateStatus(activeOrderDetails.id, 'Delivered')}
                    className="rounded bg-[#39734f] px-2.5 py-1 text-[9px] font-bold text-white hover:bg-[#2c593d]"
                    type="button"
                  >
                    ✓ Delivered
                  </button>
                  <button
                    onClick={() => updateStatus(activeOrderDetails.id, 'Rejected')}
                    className="rounded bg-[#a8493f] px-2.5 py-1 text-[9px] font-bold text-white hover:bg-[#86372f]"
                    type="button"
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>

              {/* Items list */}
              <div>
                <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#7b6d61]">Order Items</h3>
                <div className="overflow-x-auto rounded-lg border border-[#e8ded2]">
                  <table className="w-full text-left text-[10px]">
                    <thead className="bg-[#fcfaf8] text-[8px] font-bold text-[#8d8277]">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2">Shop / Vendor</th>
                        <th className="px-3 py-2">Qty</th>
                        <th className="px-3 py-2">Unit Price</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f2ede8]">
                      {activeOrderDetails.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 font-medium text-[#44362b]">{item.name || item.id}</td>
                          <td className="px-3 py-2 text-[#6f3e25] font-semibold">
                            🏪 {item.shopName || item.detail || activeOrderDetails.shopName || 'Wholesale'}
                          </td>
                          <td className="px-3 py-2">{item.quantity} {item.unit || ''}</td>
                          <td className="px-3 py-2">{item.price ? money(item.price) : '—'}</td>
                          <td className="px-3 py-2 text-right font-bold text-[#44362b]">
                            {item.price ? money(item.price * item.quantity) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total breakdown */}
              <div className="rounded-lg border border-[#f0ebe5] bg-[#faf7f4] p-3 text-right">
                <p className="text-[10px] text-[#786c62]">Standard Delivery Fee: <b>₹30</b> · Platform Fee: <b>₹12</b></p>
                <p className="mt-1 font-serif text-[16px] font-bold text-[#4b3526]">
                  Total Order Amount: {money(activeOrderDetails.total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERVIEW DASHBOARD */}
      {page === 'adminDashboard' && (
        <>
          <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5" aria-label="Marketplace summary">
            <SummaryCard label="Total products" value={filteredProducts.length} note={`Catalogue items (${currentAdminShop})`} />
            <SummaryCard
              label="Pending orders"
              value={visibleOrders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length}
              note={`Awaiting fulfilment (${currentAdminShop})`}
            />
            <SummaryCard
              label="💳 Stripe Online"
              value={money(totalStripeRevenue)}
              note={`${stripePayments.filter((p) => p.status === 'succeeded').length} card payments confirmed`}
            />
            <SummaryCard
              label="💵 Pay on Drop"
              value={money(podCollectedRevenue)}
              note={`${money(podPendingRevenue)} pending collection`}
            />
            <SummaryCard
              label="Total Revenue"
              value={money(totalCollectedRevenue)}
              note={`Stripe + Cash collected (${payments.length} orders)`}
            />
          </section>

          {/* Quick Actions Panel */}
          <section className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e8ded2] bg-white p-4">
            <div>
              <h2 className="font-serif text-[16px] text-[#4b3526]">Admin Controls</h2>
              <p className="text-[10px] text-[#77716c]">
                Managing <b>{currentAdminShop}</b> inventory, receiving orders, and inspecting payments (Stripe & Pay on Drop).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate && navigate('adminPayments')}
                className="inline-flex min-h-[34px] items-center gap-1.5 rounded-md border border-[#2e7d32]/30 bg-[#eef7ee] px-3 text-[10px] font-bold text-[#2e7d32] hover:bg-[#e2f0e2]"
                type="button"
              >
                💳 All Payments ({payments.length})
              </button>
              <button
                onClick={() => setIsAddingProduct(true)}
                className="inline-flex min-h-[34px] items-center gap-1.5 rounded-md bg-[#6f3e25] px-3 text-[10px] font-bold text-white hover:bg-[#522d19]"
                type="button"
              >
                + Add new product
              </button>
              <button
                onClick={() => navigate && navigate('adminOrders')}
                className="inline-flex min-h-[34px] items-center gap-1.5 rounded-md border border-[#e8ded2] bg-[#fbf6f0] px-3 text-[10px] font-bold text-[#6f3e25] hover:bg-[#f3eae0]"
                type="button"
              >
                View incoming orders ({visibleOrders.length})
              </button>
              <button
                onClick={() => navigate && navigate('adminProducts')}
                className="inline-flex min-h-[34px] items-center gap-1.5 rounded-md border border-[#e8ded2] bg-white px-3 text-[10px] font-bold text-[#6f3e25] hover:bg-[#fbf4ee]"
                type="button"
              >
                Manage products ({marketProducts.length})
              </button>
              <button
                onClick={() => navigate && navigate('catalogue')}
                className="inline-flex min-h-[34px] items-center gap-1.5 rounded-md border border-[#e8ded2] bg-white px-3 text-[10px] font-bold text-[#6f3e25] hover:bg-[#fbf4ee]"
                type="button"
              >
                Browse Buyer View <Icon name="arrow" />
              </button>
            </div>
          </section>

          {/* Recent Orders on Overview */}
          <section className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-[17px] font-bold text-[#472b1b]">Recent Store Orders</h3>
                <p className="text-[9px] text-[#847970]">Orders containing items from <b>{currentAdminShop}</b></p>
              </div>
              <button
                onClick={() => navigate && navigate('adminOrders')}
                className="text-[10px] font-bold text-[#6f3e25] hover:underline"
                type="button"
              >
                View full orders table →
              </button>
            </div>
            <div className="grid gap-2.5">
              {visibleOrders.slice(0, 5).map((order) => {
                const isPendingOrProcessing = order.status === 'Pending' || order.status === 'Processing'
                const isAccepted = order.status === 'Accepted'
                return (
                  <article
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e8ded2] bg-white p-3.5 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <b className="text-[11px] text-[#4c3a2c]">#{order.id}</b>
                        {order.isLiveBuyerOrder && (
                          <span className="rounded bg-[#edf5ee] px-1.5 py-0.5 text-[8px] font-bold text-[#39734f]">
                            NEW BUYER ORDER
                          </span>
                        )}
                        <span className="rounded bg-[#f4ece3] px-1.5 py-0.5 text-[8px] font-bold text-[#5c3e28]">
                          🏪 {order.shopName || (order.shops && order.shops.join(', ')) || 'Wholesale'}
                        </span>
                        <span className="text-[9px] text-[#8c8177]">{order.date}</span>
                      </div>
                      <p className="my-1 text-[10px] text-[#695d52]">
                        Buyer: <b>{order.buyer}</b>
                      </p>
                      {order.items?.length > 0 && (
                        <p className="text-[9px] text-[#8a7f76]">
                          Items: {order.items.map((i) => `${i.name || i.id} × ${i.quantity}`).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end gap-1">
                        <b className="text-[12px] text-[#6f3e25]">{money(order.total)}</b>
                        {String(order.paymentMethod || '').toLowerCase().includes('stripe') ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#ede9fe] text-[#5b21b6] border border-[#ddd6fe] px-2 py-0.5 text-[7px] font-bold">
                            💳 Online (Stripe) · {order.paymentStatus === 'Paid' ? 'Paid' : 'Pending'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a] px-2 py-0.5 text-[7px] font-bold">
                            💵 Pay on Drop · {order.paymentStatus === 'Paid' ? 'Collected' : 'Due'}
                          </span>
                        )}
                      </div>
                      <StatusBadge status={order.status} />

                      {isPendingOrProcessing && (
                        <>
                          <button
                            onClick={() => updateStatus(order.id, 'Accepted')}
                            className="inline-flex items-center gap-1 rounded bg-[#39734f] px-2.5 py-1 text-[9px] font-bold text-white transition-colors hover:bg-[#2c593d]"
                            type="button"
                          >
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => updateStatus(order.id, 'Rejected')}
                            className="inline-flex items-center gap-1 rounded bg-[#a8493f] px-2 py-1 text-[9px] font-bold text-white transition-colors hover:bg-[#86372f]"
                            type="button"
                          >
                            ✕ Reject
                          </button>
                        </>
                      )}

                      {isAccepted && (
                        <button
                          onClick={() => updateStatus(order.id, 'Shipped')}
                          className="inline-flex items-center gap-1 rounded bg-[#466884] px-2.5 py-1 text-[9px] font-bold text-white transition-colors hover:bg-[#345168]"
                          type="button"
                        >
                          🚚 Mark Shipped
                        </button>
                      )}

                      {order.status === 'Shipped' && (
                        <button
                          onClick={() => updateStatus(order.id, 'Delivered')}
                          className="inline-flex items-center gap-1 rounded bg-[#39734f] px-2.5 py-1 text-[9px] font-bold text-white transition-colors hover:bg-[#2c593d]"
                          type="button"
                        >
                          ✓ Deliver
                        </button>
                      )}

                      <button
                        onClick={() => setActiveOrderDetails(order)}
                        className="rounded border border-[#e8ded2] bg-[#faf6f1] px-2 py-1 text-[9px] font-semibold text-[#6f3e25] hover:bg-[#f3eae0]"
                        type="button"
                      >
                        Details
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </>
      )}

      {/* PRODUCTS PAGE */}
      {page === 'adminProducts' && (
        <section className="overflow-hidden rounded-lg border border-[#e8ded2] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee8e2] px-4 py-3">
            <div>
              <h2 className="font-serif text-[16px] text-[#4b3526]">
                Marketplace Inventory ({filteredProducts.length} items)
              </h2>
              <p className="text-[9px] text-[#81776e]">
                Products are managed directly with dedicated shop and vendor tags.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-[#d8c7b5] bg-[#fdf8f3] px-2.5 py-1 text-[10px] font-bold text-[#6f3e25]">
                🏪 {currentAdminShop}
              </span>
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="rounded border border-[#e8ded2] bg-white px-2 py-1 text-[10px] text-[#4b3526] outline-none"
              >
                <option value="All">All categories</option>
                <option value="Milk & dairy">Milk & dairy</option>
                <option value="Tea ingredients">Tea ingredients</option>
                <option value="Snacks">Snacks</option>
                <option value="Packaging">Packaging</option>
                <option value="Cleaning & hygiene">Cleaning & hygiene</option>
              </select>
              <button
                onClick={() => setIsAddingProduct(true)}
                className="inline-flex min-h-[30px] items-center gap-1 rounded bg-[#6f3e25] px-3 text-[9px] font-bold text-white hover:bg-[#522d19]"
                type="button"
              >
                + Add new product
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[10px]">
              <thead className="bg-[#fcfaf8] text-[8px] tracking-wide text-[#918579]">
                <tr>
                  <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Product</th>
                  <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Category</th>
                  <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Shop / Vendor</th>
                  <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Price / Unit</th>
                  <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">MOQ</th>
                  <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Stock</th>
                  <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Availability</th>
                  <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child_td]:border-b-0">
                {filteredProducts.map((product) => {
                  const availability = localProductStatus[product.id] || (product.stock === 'Out of stock' ? 'Out of stock' : 'Available')
                  return (
                    <tr key={product.id}>
                      <Cell>
                        <div className="flex items-center gap-2">
                          {productImages[product.id] ||
                          (typeof product.image === 'string' &&
                            (product.image.startsWith('http://') ||
                              product.image.startsWith('https://') ||
                              product.image.startsWith('data:') ||
                              product.image.startsWith('/'))) ? (
                            <img
                              src={productImages[product.id] || product.image}
                              alt={product.name}
                              className="size-8 rounded object-contain bg-[#fbf6f0] border border-[#eee4da] p-0.5 shrink-0"
                            />
                          ) : (
                            <span className="text-[16px] size-8 grid place-items-center rounded bg-[#fbf6f0] border border-[#eee4da] shrink-0">
                              {product.image || '📦'}
                            </span>
                          )}
                          <div>
                            <b>{product.name}</b>
                            {product.tag && (
                              <span className="ml-1.5 rounded bg-[#fbf3e8] px-1 py-0.5 text-[7px] font-bold text-[#8c6230]">
                                {product.tag}
                              </span>
                            )}
                          </div>
                        </div>
                      </Cell>
                      <Cell>{product.category}</Cell>
                      <Cell>
                        <span className="rounded bg-[#fbf5ee] border border-[#e8ded2] px-2 py-0.5 text-[8px] font-bold text-[#6f3e25]">
                          🏪 {product.shopName || product.detail || 'Wholesale'}
                        </span>
                      </Cell>
                      <Cell>
                        <b>₹{Number(product.price).toLocaleString('en-IN')}</b> / {product.unit}
                      </Cell>
                      <Cell>{product.min}</Cell>
                      <Cell>
                        <span className={`font-semibold ${product.stock === 'Out of stock' ? 'text-red-600' : product.stock === 'Low stock' ? 'text-orange-600' : 'text-[#39734f]'}`}>
                          ● {product.stock || 'In stock'}
                        </span>
                      </Cell>
                      <Cell>
                        <span
                          className={`rounded px-2 py-0.5 text-[8px] font-bold ${
                            availability === 'Available'
                              ? 'bg-[#edf5ee] text-[#39734f]'
                              : 'bg-[#fbeeed] text-[#a8493f]'
                          }`}
                        >
                          {availability}
                        </span>
                      </Cell>
                      <Cell>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(product)}
                            className="rounded border border-[#e8ded2] bg-white px-2 py-1 text-[9px] font-bold text-[#6f3e25] hover:bg-[#fbf4ee]"
                            type="button"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleProductAvailability(product.id, product.name)}
                            className="rounded border border-[#e8ded2] bg-white px-2 py-1 text-[8px] font-semibold text-[#665a50] hover:bg-[#f5ede5]"
                            type="button"
                          >
                            {availability === 'Available' ? 'Make Out of Stock' : 'Make Available'}
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[9px] font-bold text-red-700 hover:bg-red-100"
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </Cell>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ORDERS PAGE */}
      {page === 'adminOrders' && (
        <section className="overflow-hidden rounded-lg border border-[#e8ded2] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee8e2] px-4 py-3">
            <div>
              <h2 className="font-serif text-[16px] text-[#4b3526]">
                Buyer Orders ({filteredOrders.length})
              </h2>
              <p className="text-[9px] text-[#81776e]">
                Showing orders for <b>{currentAdminShop}</b>. Admin 1 orders are protected and hidden from other admins.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {['All', 'Pending', 'Processing', 'Accepted', 'Shipped', 'Delivered', 'Rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderStatusFilter(status)}
                  className={`rounded-md px-2.5 py-1 text-[9px] font-bold transition-colors ${
                    orderStatusFilter.toLowerCase() === status.toLowerCase()
                      ? 'bg-[#6f3e25] text-white'
                      : 'border border-[#e8ded2] bg-white text-[#6f3e25] hover:bg-[#fff9f3]'
                  }`}
                  type="button"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[10px]">
              <thead className="bg-[#fcfaf8] text-[8px] tracking-wide text-[#918579]">
                <tr>
                  <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Order ID</th>
                  <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Date</th>
                  <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Buyer</th>
                  <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Shop / Vendor</th>
                  <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Items Summary</th>
                  <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Total</th>
                  <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Status</th>
                  <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child_td]:border-b-0">
                {filteredOrders.map((order) => {
                  const isPendingOrProcessing = order.status === 'Pending' || order.status === 'Processing'
                  const isAccepted = order.status === 'Accepted'
                  const isShipped = order.status === 'Shipped' || order.status === 'Dispatched'

                  return (
                    <tr key={order.id}>
                      <Cell>
                        <b>#{order.id}</b>
                        {order.isLiveBuyerOrder && (
                          <span className="ml-1.5 rounded bg-[#edf5ee] px-1 py-0.5 text-[7px] font-bold text-[#39734f]">
                            NEW
                          </span>
                        )}
                      </Cell>
                      <Cell>{order.date}</Cell>
                      <Cell>
                        <b>{order.buyer}</b>
                      </Cell>
                      <Cell>
                        <span className="rounded bg-[#f4ece3] px-2 py-0.5 text-[8px] font-bold text-[#5c3e28]">
                          🏪 {order.shopName || (order.shops && order.shops.join(', ')) || 'Wholesale'}
                        </span>
                      </Cell>
                      <Cell>
                        <div className="max-w-[220px] truncate" title={order.items?.map((i) => i.name || i.id).join(', ')}>
                          {order.items?.length
                            ? order.items.map((i) => `${i.name || i.id} × ${i.quantity}`).join(', ')
                            : 'Wholesale supplies'}
                        </div>
                      </Cell>
                      <Cell>
                        <b>{money(order.total)}</b>
                        <div className="mt-1">
                          {String(order.paymentMethod || '').toLowerCase().includes('stripe') ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 rounded bg-[#ede9fe] text-[#5b21b6] px-1.5 py-0.5 text-[7px] font-bold border border-[#ddd6fe]">
                                💳 Online (Stripe)
                              </span>
                              <span className={`text-[7px] font-bold ${order.paymentStatus === 'Paid' ? 'text-[#2e7d32]' : 'text-[#b45309]'}`}>
                                {order.paymentStatus === 'Paid' ? '✓ Paid via Stripe' : '⏳ Stripe Pending'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 rounded bg-[#fef3c7] text-[#92400e] px-1.5 py-0.5 text-[7px] font-bold border border-[#fde68a]">
                                💵 Pay on Drop
                              </span>
                              <span className={`text-[7px] font-bold ${order.paymentStatus === 'Paid' ? 'text-[#2e7d32]' : 'text-[#b45309]'}`}>
                                {order.paymentStatus === 'Paid' ? '✓ Cash Collected' : '⏳ Due on Drop'}
                              </span>
                            </div>
                          )}
                        </div>
                      </Cell>
                      <Cell>
                        <StatusBadge status={order.status} />
                      </Cell>
                      <Cell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isPendingOrProcessing && (
                            <>
                              <button
                                onClick={() => updateStatus(order.id, 'Accepted')}
                                className="rounded bg-[#39734f] px-2 py-1 text-[8px] font-bold text-white transition-colors hover:bg-[#2c593d]"
                                type="button"
                              >
                                ✓ Accept
                              </button>
                              <button
                                onClick={() => updateStatus(order.id, 'Rejected')}
                                className="rounded bg-[#a8493f] px-2 py-1 text-[8px] font-bold text-white transition-colors hover:bg-[#86372f]"
                                type="button"
                              >
                                ✕ Reject
                              </button>
                            </>
                          )}
                          {isAccepted && (
                            <button
                              onClick={() => updateStatus(order.id, 'Shipped')}
                              className="rounded bg-[#466884] px-2 py-1 text-[8px] font-bold text-white transition-colors hover:bg-[#345168]"
                              type="button"
                            >
                              🚚 Mark Shipped
                            </button>
                          )}
                          {isShipped && (
                            <button
                              onClick={() => updateStatus(order.id, 'Delivered')}
                              className="rounded bg-[#39734f] px-2 py-1 text-[8px] font-bold text-white transition-colors hover:bg-[#2c593d]"
                              type="button"
                            >
                              ✓ Delivered
                            </button>
                          )}

                          {!String(order.paymentMethod || '').toLowerCase().includes('stripe') && order.paymentStatus !== 'Paid' && (
                            <button
                              onClick={() => handleMarkOrderCashCollected(order.id)}
                              className="rounded bg-[#2e7d32] px-2 py-1 text-[8px] font-bold text-white transition-colors hover:bg-[#1b5e20] shadow-2xs"
                              title="Mark cash payment as received"
                              type="button"
                            >
                              💵 Collect Cash
                            </button>
                          )}

                          <button
                            onClick={() => setActiveOrderDetails(order)}
                            className="rounded border border-[#e8ded2] bg-[#fbf6f0] px-2 py-1 text-[8px] font-semibold text-[#6f3e25] hover:bg-[#f3eae0]"
                            type="button"
                          >
                            Details
                          </button>
                        </div>
                      </Cell>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* STRIPE PAYMENTS PAGE */}
      {page === 'adminPayments' && (
        <section className="space-y-4">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryCard
              label="Total Revenue"
              value={money(totalCollectedRevenue)}
              note={`Stripe + Cash collected (${currentAdminShop})`}
            />
            <SummaryCard
              label="💳 Stripe Online Revenue"
              value={money(totalStripeRevenue)}
              note={`${stripePayments.filter((p) => p.status === 'succeeded').length} confirmed online card payments`}
            />
            <SummaryCard
              label="💵 Pay on Drop (Collected)"
              value={money(podCollectedRevenue)}
              note={`${podPayments.filter((p) => p.status === 'succeeded').length} cash deliveries collected`}
            />
            <SummaryCard
              label="⏳ Pay on Drop (Due)"
              value={money(podPendingRevenue)}
              note={`${podPayments.filter((p) => p.status !== 'succeeded').length} cash drops awaiting collection`}
            />
          </div>

          {/* Table Container */}
          <div className="overflow-hidden rounded-lg border border-[#e8ded2] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee8e2] px-4 py-3">
              <div>
                <h2 className="font-serif text-[16px] text-[#4b3526]">
                  All Payments & Settlements Database ({filteredPayments.length})
                </h2>
                <p className="text-[9px] text-[#81776e]">
                  Secure database records for both <b>Online Stripe Payments</b> and <b>Pay on Drop Cash Collections</b> for <b>{currentAdminShop}</b>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    fetchPayments()
                    if (notify) notify('Refreshing payments from MongoDB...')
                  }}
                  className="inline-flex min-h-[30px] items-center gap-1 rounded-md border border-[#d8c3af] bg-[#faf5ef] px-2.5 text-[9px] font-bold text-[#6f3e25] hover:bg-[#f2e7db]"
                >
                  ↻ {paymentsLoading ? 'Refreshing...' : 'Refresh MongoDB'}
                </button>
              </div>
            </div>

            {/* Filter Toolbar: Method & Status */}
            <div className="border-b border-[#eee8e2] bg-[#fcfaf8] p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Method Filter */}
                <div className="flex items-center gap-1 border-r border-[#e8ded2] pr-2">
                  <span className="text-[8px] font-bold text-[#81776e] uppercase">Method:</span>
                  {[
                    { id: 'All', label: `All (${payments.length})` },
                    { id: 'stripe', label: `💳 Online Stripe (${stripePayments.length})` },
                    { id: 'pod', label: `💵 Pay on Drop (${podPayments.length})` },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethodFilter(m.id)}
                      className={`rounded px-2.5 py-1 text-[8px] font-bold transition ${
                        paymentMethodFilter === m.id
                          ? 'bg-[#5c371f] text-white shadow-xs'
                          : 'border border-[#e8ded2] bg-white text-[#6f3e25] hover:bg-[#fcf7f1]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1">
                  <span className="text-[8px] font-bold text-[#81776e] uppercase">Status:</span>
                  {[
                    { id: 'All', label: 'All' },
                    { id: 'succeeded', label: '✓ Collected / Paid' },
                    { id: 'pending', label: '⏳ Pending / Due' },
                    { id: 'failed', label: '✕ Failed' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setPaymentStatusFilter(st.id)}
                      className={`rounded px-2.5 py-1 text-[8px] font-bold transition ${
                        paymentStatusFilter.toLowerCase() === st.id.toLowerCase()
                          ? 'bg-[#6f3e25] text-white'
                          : 'border border-[#e8ded2] bg-white text-[#6f3e25] hover:bg-[#fcf7f1]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="min-w-[240px] max-w-sm flex-1">
                <input
                  type="text"
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="Search buyer, order ID, payment ref, session ID..."
                  className="w-full rounded-md border border-[#e8ded2] bg-white px-3 py-1.5 text-[10px] text-[#252525] outline-none focus:border-[#6f3e25]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[10px]">
                <thead className="bg-[#fcfaf8] text-[8px] tracking-wide text-[#918579]">
                  <tr>
                    <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Payment ID / Order</th>
                    <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Payment Method</th>
                    <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Date & Time</th>
                    <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Buyer Account</th>
                    <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Store</th>
                    <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Items Purchased</th>
                    <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Amount</th>
                    <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Status</th>
                    <th className="border-b border-[#eee8e2] px-3 py-3 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child_td]:border-b-0 divide-y divide-[#f2ede8]">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-[11px] text-[#8c8177]">
                        {paymentsLoading
                          ? 'Loading payment records from MongoDB...'
                          : 'No matching payment records found in database.'}
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => {
                      const isSucceeded = p.status === 'succeeded'
                      const isStripe = p.isStripe || String(p.paymentMethod || '').toLowerCase().includes('stripe')

                      return (
                        <tr key={p.id} className="hover:bg-[#fdfbf9]">
                          <Cell>
                            <div className="flex flex-col">
                              <b className="text-[10px] text-[#4c3a2c]">#{p.paymentId || p.id}</b>
                              {p.orderId && (
                                <span className="text-[8px] font-bold text-[#6f3e25]">Order: #{p.orderId}</span>
                              )}
                              {p.stripeSessionId && (
                                <span className="text-[7px] text-[#a09489] truncate max-w-[130px]" title={p.stripeSessionId}>
                                  Session: {p.stripeSessionId.slice(0, 16)}...
                                </span>
                              )}
                            </div>
                          </Cell>
                          <Cell>
                            {isStripe ? (
                              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f3e8ff] border border-[#d8b4fe] px-2.5 py-1 text-[9px] font-bold text-[#6b21a8] shadow-2xs">
                                <span className="text-[12px]">💳</span> Online (Stripe)
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] border border-[#fde68a] px-2.5 py-1 text-[9px] font-bold text-[#92400e] shadow-2xs">
                                <span className="text-[12px]">💵</span> Pay on Drop (Cash)
                              </div>
                            )}
                          </Cell>
                          <Cell>
                            <span className="text-[#655b52]">{p.date}</span>
                          </Cell>
                          <Cell>
                            <div className="flex flex-col">
                              <b className="text-[#3c2a1e]">{p.buyerName}</b>
                              <span className="text-[9px] text-[#6f3e25]">{p.buyerEmail || 'No email recorded'}</span>
                              {p.userId && (
                                <span className="text-[7px] text-[#9a8e83]">UID: {p.userId.slice(0, 12)}...</span>
                              )}
                            </div>
                          </Cell>
                          <Cell>
                            <span className="rounded bg-[#f4ece3] px-2 py-0.5 text-[8px] font-bold text-[#5c3e28]">
                              🏪 {p.shopName || 'Wholesale'}
                            </span>
                          </Cell>
                          <Cell>
                            <div className="max-w-[180px] truncate" title={p.items?.map((i) => `${i.name || i.id} × ${i.quantity}`).join(', ')}>
                              {p.items?.length
                                ? p.items.map((i) => `${i.name || i.id} × ${i.quantity}`).join(', ')
                                : 'Wholesale products'}
                            </div>
                          </Cell>
                          <Cell>
                            <div className="flex flex-col">
                              <b className="text-[11px] text-[#2d6840]">{money(p.amount)}</b>
                              <span className="text-[7px] uppercase font-bold text-[#8c8177]">{p.currency || 'INR'}</span>
                            </div>
                          </Cell>
                          <Cell>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-bold ${
                                isSucceeded
                                  ? 'bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]'
                                  : p.status === 'initiated' || p.status === 'pending'
                                  ? 'bg-[#fff8e1] text-[#b45309] border border-[#ffe082]'
                                  : 'bg-[#ffebee] text-[#c62828] border border-[#ffcdd2]'
                              }`}
                            >
                              {isSucceeded
                                ? (isStripe ? '✓ Paid via Stripe' : '✓ Cash Collected')
                                : (isStripe ? '⏳ Stripe Pending' : '⏳ Due on Drop')}
                            </span>
                          </Cell>
                          <Cell>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {!isSucceeded && !isStripe && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkPaymentCollected(p)}
                                  className="rounded bg-[#2e7d32] px-2 py-1 text-[8px] font-bold text-white hover:bg-[#1b5e20] shadow-2xs"
                                  title="Mark cash payment as received"
                                >
                                  ✓ Collect Cash
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setActivePaymentDetails(p)}
                                className="rounded border border-[#d8c3af] bg-[#fffaf5] px-2 py-1 text-[8px] font-bold text-[#6f3e25] hover:bg-[#f6eee4] shadow-2xs"
                              >
                                Inspect Data
                              </button>
                            </div>
                          </Cell>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Stripe Payment & User Details Modal */}
      {activePaymentDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#e8ded2] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eee4da] pb-3">
              <div>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${
                  activePaymentDetails.isStripe || String(activePaymentDetails.paymentMethod || '').toLowerCase().includes('stripe')
                    ? 'text-[#6b21a8]'
                    : 'text-[#92400e]'
                }`}>
                  {activePaymentDetails.isStripe || String(activePaymentDetails.paymentMethod || '').toLowerCase().includes('stripe')
                    ? '💳 STRIPE ONLINE PAYMENT RECORD'
                    : '💵 PAY ON DROP (CASH) RECORD'}
                </span>
                <h2 className="font-serif text-[20px] font-bold text-[#432d1f]">
                  Payment #{activePaymentDetails.paymentId || activePaymentDetails.id}
                </h2>
                <p className="text-[9px] text-[#81776e]">
                  Recorded on {activePaymentDetails.date}
                </p>
              </div>
              <button
                onClick={() => setActivePaymentDetails(null)}
                className="rounded-md border border-[#e8ded2] bg-[#fbf6f0] px-2.5 py-1 text-[11px] font-bold text-[#6f3e25] hover:bg-[#f3eae0]"
                type="button"
              >
                ✕ Close
              </button>
            </div>

            <div className="mt-4 space-y-4 text-[11px]">
              {/* Payment User Info */}
              <div className="rounded-lg border border-[#e8ded2] bg-[#faf7f4] p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wide text-[#7b6d61]">
                    Payment User Information (Stored in MongoDB)
                  </h3>
                  {activePaymentDetails.isStripe || String(activePaymentDetails.paymentMethod || '').toLowerCase().includes('stripe') ? (
                    <span className="rounded-full bg-[#ede9fe] border border-[#ddd6fe] px-2.5 py-0.5 text-[8px] font-bold text-[#6b21a8]">
                      💳 Online (Stripe) · {activePaymentDetails.status === 'succeeded' ? '✓ Paid' : '⏳ Pending'}
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#fef3c7] border border-[#fde68a] px-2.5 py-0.5 text-[8px] font-bold text-[#92400e]">
                      💵 Pay on Drop · {activePaymentDetails.status === 'succeeded' ? '✓ Collected' : '⏳ Due on Drop'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[9px] text-[#8a7f76] block">Buyer Name</span>
                    <b className="text-[12px] text-[#3e3126]">{activePaymentDetails.buyerName}</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8a7f76] block">User Email</span>
                    <b className="text-[11px] text-[#6f3e25]">{activePaymentDetails.buyerEmail || 'Not recorded'}</b>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8a7f76] block">User ID (Auth UID)</span>
                    <span className="font-mono text-[9px] text-[#554a40]">{activePaymentDetails.userId || 'Guest User'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8a7f76] block">Store / Vendor</span>
                    <span className="font-bold text-[#6f3e25]">🏪 {activePaymentDetails.shopName}</span>
                  </div>
                </div>

                {activePaymentDetails.customerDetails && (activePaymentDetails.customerDetails.address || activePaymentDetails.customerDetails.phone) && (
                  <div className="mt-3 pt-2.5 border-t border-[#eee5dc] text-[10px]">
                    <span className="text-[9px] font-bold text-[#7b6d61] block mb-1">Customer Contact:</span>
                    {activePaymentDetails.customerDetails.phone && (
                      <p>Phone: <b>{activePaymentDetails.customerDetails.phone}</b></p>
                    )}
                    {activePaymentDetails.customerDetails.address && (
                      <p className="text-[#695d52]">
                        Address: {Object.values(activePaymentDetails.customerDetails.address).filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Technical / Settlement Details */}
              {activePaymentDetails.isStripe || String(activePaymentDetails.paymentMethod || '').toLowerCase().includes('stripe') ? (
                <div className="rounded-lg border border-[#e8ded2] bg-white p-3.5 space-y-1.5 font-mono text-[9px]">
                  <div className="flex justify-between items-center text-[10px] font-sans font-bold text-[#7b6d61] border-b border-[#f2ede8] pb-1.5">
                    <span>Stripe Gateway Identifiers</span>
                    <span className="text-[9px] text-[#2e7d32]">Verified by Stripe</span>
                  </div>
                  <div className="flex justify-between gap-2 pt-1">
                    <span className="text-[#8c8177]">Stripe Checkout Session:</span>
                    <span className="text-[#3c2a1e] select-all truncate max-w-[320px]">{activePaymentDetails.stripeSessionId || 'N/A'}</span>
                  </div>
                  {activePaymentDetails.stripePaymentIntentId && (
                    <div className="flex justify-between gap-2">
                      <span className="text-[#8c8177]">Payment Intent ID:</span>
                      <span className="text-[#3c2a1e] select-all">{activePaymentDetails.stripePaymentIntentId}</span>
                    </div>
                  )}
                  {activePaymentDetails.orderId && (
                    <div className="flex justify-between gap-2">
                      <span className="text-[#8c8177]">Associated Order ID:</span>
                      <b className="font-sans text-[#6f3e25]">#{activePaymentDetails.orderId}</b>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-[#fde68a] bg-[#fffdf5] p-3.5 space-y-2 text-[10px]">
                  <div className="flex justify-between items-center font-bold text-[#92400e] border-b border-[#fef3c7] pb-1.5">
                    <span className="flex items-center gap-1.5 text-[11px]">💵 Pay on Drop (Cash Settlement)</span>
                    <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold ${
                      activePaymentDetails.status === 'succeeded' ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-[#fff8e1] text-[#b45309]'
                    }`}>
                      {activePaymentDetails.status === 'succeeded' ? '✓ Cash Collected' : '⏳ Pending Handover'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-[#786c62]">
                    <span>Order: <b>#{activePaymentDetails.orderId}</b></span>
                    <span>Handover: Morning 5:00 AM – 8:00 AM delivery</span>
                  </div>
                  {activePaymentDetails.status !== 'succeeded' && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleMarkPaymentCollected(activePaymentDetails)}
                        className="rounded bg-[#2e7d32] px-3 py-1.5 text-[9px] font-bold text-white hover:bg-[#1b5e20] shadow-xs"
                      >
                        ✓ Mark Cash as Collected
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Itemized Receipt */}
              <div>
                <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#7b6d61]">
                  Items Purchased ({activePaymentDetails.items?.length || 0})
                </h3>
                <div className="overflow-x-auto rounded-lg border border-[#e8ded2]">
                  <table className="w-full text-left text-[10px]">
                    <thead className="bg-[#fcfaf8] text-[8px] font-bold text-[#8d8277]">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2">Store</th>
                        <th className="px-3 py-2">Qty</th>
                        <th className="px-3 py-2">Price</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f2ede8]">
                      {(activePaymentDetails.items || []).map((it, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 font-medium text-[#44362b]">{it.name || it.id}</td>
                          <td className="px-3 py-2 text-[#6f3e25]">{it.shopName || activePaymentDetails.shopName}</td>
                          <td className="px-3 py-2">{it.quantity} {it.unit || ''}</td>
                          <td className="px-3 py-2">{money(it.price || 0)}</td>
                          <td className="px-3 py-2 text-right font-bold text-[#44362b]">
                            {money((Number(it.price) || 0) * (Number(it.quantity) || 1))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="rounded-lg border border-[#f0ebe5] bg-[#faf7f4] p-3 text-right space-y-1">
                <div className="flex justify-between text-[10px] text-[#786c62]">
                  <span>Items Subtotal:</span>
                  <b>{money(activePaymentDetails.subtotal || activePaymentDetails.amount)}</b>
                </div>
                <div className="flex justify-between text-[10px] text-[#786c62]">
                  <span>Delivery & Platform Fee:</span>
                  <b>{money((activePaymentDetails.deliveryFee || 0) + (activePaymentDetails.platformFee || 0))}</b>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#e8ded2] font-serif text-[16px] font-bold text-[#2d6840]">
                  <span>Total Amount Paid via Stripe:</span>
                  <span>{money(activePaymentDetails.amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USERS PAGE */}
      {page === 'adminUsers' && (
        <DataTable title="Registered Accounts (Buyers and Admins)" columns={['Name', 'Email', 'Role', 'Status', 'Action']}>
          {users.map((user) => (
            <tr key={user.id}>
              <Cell>
                <b>{user.name}</b>
              </Cell>
              <Cell>{user.email}</Cell>
              <Cell>
                <span
                  className={`rounded px-2 py-0.5 font-bold ${
                    user.role === 'Admin' ? 'bg-[#522d19] text-white' : 'bg-[#f6eee7] text-[#6f3e25]'
                  }`}
                >
                  {user.role}
                </span>
              </Cell>
              <Cell>
                <StatusBadge status={user.status} />
              </Cell>
              <Cell>
                <ActionButton onClick={() => toggleUserStatus(user.id)}>
                  {user.status === 'Active' ? 'Suspend' : 'Restore'}
                </ActionButton>
              </Cell>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  )
}

function SummaryCard({ label, value, note }) {
  return (
    <div className="rounded-lg border border-[#e8ded2] bg-white p-4 shadow-sm">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-[#918579]">{label}</p>
      <p className="mt-1 font-serif text-[24px] font-bold text-[#4b3526]">{value}</p>
      {note && <p className="mt-1 text-[8px] text-[#9a8e83]">{note}</p>}
    </div>
  )
}

function DataTable({ title, columns, children }) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#e8ded2] bg-white shadow-sm">
      <h2 className="border-b border-[#eee8e2] px-4 py-3 font-serif text-[16px] text-[#4b3526]">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[10px]">
          <thead className="bg-[#fcfaf8] text-[8px] tracking-wide text-[#918579]">
            <tr>
              {columns.map((column) => (
                <th className="whitespace-nowrap border-b border-[#eee8e2] px-3 py-3 font-bold" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child_td]:border-b-0">{children}</tbody>
        </table>
      </div>
    </section>
  )
}

function Cell({ children }) {
  return <td className="whitespace-nowrap border-b border-[#f1ece7] px-3 py-3 text-[#756b62]">{children}</td>
}

function ActionButton({ children, onClick }) {
  return (
    <button
      className="rounded border border-[#e8ded2] bg-white px-2 py-1 text-[9px] font-semibold text-[#6f3e25] hover:bg-[#fff9f3]"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}
