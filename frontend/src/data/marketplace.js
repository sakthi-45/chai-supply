import milkProductImage from '../assets/milk-product.png'
import assamTeaImage from '../assets/assam-tea.jpg'
import glucoseBiscuitsImage from '../assets/glucose-biscuits.jpg'
import paperTeaCupsImage from '../assets/paper-tea-cups.jpg'
import granulatedSugarImage from '../assets/granulated-sugar.jpg'
import disposableSpoonsImage from '../assets/disposable-spoons.jpg'
import freshMiniSamosaImage from '../assets/fresh-mini-samosa.jpg'
import freshGingerImage from '../assets/fresh-ginger.jpg'

export const productImages = {
  milk: milkProductImage,
  tea: assamTeaImage,
  sugar: granulatedSugarImage,
  biscuits: glucoseBiscuitsImage,
  samosa: freshMiniSamosaImage,
  cups: paperTeaCupsImage,
  spoons: disposableSpoonsImage,
  ginger: freshGingerImage,
}

export const products = [
  { id: 'milk', name: 'Fresh dairy milk', detail: 'FreshFarm Dairy', category: 'Milk & dairy', price: 58, unit: 'litre', min: '10 L', image: '🥛', tint: 'peach', tag: 'Daily fresh', stock: 'In stock', description: 'Fresh, full-cream milk sourced from local farms and delivered chilled every morning.' },
  { id: 'tea', name: 'Premium Assam tea powder', detail: 'TeaLeaf Wholesale', category: 'Tea ingredients', price: 420, unit: 'kg', min: '2 kg', image: '🍃', tint: 'sage', tag: 'Popular choice', stock: 'In stock', description: 'Strong, aromatic Assam tea selected for a rich, consistent cup every time.' },
  { id: 'sugar', name: 'Granulated sugar', detail: 'TeaLeaf Wholesale', category: 'Tea ingredients', price: 220, unit: '5 kg', min: '1 bag', image: '🧊', tint: 'cream', tag: 'Wholesale pack', stock: 'In stock', description: 'Clean, fine-grain sugar in a convenient value-size pack for busy tea shops.' },
  { id: 'biscuits', name: 'Glucose biscuits', detail: 'Sunrise Snacks', category: 'Snacks', price: 480, unit: 'carton', min: '1 carton', image: '🍪', tint: 'gold', tag: 'Fast moving', stock: 'In stock', description: 'A tea-time favourite, packed fresh in a wholesale-ready carton.' },
  { id: 'samosa', name: 'Fresh mini samosa', detail: 'Sunrise Snacks', category: 'Snacks', price: 350, unit: '50 pcs', min: '1 pack', image: '🥟', tint: 'peach', tag: 'Made fresh', stock: 'In stock', description: 'Crispy, savoury mini samosas prepared fresh by your local snack supplier.' },
  { id: 'cups', name: 'Paper tea cups', detail: 'CityPack Supplies', category: 'Packaging', price: 180, unit: '100 pcs', min: '1 pack', image: '🥤', tint: 'blue', tag: 'Food safe', stock: 'In stock', description: 'Sturdy, food-safe paper cups made for your everyday tea service.' },
  { id: 'spoons', name: 'Disposable spoons', detail: 'CityPack Supplies', category: 'Packaging', price: 100, unit: '100 pcs', min: '1 pack', image: '🥄', tint: 'cream', tag: 'Value pack', stock: 'Low stock', description: 'Lightweight disposable spoons, neatly packed for quick service.' },
  { id: 'ginger', name: 'Fresh ginger', detail: 'FreshFarm Dairy', category: 'Tea ingredients', price: 140, unit: 'kg', min: '1 kg', image: '🫚', tint: 'gold', tag: 'Fresh today', stock: 'In stock', description: 'Fragrant fresh ginger to add a little extra warmth to every cup.' },
]

export const suppliers = [
  { name: 'FreshFarm Dairy', initials: 'FF', type: 'Milk & dairy', area: 'Indiranagar · 2.4 km', rating: '4.9', mark: '🥛' },
  { name: 'TeaLeaf Wholesale', initials: 'TL', type: 'Tea & groceries', area: 'KR Market · 3.1 km', rating: '4.8', mark: '🍃' },
  { name: 'Sunrise Snacks', initials: 'SS', type: 'Fresh snacks', area: 'Jayanagar · 1.8 km', rating: '4.8', mark: '🥨' },
  { name: 'CityPack Supplies', initials: 'CP', type: 'Packaging', area: 'BTM Layout · 4.2 km', rating: '4.7', mark: '📦' },
]

export const categories = [
  { name: 'Fresh dairy', sub: 'Milk, curd, cream & more', image: productImages.milk, icon: '🥛', quantity: '18 local suppliers', tint: 'peach' },
  { name: 'Tea ingredients', sub: 'Tea, sugar, spices & more', image: productImages.tea, icon: '🍃', quantity: '24 local suppliers', tint: 'sage' },
  { name: 'Tea-time snacks', sub: 'Biscuits, samosa & more', image: productImages.biscuits, icon: '🥨', quantity: '12 local suppliers', tint: 'gold' },
  { name: 'Eco packaging', sub: 'Cups, spoons & napkins', image: productImages.cups, icon: '🥤', quantity: '16 local suppliers', tint: 'blue' },
  { name: 'Grocery & sweeteners', sub: 'Sugar, jaggery & more', image: productImages.sugar, icon: '🧺', quantity: '20 local suppliers', tint: 'cream' },
]

export const navByRole = {
  buyer: [
    ['Dashboard', 'buyerDashboard', '⌂'],
    ['Products', 'catalogue', '▦'],
    ['Cart', 'cart', '🛒'],
    ['My orders', 'orders', '▤'],
    ['Profile', 'profile', '◎'],
  ],
  supplier: [
    ['Dashboard', 'supplierDashboard', '⌂'],
    ['My products', 'supplierProducts', '▦'],
    ['Orders', 'supplierOrders', '▤'],
    ['Profile', 'profile', '◎'],
  ],
  admin: [
    ['Dashboard', 'adminDashboard', '⌂'],
    ['Users', 'adminUsers', '♙'],
    ['Suppliers', 'adminSuppliers', '♧'],
    ['Products', 'adminProducts', '▦'],
    ['Orders', 'adminOrders', '▤'],
  ],
}

export const money = (amount) => `₹${amount.toLocaleString('en-IN')}`
