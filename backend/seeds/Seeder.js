 
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

 
const User    = require("../models/userModel");
const Product = require("../models/productModel");
const Review  = require("../models/reviewModel");
const Order   = require("../models/orderSchema");

 

const USERS = [
  {
    userName: "Admin User",
    userEmail: "admin@momogo.com",
    userPhoneNumber: 9800000001,
    userPassword: bcrypt.hashSync("admin123", 10),
    userRole: "admin",
  },
  {
    userName: "Aarav Sharma",
    userEmail: "aarav@test.com",
    userPhoneNumber: 9841234567,
    userPassword: bcrypt.hashSync("password123", 10),
    userRole: "customer",
  },
  {
    userName: "Priya Thapa",
    userEmail: "priya@test.com",
    userPhoneNumber: 9807654321,
    userPassword: bcrypt.hashSync("password123", 10),
    userRole: "customer",
  },
  {
    userName: "Bikram Rai",
    userEmail: "bikram@test.com",
    userPhoneNumber: 9851122334,
    userPassword: bcrypt.hashSync("password123", 10),
    userRole: "customer",
  },
  {
    userName: "Sita Gurung",
    userEmail: "sita@test.com",
    userPhoneNumber: 9869988776,
    userPassword: bcrypt.hashSync("password123", 10),
    userRole: "customer",
  },
  {
    userName: "Rajan Magar",
    userEmail: "rajan@test.com",
    userPhoneNumber: 9823344556,
    userPassword: bcrypt.hashSync("password123", 10),
    userRole: "customer",
  },
];

const PRODUCTS = [
  // ── Steamed Momo ──────────────────────────────────────
  {
    productName: "Classic Buff Momo",
    productDescription: "Tender buffalo meat stuffed in thin dough, steamed to perfection. Served with our signature tomato-sesame chutney. A Nepali classic loved by all.",
    productPrice: 180,
    productCategory: "Steamed Momo",
    productStatus: "available",
    productQuantity: 50,
    productImage: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop",
  },
  {
    productName: "Chicken Momo",
    productDescription: "Juicy minced chicken blended with fresh herbs, ginger and garlic, steamed in soft handmade wrappers. Light and flavourful.",
    productPrice: 200,
    productCategory: "Steamed Momo",
    productStatus: "available",
    productQuantity: 45,
    productImage: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop",
  },
  {
    productName: "Veg Momo",
    productDescription: "Fresh seasonal vegetables, paneer and spices wrapped in soft dough and steamed. Perfect for vegetarians who want authentic momo flavour.",
    productPrice: 150,
    productCategory: "Steamed Momo",
    productStatus: "available",
    productQuantity: 40,
    productImage: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop",
  },
  {
    productName: "Pork Momo",
    productDescription: "Succulent minced pork with traditional Nepali spices. Our most popular seller — rich, juicy and deeply satisfying.",
    productPrice: 220,
    productCategory: "Steamed Momo",
    productStatus: "available",
    productQuantity: 35,
    productImage: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop",
  },

  // ── Fried Momo ────────────────────────────────────────
  {
    productName: "Crispy Fried Buff Momo",
    productDescription: "Our classic buff momos deep-fried to a golden crisp. Crunchy on the outside, melt-in-your-mouth inside. Best paired with spicy achar.",
    productPrice: 220,
    productCategory: "Fried Momo",
    productStatus: "available",
    productQuantity: 30,
    productImage: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=400&h=300&fit=crop",
  },
  {
    productName: "Fried Chicken Momo",
    productDescription: "Chicken momos shallow-fried with aromatic herbs. Lighter than deep-fried, with a beautiful golden crust and juicy filling.",
    productPrice: 240,
    productCategory: "Fried Momo",
    productStatus: "available",
    productQuantity: 25,
    productImage: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop",
  },

  // ── Jhol Momo ─────────────────────────────────────────
  {
    productName: "Spicy Jhol Momo",
    productDescription: "Steamed momos swimming in our famous fiery jhol (broth) made with tomatoes, sesame, timur and secret spices. A flavour explosion!",
    productPrice: 250,
    productCategory: "Jhol Momo",
    productStatus: "available",
    productQuantity: 30,
    productImage: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop",
  },
  {
    productName: "Mild Jhol Momo",
    productDescription: "Classic jhol momo for those who prefer a milder heat. Our rich broth is still packed with authentic Nepali flavours — just gentler.",
    productPrice: 250,
    productCategory: "Jhol Momo",
    productStatus: "available",
    productQuantity: 20,
    productImage: "https://images.unsplash.com/photo-1528712306091-ed0763094c98?w=400&h=300&fit=crop",
  },

  // ── C-Momo ────────────────────────────────────────────
  {
    productName: "C-Momo Special",
    productDescription: "Steamed momos tossed in our signature chilli sauce with bell peppers, onions and Szechuan spices. Sweet, tangy and spicy all at once.",
    productPrice: 260,
    productCategory: "C-Momo",
    productStatus: "available",
    productQuantity: 25,
    productImage: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&h=300&fit=crop",
  },
  {
    productName: "Masala C-Momo",
    productDescription: "Buff momos in a thick masala gravy with whole spices, sautéed onions and fresh coriander. Bold flavour, perfect for spice lovers.",
    productPrice: 280,
    productCategory: "C-Momo",
    productStatus: "available",
    productQuantity: 20,
    productImage: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop",
  },

  // ── Kothey Momo ───────────────────────────────────────
  {
    productName: "Kothey Buff Momo",
    productDescription: "Half-steamed, half-fried dumplings with a crispy bottom and soft top. Filled with seasoned buff — the best of both cooking methods.",
    productPrice: 230,
    productCategory: "Kothey Momo",
    productStatus: "available",
    productQuantity: 20,
    productImage: "https://images.unsplash.com/photo-1609501676725-7186f017a4b5?w=400&h=300&fit=crop",
  },

  // ── Drinks ────────────────────────────────────────────
  {
    productName: "Lassi (Sweet/Salt)",
    productDescription: "Thick, creamy homemade lassi blended with fresh yoghurt. Choose sweet or salted. The perfect cooling companion for your spicy momos.",
    productPrice: 120,
    productCategory: "Drinks",
    productStatus: "available",
    productQuantity: 60,
    productImage: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=300&fit=crop",
  },
  {
    productName: "Masala Chai",
    productDescription: "Traditional Nepali spiced tea brewed with ginger, cardamom, cinnamon and fresh milk. Warm, aromatic and comforting.",
    productPrice: 80,
    productCategory: "Drinks",
    productStatus: "available",
    productQuantity: 80,
    productImage: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop",
  },
  {
    productName: "Fresh Lime Soda",
    productDescription: "Refreshing lime soda with a hint of salt and sugar. The ideal drink to balance your flavourful momo feast.",
    productPrice: 90,
    productCategory: "Drinks",
    productStatus: "available",
    productQuantity: 70,
    productImage: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop",
  },
  {
    productName: "Cold Coffee",
    productDescription: "Rich blended coffee with milk and ice cream — thick, creamy and energising. Great with any snack.",
    productPrice: 150,
    productCategory: "Drinks",
    productStatus: "available",
    productQuantity: 40,
    productImage: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
  },

  // ── Snacks ────────────────────────────────────────────
  {
    productName: "Aloo Chop",
    productDescription: "Crispy potato fritters seasoned with Nepali spices and herbs. A street food staple — crunchy, spiced and absolutely addictive.",
    productPrice: 100,
    productCategory: "Snacks",
    productStatus: "available",
    productQuantity: 50,
    productImage: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
  },
  {
    productName: "Chicken Sekuwa",
    productDescription: "Marinated chicken skewers grilled over charcoal with traditional Nepali spices. Smoky, juicy and deeply flavourful.",
    productPrice: 280,
    productCategory: "Snacks",
    productStatus: "available",
    productQuantity: 25,
    productImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
  },
  {
    productName: "Samosa (2 pcs)",
    productDescription: "Golden pastry parcels stuffed with spiced potato and peas. Crispy, flaky and served with mint and tamarind chutney.",
    productPrice: 80,
    productCategory: "Snacks",
    productStatus: "available",
    productQuantity: 60,
    productImage: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&h=300&fit=crop",
  },

  // ── Desserts ──────────────────────────────────────────
  {
    productName: "Sel Roti with Honey",
    productDescription: "Traditional Nepali ring-shaped rice bread — crispy on the outside, soft inside. Drizzled with pure mountain honey. A festive favourite.",
    productPrice: 130,
    productCategory: "Desserts",
    productStatus: "available",
    productQuantity: 30,
    productImage: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop",
  },
  {
    productName: "Sikarni",
    productDescription: "Chilled sweetened yoghurt with saffron, cardamom and dry fruits. A rich, creamy Newari dessert with a lovely golden hue.",
    productPrice: 160,
    productCategory: "Desserts",
    productStatus: "unavailable",
    productQuantity: 0,
    productImage: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
  },
];

const REVIEW_MESSAGES = [
  "Absolutely delicious! Best momos I've had delivered. Arrived hot and fresh.",
  "The jhol momo is a flavour explosion. Will definitely order again!",
  "Great quality and super fast delivery. Very impressed!",
  "Authentic Nepali taste — reminds me of home. Love it.",
  "Crispy fried momo was perfect. Not greasy at all.",
  "Amazing value for money. The portion size is very generous.",
  "Fantastic app and even better food. 100% recommend.",
  "The chutney is absolutely incredible. Everything was perfect.",
  "Delivery was earlier than expected and food was still piping hot!",
  "My whole family enjoyed it. Will be a regular customer.",
  "The buff momo has the perfect seasoning — not too spicy, very tasty.",
  "Loved the C-Momo. The chilli sauce is to die for!",
  "Fresh ingredients, great packaging, quick delivery. 5 stars!",
  "Kothey momo is my new obsession. So unique and delicious.",
  "Excellent! The masala chai paired with momos is the perfect combo.",
];

// ── Seeder function ───────────────────────────────────────

async function seed() {
  try {
    console.log("🔌 Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected!\n");

    // ── Clear existing data ──
    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Review.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log("Cleared!\n");

    
    console.log("Seeding users...");
    const users = await User.insertMany(USERS);
    const admin    = users[0];
    const customers = users.slice(1);
    console.log(`Created ${users.length} users`);
    console.log(`   Admin:    ${admin.userEmail} / admin123`);
    customers.forEach(u => console.log(`   Customer: ${u.userEmail} / password123`));
    console.log();

    // ── Seed products ──
    console.log("Seeding products...");
    const products = await Product.insertMany(PRODUCTS);
    console.log(`Created ${products.length} products\n`);

    // ── Seed reviews ──
    console.log("Seeding reviews...");
    const reviewData = [];
    let msgIdx = 0;
    for (let i = 0; i < 15; i++) {
      const user    = customers[i % customers.length];
      const product = products[i % products.length];
      reviewData.push({
        userId:    user._id,
        productId: product._id,
        rating:    Math.floor(Math.random() * 2) + 4, // 4 or 5
        message:   REVIEW_MESSAGES[msgIdx++ % REVIEW_MESSAGES.length],
      });
    }
    const reviews = await Review.insertMany(reviewData);
    console.log(`Created ${reviews.length} reviews\n`);

    // ── Seed orders ──
    console.log("Seeding orders...");
    const STATUSES = ["pending", "preparation", "ontheway", "delivered", "delivered"];
    const ADDRESSES = [
      "Thamel, Kathmandu",
      "Lazimpat, Kathmandu",
      "Patan Dhoka, Lalitpur",
      "Baneshwor, Kathmandu",
      "Baluwatar, Kathmandu",
    ];
    const orderData = [];
    for (let i = 0; i < 10; i++) {
      const user = customers[i % customers.length];
      const item1 = products[i % products.length];
      const item2 = products[(i + 3) % products.length];
      const qty1 = Math.ceil(Math.random() * 2);
      const qty2 = Math.ceil(Math.random() * 2);
      const total = item1.productPrice * qty1 + item2.productPrice * qty2;

      orderData.push({
        user:    user._id,
        items: [
          { product: item1._id, quantity: qty1 },
          { product: item2._id, quantity: qty2 },
        ],
        totalAmount:     total,
        shippingAddress: ADDRESSES[i % ADDRESSES.length],
        orderStatus:     STATUSES[i % STATUSES.length],
        paymentDetails: {
          method: i % 2 === 0 ? "COD" : "khalti",
          status: STATUSES[i % STATUSES.length] === "delivered" ? "paid" : "unpaid",
        },
      });
    }
    const orders = await Order.insertMany(orderData);
    console.log(`Created ${orders.length} orders\n`);

    // ── Summary ──
    console.log("═══════════════════════════════════════════");
    console.log("Database seeded successfully!");
    console.log("═══════════════════════════════════════════");
    console.log(`👥 Users:    ${users.length} (1 admin + ${customers.length} customers)`);
    console.log(`🍜 Products: ${products.length}`);
    console.log(`⭐ Reviews:  ${reviews.length}`);
    console.log(`📦 Orders:   ${orders.length}`);
    console.log("───────────────────────────────────────────");
    console.log("🔑 Login credentials:");
    console.log("   Admin:    admin@momogo.com / admin123");
    console.log("   Customer: aarav@test.com   / password123");
    console.log("═══════════════════════════════════════════\n");

    process.exit(0);
  } catch (err) {
    console.error("Seeder error:", err.message);
    process.exit(1);
  }
}

seed();