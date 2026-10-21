import { useState } from 'react'
import { Icon } from '../../components/Icon.jsx'
import { PageTitle } from '../../components/PageTitle.jsx'
import { money, productImages } from '../../data/marketplace.js'

export function CartPage({
  cartProducts,
  cart,
  subtotal,
  changeQuantity,
  navigate,
  onPlaceOrder,
  onPayWithStripe,
  isSubmittingOrder,
  checkoutError,
}) {
  const [paymentMethod, setPaymentMethod] = useState('stripe')
  const deliveryFee = cartProducts.length ? 30 : 0
  const platformFee = subtotal ? 12 : 0

  if (!cartProducts.length) {
    return (
      <div className="empty-cart [min-height:330px] [display:flex] [align-items:center] [justify-content:center] [flex-direction:column] [text-align:center] [border:1px_dashed_#e3d8cc] [border-radius:10px] [background:white] [&_h1]:[margin:7px_0] [&_h1]:[color:#4c3222] [&_h1]:[font-family:Georgia,_serif] [&_h1]:[font-size:19px] [&_p]:[margin-bottom:13px] [&_p]:[color:#82786f] [&_p]:[font-size:10px]">
        <span className="empty-cart-icon [display:grid] [width:54px] [height:54px] [place-items:center] [border-radius:50%] [color:#946947] [background:#f5eee6] [&_.icon]:[width:26px] [&_.icon]:[height:26px]">
          <Icon name="cart" />
        </span>
        <h1>Your cart is waiting</h1>
        <p>Add wholesale essentials from the catalogue to get started.</p>
        <button className="button button-primary button-small" onClick={() => navigate('catalogue')} type="button">
          Browse supplies <Icon name="arrow" />
        </button>
      </div>
    )
  }

  return (
    <>
      <PageTitle
        eyebrow="ONE CART, CONSOLIDATED FULFILMENT"
        title="Cart & checkout"
        text="Review your wholesale supplies and place one unified order directly with ChaiSupply."
      />
      <div className="notice-banner [margin-bottom:14px] [padding:10px_13px] [display:flex] [align-items:center] [gap:8px] [border:1px_solid_#eadcc9] [border-radius:6px] [color:#715133] [background:#fbf2e6] [font-size:9px]">
        <Icon name="truck" />
        <span>Consolidated wholesale order · Direct doorstep delivery guaranteed tomorrow morning by 5:00 AM.</span>
      </div>
      <div className="cart-layout [display:grid] [grid-template-columns:minmax(0,_1fr)_285px] [align-items:start] [gap:17px] max-[900px]:[grid-template-columns:minmax(0,_1fr)_255px] max-[680px]:[grid-template-columns:1fr]">
        <div className="cart-items-group [display:grid] [gap:12px]">
          <section className="cart-card [padding:14px] [border:1px_solid_var(--border)] [border-radius:8px] [background:white]">
            <div className="cart-header [padding-bottom:11px] [display:flex] [align-items:center] [gap:8px] [border-bottom:1px_solid_#f0ebe7] [&_>_div]:[display:flex] [&_>_div]:[flex-direction:column] [&_>_div]:[gap:2px] [&_>_div_b]:[color:#49382a] [&_>_div_b]:[font-size:10px] [&_>_div_small]:[color:#8a8077] [&_>_div_small]:[font-size:8px]">
              <span className="verified-dot [color:var(--green)]">✓</span>
              <div>
                <b>ChaiSupply Wholesale Basket</b>
                <small>FSSAI verified supplies · Guaranteed morning drop</small>
              </div>
              <span className="delivery-eta [margin-left:auto] [color:#63806a] [font-size:8px]">Tomorrow, 5:00 AM</span>
            </div>
            {cartProducts.map((product) => (
              <div
                className="cart-line [padding:9px_0] [display:flex] [align-items:center] [gap:10px] [border-bottom:1px_solid_#f4f0ec] max-[680px]:[gap:6px] max-[380px]:[flex-wrap:wrap]"
                key={product.id}
              >
                <span className="cart-product-image [display:grid] [width:40px] [height:40px] [flex:0_0_auto] [place-items:center] [overflow:hidden] [border-radius:6px] [font-size:18px] max-[680px]:[width:34px] max-[680px]:[height:34px]">
                  {productImages[product.id] ||
                  (typeof product.image === 'string' &&
                  (product.image.startsWith('http://') ||
                    product.image.startsWith('https://') ||
                    product.image.startsWith('data:') ||
                    product.image.startsWith('/'))) ? (
                    <img
                      className="[width:100%] [height:100%] [object-fit:contain]"
                      src={productImages[product.id] || product.image}
                      alt={product.name}
                    />
                  ) : (
                    product.image
                  )}
                </span>
                <span className="cart-product-name [min-width:0] [flex:1] [display:flex] [flex-direction:column] [gap:3px] [&_b]:[color:#4a3b30] [&_b]:[font-size:9px] [&_small]:[color:#857a70] [&_small]:[font-size:8px]">
                  <b>{product.name}</b>
                  <small>{money(product.price)} / {product.unit} · {product.category} · <b className="[color:#6f3e25]">🏪 {product.shopName || product.detail || 'Wholesale'}</b></small>
                </span>
                <div className="quantity-control [width:fit-content] [display:inline-flex] [align-items:center] [border:1px_solid_var(--border)] [border-radius:6px] [background:white] [&_button]:[width:31px] [&_button]:[height:34px] [&_button]:[border:0] [&_button]:[background:none] [&_button]:[color:var(--brown)] [&_button]:[font-size:16px] [&_button]:[cursor:pointer] [&_b]:[min-width:24px] [&_b]:[text-align:center] [&_b]:[font-size:10px]">
                  <button aria-label={`Remove one ${product.name}`} onClick={() => changeQuantity(product.id, -1)} type="button">
                    −
                  </button>
                  <b>{cart[product.id]}</b>
                  <button aria-label={`Add one ${product.name}`} onClick={() => changeQuantity(product.id, 1)} type="button">
                    +
                  </button>
                </div>
                <strong className="[min-width:50px] [color:#49382a] [font-size:10px] [text-align:right]">
                  {money(product.price * cart[product.id])}
                </strong>
              </div>
            ))}
            <div className="cart-subtotal [padding-top:9px] [display:flex] [justify-content:space-between] [color:#645a51] [font-size:9px] [&_b]:[color:#48362a] [&_small]:[color:#847a71] [&_small]:[font-size:8px]">
              <span>Items subtotal ({cartProducts.length} items) <b>{money(subtotal)}</b></span>
              <small>Fixed early morning delivery fee {money(deliveryFee)}</small>
            </div>
          </section>
          <button
            className="link-button [border:0] [padding:0] [background:none] [cursor:pointer] [color:var(--brown)] [font-size:10px] [font-weight:700]"
            onClick={() => navigate('catalogue')}
            type="button"
          >
            ← Continue shopping
          </button>
        </div>
        <aside className="checkout-card [padding:14px] [border:1px_solid_var(--border)] [border-radius:8px] [background:white] [&_h2]:[margin:0_0_14px] [&_h2]:[color:#4a3222] [&_h2]:[font-family:Georgia,_serif] [&_h2]:[font-size:16px] max-[680px]:[grid-row:1]">
          <h2>Order summary</h2>
          <div className="summary-line [margin:10px_0] [display:flex] [justify-content:space-between] [color:#74695f] [font-size:9px]">
            <span>Product subtotal</span>
            <b>{money(subtotal)}</b>
          </div>
          <div className="summary-line [margin:10px_0] [display:flex] [justify-content:space-between] [color:#74695f] [font-size:9px]">
            <span>Delivery charge (5:00 AM drop)</span>
            <b>{money(deliveryFee)}</b>
          </div>
          <div className="summary-line [margin:10px_0] [display:flex] [justify-content:space-between] [color:#74695f] [font-size:9px]">
            <span>Platform fee</span>
            <b>{money(platformFee)}</b>
          </div>
          <div className="summary-total [margin-top:13px] [padding-top:12px] [display:flex] [justify-content:space-between] [border-top:1px_solid_#eee8e1] [color:#443327] [font-size:11px] [font-weight:700]">
            <span>Total amount</span>
            <b>{money(subtotal + deliveryFee + platformFee)}</b>
          </div>
          <div className="payment-options [margin-top:14px] [display:flex] [flex-direction:column] [gap:6px]">
            <span className="[font-size:9px] [font-weight:700] [color:#49382a]">Payment Method</span>
            <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:7px]">
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`[padding:7px_8px] [border-radius:6px] [border:1px_solid] [font-size:9px] [font-weight:700] [cursor:pointer] [display:flex] [align-items:center] [justify-content:center] [gap:5px] ${
                  paymentMethod === 'stripe'
                    ? '[border-color:var(--brown)] [background:#f7efe8] [color:var(--brown)]'
                    : '[border-color:#e4ddd6] [background:white] [color:#6e645a]'
                }`}
              >
                💳 Online (Stripe)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`[padding:7px_8px] [border-radius:6px] [border:1px_solid] [font-size:9px] [font-weight:700] [cursor:pointer] [display:flex] [align-items:center] [justify-content:center] [gap:5px] ${
                  paymentMethod === 'cod'
                    ? '[border-color:var(--brown)] [background:#f7efe8] [color:var(--brown)]'
                    : '[border-color:#e4ddd6] [background:white] [color:#6e645a]'
                }`}
              >
                💵 Pay on Drop
              </button>
            </div>
          </div>
          {checkoutError && (
            <p className="[margin-top:12px] [color:#b42318] [font-size:9px]" role="alert">
              {checkoutError}
            </p>
          )}
          <button
            className="button button-primary [width:100%] [margin-top:15px] disabled:[opacity:.6]"
            disabled={isSubmittingOrder}
            type="button"
            onClick={() => {
              if (paymentMethod === 'stripe') {
                if (onPayWithStripe) {
                  onPayWithStripe()
                } else if (onPlaceOrder) {
                  onPlaceOrder('Online (Stripe)')
                }
              } else if (onPlaceOrder) {
                onPlaceOrder('Pay on Drop')
              }
            }}
          >
            {isSubmittingOrder
              ? 'Processing…'
              : paymentMethod === 'stripe'
              ? 'Pay with Stripe (Card)'
              : 'Place wholesale order'} {!isSubmittingOrder && <Icon name="arrow" />}
          </button>
          <small className="secure-note [margin-top:9px] [display:flex] [justify-content:center] [color:#7b8a76] [font-size:8px]">
            <Icon name="shield" /> Secure wholesale checkout · FSSAI certified
          </small>

        </aside>
      </div>
    </>
  )
}
