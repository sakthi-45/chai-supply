import { Icon } from '../components/Icon.jsx'
import { money, productImages } from '../data/marketplace.js'

export function ProductCard({ product, onOpen, onAdd }) {
  const productImage =
    productImages[product.id] ||
    (typeof product.image === 'string' &&
    (product.image.startsWith('http://') ||
      product.image.startsWith('https://') ||
      product.image.startsWith('data:') ||
      product.image.startsWith('/'))
      ? product.image
      : null)

  return (
    <article className="product-card hover:[transform:translateY(-2px)] hover:[box-shadow:var(--shadow)] [min-width:0] [padding:9px] [border:1px_solid_#eee7e0] [border-radius:9px] [background:white] [transition:transform_.18s,_box-shadow_.18s] max-[680px]:[padding:7px]">
      <button
        className={`product-visual [position:relative] [width:100%] [height:89px] [display:grid] [place-items:center] [overflow:hidden] [border:0] [border-radius:6px] [cursor:pointer] [&_>_span]:[font-size:36px] [&_>_span]:[filter:drop-shadow(0_3px_3px_#39231219)] [&_>_img]:[position:absolute] [&_>_img]:[inset:0] [&_>_img]:[width:100%] [&_>_img]:[height:100%] [&_>_img]:[object-fit:contain] [&_>_img]:[object-position:center] [&_>_small]:[position:absolute] [&_>_small]:[top:7px] [&_>_small]:[left:7px] [&_>_small]:[padding:3px_5px] [&_>_small]:[border-radius:3px] [&_>_small]:[color:#37634a] [&_>_small]:[background:#eff5ed] [&_>_small]:[font-size:7px] [&_>_small]:[font-weight:700] max-[680px]:[height:75px] max-[680px]:[&_>_span]:[font-size:29px] ${
          productImage
            ? 'bg-white'
            : product.tint === 'peach'
            ? 'bg-[#fae8de]'
            : product.tint === 'sage'
            ? 'bg-[#eaf1e7]'
            : product.tint === 'gold'
            ? 'bg-[#fbf0d9]'
            : product.tint === 'blue'
            ? 'bg-[#e6eff1]'
            : 'bg-[#f2eee8]'
        }`}
        onClick={onOpen}
        aria-label={`View ${product.name}`}
      >
        {productImage ? <img src={productImage} alt="" /> : <span>{product.image}</span>}
        <small>{product.tag || 'Wholesale'}</small>
      </button>
      <div className="product-card-body [padding:8px_2px_0]">
        <div className="product-meta [display:flex] [justify-content:space-between] [gap:5px] [color:#756e66] [font-size:7px] [&_span:first-child]:[color:var(--green)] max-[680px]:[font-size:6px] max-[380px]:[flex-wrap:wrap]">
          <span>
            <i className="verified-dot [color:var(--green)] [font-style:normal] [font-weight:800]">✓</i> Wholesale Quality
          </span>
          <span>MOQ {product.min}</span>
        </div>
        <button
          className="product-title [display:block] [max-width:100%] [margin:7px_0_1px] [padding:0] [overflow:hidden] [border:0] [background:none] [color:#41342b] [font-family:Georgia,_serif] [font-size:12px] [font-weight:700] [text-align:left] [text-overflow:ellipsis] [white-space:nowrap] [cursor:pointer] max-[680px]:[font-size:10px]"
          onClick={onOpen}
        >
          {product.name}
        </button>
        <span className="product-category [display:block] [color:#827870] [font-size:8px]">
          {product.category} · <b className="[color:#6f3e25]">🏪 {product.shopName || product.detail || 'Wholesale'}</b>
        </span>
        <div className="price-row [margin:10px_0_8px] [padding-bottom:8px] [display:flex] [justify-content:space-between] [align-items:end] [gap:5px] [border-bottom:1px_solid_#f0ece8] [&_strong]:[color:var(--brown)] [&_strong]:[font-size:14px] [&_strong_small]:[color:#87796d] [&_strong_small]:[font-size:8px] [&_strong_small]:[font-weight:500] [&_>_span]:[color:var(--green)] [&_>_span]:[font-size:7px] max-[680px]:[&_strong]:[font-size:12px]">
          <strong>
            {money(product.price)}
            <small> / {product.unit}</small>
          </strong>
          <span>GST included</span>
        </div>
        <div className="product-card-actions [display:flex] [justify-content:space-between] [align-items:center] [gap:4px] max-[680px]:[align-items:flex-start] max-[680px]:[flex-direction:column] max-[680px]:[&_.button]:[width:100%]">
          <span className="stock-mark [color:var(--green)] [font-size:7px] [&::first-letter]:[font-size:7px]">
            ● {product.stock || 'In stock'}
          </span>
          <button
            className="button [min-height:42px] [padding:0_17px] [border:1px_solid_transparent] [border-radius:7px] [display:inline-flex] [justify-content:center] [align-items:center] [gap:9px] [font-size:12px] [line-height:1.2] [font-weight:700] [cursor:pointer] [transition:background_.18s,_border-color_.18s,_transform_.18s] hover:[transform:translateY(-1px)] [&_.icon]:[width:15px] [&_.icon]:[height:15px] button-primary [background:var(--brown)] [color:#fff] [box-shadow:0_3px_8px_rgba(81,_43,_23,_.13)] hover:[background:var(--brown-dark)] button-small [min-height:34px] [padding:0_12px] [font-size:10px] [border-radius:6px]"
            onClick={onAdd}
          >
            <Icon name="cart" /> Add to cart
          </button>
        </div>
      </div>
    </article>
  )
}
