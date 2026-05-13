 
require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const User       = require('../models/userModel')
const Product    = require('../models/productModel')
const Review     = require('../models/reviewModel')
const Order      = require('../models/orderSchema')
const Restaurant = require('../models/restaurantModel')

// ── Users ─────────────────────────────────────────────────────────────
const USERS = [
  { userName: 'Admin User',   userEmail: 'admin@momogo.com',  userPhoneNumber: 9800000001, userPassword: bcrypt.hashSync('admin123', 10),    userRole: 'admin'    },
  { userName: 'Aarav Sharma', userEmail: 'aarav@test.com',    userPhoneNumber: 9841234567, userPassword: bcrypt.hashSync('password123', 10), userRole: 'customer' },
  { userName: 'Priya Thapa',  userEmail: 'priya@test.com',    userPhoneNumber: 9807654321, userPassword: bcrypt.hashSync('password123', 10), userRole: 'customer' },
  { userName: 'Bikram Rai',   userEmail: 'bikram@test.com',   userPhoneNumber: 9851122334, userPassword: bcrypt.hashSync('password123', 10), userRole: 'customer' },
  { userName: 'Sita Gurung',  userEmail: 'sita@test.com',     userPhoneNumber: 9869988776, userPassword: bcrypt.hashSync('password123', 10), userRole: 'customer' },
  { userName: 'Rajan Magar',  userEmail: 'rajan@test.com',    userPhoneNumber: 9823344556, userPassword: bcrypt.hashSync('password123', 10), userRole: 'customer' },
]
 
const RESTAURANTS = [
  {
    name: 'Momo Corner Thamel',
    description: 'The original momo house of Thamel since 2008. Famous for our secret recipe buff momo and the spiciest jhol in Kathmandu. Every dumpling is hand-crafted fresh daily.',
    address: 'Thamel Marg, Thamel, Kathmandu',
    phone: '01-4441234',
    email: 'thamel@momocorner.com',
    cuisine: ['Nepali', 'Momo', 'Street Food'],
    rating: 4.9,
    totalReviews: 2140,
    deliveryTime: '20-30',
    deliveryFee: 0,
    minimumOrder: 150,
    isOpen: true,
    isPopular: true,
    isFeatured: true,
    emoji: '🏠',
    openingHours: '7:00 AM – 11:00 PM',
    location: { district: 'Kathmandu', area: 'Thamel' },
  },
  {
    name: 'Himalayan Bites',
    description: 'Authentic Nepali street food brought to your table. Specialising in traditional jhol momo, sel roti and mountain-style snacks. A hidden gem loved by locals.',
    address: 'Lazimpat Road, Lazimpat, Kathmandu',
    phone: '01-4423456',
    email: 'info@himalayanbites.com',
    cuisine: ['Street Food', 'Nepali', 'Snacks'],
    rating: 4.7,
    totalReviews: 872,
    deliveryTime: '25-35',
    deliveryFee: 30,
    minimumOrder: 200,
    isOpen: true,
    isPopular: true,
    isFeatured: false,
    emoji: '🏔️',
    openingHours: '9:00 AM – 10:00 PM',
    location: { district: 'Kathmandu', area: 'Lazimpat' },
  },
  {
    name: 'Kathmandu Kitchen',
    description: 'Home-style Nepali cooking made with love. Our recipes are passed down through three generations. The comfort food you crave when you miss home.',
    address: 'Pulchowk, Lalitpur',
    phone: '01-5521234',
    email: 'hello@kathmanduktichen.com',
    cuisine: ['Nepali', 'Home-style', 'Thali'],
    rating: 4.8,
    totalReviews: 653,
    deliveryTime: '30-40',
    deliveryFee: 0,
    minimumOrder: 250,
    isOpen: true,
    isPopular: false,
    isFeatured: false,
    emoji: '🏡',
    openingHours: '10:00 AM – 9:00 PM',
    location: { district: 'Lalitpur', area: 'Pulchowk' },
  },
  {
    name: 'Street Bites Patan',
    description: 'Quick bites and snacks from the streets of Patan. Lightning-fast delivery and unbeatable prices. Perfect for when hunger hits and you need food NOW.',
    address: 'Mangal Bazar, Lalitpur',
    phone: '01-5534567',
    email: 'orders@streetbitespatan.com',
    cuisine: ['Street Food', 'Fast Food', 'Snacks'],
    rating: 4.6,
    totalReviews: 430,
    deliveryTime: '15-25',
    deliveryFee: 20,
    minimumOrder: 100,
    isOpen: true,
    isPopular: false,
    isFeatured: false,
    emoji: '🛵',
    openingHours: '8:00 AM – 11:00 PM',
    location: { district: 'Lalitpur', area: 'Mangal Bazar' },
  },
  {
    name: 'Newari Kitchen',
    description: 'Traditional Newari cuisine crafted with century-old recipes. Savouring the rich cultural heritage of the Kathmandu Valley one dish at a time.',
    address: 'Asan Tole, Kathmandu',
    phone: '01-4456789',
    email: 'taste@newari.kitchen',
    cuisine: ['Newari', 'Traditional', 'Cultural'],
    rating: 4.8,
    totalReviews: 789,
    deliveryTime: '25-35',
    deliveryFee: 0,
    minimumOrder: 200,
    isOpen: true,
    isPopular: true,
    isFeatured: true,
    emoji: '🍲',
    openingHours: '11:00 AM – 10:00 PM',
    location: { district: 'Kathmandu', area: 'Asan' },
  },
  {
    name: 'Momo Mania',
    description: 'Momo specialists since 2010. We do one thing and we do it perfectly — hand-folded momos in 12 varieties. Over 3,000 glowing reviews speak for themselves.',
    address: 'Baneshwor, Kathmandu',
    phone: '01-4467890',
    email: 'eat@momomania.com.np',
    cuisine: ['Momo', 'Fast Food', 'Nepali'],
    rating: 4.9,
    totalReviews: 3200,
    deliveryTime: '18-28',
    deliveryFee: 0,
    minimumOrder: 100,
    isOpen: true,
    isPopular: true,
    isFeatured: true,
    emoji: '🎯',
    openingHours: '9:00 AM – 11:00 PM',
    location: { district: 'Kathmandu', area: 'Baneshwor' },
  },
  {
    name: 'Chiya Corner',
    description: 'Your neighbourhood tea and snack spot. Perfectly brewed masala chai, fresh samosas and crispy pakodas. A warm escape from the city buzz.',
    address: 'Bouddha, Kathmandu',
    phone: '01-4489012',
    email: 'chai@chiyacorner.com',
    cuisine: ['Drinks', 'Snacks', 'Chai'],
    rating: 4.3,
    totalReviews: 180,
    deliveryTime: '10-20',
    deliveryFee: 10,
    minimumOrder: 80,
    isOpen: true,
    isPopular: false,
    isFeatured: false,
    emoji: '☕',
    openingHours: '6:00 AM – 9:00 PM',
    location: { district: 'Kathmandu', area: 'Bouddha' },
  },
  {
    name: 'Durbar Square Dine',
    description: 'Fine dining with a view of historic Durbar Square. Contemporary Nepali cuisine elevated to an art form. The best special-occasion restaurant in Kathmandu.',
    address: 'Basantapur Durbar Square, Kathmandu',
    phone: '01-4412345',
    email: 'reservations@durbardine.com',
    cuisine: ['Fine Dining', 'Nepali', 'Heritage'],
    rating: 4.5,
    totalReviews: 310,
    deliveryTime: '35-50',
    deliveryFee: 50,
    minimumOrder: 400,
    isOpen: false,
    isPopular: false,
    isFeatured: false,
    emoji: '🏛️',
    openingHours: '12:00 PM – 10:00 PM (Closed Mon)',
    location: { district: 'Kathmandu', area: 'Basantapur' },
  },
]

// ── Products factory (linked to restaurants by index) ──────────────────
const makeProducts = (restaurantIds) => [
  // ── Momo Corner Thamel (index 0) ──────────────────────────────────
  { productName: 'Classic Buff Momo',      productDescription: 'Tender buffalo meat stuffed in thin dough, steamed to perfection. Served with our signature tomato-sesame chutney. A Nepali classic loved by all.', productPrice: 180, productCategory: 'Steamed Momo', productStatus: 'available', productQuantity: 50, productImage: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500&h=375&fit=crop', restaurant: restaurantIds[0] },
  { productName: 'Pork Momo',              productDescription: 'Succulent minced pork with traditional Nepali spices, hand-folded and steamed. Our most popular seller — rich, juicy and deeply satisfying.', productPrice: 220, productCategory: 'Steamed Momo', productStatus: 'available', productQuantity: 35, productImage: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500&h=375&fit=crop', restaurant: restaurantIds[0] },
  { productName: 'Crispy Fried Buff Momo', productDescription: 'Our classic buff momos deep-fried to a golden crisp. Crunchy outside, melt-in-your-mouth inside. Best paired with spicy achar.', productPrice: 220, productCategory: 'Fried Momo', productStatus: 'available', productQuantity: 30, productImage: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=500&h=375&fit=crop', restaurant: restaurantIds[0] },
  { productName: 'C-Momo Special',         productDescription: 'Steamed momos tossed in our signature chilli sauce with bell peppers, onions and Szechuan spices. Sweet, tangy and fiery all at once.', productPrice: 260, productCategory: 'C-Momo', productStatus: 'available', productQuantity: 25, productImage: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=500&h=375&fit=crop', restaurant: restaurantIds[0] },
  { productName: 'Masala Chai',            productDescription: 'Traditional Nepali spiced tea brewed with ginger, cardamom, cinnamon and full-cream milk. Warm, aromatic and perfectly comforting.', productPrice: 80,  productCategory: 'Drinks', productStatus: 'available', productQuantity: 100, productImage: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&h=375&fit=crop', restaurant: restaurantIds[0] },

  // ── Himalayan Bites (index 1) ────────────────────────────────────
  { productName: 'Spicy Jhol Momo',        productDescription: 'Steamed momos swimming in our famous fiery jhol made with tomatoes, sesame, timur and secret spices. A flavour explosion you will not forget.', productPrice: 250, productCategory: 'Jhol Momo', productStatus: 'available', productQuantity: 30, productImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=375&fit=crop', restaurant: restaurantIds[1] },
  { productName: 'Mild Jhol Momo',         productDescription: 'Classic jhol momo for those who prefer a gentler heat. Our rich broth is packed with authentic Nepali flavours — just gentler on the palate.', productPrice: 250, productCategory: 'Jhol Momo', productStatus: 'available', productQuantity: 20, productImage: 'https://images.unsplash.com/photo-1528712306091-ed0763094c98?w=500&h=375&fit=crop', restaurant: restaurantIds[1] },
  { productName: 'Chicken Sekuwa',         productDescription: 'Marinated chicken skewers grilled over charcoal with traditional Nepali spices. Smoky, juicy and deeply flavourful.', productPrice: 280, productCategory: 'Snacks', productStatus: 'available', productQuantity: 25, productImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=375&fit=crop', restaurant: restaurantIds[1] },
  { productName: 'Aloo Chop',              productDescription: 'Crispy potato fritters seasoned with Nepali spices and fresh herbs. A street food staple — crunchy, spiced and absolutely addictive.', productPrice: 100, productCategory: 'Snacks', productStatus: 'available', productQuantity: 50, productImage: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=375&fit=crop', restaurant: restaurantIds[1] },
  { productName: 'Fresh Lime Soda',        productDescription: 'Refreshing lime soda with a hint of salt and sugar. The ideal drink to balance your flavourful momo feast.', productPrice: 90, productCategory: 'Drinks', productStatus: 'available', productQuantity: 70, productImage: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&h=375&fit=crop', restaurant: restaurantIds[1] },

  // ── Kathmandu Kitchen (index 2) ──────────────────────────────────
  { productName: 'Veg Momo',               productDescription: 'Fresh seasonal vegetables, paneer and spices wrapped in soft dough and steamed. Perfect for vegetarians who love authentic momo flavour.', productPrice: 150, productCategory: 'Steamed Momo', productStatus: 'available', productQuantity: 40, productImage: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&h=375&fit=crop', restaurant: restaurantIds[2] },
  { productName: 'Sel Roti with Honey',    productDescription: 'Traditional Nepali ring-shaped rice bread — crispy outside, soft inside. Drizzled with pure mountain honey. A festive favourite.', productPrice: 130, productCategory: 'Desserts', productStatus: 'available', productQuantity: 30, productImage: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&h=375&fit=crop', restaurant: restaurantIds[2] },
  { productName: 'Dal Bhat Thali',         productDescription: 'The complete Nepali meal. Steamed rice, lentil dal, seasonal vegetables, spinach saag, pickles and papad. Hearty and wholesome.', productPrice: 320, productCategory: 'Nepali Thali', productStatus: 'available', productQuantity: 20, productImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=375&fit=crop', restaurant: restaurantIds[2] },
  { productName: 'Lassi (Sweet/Salt)',     productDescription: 'Thick, creamy homemade lassi blended with fresh yoghurt. Choose sweet or salted. The perfect cooling companion for your spicy momos.', productPrice: 120, productCategory: 'Drinks', productStatus: 'available', productQuantity: 60, productImage: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=500&h=375&fit=crop', restaurant: restaurantIds[2] },

  // ── Street Bites Patan (index 3) ─────────────────────────────────
  { productName: 'Kothey Buff Momo',       productDescription: 'Half-steamed, half-fried dumplings with a crispy bottom and soft top. Filled with seasoned buff — the best of both cooking methods.', productPrice: 230, productCategory: 'Kothey Momo', productStatus: 'available', productQuantity: 20, productImage: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b5?w=500&h=375&fit=crop', restaurant: restaurantIds[3] },
  { productName: 'Samosa (2 pcs)',          productDescription: 'Golden pastry parcels stuffed with spiced potato and peas. Crispy, flaky and served with mint and tamarind chutney.', productPrice: 80, productCategory: 'Snacks', productStatus: 'available', productQuantity: 60, productImage: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=500&h=375&fit=crop', restaurant: restaurantIds[3] },
  { productName: 'Cold Coffee',             productDescription: 'Rich blended coffee with milk and ice cream — thick, creamy and energising. Great with any snack on the go.', productPrice: 150, productCategory: 'Drinks', productStatus: 'available', productQuantity: 40, productImage: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&h=375&fit=crop', restaurant: restaurantIds[3] },

  // ── Newari Kitchen (index 4) ─────────────────────────────────────
  { productName: 'Chatamari',               productDescription: 'Newari rice crepe topped with minced meat, egg and spices. Known as the Newari pizza — crispy, thin and utterly delicious.', productPrice: 200, productCategory: 'Newari Special', productStatus: 'available', productQuantity: 25, productImage: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=375&fit=crop', restaurant: restaurantIds[4] },
  { productName: 'Bara',                    productDescription: 'Savoury Newari lentil pancake, crispy on the outside and soft inside. Served with spicy achar and fresh chutney. A cultural staple.', productPrice: 160, productCategory: 'Newari Special', productStatus: 'available', productQuantity: 30, productImage: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=375&fit=crop', restaurant: restaurantIds[4] },
  { productName: 'Sikarni',                 productDescription: 'Chilled sweetened yoghurt with saffron, cardamom and dry fruits. A rich, creamy Newari dessert with a lovely golden hue.', productPrice: 160, productCategory: 'Desserts', productStatus: 'available', productQuantity: 20, productImage: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&h=375&fit=crop', restaurant: restaurantIds[4] },

  // ── Momo Mania (index 5) ─────────────────────────────────────────
  { productName: 'Chicken Momo',            productDescription: 'Juicy minced chicken blended with fresh herbs, ginger and garlic, steamed in soft handmade wrappers. Light, flavourful and satisfying.', productPrice: 200, productCategory: 'Steamed Momo', productStatus: 'available', productQuantity: 45, productImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&h=375&fit=crop', restaurant: restaurantIds[5] },
  { productName: 'Masala C-Momo',           productDescription: 'Buff momos in a thick masala gravy with whole spices, sautéed onions and fresh coriander. Bold flavour, perfect for spice lovers.', productPrice: 280, productCategory: 'C-Momo', productStatus: 'available', productQuantity: 20, productImage: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&h=375&fit=crop', restaurant: restaurantIds[5] },
  { productName: 'Fried Chicken Momo',      productDescription: 'Chicken momos shallow-fried with aromatic herbs. Lighter than deep-fried with a beautiful golden crust and juicy filling.', productPrice: 240, productCategory: 'Fried Momo', productStatus: 'available', productQuantity: 25, productImage: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=500&h=375&fit=crop', restaurant: restaurantIds[5] },
  { productName: 'Mixed Momo Platter',      productDescription: 'The ultimate momo feast — 4 each of buff, chicken, veg and kothey. Perfect for sharing or when you simply cannot decide which to order.', productPrice: 450, productCategory: 'Steamed Momo', productStatus: 'available', productQuantity: 15, productImage: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500&h=375&fit=crop', restaurant: restaurantIds[5] },

  // ── Chiya Corner (index 6) ───────────────────────────────────────
  { productName: 'Classic Masala Tea',      productDescription: 'Our signature masala chai brewed with 7 spices, ginger and full-cream milk. Every cup is a warm hug in a mug.', productPrice: 60,  productCategory: 'Drinks', productStatus: 'available', productQuantity: 100, productImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&h=375&fit=crop', restaurant: restaurantIds[6] },
  { productName: 'Pakoda Platter',          productDescription: 'Assorted vegetable fritters — onion, spinach and potato — coated in spiced gram flour batter and fried until perfectly crispy.', productPrice: 120, productCategory: 'Snacks', productStatus: 'available', productQuantity: 40, productImage: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=375&fit=crop', restaurant: restaurantIds[6] },

  // ── Durbar Square Dine (index 7) ─────────────────────────────────
  { productName: 'Heritage Buff Sekuwa',    productDescription: 'Premium marinated buffalo skewers slow-cooked over aromatic wood fire. A signature dish inspired by centuries of Newar culinary tradition.', productPrice: 480, productCategory: 'Snacks', productStatus: 'unavailable', productQuantity: 0, productImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=375&fit=crop', restaurant: restaurantIds[7] },
  { productName: 'Royal Thali',             productDescription: 'A royal banquet on a single plate. Traditional multi-course meal with heritage recipes served in authentic Newari copper bowls.', productPrice: 650, productCategory: 'Nepali Thali', productStatus: 'unavailable', productQuantity: 0, productImage: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=375&fit=crop', restaurant: restaurantIds[7] },
]

const REVIEW_MESSAGES = [
  'Absolutely delicious! Arrived hot and fresh in 22 minutes. Will definitely order again.',
  'The jhol momo is a flavour explosion. MoMoGo is my go-to food app now!',
  'Great quality and super fast delivery. Very impressed!',
  'Authentic Nepali taste — reminds me of home. Love it.',
  'Crispy fried momo was perfect. Not greasy at all.',
  'Amazing value for money. The portion size is very generous.',
  'Fantastic app and even better food. 100% recommend.',
  'The chutney is absolutely incredible. Everything was perfect.',
  'Delivery was earlier than expected and food was still piping hot!',
  'My whole family enjoyed it. Will be a regular customer.',
  'The buff momo has the perfect seasoning — not too spicy, very tasty.',
  'Loved the C-Momo. The chilli sauce is to die for!',
  'Fresh ingredients, great packaging, quick delivery. 5 stars!',
  'Kothey momo is my new obsession. So unique and delicious.',
  'Excellent! The masala chai paired with momos is the perfect combo.',
]

async function seed() {
  try {
    console.log('🔌 Connecting to database...')
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected!\n')

    console.log('🗑️  Clearing existing data...')
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Review.deleteMany({}),
      Order.deleteMany({}),
      Restaurant.deleteMany({}),
    ])
    console.log('✅ Cleared!\n')

    // Users
    console.log('👥 Seeding users...')
    const users      = await User.insertMany(USERS)
    const customers  = users.filter(u => u.userRole === 'customer')
    console.log(`✅ ${users.length} users created\n`)

    // Restaurants
    console.log('Seeding restaurants...')
    const restaurants = await Restaurant.insertMany(RESTAURANTS)
    const rIds = restaurants.map(r => r._id)
    console.log(`${restaurants.length} restaurants created\n`)

    // Products
    console.log('Seeding products...')
    const products = await Product.insertMany(makeProducts(rIds))
    console.log(`${products.length} products created\n`)

    // Reviews
    console.log('⭐ Seeding reviews...')
    const reviewData = products.slice(0, 15).map((p, i) => ({
      userId:    customers[i % customers.length]._id,
      productId: p._id,
      rating:    Math.floor(Math.random() * 2) + 4,
      message:   REVIEW_MESSAGES[i % REVIEW_MESSAGES.length],
    }))
    const reviews = await Review.insertMany(reviewData)
    console.log(`✅ ${reviews.length} reviews created\n`)

    // Orders
    console.log('📦 Seeding orders...')
    const STATUSES   = ['pending','preparation','ontheway','delivered','delivered']
    const ADDRESSES  = ['Thamel, Kathmandu','Lazimpat, Kathmandu','Patan Dhoka, Lalitpur','Baneshwor, Kathmandu','Baluwatar, Kathmandu']
    const orderData  = []
    for (let i = 0; i < 10; i++) {
      const user  = customers[i % customers.length]
      const item1 = products[i % products.length]
      const item2 = products[(i + 5) % products.length]
      const total = item1.productPrice + item2.productPrice
      const st    = STATUSES[i % STATUSES.length]
      orderData.push({
        user:    user._id,
        items:   [{ product: item1._id, quantity: 1 }, { product: item2._id, quantity: 1 }],
        totalAmount:     total,
        shippingAddress: ADDRESSES[i % ADDRESSES.length],
        orderStatus:     st,
        paymentDetails:  { method: i % 2 === 0 ? 'COD' : 'khalti', status: st === 'delivered' ? 'paid' : 'unpaid' },
      })
    }
    const orders = await Order.insertMany(orderData)
    console.log(`✅ ${orders.length} orders created\n`)

    console.log('═══════════════════════════════════════════════')
    console.log('🎉 Database seeded successfully!')
    console.log('═══════════════════════════════════════════════')
    console.log(`👥 Users:       ${users.length}`)
    console.log(`🏪 Restaurants: ${restaurants.length}`)
    console.log(`🍜 Products:    ${products.length}`)
    console.log(`⭐ Reviews:     ${reviews.length}`)
    console.log(`📦 Orders:      ${orders.length}`)
    console.log('───────────────────────────────────────────────')
    console.log('🔑 Login:  admin@momogo.com / admin123')
    console.log('           aarav@test.com   / password123')
    console.log('═══════════════════════════════════════════════\n')

    process.exit(0)
  } catch (err) {
    console.error('❌ Seeder error:', err.message)
    process.exit(1)
  }
}

seed()
