import { useState } from 'react'
import { Icon } from '../../components/Icon.jsx'
import { PageTitle } from '../../components/PageTitle.jsx'
import { StatusBadge } from '../../components/StatusBadge.jsx'
import { money } from '../../data/marketplace.js'

export function OrdersPage({ navigate, orderFilter, setOrderFilter, orders, ordersError, onOpenOrder }) {
  const [query, setQuery] = useState('')
  const filters = ['All', 'Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled']
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = orderFilter === 'All' || order.status === orderFilter
    const shopsText = [order.shopName, ...(order.shops || [])].filter(Boolean).join(' ')
    const matchesQuery = `${order.id} ${shopsText} ${order.items?.map((item) => `${item.name || item.id} ${item.shopName || ''}`).join(' ') || ''}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
    return matchesStatus && matchesQuery
  })

  return (
    <>
      <PageTitle
        eyebrow="YOUR SUPPLY HISTORY"
        title="My orders"
        text="Track your wholesale supply deliveries in one place."
        action="Shop supplies"
        onAction={() => navigate('catalogue')}
      />
      {ordersError && <p className="[margin:0_0_14px] [padding:10px_12px] [border:1px_solid_#f1c3c0] [border-radius:6px] [color:#9f2118] [background:#fff5f4] [font-size:9px]" role="alert">{ordersError}</p>}
      <label className="orders-search [min-height:35px] [max-width:440px] [margin:0_0_15px] [padding:0_10px] [display:flex] [align-items:center] [gap:7px] [border:1px_solid_#eae3dc] [border-radius:6px] [background:#fff] [color:#91867b] [&_.icon]:[width:14px] [&_.icon]:[height:14px] [&_input]:[min-width:120px] [&_input]:[width:100%] [&_input]:[padding:0] [&_input]:[border:0] [&_input]:[outline:0] [&_input]:[color:var(--ink)] [&_input]:[background:transparent] [&_input]:[font-size:10px]">
        <Icon name="search" />
        <input onChange={(event) => setQuery(event.target.value)} placeholder="Search by order number, shop, or product..." value={query} />
      </label>
      <div className="status-tabs [margin-bottom:14px] [display:flex] [gap:5px] [overflow-x:auto] [border-bottom:1px_solid_#eae2da] [&_button]:[min-height:34px] [&_button]:[padding:0_12px] [&_button]:[flex:0_0_auto] [&_button]:[border:0] [&_button]:[border-bottom:2px_solid_transparent] [&_button]:[background:none] [&_button]:[color:#82776d] [&_button]:[font-size:9px] [&_button]:[cursor:pointer] [&_button.selected]:[border-color:var(--brown)] [&_button.selected]:[color:var(--brown)] [&_button.selected]:[font-weight:700]">
        {filters.map((filter) => (
          <button className={orderFilter === filter ? 'selected' : ''} key={filter} onClick={() => setOrderFilter(filter)} type="button">
            {filter}
          </button>
        ))}
      </div>
      {filteredOrders.length ? (
        <div className="orders-table-wrap [overflow-x:auto] [border:1px_solid_var(--border)] [border-radius:8px] [background:white] max-[680px]:[border:0] max-[680px]:[overflow:visible] max-[680px]:[background:transparent]">
          <table className="data-table [width:100%] [border-collapse:collapse] [text-align:left] [&_th]:[padding:11px_12px] [&_th]:[border-bottom:1px_solid_#eee8e2] [&_th]:[color:#918579] [&_th]:[background:#fcfaf8] [&_th]:[font-size:8px] [&_th]:[font-weight:700] [&_th]:[white-space:nowrap] [&_td]:[padding:12px] [&_td]:[border-bottom:1px_solid_#f1ece7] [&_td]:[color:#756b62] [&_td]:[font-size:9px] [&_tr:last-child_td]:[border-bottom:0] [&_td_b]:[color:#4c3a2c] [&_td_b]:[font-size:9px] max-[680px]:[&_thead]:[display:none] max-[680px]:[display:block] max-[680px]:[width:100%] max-[680px]:[&_tbody]:[display:block] max-[680px]:[&_tr]:[display:block] max-[680px]:[&_tr]:[margin-bottom:9px] max-[680px]:[&_tr]:[padding:5px_11px] max-[680px]:[&_tr]:[border:1px_solid_var(--border)] max-[680px]:[&_tr]:[border-radius:7px] max-[680px]:[&_tr]:[background:white] max-[680px]:[&_td]:[display:flex] max-[680px]:[&_td]:[justify-content:space-between] max-[680px]:[&_td]:[gap:10px] max-[680px]:[&_td]:[padding:7px_0] max-[680px]:[&_td]:[border-bottom:1px_solid_#f2ede8]">
            <thead><tr><th>ORDER</th><th>DATE</th><th>SHOP / VENDOR</th><th>ITEMS</th><th>TOTAL</th><th>STATUS</th><th /></tr></thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td><b>#{order.id}</b></td>
                  <td>{order.date}</td>
                  <td>
                    <span className="rounded bg-[#f4ece3] px-2 py-0.5 text-[8px] font-bold text-[#5c3e28]">
                      🏪 {order.shopName || (order.shops && order.shops.join(', ')) || 'ChaiSupply Wholesale'}
                    </span>
                  </td>
                  <td>{order.items?.length ? `${order.items.length} item(s)` : 'Wholesale supplies'}</td>

                  <td>
                    <b>{money(order.total)}</b>
                    <div className="mt-0.5">
                      {order.paymentMethod === 'Stripe' || order.paymentStatus === 'Paid' ? (
                        <span className="rounded bg-[#e8f5e9] px-1.5 py-0.5 text-[7px] font-bold text-[#2e7d32]">
                          💳 Paid (Stripe)
                        </span>
                      ) : (
                        <span className="rounded bg-[#f5f5f5] px-1.5 py-0.5 text-[7px] font-bold text-[#757575]">
                          💵 COD
                        </span>
                      )}
                    </div>
                  </td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>
                    <button className="table-action [border:0] [padding:0] [background:none] [cursor:pointer] [display:inline-flex] [align-items:center] [gap:4px] [color:var(--brown)] [font-size:8px] [font-weight:700] [white-space:nowrap]" onClick={() => onOpenOrder(order)} type="button">
                      View order <Icon name="arrow" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state [min-height:240px] [display:flex] [align-items:center] [justify-content:center] [flex-direction:column] [text-align:center] [border:1px_dashed_#e3d8cc] [border-radius:10px] [background:white] [&_>_span]:[color:#c9aa8d] [&_>_span]:[font-size:29px] [&_h3]:[margin:7px_0] [&_h3]:[color:#4c3222] [&_h3]:[font-family:Georgia,_serif] [&_h3]:[font-size:19px] [&_p]:[margin-bottom:13px] [&_p]:[color:#82786f] [&_p]:[font-size:10px]">
          <span>▤</span>
          <h3>{orders.length ? 'No matching orders' : 'No orders yet'}</h3>
          <p>{orders.length ? 'Try another search or status filter.' : 'Your orders will show up here as soon as you place them.'}</p>
          <button className="button button-outline button-small" onClick={() => {
            setQuery('')
            setOrderFilter('All')
            if (!orders.length) navigate('catalogue')
          }} type="button">
            {orders.length ? 'Clear filters' : 'Shop supplies'}
          </button>
        </div>
      )}
    </>
  )
}
