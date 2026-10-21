import { Icon } from '../../components/Icon.jsx'
import { ProductCard } from '../../components/ProductCard.jsx'
import { PageTitle } from '../../components/PageTitle.jsx'
import { products, DEFAULT_SHOPS } from '../../data/marketplace.js'

export function Catalogue({ category, setCategory, query, setQuery, filteredProducts, openProduct, addToCart }) {
  const filters = ['All', ...new Set(products.map((product) => product.category))]

  return (
    <>
      <PageTitle
        eyebrow="THE WHOLESALE MARKET"
        title="Shop supplies"
        text="Find your everyday essentials managed directly by ChaiSupply wholesale inventory."
      />
      <div className="catalogue-toolbar [margin-bottom:18px] [display:flex] [gap:9px] max-[680px]:[gap:6px]">
        <label className="catalogue-search [min-height:35px] [padding:0_10px] [display:flex] [align-items:center] [gap:7px] [border:1px_solid_#eae3dc] [border-radius:6px] [background:#fff] [color:#91867b] [&_.icon]:[width:14px] [&_.icon]:[height:14px] [&_input]:[min-width:120px] [&_input]:[padding:0] [&_input]:[border:0] [&_input]:[outline:0] [&_input]:[color:var(--ink)] [&_input]:[background:transparent] [&_input]:[font-size:10px] [width:min(530px,_70%)] [min-height:39px] [&_input]:[width:100%] max-[680px]:[width:100%] max-[680px]:[&_input]:[min-width:0]">
          <Icon name="search" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search milk, tea powder, snacks, cups, shop name..."
          />
        </label>
        <button
          className="filter-button [min-height:35px] [padding:0_11px] [border:1px_solid_var(--border)] [border-radius:6px] [background:white] [color:#67584b] [font-size:9px] [cursor:pointer] [&_span]:[margin-left:5px] [&_span]:[padding:2px_5px] [&_span]:[border-radius:50%] [&_span]:[color:white] [&_span]:[background:var(--brown)]"
          onClick={() => {
            setCategory('All')
            setQuery('')
          }}
          type="button"
        >
          ☷ All Categories <span>{filters.length - 1}</span>
        </button>
      </div>

      <div className="catalogue-layout [display:grid] [grid-template-columns:185px_minmax(0,_1fr)] [gap:18px] max-[680px]:[grid-template-columns:1fr]">
        <aside className="filter-sidebar [align-self:start] [padding:14px] [display:flex] [flex-direction:column] [align-items:stretch] [border:1px_solid_var(--border)] [border-radius:8px] [background:white] [&_>_b]:[margin-bottom:9px] [&_>_b]:[color:#4c3c30] [&_>_b]:[font-size:10px] [&_>_button]:[min-height:30px] [&_>_button]:[padding:0_7px] [&_>_button]:[display:flex] [&_>_button]:[align-items:center] [&_>_button]:[justify-content:space-between] [&_>_button]:[border:0] [&_>_button]:[border-radius:5px] [&_>_button]:[background:none] [&_>_button]:[color:#746a61] [&_>_button]:[font-size:9px] [&_>_button]:[text-align:left] [&_>_button]:[cursor:pointer] [&_>_button_span]:[color:#a79a8e] [&_>_button_span]:[font-size:8px] [&_>_button.filter-active]:[color:var(--brown)] [&_>_button.filter-active]:[background:#f7efe8] [&_>_button.filter-active]:[font-weight:700] max-[680px]:[padding:9px] max-[680px]:[display:flex] max-[680px]:[flex-direction:row] max-[680px]:[align-items:center] max-[680px]:[gap:5px] max-[680px]:[overflow-x:auto] max-[680px]:[&_>_b]:[display:none] max-[680px]:[&_>_label]:[display:none] max-[680px]:[&_>_button]:[min-height:29px] max-[680px]:[&_>_button]:[padding-inline:8px] max-[680px]:[&_>_button]:[flex:0_0_auto] max-[680px]:[&_>_button]:[border:1px_solid_#eee6df]">
          <b>Categories</b>
          {filters.map((filter) => (
            <button
              key={filter}
              className={category === filter ? 'filter-active' : ''}
              onClick={() => setCategory(filter)}
              type="button"
            >
              {filter}
              <span>
                {filter === 'All'
                  ? products.length
                  : products.filter((item) => item.category === filter).length}
              </span>
            </button>
          ))}

          <b className="filter-group-title [margin-top:17px] max-[680px]:[display:none]">Partner Shops</b>
          {DEFAULT_SHOPS.map((shop) => (
            <button
              key={shop}
              className={query.toLowerCase() === shop.toLowerCase() ? 'filter-active' : ''}
              onClick={() => {
                if (query.toLowerCase() === shop.toLowerCase()) {
                  setQuery('')
                } else {
                  setQuery(shop)
                }
              }}
              type="button"
            >
              🏪 {shop}
            </button>
          ))}

          <b className="filter-group-title [margin-top:17px] max-[680px]:[display:none]">Availability</b>
          <label className="check-filter [margin:6px_0] [display:flex] [align-items:center] [gap:7px] [color:#766d65] [font-size:8px] [&_input]:[accent-color:var(--brown)]">
            <input type="checkbox" defaultChecked />
            In stock & ready
          </label>
          <label className="check-filter [margin:6px_0] [display:flex] [align-items:center] [gap:7px] [color:#766d65] [font-size:8px] [&_input]:[accent-color:var(--brown)]">
            <input type="checkbox" defaultChecked />
            5:00 AM Delivery
          </label>
        </aside>

        <div className="catalogue-results [min-width:0]">
          <div className="results-meta [margin-bottom:12px] [display:flex] [justify-content:space-between] [align-items:center] [color:#847970] [font-size:9px] [&_b]:[color:#4f3b2d]">
            <span>
              <b>{filteredProducts.length}</b> wholesale products
            </span>
            <span className="[color:#91867b]">Wholesale Quality Assured</span>
          </div>

          {filteredProducts.length ? (
            <div className="product-grid [display:grid] [grid-template-columns:repeat(3,_minmax(0,_1fr))] [gap:14px] max-[680px]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] max-[680px]:[gap:8px]">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpen={() => openProduct(product)}
                  onAdd={() => addToCart(product)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state [min-height:240px] [display:flex] [align-items:center] [justify-content:center] [flex-direction:column] [text-align:center] [border:1px_dashed_#e3d8cc] [border-radius:10px] [background:white] [&_>_span]:[color:#c9aa8d] [&_>_span]:[font-size:29px] [&_h3]:[margin:7px_0] [&_h3]:[color:#4c3222] [&_h3]:[font-family:Georgia,_serif] [&_h3]:[font-size:19px] [&_p]:[margin-bottom:13px] [&_p]:[color:#82786f] [&_p]:[font-size:10px]">
              <span>⌕</span>
              <h3>No products found</h3>
              <p>Try another search or choose a different category.</p>
              <button
                className="button button-outline"
                onClick={() => {
                  setQuery('')
                  setCategory('All')
                }}
                type="button"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
