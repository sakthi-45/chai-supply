export function createAdminRoutes(workspaceElement) {
  return [
    { path: '/admin/dashboard', element: workspaceElement('adminDashboard', 'admin') },
    { path: '/admin/users', element: workspaceElement('adminUsers', 'admin') },
    { path: '/admin/suppliers', element: workspaceElement('adminSuppliers', 'admin') },
    { path: '/admin/products', element: workspaceElement('adminProducts', 'admin') },
    { path: '/admin/orders', element: workspaceElement('adminOrders', 'admin') },
  ]
}
