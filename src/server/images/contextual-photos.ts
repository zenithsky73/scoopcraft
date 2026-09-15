/**
 * Contextual Photo Engine untuk InstaDeck PRO.
 * Menyediakan koleksi ratusan foto editorial resolusi tinggi (Unsplash HD CDN)
 * yang dicocokkan secara presisi berdasarkan topik konten dan peran spesifik per-slide.
 */

export const TOPIC_PHOTO_COLLECTION: Record<string, string[]> = {
  // ─── 1. KULINER SPESIFIK: RENDANG & DAGING PADANG ───
  RENDANG_PADANG: [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=1080&auto=format&fit=crop&q=80', // Spiced slow cooked meat beef ribs
    'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=1080&auto=format&fit=crop&q=80', // Rich beef curry stew
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1080&auto=format&fit=crop&q=80', // Delicious grilled spiced meat
    'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=1080&auto=format&fit=crop&q=80', // Braised rich spiced meat
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1080&auto=format&fit=crop&q=80', // Plated meat specialty
  ],

  // ─── 2. KULINER SPESIFIK: NASI GORENG & WOK NUSANTARA ───
  NASI_GORENG: [
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=1080&auto=format&fit=crop&q=80', // Asian wok street food fried rice
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1080&auto=format&fit=crop&q=80', // Delicious fried rice plate with egg
    'https://images.unsplash.com/photo-1603073163308-9655c607283b?w=1080&auto=format&fit=crop&q=80', // Wok stir fry rice dish
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1080&auto=format&fit=crop&q=80', // Fresh appetizing meal bowl
  ],

  // ─── 3. KULINER SPESIFIK: AYAM GORENG, GEPREK & SAMBAL ───
  AYAM_GORENG: [
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=1080&auto=format&fit=crop&q=80', // Crispy golden fried chicken
    'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=1080&auto=format&fit=crop&q=80', // Spicy grilled chicken feast
    'https://images.unsplash.com/photo-1527477321005-4d01d75ba29f?w=1080&auto=format&fit=crop&q=80', // Golden wings & drumsticks
    'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=1080&auto=format&fit=crop&q=80', // Crispy fried chicken bites
  ],

  // ─── 4. KULINER SPESIFIK: SATE AYAM & DAGING ───
  SATE_NUSANTARA: [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1080&auto=format&fit=crop&q=80', // Grilled skewers on charcoal
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1080&auto=format&fit=crop&q=80', // Satay skewers with peanut sauce
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=1080&auto=format&fit=crop&q=80', // Grilled meat skewers platter
  ],

  // ─── 5. KULINER SPESIFIK: BAKSO, MIE & SOTO ───
  BAKSO_MIE_SOTO: [
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1080&auto=format&fit=crop&q=80', // Asian noodle soup bowl
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1080&auto=format&fit=crop&q=80', // Steaming ramen noodles
    'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?w=1080&auto=format&fit=crop&q=80', // Hot broth noodle bowl
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=1080&auto=format&fit=crop&q=80', // Delicious Asian soup
  ],

  // ─── 6. KULINER SPESIFIK: MARTABAK, SEBLAK, PEMPEK & SNACK ───
  SNACK_TRADISIONAL: [
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1080&auto=format&fit=crop&q=80', // Sweet pancake dessert
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&auto=format&fit=crop&q=80', // Hot cooking pan street food
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1080&auto=format&fit=crop&q=80', // Spicy snack bowl
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1080&auto=format&fit=crop&q=80', // Crispy fried street snack
  ],

  // ─── 7. PROSES MASAK SPESIFIK: BAHAN & BUMBU MENTAH ───
  RAW_INGREDIENTS_SPICES: [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1080&auto=format&fit=crop&q=80', // Whole spices, chili, garlic, shallots on cutting board
    'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=1080&auto=format&fit=crop&q=80', // Fresh herbs, chili, garlic, spices bowls
    'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1080&auto=format&fit=crop&q=80', // Fresh raw garlic and red chilies
    'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=1080&auto=format&fit=crop&q=80', // Chopped fresh ingredients on rustic board
  ],

  // ─── 8. PROSES MASAK SPESIFIK: MENUMIS DI WAJAN (WOK & PAN) ───
  COOKING_WOK_PAN: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&auto=format&fit=crop&q=80', // Chef stir frying in hot wok with steam
    'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=1080&auto=format&fit=crop&q=80', // Sautéing spices in hot pan
    'https://images.unsplash.com/photo-1514944298352-78d11c0f4f03?w=1080&auto=format&fit=crop&q=80', // Stir frying vegetables & meat in pan
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1080&auto=format&fit=crop&q=80', // Fresh stir fry in wok with spatula
  ],

  // ─── 9. PROSES MASAK SPESIFIK: MEREBUS & MERESAP (SIMMERING POT) ───
  SIMMERING_STEW_POT: [
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=1080&auto=format&fit=crop&q=80', // Bubbling stew pot on stove
    'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=1080&auto=format&fit=crop&q=80', // Slow braised stew simmering
    'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=1080&auto=format&fit=crop&q=80', // Rich soup pot bubbling
  ],

  // ─── 10. PENYAJIAN & MEJA MAKAN (PLATED DINING TABLE) ───
  PLATED_DINING_TABLE: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&auto=format&fit=crop&q=80', // Gourmet dish beautifully presented on table
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1080&auto=format&fit=crop&q=80', // Plated meat dish with garnishes
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1080&auto=format&fit=crop&q=80', // Restaurant dining table feast
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=1080&auto=format&fit=crop&q=80', // Plated main course on wood
  ],

  // ─── 11. KULINER UMUM & RESTORAN ───
  KULINER: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&auto=format&fit=crop&q=80', // Gourmet meal plate
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&auto=format&fit=crop&q=80', // Chef cooking in kitchen
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1080&auto=format&fit=crop&q=80', // Artisan wood-fired pizza
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1080&auto=format&fit=crop&q=80', // Juicy gourmet burger
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1080&auto=format&fit=crop&q=80', // Pancakes with syrup & berries
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1080&auto=format&fit=crop&q=80', // Asian ramen noodles bowl
  ],

  // ─── 12. KOPI, LATTE & KAFE ───
  KOPI_CAFE: [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1080&auto=format&fit=crop&q=80', // Latte art coffee cup
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1080&auto=format&fit=crop&q=80', // Espresso machine extraction
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&auto=format&fit=crop&q=80', // Warm cafe table aesthetic
    'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=1080&auto=format&fit=crop&q=80', // Iced coffee glass
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1080&auto=format&fit=crop&q=80', // Fresh roasted coffee beans
  ],

  // ─── 13. MATCHA, TEH & BOBA ───
  MATCHA_TEA: [
    'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=1080&auto=format&fit=crop&q=80', // Whisking green matcha in bowl
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1080&auto=format&fit=crop&q=80', // Iced matcha latte glass
    'https://images.unsplash.com/photo-1558857563-b371f31ca704?w=1080&auto=format&fit=crop&q=80', // Bubble tea with boba pearls
    'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=1080&auto=format&fit=crop&q=80', // Fresh herbal tea cup
  ],

  // ─── 14. BAKERY, ROTI & DESSERT ───
  BAKERY_DESSERT: [
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1080&auto=format&fit=crop&q=80', // Golden flaky butter croissants
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1080&auto=format&fit=crop&q=80', // Sourdough artisan bread loaf
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1080&auto=format&fit=crop&q=80', // Chocolate cake slice
    'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=1080&auto=format&fit=crop&q=80', // Colorful French macarons
  ],

  // ─── 15. AI, TOOLS, SOFTWARE & AUTOMATION ───
  AI_TOOLS: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80', // Glowing digital neural network
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&auto=format&fit=crop&q=80', // Analytics software dashboard
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1080&auto=format&fit=crop&q=80', // Clean productive developer setup
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1080&auto=format&fit=crop&q=80', // High tech digital UI tools
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1080&auto=format&fit=crop&q=80', // Futuristic AI Robot
  ],

  // ─── 16. CODING, SOFTWARE DEV & IT ───
  CODING_DEV: [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1080&auto=format&fit=crop&q=80', // Matrix code & dark mode IDE
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1080&auto=format&fit=crop&q=80', // Software developer coding
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1080&auto=format&fit=crop&q=80', // Tech engineers coding team
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1080&auto=format&fit=crop&q=80', // Laptop displaying code
  ],

  // ─── 17. UI/UX DESIGN & CREATIVE GRAPHIC TOOLS ───
  DESIGN_UIUX: [
    'https://images.unsplash.com/photo-1581291518655-9523c932694b?w=1080&auto=format&fit=crop&q=80', // UI/UX design wireframes on laptop
    'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1080&auto=format&fit=crop&q=80', // Design sprint color palette
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1080&auto=format&fit=crop&q=80', // Digital designer tablet stylus
    'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=1080&auto=format&fit=crop&q=80', // Creative graphic design screen
  ],

  // ─── 18. DATA ANALYTICS & BI DASHBOARD ───
  DATA_ANALYTICS: [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&auto=format&fit=crop&q=80', // Data visualization dashboard
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1080&auto=format&fit=crop&q=80', // Business analytics growth charts
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1080&auto=format&fit=crop&q=80', // Analytics graph screen
  ],

  // ─── 19. WORKSPACE, MEJA KERJA & PRODUKTIVITAS ───
  WORKSPACE: [
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1080&auto=format&fit=crop&q=80', // Aesthetic clean desk with laptop
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1080&auto=format&fit=crop&q=80', // Modern productive office space
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1080&auto=format&fit=crop&q=80', // Journal coffee workspace
  ],

  // ─── 20. SKINCARE & BEAUTY CARE ───
  SKINCARE: [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1080&auto=format&fit=crop&q=80', // Amber serum dropper bottles
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1080&auto=format&fit=crop&q=80', // Organic cosmetic cream
    'https://images.unsplash.com/photo-1608248597359-5489f6d713c2?w=1080&auto=format&fit=crop&q=80', // Minimalist facial moisturizer
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1080&auto=format&fit=crop&q=80', // Aesthetic glowing skin portrait
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1080&auto=format&fit=crop&q=80', // Skincare product flatlay with flora
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1080&auto=format&fit=crop&q=80', // Makeup cosmetics palette
  ],

  // ─── 21. FASHION & OOTD ───
  FASHION: [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1080&auto=format&fit=crop&q=80', // Fashion model in modern outfit
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1080&auto=format&fit=crop&q=80', // Minimalist wardrobe rack
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1080&auto=format&fit=crop&q=80', // Luxury leather handbag
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1080&auto=format&fit=crop&q=80', // Modern aesthetic watch
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1080&auto=format&fit=crop&q=80', // High-fashion editorial look
  ],

  // ─── 22. SNEAKERS & SEPATU ───
  SNEAKERS: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1080&auto=format&fit=crop&q=80', // Nike red sneakers
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1080&auto=format&fit=crop&q=80', // Aesthetic white & pastel sneakers
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1080&auto=format&fit=crop&q=80', // Retro racing sneakers on feet
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1080&auto=format&fit=crop&q=80', // Modern trendy sneakers
  ],

  // ─── 23. FITNESS, GYM & WORKOUT ───
  FITNESS: [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1080&auto=format&fit=crop&q=80', // Gym workout dumbbells
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1080&auto=format&fit=crop&q=80', // Track athlete sprint
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1080&auto=format&fit=crop&q=80', // Yoga studio stretching
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1080&auto=format&fit=crop&q=80', // Crossfit fitness training
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=1080&auto=format&fit=crop&q=80', // Barbell deadlift workout
  ],

  // ─── 24. RUNNING, LARI & MARATHON ───
  RUNNING: [
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1080&auto=format&fit=crop&q=80', // Athlete sprinting on track
    'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1080&auto=format&fit=crop&q=80', // Runner on open asphalt road
    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1080&auto=format&fit=crop&q=80', // Morning run sunrise silhouette
  ],

  // ─── 25. DIET, NUTRISI & HEALTHY FOOD ───
  DIET_NUTRISI: [
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1080&auto=format&fit=crop&q=80', // Fresh healthy meal prep bowl
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1080&auto=format&fit=crop&q=80', // Vibrant green salad bowl
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1080&auto=format&fit=crop&q=80', // Fresh vegetables & fruit
  ],

  // ─── 26. BISNIS, STARTUP & MARKETING ───
  BISNIS: [
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080&auto=format&fit=crop&q=80', // Startup team collaborating at table
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1080&auto=format&fit=crop&q=80', // Business strategy analytics
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1080&auto=format&fit=crop&q=80', // Modern creative office workshop
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1080&auto=format&fit=crop&q=80', // Executive in business meeting
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1080&auto=format&fit=crop&q=80', // Business performance analytics
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080&auto=format&fit=crop&q=80', // Creative brainstorm session
  ],

  // ─── 27. SAHAM, TRADING & PASAR MODAL ───
  SAHAM_TRADING: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1080&auto=format&fit=crop&q=80', // Stock trading multiple monitors
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080&auto=format&fit=crop&q=80', // Green & red candlestick chart
    'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1080&auto=format&fit=crop&q=80', // Financial market ticker board
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1080&auto=format&fit=crop&q=80', // Financial growth analytics dashboard
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&auto=format&fit=crop&q=80', // Wall Street financial district towers
  ],

  // ─── 28. CRYPTO, BITCOIN & BLOCKCHAIN ───
  CRYPTO: [
    'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=1080&auto=format&fit=crop&q=80', // Golden Bitcoin physical coin macro
    'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=1080&auto=format&fit=crop&q=80', // Ethereum crypto dashboard
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1080&auto=format&fit=crop&q=80', // 3D Blockchain decentralized network
    'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=1080&auto=format&fit=crop&q=80', // Bitcoin on crypto hardware wallet
    'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1080&auto=format&fit=crop&q=80', // Floating 3D cryptocurrency coins
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080&auto=format&fit=crop&q=80', // Crypto candlestick trading chart
  ],

  // ─── 29. KEUANGAN PRIBADI & TABUNGAN ───
  KEUANGAN_PRIBADI: [
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1080&auto=format&fit=crop&q=80', // Piggy bank savings
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1080&auto=format&fit=crop&q=80', // Calculating budget financial planning
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1080&auto=format&fit=crop&q=80', // Wallet with cash & credit card
  ],

  // ─── 30. E-COMMERCE, TOKO ONLINE & PACKING ───
  ECOMMERCE: [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1080&auto=format&fit=crop&q=80', // Warehouse logistics packing boxes
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1080&auto=format&fit=crop&q=80', // Skincare product
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1080&auto=format&fit=crop&q=80', // Shoes sneakers
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1080&auto=format&fit=crop&q=80', // Modern watch
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1080&auto=format&fit=crop&q=80', // Audio headphones
  ],

  // ─── 31. MOTIVASI, MINDSET & SELF IMPROVEMENT ───
  MOTIVASI: [
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1080&auto=format&fit=crop&q=80', // Morning workspace desk journal
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&auto=format&fit=crop&q=80', // Mountain summit sunrise view
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1080&auto=format&fit=crop&q=80', // Goal planner writing
    'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1080&auto=format&fit=crop&q=80', // Celebrating success atop mountain
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1080&auto=format&fit=crop&q=80', // Inspiring stack of books
  ],

  // ─── 32. TRAVEL, WISATA & LIBURAN ───
  TRAVEL: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80', // Turquoise beach tropical sea
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1080&auto=format&fit=crop&q=80', // Airplane wing over golden clouds
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1080&auto=format&fit=crop&q=80', // European vacation scenery
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1080&auto=format&fit=crop&q=80', // Road trip adventure van
  ],

  // ─── 33. PROPERTI, RUMAH & ARSITEKTUR ───
  PROPERTY: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080&auto=format&fit=crop&q=80', // Luxury modern villa architecture
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1080&auto=format&fit=crop&q=80', // Aesthetic living room interior
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1080&auto=format&fit=crop&q=80', // Minimalist sunny bedroom
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1080&auto=format&fit=crop&q=80', // Real estate house keys
  ],

  // ─── 34. GAMING & ESPORTS ───
  GAMING: [
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1080&auto=format&fit=crop&q=80', // RGB mechanical gaming setup
    'https://images.unsplash.com/photo-1612287233201-925203362a26?w=1080&auto=format&fit=crop&q=80', // Wireless gaming controller
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1080&auto=format&fit=crop&q=80', // Cyberpunk esports arena
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&auto=format&fit=crop&q=80', // Retro gaming console
  ],

  // ─── 35. PARENTING, BAYI & KELUARGA ───
  PARENTING: [
    'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1080&auto=format&fit=crop&q=80', // Cute smiling baby
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1080&auto=format&fit=crop&q=80', // Mother holding baby lovingly
    'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1080&auto=format&fit=crop&q=80', // Kids playing wooden toys
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1080&auto=format&fit=crop&q=80', // Family walking together outdoors
  ],

  // ─── 36. SMARTPHONE & GADGET MOBILE ───
  SMARTPHONE: [
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1080&auto=format&fit=crop&q=80', // Modern smartphone camera module
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1080&auto=format&fit=crop&q=80', // Sleek smartphone screen
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1080&auto=format&fit=crop&q=80', // Hand holding smartphone
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=1080&auto=format&fit=crop&q=80', // Minimalist flagship phone
  ],

  // ─── 37. KAMERA, LENSA & FOTOGRAFI ───
  KAMERA: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1080&auto=format&fit=crop&q=80', // Pro camera lens
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1080&auto=format&fit=crop&q=80', // Camera sensor & optics
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1080&auto=format&fit=crop&q=80', // Camera lens aperture
    'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?w=1080&auto=format&fit=crop&q=80', // Optical zoom equipment
  ],

  // ─── 38. OTOMOTIF & KENDARAAN (EV / MOTOR / MOBIL) ───
  OTOMOTIF_EV: [
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1080&auto=format&fit=crop&q=80', // EV car charging station
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1080&auto=format&fit=crop&q=80', // Electric motorcycle bike
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1080&auto=format&fit=crop&q=80', // Sports car speed
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1080&auto=format&fit=crop&q=80', // Modern scooter
  ],

  // ─── 39. PENDIDIKAN, KULIAH & TIPS BELAJAR ───
  PENDIDIKAN: [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1080&auto=format&fit=crop&q=80', // Students discussion
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1080&auto=format&fit=crop&q=80', // Campus library
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1080&auto=format&fit=crop&q=80', // Book stack research
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1080&auto=format&fit=crop&q=80', // Open book reading
  ],

  // ─── 40. HEWAN PELIHARAAN (KUCING & ANJING) ───
  PETS: [
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1080&auto=format&fit=crop&q=80', // Cute cat portrait
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1080&auto=format&fit=crop&q=80', // Playful golden retriever dog
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1080&auto=format&fit=crop&q=80', // Fluffy kitten
  ],

  // ─── 41. GENERAL / BRAND / BERITA ───
  BERITA: [
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1080&auto=format&fit=crop&q=80', // Newspaper headlines
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1080&auto=format&fit=crop&q=80', // Live journalism broadcast
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080&auto=format&fit=crop&q=80', // Global communication
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080&auto=format&fit=crop&q=80', // Creative office
  ],
};

/**
 * Mendeteksi kategori yang paling spesifik dan presisi berdasarkan kata kunci teks dan photoKeyword.
 */
export function detectCategoryFromText(text: string): string {
  const t = text.toLowerCase();

  // 1. KULINER SPESIFIK
  if (t.includes('rendang') || t.includes('padang') || t.includes('dendeng') || t.includes('gulai') || t.includes('daging sapi') || t.includes('kalio')) {
    return 'RENDANG_PADANG';
  }
  if (t.includes('nasi goreng') || t.includes('fried rice') || t.includes('nasi uduk') || t.includes('nasi bakar') || t.includes('nasi liwet') || t.includes('nasi kuning')) {
    return 'NASI_GORENG';
  }
  if (t.includes('ayam goreng') || t.includes('ayam bakar') || t.includes('ayam geprek') || t.includes('ayam crispy') || t.includes('ayam penyet') || t.includes('sambal') || t.includes('bebek')) {
    return 'AYAM_GORENG';
  }
  if (t.includes('sate') || t.includes('satay') || t.includes('bumbu kacang') || t.includes('tusuk sate')) {
    return 'SATE_NUSANTARA';
  }
  if (t.includes('bakso') || t.includes('mie ayam') || t.includes('mie') || t.includes('soto') || t.includes('ramen') || t.includes('sop') || t.includes('sup')) {
    return 'BAKSO_MIE_SOTO';
  }
  if (t.includes('martabak') || t.includes('terang bulan') || t.includes('seblak') || t.includes('pempek') || t.includes('cireng') || t.includes('cilok') || t.includes('jajanan') || t.includes('snack')) {
    return 'SNACK_TRADISIONAL';
  }
  if (t.includes('kopi') || t.includes('coffee') || t.includes('espresso') || t.includes('latte') || t.includes('cappuccino') || t.includes('cafe') || t.includes('kafe') || t.includes('barista')) {
    return 'KOPI_CAFE';
  }
  if (t.includes('matcha') || t.includes('boba') || t.includes('bubble tea') || t.includes('teh') || t.includes('milk tea') || t.includes('minuman')) {
    return 'MATCHA_TEA';
  }
  if (t.includes('croissant') || t.includes('roti') || t.includes('bakery') || t.includes('kue') || t.includes('cake') || t.includes('pastry') || t.includes('macaron') || t.includes('baking') || t.includes('dessert')) {
    return 'BAKERY_DESSERT';
  }
  if (t.includes('kuliner') || t.includes('makanan') || t.includes('resep') || t.includes('masak') || t.includes('resto') || t.includes('restoran') || t.includes('dapur') || t.includes('food') || t.includes('dish')) {
    return 'KULINER';
  }

  // 2. CRYPTO, BITCOIN, WEB3
  if (t.includes('crypto') || t.includes('kripto') || t.includes('bitcoin') || t.includes('btc') || t.includes('ethereum') || t.includes('eth') || t.includes('solana') || t.includes('blockchain') || t.includes('web3') || t.includes('token') || t.includes('airdrop') || t.includes('altcoin')) {
    return 'CRYPTO';
  }

  // 3. SAHAM, TRADING & PASAR MODAL
  if (t.includes('saham') || t.includes('ihsg') || t.includes('deviden') || t.includes('dividen') || t.includes('emiten') || t.includes('reksadana') || t.includes('pasar modal') || t.includes('idx') || t.includes('scalping') || t.includes('forex') || t.includes('candlestick')) {
    return 'SAHAM_TRADING';
  }

  // 4. KEUANGAN PRIBADI
  if (t.includes('menabung') || t.includes('budgeting') || t.includes('keuangan') || t.includes('dana darurat') || t.includes('gaji') || t.includes('finansial') || t.includes('pengeluaran')) {
    return 'KEUANGAN_PRIBADI';
  }

  // 5. SKINCARE & BEAUTY
  if (t.includes('skincare') || t.includes('serum') || t.includes('moisturizer') || t.includes('sunscreen') || t.includes('jerawat') || t.includes('glowing') || t.includes('retinol') || t.includes('niacinamide') || t.includes('kulit') || t.includes('cleanser') || t.includes('toner') || t.includes('makeup') || t.includes('lipstik') || t.includes('beauty') || t.includes('kosmetik')) {
    return 'SKINCARE';
  }

  // 6. SNEAKERS & SEPATU
  if (t.includes('sneaker') || t.includes('sepatu') || t.includes('puma') || t.includes('nike') || t.includes('adidas') || t.includes('jordan') || t.includes('speedcat') || t.includes('sambas') || t.includes('vans')) {
    return 'SNEAKERS';
  }

  // 7. FASHION & OOTD
  if (t.includes('fashion') || t.includes('baju') || t.includes('outfit') || t.includes('ootd') || t.includes('pakaian') || t.includes('celana') || t.includes('hoodie') || t.includes('dress') || t.includes('hijab') || t.includes('tas') || t.includes('styling') || t.includes('streetwear')) {
    return 'FASHION';
  }

  // 8. FITNESS, GYM & WORKOUT
  if (t.includes('fitness') || t.includes('gym') || t.includes('workout') || t.includes('otot') || t.includes('angkat beban') || t.includes('bench press') || t.includes('deadlift') || t.includes('barbell') || t.includes('dumbbell') || t.includes('olahraga')) {
    return 'FITNESS';
  }
  if (t.includes('lari') || t.includes('running') || t.includes('marathon') || t.includes('pace') || t.includes('jogging')) {
    return 'RUNNING';
  }
  if (t.includes('diet') || t.includes('kalori') || t.includes('fat loss') || t.includes('protein') || t.includes('nutrisi') || t.includes('meal prep') || t.includes('defisit')) {
    return 'DIET_NUTRISI';
  }

  // 9. CODING & SOFTWARE DEV
  if (t.includes('coding') || t.includes('programmer') || t.includes('software') || t.includes('javascript') || t.includes('python') || t.includes('react') || t.includes('developer') || t.includes('github') || t.includes('html') || t.includes('css') || t.includes('api') || t.includes('backend') || t.includes('frontend')) {
    return 'CODING_DEV';
  }

  // 10. UI/UX DESIGN & TOOLS KREATIF
  if (t.includes('ui/ux') || t.includes('figma') || t.includes('desain grafis') || t.includes('wireframe') || t.includes('canva') || t.includes('photoshop') || t.includes('illustrator') || t.includes('vector') || t.includes('desain')) {
    return 'DESIGN_UIUX';
  }

  // 11. DATA ANALYTICS
  if (t.includes('data analytics') || t.includes('dashboard') || t.includes('tableau') || t.includes('power bi') || t.includes('excel') || t.includes('spreadsheet') || t.includes('visualisasi data') || t.includes('metrik')) {
    return 'DATA_ANALYTICS';
  }

  // 12. AI TOOLS & SOFTWARE TECH
  if (t.includes('tools ai') || t.includes('ai tools') || t.includes('ai') || t.includes('chatgpt') || t.includes('gemini') || t.includes('claude') || t.includes('midjourney') || t.includes('cursor') || t.includes('otomasi') || t.includes('aplikasi') || t.includes('tools') || t.includes('tool')) {
    return 'AI_TOOLS';
  }

  // 13. SMARTPHONE, KAMERA & GADGET
  if (t.includes('kamera') || t.includes('lens') || t.includes('megapiksel') || t.includes('zoom optis') || t.includes('mirrorless') || t.includes('dslr') || t.includes('fotografi')) {
    return 'KAMERA';
  }
  if (t.includes('hp') || t.includes('smartphone') || t.includes('iphone') || t.includes('galaxy') || t.includes('xiaomi') || t.includes('oppo') || t.includes('vivo') || t.includes('gadget') || t.includes('ponsel') || t.includes('android')) {
    return 'SMARTPHONE';
  }

  // 14. BISNIS & STARTUP
  if (t.includes('bisnis') || t.includes('startup') || t.includes('wirausaha') || t.includes('omset') || t.includes('penjualan') || t.includes('closing') || t.includes('marketing') || t.includes('sales') || t.includes('b2b') || t.includes('b2c') || t.includes('scale up') || t.includes('umkm')) {
    return 'BISNIS';
  }

  // 15. E-COMMERCE & SHOPEE
  if (t.includes('shopee') || t.includes('tokopedia') || t.includes('affiliate') || t.includes('racun') || t.includes('diskon') || t.includes('promo') || t.includes('voucher') || t.includes('olshop') || t.includes('jual')) {
    return 'ECOMMERCE';
  }

  // 16. MOTIVASI & MINDSET
  if (t.includes('motivasi') || t.includes('mindset') || t.includes('self improvement') || t.includes('produktivitas') || t.includes('kebiasaan') || t.includes('habit') || t.includes('sukses') || t.includes('disiplin') || t.includes('overthinking') || t.includes('mental health') || t.includes('psikologi')) {
    return 'MOTIVASI';
  }

  // 17. TRAVEL & WISATA
  if (t.includes('travel') || t.includes('liburan') || t.includes('wisata') || t.includes('trip') || t.includes('pantai') || t.includes('hotel') || t.includes('villa') || t.includes('gunung') || t.includes('bali') || t.includes('destinasi')) {
    return 'TRAVEL';
  }

  // 18. PROPERTI & RUMAH
  if (t.includes('properti') || t.includes('rumah') || t.includes('perumahan') || t.includes('real estate') || t.includes('apartemen') || t.includes('interior') || t.includes('arsitektur') || t.includes('dekorasi')) {
    return 'PROPERTY';
  }

  // 19. GAMING
  if (t.includes('game') || t.includes('gaming') || t.includes('esports') || t.includes('ps5') || t.includes('playstation') || t.includes('steam') || t.includes('mobile legends') || t.includes('pubg') || t.includes('valorant')) {
    return 'GAMING';
  }

  // 20. PARENTING
  if (t.includes('parenting') || t.includes('anak') || t.includes('bayi') || t.includes('balita') || t.includes('ibu') || t.includes('ayah') || t.includes('mpasi') || t.includes('pola asuh') || t.includes('keluarga')) {
    return 'PARENTING';
  }

  // 21. HEWAN PELIHARAAN
  if (t.includes('kucing') || t.includes('anjing') || t.includes('cat') || t.includes('dog') || t.includes('pet') || t.includes('hewan') || t.includes('puppy') || t.includes('kitten')) {
    return 'PETS';
  }

  // 22. OTOMOTIF & EV
  if (t.includes('mobil') || t.includes('motor') || t.includes('otomotif') || t.includes('kendaraan') || t.includes('ev') || t.includes('tesla') || t.includes('byd') || t.includes('wuling') || t.includes('gesits')) {
    return 'OTOMOTIF_EV';
  }

  // 23. PENDIDIKAN & TIPS
  if (t.includes('kampus') || t.includes('kuliah') || t.includes('mahasiswa') || t.includes('sekolah') || t.includes('belajar') || t.includes('pendidikan') || t.includes('skripsi') || t.includes('tips') || t.includes('tutorial')) {
    return 'PENDIDIKAN';
  }

  return 'BERITA';
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Mengambil foto editorial yang relevan untuk setiap slide secara dinamis, presisi & kontekstual.
 * Mendukung deteksi peran slide (Cover, Bahan, Tumis, Masak, Penyajian, Tools, Workout, dll).
 */
export function getContextualPhotoForSlide(
  category: string | undefined,
  slideIndex: number,
  slideText?: string,
  articleImageUrl?: string | null,
  photoKeyword?: string,
): string {
  // 1. Slide 0 (Cover): Jika ada gambar asli dari URL artikel / produk marketplace, utamakan gambar asli
  if (slideIndex === 0 && articleImageUrl) {
    return articleImageUrl;
  }

  const combinedText = `${photoKeyword || ''} ${slideText || ''} ${category || ''}`.toLowerCase();
  const isCulinary = /resep|masak|cook|makanan|kuliner|rendang|nasi|ayam|sate|bakso|soto|martabak|seblak|pempek|bumbu|dapur|chef|dish|food/i.test(combinedText);

  // 2. Deteksi peran slide kontekstual untuk Resep / Kuliner:
  if (isCulinary) {
    if (slideIndex === 1 || /bahan|bumbu|ingredients|spices|raw|shallot|garlic|chili|takaran|rempah/i.test(combinedText)) {
      const rawPool = TOPIC_PHOTO_COLLECTION.RAW_INGREDIENTS_SPICES;
      return rawPool[hashString(combinedText + slideIndex) % rawPool.length];
    }
    if (slideIndex === 2 || /tumis|wok|stir fry|panas|wajan|saute|pan|minyak|wangi/i.test(combinedText)) {
      const wokPool = TOPIC_PHOTO_COLLECTION.COOKING_WOK_PAN;
      return wokPool[hashString(combinedText + slideIndex) % wokPool.length];
    }
    if (slideIndex === 3 || /rebus|simmer|ungkep|kuah|meresap|slow cook|mendidih|pot|api kecil/i.test(combinedText)) {
      const simPool = TOPIC_PHOTO_COLLECTION.SIMMERING_STEW_POT;
      return simPool[hashString(combinedText + slideIndex) % simPool.length];
    }
    if (slideIndex >= 4 || /saji|plating|hidang|santap|meja makan|plate|nasi hangat|nikmati/i.test(combinedText)) {
      const platePool = TOPIC_PHOTO_COLLECTION.PLATED_DINING_TABLE;
      return platePool[hashString(combinedText + slideIndex) % platePool.length];
    }
  }

  // 3. Deteksi kategori spesifik dari teks slide & topik
  const detectedCategory = detectCategoryFromText(combinedText);
  const pool = TOPIC_PHOTO_COLLECTION[detectedCategory] || TOPIC_PHOTO_COLLECTION.BERITA;

  // Hash teks topik agar topik berbeda selalu mendapatkan foto berbeda
  const hashOffset = hashString(combinedText);
  const photoIndex = (hashOffset + slideIndex) % pool.length;

  return pool[photoIndex] || pool[0];
}
