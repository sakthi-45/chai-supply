import { useState } from 'react'
import { PageTitle } from '../../components/PageTitle.jsx'
import { StatusBadge } from '../../components/StatusBadge.jsx'
import { products, suppliers } from '../../data/marketplace.js'

const initialUsers = [
  { id: 'user-1', name: 'Ravi Kumar', email: 'ravi@example.com', role: 'Buyer', status: 'Active' },
  { id: 'user-2', name: 'FreshFarm Dairy', email: 'hello@freshfarm.example', role: 'Supplier', status: 'Active' },
  { id: 'user-3', name: 'Anita Sharma', email: 'anita@example.com', role: 'Buyer', status: 'Active' },
  { id: 'user-4', name: 'TeaLeaf Wholesale', email: 'orders@tealeaf.example', role: 'Supplier', status: 'Pending' },
]

const initialOrders = [
  { id: 'CS-2048', buyer: 'Ravi Kumar', supplier: 'FreshFarm Dairy', total: '₹1,740', status: 'Processing' },
  { id: 'CS-2047', buyer: 'Anita Sharma', supplier: 'TeaLeaf Wholesale', total: '₹2,260', status: 'Delivered' },
  { id: 'CS-2046', buyer: 'Ravi Kumar', supplier: 'Sunrise Snacks', total: '₹960', status: 'Pending' },
]

const adminSections = {
  adminDashboard: 'Overview',
  adminUsers: 'Users',
  adminSuppliers: 'Suppliers',
  adminProducts: 'Products',
  adminOrders: 'Orders',
}

export function AdminDashboard({ page, notify }) {
  const [users, setUsers] = useState(initialUsers)
  const [supplierStatus, setSupplierStatus] = useState(() =>
    Object.fromEntries(suppliers.map((supplier) => [supplier.name, 'Verified'])),
  )
  const [productStatus, setProductStatus] = useState(() =>
    Object.fromEntries(products.map((product) => [product.id, 'Approved'])),
  )
  const [orders, setOrders] = useState(initialOrders)
  const section = adminSections[page] || 'Overview'

  function toggleUserStatus(userId) {
    setUsers((currentUsers) => currentUsers.map((user) => {
      if (user.id !== userId) return user
      const status = user.status === 'Active' ? 'Suspended' : 'Active'
      notify(`${user.name} is now ${status.toLowerCase()} for this session`)
      return { ...user, status }
    }))
  }

  function toggleSupplierStatus(name) {
    const status = supplierStatus[name] === 'Verified' ? 'Review' : 'Verified'
    setSupplierStatus((currentStatus) => ({ ...currentStatus, [name]: status }))
    notify(`${name} marked ${status.toLowerCase()} for this session`)
  }

  function toggleProductStatus(id, name) {
    const status = productStatus[id] === 'Approved' ? 'Review' : 'Approved'
    setProductStatus((currentStatus) => ({ ...currentStatus, [id]: status }))
    notify(`${name} marked ${status.toLowerCase()} for this session`)
  }

  function advanceOrder(orderId) {
    setOrders((currentOrders) => currentOrders.map((order) => {
      if (order.id !== orderId) return order
      const status = order.status === 'Pending' ? 'Processing' : order.status === 'Processing' ? 'Delivered' : 'Processing'
      notify(`Order ${order.id} marked ${status.toLowerCase()} for this session`)
      return { ...order, status }
    }))
  }

  return (
    <>
      <PageTitle
        eyebrow="MARKETPLACE ADMINISTRATION"
        title={section}
        text="Review marketplace activity and manage accounts, suppliers, products, and orders."
      />
      <div className="mb-4 rounded-md border border-[#eadcc9] bg-[#fbf3e8] px-3 py-2 text-[9px] leading-5 text-[#75634f]" role="status">
        Demo workspace: changes are held in this browser session and are not saved to a server.
      </div>
      {page === 'adminDashboard' && (
        <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Marketplace summary">
          <SummaryCard label="Registered users" value={users.length} />
          <SummaryCard label="Suppliers" value={suppliers.length} />
          <SummaryCard label="Products" value={products.length} />
          <SummaryCard label="Recent orders" value={orders.length} />
        </section>
      )}
      {page === 'adminDashboard' && (
        <section className="mb-4 rounded-lg border border-[#e8ded2] bg-white p-4">
          <h2 className="mb-3 font-serif text-[16px] text-[#4b3526]">Marketplace management</h2>
          <p className="text-[10px] leading-5 text-[#77716c]">
            Use the admin navigation to review user access, verify suppliers, moderate product listings, and monitor orders.
          </p>
        </section>
      )}
      {page === 'adminUsers' && (
        <DataTable title="User accounts" columns={['Name', 'Email', 'Role', 'Status', 'Action']}>
          {users.map((user) => (
            <tr key={user.id}>
              <Cell>{user.name}</Cell>
              <Cell>{user.email}</Cell>
              <Cell>{user.role}</Cell>
              <Cell><StatusBadge status={user.status} /></Cell>
              <Cell><ActionButton onClick={() => toggleUserStatus(user.id)}>{user.status === 'Active' ? 'Suspend' : 'Restore'}</ActionButton></Cell>
            </tr>
          ))}
        </DataTable>
      )}
      {page === 'adminSuppliers' && (
        <DataTable title="Supplier verification" columns={['Supplier', 'Category', 'Area', 'Rating', 'Status', 'Action']}>
          {suppliers.map((supplier) => (
            <tr key={supplier.name}>
              <Cell>{supplier.name}</Cell>
              <Cell>{supplier.type}</Cell>
              <Cell>{supplier.area}</Cell>
              <Cell>{supplier.rating} / 5</Cell>
              <Cell><StatusBadge status={supplierStatus[supplier.name]} /></Cell>
              <Cell><ActionButton onClick={() => toggleSupplierStatus(supplier.name)}>{supplierStatus[supplier.name] === 'Verified' ? 'Review' : 'Verify'}</ActionButton></Cell>
            </tr>
          ))}
        </DataTable>
      )}
      {page === 'adminProducts' && (
        <DataTable title="Product moderation" columns={['Product', 'Supplier', 'Category', 'Price', 'Status', 'Action']}>
          {products.map((product) => (
            <tr key={product.id}>
              <Cell>{product.name}</Cell>
              <Cell>{product.detail}</Cell>
              <Cell>{product.category}</Cell>
              <Cell>₹{product.price.toLocaleString('en-IN')} / {product.unit}</Cell>
              <Cell><StatusBadge status={productStatus[product.id]} /></Cell>
              <Cell><ActionButton onClick={() => toggleProductStatus(product.id, product.name)}>{productStatus[product.id] === 'Approved' ? 'Review' : 'Approve'}</ActionButton></Cell>
            </tr>
          ))}
        </DataTable>
      )}
      {page === 'adminOrders' && (
        <DataTable title="Marketplace orders" columns={['Order', 'Buyer', 'Supplier', 'Total', 'Status', 'Action']}>
          {orders.map((order) => (
            <tr key={order.id}>
              <Cell>{order.id}</Cell>
              <Cell>{order.buyer}</Cell>
              <Cell>{order.supplier}</Cell>
              <Cell>{order.total}</Cell>
              <Cell><StatusBadge status={order.status} /></Cell>
              <Cell><ActionButton onClick={() => advanceOrder(order.id)}>Update status</ActionButton></Cell>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-lg border border-[#e8ded2] bg-white p-4">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-[#918579]">{label}</p>
      <p className="mt-2 font-serif text-[24px] text-[#4b3526]">{value}</p>
    </div>
  )
}

function DataTable({ title, columns, children }) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#e8ded2] bg-white">
      <h2 className="border-b border-[#eee8e2] px-4 py-3 font-serif text-[16px] text-[#4b3526]">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[10px]">
          <thead className="bg-[#fcfaf8] text-[8px] tracking-wide text-[#918579]">
            <tr>{columns.map((column) => <th className="whitespace-nowrap border-b border-[#eee8e2] px-3 py-3 font-bold" key={column}>{column}</th>)}</tr>
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
    <button className="rounded border border-[#e8ded2] bg-white px-2 py-1 text-[9px] font-semibold text-[#6f3e25] hover:bg-[#fff9f3]" onClick={onClick} type="button">
      {children}
    </button>
  )
}
