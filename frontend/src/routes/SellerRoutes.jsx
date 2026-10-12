export function createSellerRoutes(workspaceElement) {
  return [
    { path: '/seller/dashboard', element: workspaceElement('supplierDashboard', 'supplier') },
    { path: '/seller/products', element: workspaceElement('supplierProducts', 'supplier') },
    { path: '/seller/orders', element: workspaceElement('supplierOrders', 'supplier') },
  ]
}
