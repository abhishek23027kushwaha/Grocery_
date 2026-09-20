export type Product = { id: number; name: string; detail: string; price: number; old: number; category: string; image: string; description: string }

export const categories = [
  { name: 'Fresh fruits', slug: 'fruits', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=80' },
  { name: 'Vegetables', slug: 'vegetables', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80' },
  { name: 'Dairy & eggs', slug: 'dairy-eggs', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=500&q=80' },
  { name: 'Bakery', slug: 'bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80' },
  { name: 'Munchies', slug: 'munchies', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=500&q=80' },
  { name: 'Drinks', slug: 'drinks', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=500&q=80' },
  { name: 'Grocery & kitchen', slug: 'grocery-kitchen', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=500&q=80' },
]

export const products: Product[] = [
  { id: 1, name: 'Fresh bananas', detail: 'Robusta â€¢ 6 pcs', price: 42, old: 55, category: 'fruits', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=85', description: 'Naturally sweet, perfectly ripe robusta bananas for a quick and healthy snack.' },
  { id: 2, name: 'Avocado', detail: 'Imported â€¢ 1 pc', price: 89, old: 110, category: 'fruits', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=85', description: 'Creamy, nutrient-rich avocados selected at the perfect stage of ripeness.' },
  { id: 3, name: 'Farm fresh eggs', detail: 'Pack of 6', price: 64, old: 72, category: 'dairy-eggs', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=85', description: 'Fresh, protein-rich eggs sourced from trusted local farms.' },
  { id: 4, name: 'Sourdough bread', detail: 'Classic loaf â€¢ 400 g', price: 119, old: 145, category: 'bakery', image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=85', description: 'A golden crust and soft, tangy crumb baked fresh every morning.' },
  { id: 5, name: 'Cherry tomatoes', detail: 'Farm fresh â€¢ 250 g', price: 55, old: 70, category: 'vegetables', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=600&q=85', description: 'Juicy, bright cherry tomatoes for salads, sandwiches and snacking.' },
  { id: 6, name: 'Greek yogurt', detail: 'Natural â€¢ 400 g', price: 99, old: 120, category: 'dairy-eggs', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=85', description: 'Thick and creamy natural yogurt with no added sugar.' },
  { id: 7, name: 'Orange juice', detail: 'No added sugar â€¢ 1 L', price: 129, old: 155, category: 'drinks', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=85', description: 'Refreshing citrus juice made with hand-picked oranges.' },
  { id: 8, name: 'Potato chips', detail: 'Classic salted â€¢ 100 g', price: 35, old: 40, category: 'munchies', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=85', description: 'Crispy, golden potato chips with just the right amount of salt.' },
  { id: 13, name: 'Basmati rice', detail: 'Premium â€¢ 5 kg', price: 499, old: 560, category: 'grocery-kitchen', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=85', description: 'Long-grain aromatic basmati rice for everyday meals and special occasions.' },
  { id: 14, name: 'Wooden kitchen tools', detail: 'Set of 5', price: 249, old: 299, category: 'grocery-kitchen', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=600&q=85', description: 'A practical set of durable wooden tools for everyday cooking.' },
]

export const heroImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1100&q=85'
export const money = (value: number) => `₹${value}`
export const categoryFor = (slug: string) => categories.find((category) => category.slug === slug)
export const productById = (id: string) => products.find((product) => product.id === Number(id))
export type CartItem = { product: any; count: number }
export type Cart = Record<string, CartItem>

export const categoryProducts = (slug?: string) => !slug || slug === 'all' ? products : products.filter((product) => product.category === slug)
export const searchProducts = (query: string) => products.filter((product) => `${product.name} ${product.detail} ${product.category}`.toLowerCase().includes(query.toLowerCase()))
export const cartItems = (cart: Cart) => Object.values(cart)
export const cartTotal = (cart: Cart) => Object.values(cart).reduce((sum, item) => sum + item.product.price * item.count, 0)
export const cartCount = (cart: Cart) => Object.values(cart).reduce((sum, item) => sum + item.count, 0)
export const categoryTint = (index: number) => ['bg-[#fff2d7]', 'bg-[#e8f5df]', 'bg-[#fff8df]', 'bg-[#f9e8d8]', 'bg-[#fde6e1]', 'bg-[#e2f4f4]'][index % 6]
export const productUrl = (id: number) => `/products/${id}`
export const categoryUrl = (slug: string) => `/categories/${slug}`
export const navLinks = [{ label: 'Home', href: '/' }, { label: 'Categories', href: '/categories' }, { label: 'Deals', href: '/deals' }]
export const footerCopy = 'Â© 2026 grovli Â· Fresh groceries, thoughtfully delivered'
export const promoCode = 'WELCOME50'
export const orderMinimum = 199
export const deliveryFee = 25
export const maxQuantity = 9
export const pageMaxWidth = 'mx-auto w-full px-5 lg:px-8'
export const supportPhone = '+91 80000 12345'
export const supportEmail = 'hello@grovli.example'
