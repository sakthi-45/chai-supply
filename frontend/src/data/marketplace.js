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
  cardamom: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  cloves: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  cinnamon: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  'green-tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
  'lemon-tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
  jaggery: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  'palm-sugar': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  'condensed-milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
  butter: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80',
  'sliced-cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80',
  'oat-milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
  'soy-milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
  rusk: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  khari: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'cake-rusk': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'osmania-biscuits': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
  'bakery-buns': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'cups-with-lids': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80',
  'paper-straws': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80',
  'wooden-stirrers': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80',
  napkins: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80',
  'carry-bags': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80',
  dishwash: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80',
  'scouring-pads': 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80',
  disinfectant: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80',
  'floor-cleaner': 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80',
}

export const DEFAULT_SHOPS = ['Sunrise Snacks', 'Fresh Farm Dairy', 'TeaLeaf Wholesale']

export const products = [
  { id: 'milk', name: 'Fresh dairy milk', shopName: 'Fresh Farm Dairy', detail: 'Fresh Farm Dairy', category: 'Milk & dairy', price: 58, unit: 'litre', min: '10 L', image: '🥛', tint: 'peach', tag: 'Daily fresh', stock: 'In stock', description: 'Fresh, full-cream milk sourced from local farms and delivered chilled every morning.' },
  { id: 'tea', name: 'Premium Assam tea powder', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Tea ingredients', price: 420, unit: 'kg', min: '2 kg', image: '🍃', tint: 'sage', tag: 'Popular choice', stock: 'In stock', description: 'Strong, aromatic Assam tea selected for a rich, consistent cup every time.' },
  { id: 'sugar', name: 'Granulated sugar', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Tea ingredients', price: 220, unit: '5 kg', min: '1 bag', image: '🧊', tint: 'cream', tag: 'Wholesale pack', stock: 'In stock', description: 'Clean, fine-grain sugar in a convenient value-size pack for busy tea shops.' },
  { id: 'biscuits', name: 'Glucose biscuits', shopName: 'Sunrise Snacks', detail: 'Sunrise Snacks', category: 'Snacks', price: 480, unit: 'carton', min: '1 carton', image: '🍪', tint: 'gold', tag: 'Fast moving', stock: 'In stock', description: 'A tea-time favourite, packed fresh in a wholesale-ready carton.' },
  { id: 'samosa', name: 'Fresh mini samosa', shopName: 'Sunrise Snacks', detail: 'Sunrise Snacks', category: 'Snacks', price: 350, unit: '50 pcs', min: '1 pack', image: '🥟', tint: 'peach', tag: 'Made fresh', stock: 'In stock', description: 'Crispy, savoury mini samosas prepared fresh by your local snack supplier.' },
  { id: 'cups', name: 'Paper tea cups', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Packaging', price: 180, unit: '100 pcs', min: '1 pack', image: '🥤', tint: 'blue', tag: 'Food safe', stock: 'In stock', description: 'Sturdy, food-safe paper cups made for your everyday tea service.' },
  { id: 'spoons', name: 'Disposable spoons', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Packaging', price: 100, unit: '100 pcs', min: '1 pack', image: '🥄', tint: 'cream', tag: 'Value pack', stock: 'Low stock', description: 'Lightweight disposable spoons, neatly packed for quick service.' },
  { id: 'ginger', name: 'Fresh ginger', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Tea ingredients', price: 140, unit: 'kg', min: '1 kg', image: '🫚', tint: 'gold', tag: 'Fresh today', stock: 'In stock', description: 'Fragrant fresh ginger to add a little extra warmth to every cup.' },
  { id: 'cardamom', name: 'Green cardamom', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Tea ingredients', price: 1450, unit: 'kg', min: '250 g', image: '🌿', tint: 'sage', tag: 'Aromatic spice', stock: 'In stock', description: 'Whole green cardamom pods for fragrant masala chai and specialty tea blends.' },
  { id: 'cloves', name: 'Whole cloves', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Tea ingredients', price: 850, unit: 'kg', min: '250 g', image: '🌰', tint: 'gold', tag: 'Whole spice', stock: 'In stock', description: 'Carefully selected whole cloves for chai masala and spiced tea.' },
  { id: 'cinnamon', name: 'Cinnamon sticks', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Tea ingredients', price: 420, unit: 'kg', min: '250 g', image: '🪵', tint: 'peach', tag: 'Whole spice', stock: 'In stock', description: 'Cinnamon sticks with a warm aroma for tea, coffee, and bakery recipes.' },
  { id: 'green-tea', name: 'Loose green tea leaves', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Tea ingredients', price: 560, unit: 'kg', min: '1 kg', image: '🍵', tint: 'sage', tag: 'Loose leaf', stock: 'In stock', description: 'Loose green tea leaves for light, non-milk tea service.' },
  { id: 'lemon-tea', name: 'Lemon tea blend', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Tea ingredients', price: 380, unit: 'kg', min: '500 g', image: '🍋', tint: 'gold', tag: 'Citrus blend', stock: 'In stock', description: 'A fragrant tea blend suited to refreshing lemon tea and iced tea.' },
  { id: 'jaggery', name: 'Jaggery powder', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Tea ingredients', price: 360, unit: '5 kg', min: '1 bag', image: '🟤', tint: 'gold', tag: 'Natural sweetener', stock: 'In stock', description: 'Convenient powdered jaggery for chai and drinks as an alternative to refined sugar.' },
  { id: 'palm-sugar', name: 'Palm sugar', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Tea ingredients', price: 520, unit: '5 kg', min: '1 bag', image: '🟤', tint: 'cream', tag: 'Alternative sweetener', stock: 'In stock', description: 'Palm sugar in a value-size wholesale pack for cafes and tea stalls.' },
  { id: 'condensed-milk', name: 'Condensed milk', shopName: 'Fresh Farm Dairy', detail: 'Fresh Farm Dairy', category: 'Milk & dairy', price: 115, unit: '1 kg tin', min: '1 tin', image: '🥫', tint: 'peach', tag: 'Cafe essential', stock: 'In stock', description: 'Rich sweetened condensed milk for special milk tea, coffee, and dessert drinks.' },
  { id: 'butter', name: 'Dairy butter', shopName: 'Fresh Farm Dairy', detail: 'Fresh Farm Dairy', category: 'Milk & dairy', price: 520, unit: 'kg', min: '500 g', image: '🧈', tint: 'gold', tag: 'Chilled dairy', stock: 'In stock', description: 'Creamy dairy butter for toast, sandwiches, and bun maska.' },
  { id: 'sliced-cheese', name: 'Processed cheese slices', shopName: 'Fresh Farm Dairy', detail: 'Fresh Farm Dairy', category: 'Milk & dairy', price: 420, unit: '1 kg pack', min: '1 pack', image: '🧀', tint: 'gold', tag: 'Sandwich staple', stock: 'In stock', description: 'Individually sliced cheese for quick-service sandwiches and toast.' },
  { id: 'oat-milk', name: 'Oat milk', shopName: 'Fresh Farm Dairy', detail: 'Fresh Farm Dairy', category: 'Milk & dairy', price: 250, unit: 'litre', min: '6 L', image: '🥛', tint: 'cream', tag: 'Plant-based', stock: 'In stock', description: 'Plant-based oat milk for cafes serving dairy-free tea and coffee.' },
  { id: 'soy-milk', name: 'Soy milk', shopName: 'Fresh Farm Dairy', detail: 'Fresh Farm Dairy', category: 'Milk & dairy', price: 180, unit: 'litre', min: '6 L', image: '🥛', tint: 'sage', tag: 'Plant-based', stock: 'In stock', description: 'Plant-based soy milk for dairy-free drinks and cafe menus.' },
  { id: 'rusk', name: 'Tea rusk toast', shopName: 'Sunrise Snacks', detail: 'Sunrise Snacks', category: 'Snacks', price: 240, unit: 'carton', min: '1 carton', image: '🍞', tint: 'gold', tag: 'Chai-time classic', stock: 'In stock', description: 'Crisp tea rusks packed in a wholesale carton for everyday chai service.' },
  { id: 'khari', name: 'Khari puff pastry', shopName: 'Sunrise Snacks', detail: 'Sunrise Snacks', category: 'Snacks', price: 300, unit: 'kg', min: '1 kg', image: '🥐', tint: 'peach', tag: 'Bakery favourite', stock: 'In stock', description: 'Flaky, savoury khari pastry supplied fresh for tea-time counters.' },
  { id: 'cake-rusk', name: 'Cake rusk', shopName: 'Sunrise Snacks', detail: 'Sunrise Snacks', category: 'Snacks', price: 360, unit: 'carton', min: '1 carton', image: '🍞', tint: 'gold', tag: 'Tea-time snack', stock: 'In stock', description: 'Crunchy twice-baked cake rusk in a convenient wholesale carton.' },
  { id: 'osmania-biscuits', name: 'Osmania biscuits', shopName: 'Sunrise Snacks', detail: 'Sunrise Snacks', category: 'Snacks', price: 420, unit: 'carton', min: '1 carton', image: '🍪', tint: 'cream', tag: 'Regional favourite', stock: 'In stock', description: 'Traditional buttery Osmania biscuits packed for tea stalls and cafes.' },
  { id: 'bakery-buns', name: 'Fresh bakery buns', shopName: 'Sunrise Snacks', detail: 'Sunrise Snacks', category: 'Snacks', price: 180, unit: '20 pcs', min: '1 crate', image: '🍞', tint: 'gold', tag: 'Bun maska ready', stock: 'In stock', description: 'Soft fresh buns suited to bun maska, toast, and quick cafe sandwiches.' },
  { id: 'cups-with-lids', name: 'Paper tea cups with lids', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Packaging', price: 260, unit: '100 sets', min: '1 pack', image: '🥤', tint: 'blue', tag: 'Takeaway ready', stock: 'In stock', description: 'Food-grade takeaway paper cups supplied with matching lids.' },
  { id: 'paper-straws', name: 'Paper drinking straws', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Packaging', price: 90, unit: '100 pcs', min: '1 pack', image: '🥤', tint: 'blue', tag: 'Paper alternative', stock: 'In stock', description: 'Paper straws for iced tea, cold coffee, and other takeaway drinks.' },
  { id: 'wooden-stirrers', name: 'Wooden drink stirrers', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Packaging', price: 80, unit: '100 pcs', min: '1 pack', image: '🥢', tint: 'cream', tag: 'Natural wood', stock: 'In stock', description: 'Single-use wooden stirrers for takeaway tea and coffee.' },
  { id: 'napkins', name: 'Paper napkins', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Packaging', price: 120, unit: '100 pcs', min: '1 pack', image: '🧻', tint: 'cream', tag: 'Counter essential', stock: 'In stock', description: 'Soft paper napkins for quick-service counters and takeaway orders.' },
  { id: 'carry-bags', name: 'Food-grade paper carry bags', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Packaging', price: 180, unit: '100 pcs', min: '1 pack', image: '🛍️', tint: 'gold', tag: 'Takeaway essential', stock: 'In stock', description: 'Food-grade paper carry bags for packed snacks and multi-item takeaway orders.' },
  { id: 'dishwash', name: 'Liquid dishwash soap', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Cleaning & hygiene', price: 140, unit: '5 litre', min: '1 can', image: '🧴', tint: 'sage', tag: 'Bulk cleaning', stock: 'In stock', description: 'Concentrated liquid dishwash for daily cleaning of cups, kettles, and utensils.' },
  { id: 'scouring-pads', name: 'Scouring pads', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Cleaning & hygiene', price: 90, unit: '10 pcs', min: '1 pack', image: '🧽', tint: 'gold', tag: 'Daily essential', stock: 'In stock', description: 'Durable scouring pads for cleaning cookware and food-service equipment.' },
  { id: 'disinfectant', name: 'Surface disinfectant', shopName: 'TeaLeaf Wholesale', detail: 'TeaLeaf Wholesale', category: 'Cleaning & hygiene', price: 220, unit: '5 litre', min: '1 can', image: '🧴', tint: 'blue', tag: 'Hygiene essential', stock: 'In stock', description: 'Surface disinfectant supplied in a bulk can for regular counter cleaning.' },
]

export const suppliers = [
  { name: 'Sunrise Snacks', initials: 'SS', type: 'Fresh snacks', area: 'Jayanagar · 1.8 km', rating: '4.8', mark: '🥨' },
  { name: 'Fresh Farm Dairy', initials: 'FF', type: 'Milk & dairy', area: 'Indiranagar · 2.4 km', rating: '4.9', mark: '🥛' },
  { name: 'TeaLeaf Wholesale', initials: 'TL', type: 'Tea & groceries', area: 'KR Market · 3.1 km', rating: '4.8', mark: '🍃' },
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
  admin: [
    ['Dashboard', 'adminDashboard', '⌂'],
    ['Products', 'adminProducts', '▦'],
    ['Orders', 'adminOrders', '▤'],
    ['Payments', 'adminPayments', '💳'],
    ['Users', 'adminUsers', '♙'],
    ['Profile', 'profile', '◎'],
  ],
}

export const money = (amount) => `₹${amount.toLocaleString('en-IN')}`
