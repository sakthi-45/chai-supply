export function createSharedRoutes(workspaceElement) {
  return [
    { path: '/account/profile', element: workspaceElement('profile') },
  ]
}
