import { useState, useEffect } from 'react'

const CART_STORAGE_KEY = 'chai-supply:cart'

function getInitialCart() {
  try {
    const saved = window.localStorage.getItem(CART_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (error) {
    console.warn('Could not restore cart from localStorage:', error)
  }
  return {}
}

export function useCart(productList = [], notify) {
  const [cart, setCart] = useState(getInitialCart)

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.warn('Could not save cart to localStorage:', error)
    }
  }, [cart])

  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
  const cartProducts = productList.filter((product) => cart[product.id])
  const subtotal = cartProducts.reduce((sum, product) => sum + product.price * cart[product.id], 0)

  function addToCart(product, quantity = 1) {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] || 0) + quantity }))
    if (notify) {
      notify(`${product.name} added to your cart`)
    }
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

  return {
    cart,
    setCart,
    cartCount,
    cartProducts,
    subtotal,
    addToCart,
    changeQuantity,
  }
}
