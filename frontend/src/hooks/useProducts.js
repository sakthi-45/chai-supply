import { useState, useEffect, useMemo } from 'react'
import { products as defaultProducts } from '../data/marketplace.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function useProducts(notify) {
  const [productList, setProductList] = useState(defaultProducts)
  const [selectedProduct, setSelectedProduct] = useState(defaultProducts[0])
  const [detailQuantity, setDetailQuantity] = useState(1)
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    async function fetchProducts() {
      try {
        const response = await fetch(`${API_URL}/api/products`)
        if (!response.ok) return
        const data = await response.json()
        if (active && Array.isArray(data.products) && data.products.length > 0) {
          setProductList(data.products)
          setSelectedProduct((current) => {
            if (!current) return data.products[0]
            const match = data.products.find((p) => p.id === current.id)
            return match || data.products[0]
          })
        }
      } catch (err) {
        console.warn('Could not fetch products from backend, using default catalog:', err.message)
      }
    }
    fetchProducts()
    return () => {
      active = false
    }
  }, [])

  const filteredProducts = useMemo(
    () =>
      productList.filter((product) => {
        const matchesCategory = category === 'All' || product.category === category
        const matchesQuery = `${product.name} ${product.detail} ${product.shopName || ''} ${product.category}`
          .toLowerCase()
          .includes(query.toLowerCase())
        return matchesCategory && matchesQuery
      }),
    [category, query, productList]
  )

  function openProduct(product, navigate) {
    setSelectedProduct(product)
    setDetailQuantity(1)
    if (navigate) navigate('product')
  }

  async function handleAddProduct(newProduct, authUser) {
    const assignedShop = newProduct.shopName || newProduct.detail || 'Sunrise Snacks'
    const productWithId = {
      ...newProduct,
      id: newProduct.id || `prod-${Date.now()}`,
      price: Number(newProduct.price) || 0,
      stock: newProduct.stock || 'In stock',
      tag: newProduct.tag || 'New arrival',
      shopName: assignedShop,
      detail: assignedShop,
      category: newProduct.category || 'Tea ingredients',
      unit: newProduct.unit || 'kg',
      min: newProduct.min || '1 kg',
      image: newProduct.image || '📦',
      tint: newProduct.tint || 'peach',
      description: newProduct.description || 'Wholesale marketplace supply item.',
    }
    setProductList((current) => [productWithId, ...current])
    if (notify) notify(`Product "${productWithId.name}" added to marketplace`)

    try {
      const token = authUser ? await authUser.getIdToken() : null
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'x-user-role': 'admin',
        },
        body: JSON.stringify(productWithId),
      })
      const data = await response.json()
      if (response.ok && data.product) {
        setProductList((current) =>
          current.map((p) => (p.id === productWithId.id ? data.product : p))
        )
      }
    } catch (err) {
      console.error('Failed to sync new product to backend:', err)
    }
  }

  async function handleEditProduct(updatedProduct, authUser) {
    const assignedShop = updatedProduct.shopName || updatedProduct.detail
    const safeProduct = {
      ...updatedProduct,
      ...(assignedShop ? { shopName: assignedShop, detail: assignedShop } : {}),
    }
    setProductList((current) =>
      current.map((product) =>
        product.id === safeProduct.id ? { ...product, ...safeProduct } : product
      )
    )
    if (notify) notify(`Product "${safeProduct.name || 'item'}" updated successfully`)

    try {
      const token = authUser ? await authUser.getIdToken() : null
      const response = await fetch(`${API_URL}/api/products/${encodeURIComponent(safeProduct.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'x-user-role': 'admin',
        },
        body: JSON.stringify(safeProduct),
      })
      const data = await response.json()
      if (response.ok && data.product) {
        setProductList((current) =>
          current.map((p) => (p.id === safeProduct.id ? data.product : p))
        )
      }
    } catch (err) {
      console.error('Failed to sync product edit to backend:', err)
    }
  }

  async function handleDeleteProduct(productId, authUser) {
    setProductList((current) => current.filter((product) => product.id !== productId))
    if (notify) notify('Product removed from marketplace')

    try {
      const token = authUser ? await authUser.getIdToken() : null
      await fetch(`${API_URL}/api/products/${encodeURIComponent(productId)}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'x-user-role': 'admin',
        },
      })
    } catch (err) {
      console.error('Failed to sync product deletion to backend:', err)
    }
  }

  return {
    productList,
    setProductList,
    selectedProduct,
    setSelectedProduct,
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
  }
}
