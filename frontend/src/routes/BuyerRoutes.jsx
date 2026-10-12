export function createBuyerRoutes(workspaceElement) {
  return [
    { path: '/buyer/dashboard', element: workspaceElement('buyerDashboard', 'buyer') },
    { path: '/buyer/products', element: workspaceElement('catalogue', 'buyer') },
    { path: '/buyer/product', element: workspaceElement('product', 'buyer') },
    { path: '/buyer/cart', element: workspaceElement('cart', 'buyer') },
    { path: '/buyer/orders', element: workspaceElement('orders', 'buyer') },
    { path: '/buyer/orders/:orderId', element: workspaceElement('orderDetails', 'buyer') },
  ]
}
