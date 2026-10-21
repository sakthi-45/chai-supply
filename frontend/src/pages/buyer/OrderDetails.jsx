import { Icon } from '../../components/Icon.jsx'
import { PageTitle } from '../../components/PageTitle.jsx'
import { StatusBadge } from '../../components/StatusBadge.jsx'
import { money } from '../../data/marketplace.js'

export function OrderDetails({ navigate, order }) {
  if (!order) {
    return (
      <div className="empty-state [min-height:240px] [display:flex] [align-items:center] [justify-content:center] [flex-direction:column] [text-align:center] [border:1px_dashed_#e3d8cc] [border-radius:10px] [background:white] [&_h2]:[color:#4c3222] [&_h2]:[font-family:Georgia,_serif] [&_p]:[color:#82786f] [&_p]:[font-size:10px]">
        <h2>Order not found</h2>
        <p>This order may have been removed or belongs to another account.</p>
        <button className="button button-outline button-small" onClick={() => navigate('orders')} type="button">
          Back to my orders
        </button>
      </div>
    )
  }

  const items = Array.isArray(order.items) ? order.items : []
  const subtotal = order.subtotal ?? items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
  const deliveryFee = order.deliveryFee ?? 30
  const platformFee = order.platformFee ?? 12
  const total = order.total ?? (subtotal + deliveryFee + platformFee)

  return (
    <>
      <button
        className="back-link [border:0] [padding:0] [background:none] [cursor:pointer] [margin-bottom:17px] [color:var(--brown)] [font-size:10px] [font-weight:700]"
        onClick={() => navigate('orders')}
        type="button"
      >
        ← Back to my orders
      </button>
      <PageTitle
        eyebrow={`ORDER PLACED ${(order.date || 'RECENT').toUpperCase()}`}
        title={`Order #${order.id || order.orderId}`}
        text="Your order has been consolidated and scheduled for early morning fulfilment."
      />
      <div className="order-details-layout [display:grid] [grid-template-columns:minmax(0,_1fr)_285px] [align-items:start] [gap:17px] max-[900px]:[grid-template-columns:minmax(0,_1fr)_255px] max-[680px]:[grid-template-columns:1fr]">
        <div className="order-main-card [display:grid] [gap:12px]">
          <section className="order-items-card [padding:15px] [border:1px_solid_var(--border)] [border-radius:8px] [background:white]">
            <div className="order-items-head [display:flex] [justify-content:space-between] [align-items:center] [gap:8px] [&_>_span]:[display:flex] [&_>_span]:[align-items:center] [&_>_span]:[gap:7px] [&_>_span]:[color:#49382b] [&_>_span]:[font-size:10px]">
              <span>
                <i className="verified-dot [color:var(--green)]">✓</i>
                <b>ChaiSupply Direct Fulfilment</b>
              </span>
              <StatusBadge status={order.status} />
            </div>
            <ul className="[margin:10px_0] [padding:0] [list-style:none] [&_li]:[padding:7px_0] [&_li]:[display:flex] [&_li]:[justify-content:space-between] [&_li]:[gap:8px] [&_li]:[border-bottom:1px_solid_#f0ebe6] [&_li]:[color:#796f66] [&_li]:[font-size:9px] [&_li_b]:[color:#4c3b2d]">
              {items.map((item, idx) => (
                <li key={item.id || idx}>
                  <span>
                    {item.name || item.id} × {item.quantity || 1} {item.unit || ''}
                    <small className="[display:block] [color:#6f3e25] [font-size:8px] [font-weight:600]">
                      🏪 {item.shopName || item.detail || order.shopName || 'Wholesale'}
                    </small>
                  </span>
                  <b>{item.price ? money(item.price * (item.quantity || 1)) : `Qty: ${item.quantity || 1}`}</b>
                </li>
              ))}
            </ul>
            <div className="order-items-total [margin-top:9px] [display:flex] [justify-content:space-between] [color:#746a61] [font-size:9px] [&_b]:[color:#4c382a]">
              <span>Items subtotal</span>
              <b>{money(subtotal)}</b>
            </div>
          </section>
        </div>
        <aside className="checkout-card [padding:14px] [border:1px_solid_var(--border)] [border-radius:8px] [background:white] [&_h2]:[margin:0_0_14px] [&_h2]:[color:#4a3222] [&_h2]:[font-family:Georgia,_serif] [&_h2]:[font-size:16px] max-[680px]:[grid-row:1]">
          <h2>Order information</h2>
          <div className="[margin:13px_0] [display:flex] [flex-direction:column] [gap:5px] [color:#8a8077] [font-size:8px]">
            Order status
            <StatusBadge status={order.status} />
          </div>
          <div className="[margin:13px_0] [display:flex] [flex-direction:column] [gap:5px] [color:#8a8077] [font-size:8px]">
            Payment method
            <span className="[color:#4c3b2d] [font-size:9px] [font-weight:700]">
              {order.paymentMethod === 'Stripe' || order.paymentStatus === 'Paid'
                ? '💳 Paid Online (Stripe)'
                : '💵 Cash on Delivery'}
            </span>
          </div>
          <div className="[margin:13px_0] [display:flex] [flex-direction:column] [gap:5px] [color:#8a8077] [font-size:8px]">
            Delivery window
            <span className="[color:#4c3b2d] [font-size:9px]">Tomorrow, 5:00 AM – 6:30 AM drop</span>
          </div>
          <div className="[margin:13px_0] [display:flex] [justify-content:space-between] [color:#8a8077] [font-size:8px]">
            Products subtotal
            <b className="[color:#4c3b2d]">{money(subtotal)}</b>
          </div>
          <div className="[margin:13px_0] [display:flex] [justify-content:space-between] [color:#8a8077] [font-size:8px]">
            Delivery and platform fees
            <b className="[color:#4c3b2d]">{money(deliveryFee + platformFee)}</b>
          </div>
          <div className="[margin-top:13px] [padding-top:12px] [display:flex] [justify-content:space-between] [border-top:1px_solid_#eee8e1] [color:#443327] [font-size:10px] [font-weight:700]">
            Order total
            <b>{money(total)}</b>
          </div>
          <button
            className="button button-outline button-small [width:100%] [margin-top:15px]"
            onClick={() => navigate('orders')}
            type="button"
          >
            Need help with this order? <Icon name="arrow" />
          </button>
        </aside>
      </div>
    </>
  )
}
