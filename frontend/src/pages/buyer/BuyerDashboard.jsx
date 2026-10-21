import { Icon } from '../../components/Icon.jsx'
import { ProductCard } from '../../components/ProductCard.jsx'
import { Stat } from '../../components/Stat.jsx'
import { StatusBadge } from '../../components/StatusBadge.jsx'
import { money, products, categories } from '../../data/marketplace.js'

export function BuyerDashboard({
  navigate,
  addToCart,
  openProduct,
  orders,
  ordersError,
  cartCount,
  onOpenOrder,
  products: marketProducts = products,
}) {
  const activeOrders = orders.filter((order) => !['Delivered', 'Cancelled'].includes(order.status))
  const today = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <>
      <div className="dashboard-welcome [margin-bottom:20px] [display:flex] [justify-content:space-between] [align-items:center] [gap:20px] max-[680px]:[align-items:flex-start] max-[680px]:[flex-direction:column]">
        <div>
          <span className="eyebrow [display:inline-block] [color:#9e642e] [font-size:9px] [font-weight:800] [letter-spacing:.65px]">{today.toUpperCase()}</span>
          <h1 className="[margin:5px_0] [color:#482b1a] [font-family:Georgia,_serif] [font-size:26px]">Good morning, tea-shop owner. ☀</h1>
          <p className="[color:#81776e] [font-size:11px]">Everything for a smoother morning is just around the corner.</p>
        </div>
        <button className="button button-primary button-small" onClick={() => navigate('catalogue')} type="button">
          Browse products <Icon name="arrow" />
        </button>
      </div>

      <div className="stats-grid [margin-bottom:22px] [display:grid] [grid-template-columns:repeat(3,_1fr)] [gap:12px] max-[680px]:[grid-template-columns:repeat(2,_1fr)]">
        <Stat icon="truck" label="Active orders" value={activeOrders.length} note="Awaiting delivery or fulfilment" />
        <Stat icon="clock" label="Orders placed" value={orders.length} note="Your complete order history" />
        <Stat icon="cart" label="Items in your cart" value={cartCount} note="Ready for checkout" />
      </div>

      {ordersError && <p className="[margin:0_0_14px] [padding:10px_12px] [border:1px_solid_#f1c3c0] [border-radius:6px] [color:#9f2118] [background:#fff5f4] [font-size:9px]" role="alert">{ordersError}</p>}

      {orders.length > 0 && (
        <section className="dashboard-section [margin-bottom:22px]">
          <div className="section-title-row [margin-bottom:12px] [display:flex] [align-items:center] [justify-content:space-between] [gap:12px]">
            <div><h2 className="[margin:4px_0_3px] [color:#472b1b] [font-family:Georgia,_serif] [font-size:17px]">Your recent orders</h2><p className="[color:#817870] [font-size:9px]">Orders you have placed from your cart.</p></div>
            <button className="link-button [border:0] [padding:0] [background:none] [color:var(--brown)] [font-size:10px] [font-weight:700] [cursor:pointer]" onClick={() => navigate('orders')} type="button">
              View all <Icon name="arrow" />
            </button>
          </div>
          <div className="[display:grid] [gap:8px]">
            {orders.slice(0, 3).map((order) => (
              <article className="[padding:12px] [display:flex] [align-items:center] [justify-content:space-between] [gap:12px] [border:1px_solid_var(--border)] [border-radius:8px] [background:white] max-[680px]:[align-items:flex-start] max-[680px]:[flex-direction:column]" key={order.id}>
                <div>
                  <b className="[color:#4c3a2c] [font-size:10px]">#{order.id}</b>
                  <p className="[margin:4px_0] [color:#756b62] [font-size:9px]">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</p>
                  <small className="[color:#918579] [font-size:8px]">{order.date} · 🏪 {order.shopName || (order.shops && order.shops.join(', ')) || 'ChaiSupply Wholesale'}</small>
                </div>
                <div className="[display:flex] [align-items:center] [gap:10px]">
                  <span className="[color:var(--brown)] [font-size:10px] [font-weight:700]">{money(order.total)}</span>
                  <StatusBadge status={order.status} />
                  <button className="table-action [border:0] [padding:0] [background:none] [color:var(--brown)] [font-size:8px] [font-weight:700] [cursor:pointer]" onClick={() => onOpenOrder(order)} type="button">Details</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="dashboard-section [margin-bottom:18px]">
        <div className="section-title-row [margin-bottom:12px] [display:flex] [align-items:center] [justify-content:space-between] [gap:12px]">
          <div><h2 className="[margin:4px_0_3px] [color:#472b1b] [font-family:Georgia,_serif] [font-size:17px]">Shop by category</h2><p className="[color:#817870] [font-size:9px]">Everyday wholesale essentials for your tea stall.</p></div>
          <button className="link-button [border:0] [padding:0] [background:none] [color:var(--brown)] [font-size:10px] [font-weight:700] [cursor:pointer]" onClick={() => navigate('catalogue')} type="button">
            View all <Icon name="arrow" />
          </button>
        </div>
        <div className="shortcut-grid [display:grid] [grid-template-columns:repeat(4,_1fr)] [gap:10px] [&_button]:[padding:12px] [&_button]:[display:flex] [&_button]:[align-items:flex-start] [&_button]:[flex-direction:column] [&_button]:[border:1px_solid_var(--border)] [&_button]:[border-radius:8px] [&_button]:[background:white] [&_button]:[text-align:left] [&_button]:[cursor:pointer] [&_b]:[margin-top:8px] [&_b]:[color:#4e3b2d] [&_b]:[font-size:10px] [&_small]:[margin-top:3px] [&_small]:[color:#847a70] [&_small]:[font-size:8px] max-[680px]:[grid-template-columns:repeat(2,_1fr)]">
          {categories.slice(0, 4).map((item) => (
            <button key={item.name} onClick={() => navigate('catalogue')} type="button">
              <span className="[display:grid] [width:34px] [height:34px] [place-items:center] [overflow:hidden] [border-radius:8px]"><img className="[width:100%] [height:100%] [object-fit:contain]" src={item.image} alt="" /></span>
              <b>{item.name}</b><small>{item.quantity}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard-section [margin-bottom:18px]">
        <div className="section-title-row [margin-bottom:12px] [display:flex] [align-items:center] [justify-content:space-between] [gap:12px]">
          <div><h2 className="[margin:4px_0_3px] [color:#472b1b] [font-family:Georgia,_serif] [font-size:17px]">Frequently purchased</h2><p className="[color:#817870] [font-size:9px]">Everyday essentials, ready to add to your cart.</p></div>
          <button className="link-button [border:0] [padding:0] [background:none] [color:var(--brown)] [font-size:10px] [font-weight:700] [cursor:pointer]" onClick={() => navigate('catalogue')} type="button">
            All products <Icon name="arrow" />
          </button>
        </div>
        <div className="product-grid [display:grid] [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:14px] max-[680px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[680px]:[gap:8px]">
          {(marketProducts || products).slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} onOpen={() => openProduct(product)} onAdd={() => addToCart(product)} />
          ))}
        </div>
      </section>
    </>
  )
}
