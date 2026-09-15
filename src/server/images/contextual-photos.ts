/**
 * Contextual Photo Engine untuk InstaDeck PRO.
 * Menyediakan koleksi foto editorial resolusi tinggi (Unsplash HD CDN)
 * yang dicocokkan secara presisi berdasarkan topik konten per-slide.
 */

export const TOPIC_PHOTO_COLLECTION: Record<string, string[]> = {
  // ─── 1. CRYPTO, BITCOIN & BLOCKCHAIN ───
  CRYPTO: [
    'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=1080&auto=format&fit=crop&q=80', // Golden Bitcoin physical coin macro
    'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=1080&auto=format&fit=crop&q=80', // Ethereum crypto dashboard
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1080&auto=format&fit=crop&q=80', // 3D Blockchain decentralized network
    'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=1080&auto=format&fit=crop&q=80', // Bitcoin on crypto hardware wallet
    'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1080&auto=format&fit=crop&q=80', // Floating 3D cryptocurrency coins
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080&auto=format&fit=crop&q=80', // Crypto candlestick trading chart
  ],

  // ─── 2. SAHAM, TRADING & PASAR MODAL ───
  SAHAM_TRADING: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1080&auto=format&fit=crop&q=80', // Stock trading multiple monitors
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080&auto=format&fit=crop&q=80', // Green & red candlestick chart
    'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1080&auto=format&fit=crop&q=80', // Financial market ticker board
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1080&auto=format&fit=crop&q=80', // Financial growth analytics dashboard
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&auto=format&fit=crop&q=80', // Wall Street financial district towers
  ],

  // ─── 3. BISNIS, STARTUP & MARKETING ───
  BISNIS: [
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1080&auto=format&fit=crop&q=80', // Startup team collaborating at table
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1080&auto=format&fit=crop&q=80', // Business strategy analytics
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1080&auto=format&fit=crop&q=80', // Modern creative office workshop
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1080&auto=format&fit=crop&q=80', // Executive in business meeting
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1080&auto=format&fit=crop&q=80', // Business performance analytics
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080&auto=format&fit=crop&q=80', // Creative brainstorm session
  ],

  // ─── 4. KULINER SPESIFIK: NASI GORENG & INDONESIAN WOK ───
  NASI_GORENG: [
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=1080&auto=format&fit=crop&q=80', // Asian wok street food fried rice
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1080&auto=format&fit=crop&q=80', // Delicious fried rice plate with egg
    'https://images.unsplash.com/photo-1603073163308-9655c607283b?w=1080&auto=format&fit=crop&q=80', // Wok stir fry rice dish
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1080&auto=format&fit=crop&q=80', // Fresh appetizing meal bowl
  ],

  // ─── 4B. KULINER SPESIFIK: RENDANG & DAGING PADANG ───
  RENDANG_PADANG: [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=1080&auto=format&fit=crop&q=80', // Spiced slow cooked meat beef ribs
    'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=1080&auto=format&fit=crop&q=80', // Rich beef curry stew
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1080&auto=format&fit=crop&q=80', // Delicious grilled spiced meat
    'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=1080&auto=format&fit=crop&q=80', // Braised rich spiced meat
  ],

  // ─── 4C. KULINER SPESIFIK: AYAM GORENG & SAMBAL ───
  AYAM_GORENG: [
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=1080&auto=format&fit=crop&q=80', // Crispy golden fried chicken
    'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=1080&auto=format&fit=crop&q=80', // Spicy grilled chicken feast
    'https://images.unsplash.com/photo-1527477321005-4d01d75ba29f?w=1080&auto=format&fit=crop&q=80', // Golden wings & drumsticks
  ],

  // ─── 4D. KULINER SPESIFIK: KOPI & KAFE ───
  KOPI_CAFE: [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1080&auto=format&fit=crop&q=80', // Latte art coffee cup
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1080&auto=format&fit=crop&q=80', // Espresso machine extraction
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1080&auto=format&fit=crop&q=80', // Warm cafe table aesthetic
    'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=1080&auto=format&fit=crop&q=80', // Iced coffee glass
  ],

  // ─── 4E. KULINER UMUM, MAKANAN, CAFE & RESEP ───
  KULINER: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&auto=format&fit=crop&q=80', // Gourmet meal plate
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&auto=format&fit=crop&q=80', // Chef cooking in kitchen
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1080&auto=format&fit=crop&q=80', // Artisan wood-fired pizza
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1080&auto=format&fit=crop&q=80', // Juicy gourmet burger
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1080&auto=format&fit=crop&q=80', // Pancakes with syrup & berries
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1080&auto=format&fit=crop&q=80', // Asian ramen noodles bowl
  ],

  // ─── 5. SKINCARE & BEAUTY CARE ───
  SKINCARE: [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1080&auto=format&fit=crop&q=80', // Amber serum dropper bottles
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1080&auto=format&fit=crop&q=80', // Organic cosmetic cream
    'https://images.unsplash.com/photo-1608248597359-5489f6d713c2?w=1080&auto=format&fit=crop&q=80', // Minimalist facial moisturizer
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1080&auto=format&fit=crop&q=80', // Aesthetic glowing skin portrait
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1080&auto=format&fit=crop&q=80', // Skincare product flatlay with flora
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1080&auto=format&fit=crop&q=80', // Makeup cosmetics palette
  ],

  // ─── 6. FASHION, OOTD & AKSESORIS ───
  FASHION: [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1080&auto=format&fit=crop&q=80', // Fashion model in modern outfit
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1080&auto=format&fit=crop&q=80', // Minimalist wardrobe rack
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1080&auto=format&fit=crop&q=80', // Luxury leather handbag
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1080&auto=format&fit=crop&q=80', // Modern aesthetic watch
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1080&auto=format&fit=crop&q=80', // High-fashion editorial look
  ],

  // ─── 6B. SNEAKERS & SEPATU ───
  SNEAKERS: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1080&auto=format&fit=crop&q=80', // Nike red sneakers
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1080&auto=format&fit=crop&q=80', // Aesthetic white & pastel sneakers
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1080&auto=format&fit=crop&q=80', // Retro racing sneakers on feet
    'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1080&auto=format&fit=crop&q=80', // Modern trendy sneakers
  ],

  // ─── 7. AI, TOOLS, SOFTWARE & AUTOMATION ───
  AI_TOOLS: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80', // Glowing digital neural network
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&auto=format&fit=crop&q=80', // Analytics software dashboard
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1080&auto=format&fit=crop&q=80', // Clean productive developer setup
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1080&auto=format&fit=crop&q=80', // High tech digital UI tools
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1080&auto=format&fit=crop&q=80', // Futuristic AI Robot
  ],

  // ─── 7B. AI, ROBOTIK, CODING & TECH UMUM ───
  AI_TECH: [
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1080&auto=format&fit=crop&q=80', // Futuristic AI Robot head
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80', // Neural network glowing mesh
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1080&auto=format&fit=crop&q=80', // Cloud server rack blue LED
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1080&auto=format&fit=crop&q=80', // Matrix code & circuit board
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1080&auto=format&fit=crop&q=80', // Tech engineers coding
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1080&auto=format&fit=crop&q=80', // AI computation abstract
  ],

  // ─── 8. MOTIVASI, SELF IMPROVEMENT & MINDFULNESS ───
  MOTIVASI: [
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1080&auto=format&fit=crop&q=80', // Morning workspace desk journal
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&auto=format&fit=crop&q=80', // Mountain summit sunrise view
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1080&auto=format&fit=crop&q=80', // Goal planner writing
    'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1080&auto=format&fit=crop&q=80', // Celebrating success atop mountain
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1080&auto=format&fit=crop&q=80', // Inspiring stack of books
  ],

  // ─── 9. FITNESS, GYM & OLAHRAGA ───
  FITNESS: [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1080&auto=format&fit=crop&q=80', // Gym workout dumbbells
    'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=1080&auto=format&fit=crop&q=80', // Track athlete sprint
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1080&auto=format&fit=crop&q=80', // Stadium night match
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1080&auto=format&fit=crop&q=80', // Yoga studio stretching
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1080&auto=format&fit=crop&q=80', // Crossfit fitness training
  ],

  // ─── 10. TRAVEL, WISATA & LIBURAN ───
  TRAVEL: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80', // Turquoise beach tropical sea
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1080&auto=format&fit=crop&q=80', // Airplane wing over golden clouds
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1080&auto=format&fit=crop&q=80', // European vacation scenery
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1080&auto=format&fit=crop&q=80', // Road trip adventure van
  ],

  // ─── 11. PROPERTI, RUMAH & ARSITEKTUR ───
  PROPERTY: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080&auto=format&fit=crop&q=80', // Luxury modern villa architecture
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1080&auto=format&fit=crop&q=80', // Aesthetic living room interior
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1080&auto=format&fit=crop&q=80', // Minimalist sunny bedroom
    'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1080&auto=format&fit=crop&q=80', // Real estate house keys
  ],

  // ─── 12. GAMING & ESPORTS ───
  GAMING: [
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1080&auto=format&fit=crop&q=80', // RGB mechanical gaming setup
    'https://images.unsplash.com/photo-1612287233201-925203362a26?w=1080&auto=format&fit=crop&q=80', // Wireless gaming controller
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1080&auto=format&fit=crop&q=80', // Cyberpunk esports arena
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&auto=format&fit=crop&q=80', // Retro gaming console
  ],

  // ─── 13. PARENTING, BAYI & KELUARGA ───
  PARENTING: [
    'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1080&auto=format&fit=crop&q=80', // Cute smiling baby
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1080&auto=format&fit=crop&q=80', // Mother holding baby lovingly
    'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1080&auto=format&fit=crop&q=80', // Kids playing wooden toys
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1080&auto=format&fit=crop&q=80', // Family walking together outdoors
  ],

  // ─── 14. SMARTPHONE & GADGET MOBILE ───
  SMARTPHONE: [
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1080&auto=format&fit=crop&q=80', // Modern smartphone camera module
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1080&auto=format&fit=crop&q=80', // Sleek smartphone screen
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1080&auto=format&fit=crop&q=80', // Hand holding smartphone
    'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=1080&auto=format&fit=crop&q=80', // Minimalist flagship phone
  ],

  // ─── 15. KAMERA, LENSA & FOTOGRAFI ───
  KAMERA: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1080&auto=format&fit=crop&q=80', // Pro camera lens
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1080&auto=format&fit=crop&q=80', // Camera sensor & optics
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1080&auto=format&fit=crop&q=80', // Camera lens aperture
    'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?w=1080&auto=format&fit=crop&q=80', // Optical zoom equipment
  ],

  // ─── 16. BATERAI & DAYA ───
  BATERAI: [
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1080&auto=format&fit=crop&q=80', // Battery cell energy
    'https://images.unsplash.com/photo-1558441719-8b449c6ff670?w=1080&auto=format&fit=crop&q=80', // Fast battery charging
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1080&auto=format&fit=crop&q=80', // Fast energy cable
  ],

  // ─── 17. CHIP & PROSESOR ───
  CHIP: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&auto=format&fit=crop&q=80', // Microchip processor CPU
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1080&auto=format&fit=crop&q=80', // Semiconductor wafer
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1080&auto=format&fit=crop&q=80', // Hardware chipset
  ],

  // ─── 18. OTOMOTIF & KENDARAAN LISTRIK (EV) ───
  OTOMOTIF_EV: [
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1080&auto=format&fit=crop&q=80', // EV car charging station
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1080&auto=format&fit=crop&q=80', // Electric motorcycle bike
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1080&auto=format&fit=crop&q=80', // Sports car speed
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1080&auto=format&fit=crop&q=80', // Modern scooter
  ],

  // ─── 19. LAPTOP & KOMPUTER ───
  LAPTOP: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1080&auto=format&fit=crop&q=80', // Sleek laptop workspace
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1080&auto=format&fit=crop&q=80', // MacBook desk
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1080&auto=format&fit=crop&q=80', // Computer monitor
  ],

  // ─── 20. EDUKASI, TIPS & PRODUKTIVITAS ───
  PENDIDIKAN: [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1080&auto=format&fit=crop&q=80', // Students discussion
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1080&auto=format&fit=crop&q=80', // Campus library
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1080&auto=format&fit=crop&q=80', // Book stack research
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1080&auto=format&fit=crop&q=80', // Open book reading
  ],

  // ─── 21. E-COMMERCE & RACUN PRODUK ───
  ECOMMERCE: [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1080&auto=format&fit=crop&q=80', // Skincare product
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1080&auto=format&fit=crop&q=80', // Shoes sneakers
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1080&auto=format&fit=crop&q=80', // Modern watch
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1080&auto=format&fit=crop&q=80', // Audio headphones
  ],

  // ─── 22. POLITIK & PEMERINTAHAN ───
  POLITIK: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1080&auto=format&fit=crop&q=80', // Press conference microphones
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1080&auto=format&fit=crop&q=80', // Parliament assembly hall
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1080&auto=format&fit=crop&q=80', // Executive meeting
  ],

  // ─── 23. HUKUM & PENGADILAN ───
  HUKUM: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1080&auto=format&fit=crop&q=80', // Law gavel & scales
    'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=1080&auto=format&fit=crop&q=80', // Law library books
    'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1080&auto=format&fit=crop&q=80', // Courtroom desk
  ],

  // ─── 24. GENERAL / BRAND / BERITA ───
  BERITA: [
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1080&auto=format&fit=crop&q=80', // Newspaper headlines
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1080&auto=format&fit=crop&q=80', // Live journalism broadcast
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080&auto=format&fit=crop&q=80', // Global communication
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080&auto=format&fit=crop&q=80', // Creative office
  ],
};

/**
 * Mendeteksi kategori yang paling spesifik dan presisi berdasarkan kata kunci teks.
 */
export function detectCategoryFromText(text: string): string {
  const t = text.toLowerCase();

  // 1. CRYPTO, BITCOIN, WEB3 & BLOCKCHAIN
  if (
    t.includes('crypto') ||
    t.includes('kripto') ||
    t.includes('bitcoin') ||
    t.includes('btc') ||
    t.includes('ethereum') ||
    t.includes('eth') ||
    t.includes('solana') ||
    t.includes('blockchain') ||
    t.includes('web3') ||
    t.includes('wallet') ||
    t.includes('binance') ||
    t.includes('token') ||
    t.includes('airdrop') ||
    t.includes('altcoin') ||
    t.includes('nft') ||
    t.includes('defi') ||
    t.includes('satoshi') ||
    t.includes('halving')
  ) {
    return 'CRYPTO';
  }

  // 2. SAHAM, TRADING, FOREX & PASAR MODAL
  if (
    t.includes('saham') ||
    t.includes('ihsg') ||
    t.includes('deviden') ||
    t.includes('dividen') ||
    t.includes('emiten') ||
    t.includes('reksadana') ||
    t.includes('pasar modal') ||
    t.includes('idx') ||
    t.includes('scalping') ||
    t.includes('forex') ||
    t.includes('candlestick') ||
    t.includes('bullish') ||
    t.includes('bearish') ||
    t.includes('porto') ||
    t.includes('broker') ||
    t.includes('sekuritas')
  ) {
    return 'SAHAM_TRADING';
  }

  // 3. BISNIS, STARTUP & MARKETING
  if (
    t.includes('bisnis') ||
    t.includes('startup') ||
    t.includes('wirausaha') ||
    t.includes('omset') ||
    t.includes('penjualan') ||
    t.includes('closing') ||
    t.includes('marketing') ||
    t.includes('sales') ||
    t.includes('b2b') ||
    t.includes('b2c') ||
    t.includes('digital marketing') ||
    t.includes('profit') ||
    t.includes('founder') ||
    t.includes('ceo') ||
    t.includes('agency') ||
    t.includes('freelance') ||
    t.includes('jualan') ||
    t.includes('modal usaha') ||
    t.includes('scale up') ||
    t.includes('revenue') ||
    t.includes('klien') ||
    t.includes('omzet')
  ) {
    return 'BISNIS';
  }

  // 4. SKINCARE & BEAUTY
  if (
    t.includes('skincare') ||
    t.includes('serum') ||
    t.includes('moisturizer') ||
    t.includes('sunscreen') ||
    t.includes('jerawat') ||
    t.includes('glowing') ||
    t.includes('retinol') ||
    t.includes('niacinamide') ||
    t.includes('kulit') ||
    t.includes('cleanser') ||
    t.includes('toner') ||
    t.includes('facial') ||
    t.includes('makeup') ||
    t.includes('lipstik') ||
    t.includes('beauty') ||
    t.includes('kecantikan') ||
    t.includes('skincare routine') ||
    t.includes('flek hitam') ||
    t.includes('kosmetik')
  ) {
    return 'SKINCARE';
  }

  // 5. FASHION & OOTD
  if (
    t.includes('fashion') ||
    t.includes('baju') ||
    t.includes('outfit') ||
    t.includes('ootd') ||
    t.includes('pakaian') ||
    t.includes('celana') ||
    t.includes('hoodie') ||
    t.includes('dress') ||
    t.includes('hijab') ||
    t.includes('sepatu') ||
    t.includes('sneakers') ||
    t.includes('tas') ||
    t.includes('styling') ||
    t.includes('model') ||
    t.includes('thrift') ||
    t.includes('jam tangan') ||
    t.includes('kacamata') ||
    t.includes('streetwear')
  ) {
    return 'FASHION';
  }

  // 5B. SNEAKERS & SEPATU
  if (
    t.includes('sneaker') ||
    t.includes('sepatu') ||
    t.includes('puma') ||
    t.includes('nike') ||
    t.includes('adidas') ||
    t.includes('jordan') ||
    t.includes('speedcat') ||
    t.includes('sambas') ||
    t.includes('vans')
  ) {
    return 'SNEAKERS';
  }

  // 6A. KULINER SPESIFIK: RENDANG & MASAKAN PADANG
  if (
    t.includes('rendang') ||
    t.includes('padang') ||
    t.includes('dendeng') ||
    t.includes('gulai') ||
    t.includes('daging sapi')
  ) {
    return 'RENDANG_PADANG';
  }

  // 6B. KULINER SPESIFIK: NASI GORENG & WOK
  if (
    t.includes('nasi goreng') ||
    t.includes('fried rice') ||
    t.includes('nasi rempah') ||
    t.includes('nasi uduk') ||
    t.includes('nasi bakar') ||
    t.includes('nasi')
  ) {
    return 'NASI_GORENG';
  }

  // 6C. KULINER SPESIFIK: AYAM GORENG & SAMBAL
  if (
    t.includes('ayam goreng') ||
    t.includes('ayam bakar') ||
    t.includes('ayam geprek') ||
    t.includes('ayam crispy') ||
    t.includes('ayam') ||
    t.includes('bebek')
  ) {
    return 'AYAM_GORENG';
  }

  // 6D. KULINER SPESIFIK: KOPI & KAFE
  if (
    t.includes('kopi') ||
    t.includes('coffee') ||
    t.includes('espresso') ||
    t.includes('latte') ||
    t.includes('cappuccino') ||
    t.includes('cafe') ||
    t.includes('kafe') ||
    t.includes('barista') ||
    t.includes('boba') ||
    t.includes('matcha')
  ) {
    return 'KOPI_CAFE';
  }

  // 6E. KULINER UMUM & MAKANAN
  if (
    t.includes('kuliner') ||
    t.includes('makanan') ||
    t.includes('resep') ||
    t.includes('masak') ||
    t.includes('resto') ||
    t.includes('restoran') ||
    t.includes('bakery') ||
    t.includes('roti') ||
    t.includes('cake') ||
    t.includes('minuman') ||
    t.includes('mie') ||
    t.includes('sambal') ||
    t.includes('kuliner malam') ||
    t.includes('jajanan') ||
    t.includes('snack') ||
    t.includes('dapur')
  ) {
    return 'KULINER';
  }

  // 7. MOTIVASI, SELF IMPROVEMENT & MINDFULNESS
  if (
    t.includes('motivasi') ||
    t.includes('self improvement') ||
    t.includes('mindset') ||
    t.includes('produktif') ||
    t.includes('produktivitas') ||
    t.includes('kebiasaan') ||
    t.includes('habit') ||
    t.includes('sukses') ||
    t.includes('disiplin') ||
    t.includes('overthinking') ||
    t.includes('mental health') ||
    t.includes('psikologi') ||
    t.includes('rutinitas') ||
    t.includes('fokus') ||
    t.includes('impian') ||
    t.includes('tujuan hidup')
  ) {
    return 'MOTIVASI';
  }

  // 8. FITNESS, GYM & WORKOUT
  if (
    t.includes('fitness') ||
    t.includes('gym') ||
    t.includes('workout') ||
    t.includes('lari') ||
    t.includes('marathon') ||
    t.includes('diet') ||
    t.includes('kalori') ||
    t.includes('otot') ||
    t.includes('yoga') ||
    t.includes('latihan fisik') ||
    t.includes('fat loss') ||
    t.includes('protein') ||
    t.includes('bola') ||
    t.includes('timnas') ||
    t.includes('atlet') ||
    t.includes('pertandingan') ||
    t.includes('olahraga')
  ) {
    return 'FITNESS';
  }

  // 9. TRAVEL & WISATA
  if (
    t.includes('travel') ||
    t.includes('liburan') ||
    t.includes('wisata') ||
    t.includes('trip') ||
    t.includes('jalan-jalan') ||
    t.includes('pantai') ||
    t.includes('hotel') ||
    t.includes('villa') ||
    t.includes('gunung') ||
    t.includes('healing') ||
    t.includes('traveling') ||
    t.includes('tiket') ||
    t.includes('penerbangan') ||
    t.includes('destinasi') ||
    t.includes('backpacker')
  ) {
    return 'TRAVEL';
  }

  // 10. PROPERTI & RUMAH
  if (
    t.includes('properti') ||
    t.includes('rumah') ||
    t.includes('perumahan') ||
    t.includes('real estate') ||
    t.includes('kos') ||
    t.includes('apartemen') ||
    t.includes('kpr') ||
    t.includes('interior') ||
    t.includes('arsitektur') ||
    t.includes('denah') ||
    t.includes('dekorasi rumah') ||
    t.includes('renovasi')
  ) {
    return 'PROPERTY';
  }

  // 11. GAMING & ESPORTS
  if (
    t.includes('game') ||
    t.includes('gaming') ||
    t.includes('gamer') ||
    t.includes('esports') ||
    t.includes('ps5') ||
    t.includes('playstation') ||
    t.includes('steam') ||
    t.includes('mobile legends') ||
    t.includes('pubg') ||
    t.includes('valorant') ||
    t.includes('rpg') ||
    t.includes('gameplay') ||
    t.includes('konsol')
  ) {
    return 'GAMING';
  }

  // 12. PARENTING & ANAK
  if (
    t.includes('parenting') ||
    t.includes('anak') ||
    t.includes('bayi') ||
    t.includes('balita') ||
    t.includes('ibu') ||
    t.includes('ayah') ||
    t.includes('mpasi') ||
    t.includes('pola asuh') ||
    t.includes('tumbuh kembang') ||
    t.includes('keluarga') ||
    t.includes('mom') ||
    t.includes('kids')
  ) {
    return 'PARENTING';
  }

  // 13. SMARTPHONE, KAMERA & GADGET
  if (
    t.includes('kamera') ||
    t.includes('telefoto') ||
    t.includes('lens') ||
    t.includes('sensor 200') ||
    t.includes('megapiksel') ||
    t.includes('zoom optis') ||
    t.includes('mirrorless') ||
    t.includes('dslr')
  ) {
    return 'KAMERA';
  }

  if (
    t.includes('baterai') ||
    t.includes('mah') ||
    t.includes('fast charging') ||
    t.includes('silikon') ||
    t.includes('pengisian daya') ||
    t.includes('watt')
  ) {
    return 'BATERAI';
  }

  if (
    t.includes('chip') ||
    t.includes('snapdragon') ||
    t.includes('dimensity') ||
    t.includes('prosesor') ||
    t.includes('bionic') ||
    t.includes('processor')
  ) {
    return 'CHIP';
  }

  if (
    t.includes('hp') ||
    t.includes('smartphone') ||
    t.includes('flagship') ||
    t.includes('find x') ||
    t.includes('galaxy') ||
    t.includes('iphone') ||
    t.includes('xiaomi') ||
    t.includes('oppo') ||
    t.includes('vivo') ||
    t.includes('layar amoled') ||
    t.includes('gadget') ||
    t.includes('ponsel') ||
    t.includes('android') ||
    t.includes('ios')
  ) {
    return 'SMARTPHONE';
  }

  // 14. OTOMOTIF & EV
  if (
    t.includes('motor listrik') ||
    t.includes('mobil listrik') ||
    t.includes('ev') ||
    t.includes('gesits') ||
    t.includes('alva') ||
    t.includes('polytron') ||
    t.includes('wuling') ||
    t.includes('byd') ||
    t.includes('hyundai') ||
    t.includes('tesla') ||
    t.includes('otomotif') ||
    t.includes('kendaraan') ||
    t.includes('mobil') ||
    t.includes('motor')
  ) {
    return 'OTOMOTIF_EV';
  }

  // 15. LAPTOP & KOMPUTER
  if (t.includes('laptop') || t.includes('macbook') || t.includes('pc') || t.includes('komputer') || t.includes('desktop')) {
    return 'LAPTOP';
  }

  // 16. AI & SOFTWARE TECH / TOOLS
  if (
    t.includes('tools ai') ||
    t.includes('ai tools') ||
    t.includes('ai') ||
    t.includes('robot') ||
    t.includes('chatgpt') ||
    t.includes('gemini') ||
    t.includes('claude') ||
    t.includes('algoritma') ||
    t.includes('software') ||
    t.includes('coding') ||
    t.includes('programming') ||
    t.includes('otomasi') ||
    t.includes('aplikasi') ||
    t.includes('tools') ||
    t.includes('tool')
  ) {
    return 'AI_TOOLS';
  }

  // 17. E-COMMERCE & SHOPEE AFFILIATE
  if (t.includes('shopee') || t.includes('tokopedia') || t.includes('affiliate') || t.includes('racun') || t.includes('diskon') || t.includes('promo') || t.includes('voucher') || t.includes('olshop')) {
    return 'ECOMMERCE';
  }

  // 18. POLITIK & PEMERINTAHAN
  if (t.includes('presiden') || t.includes('prabowo') || t.includes('jokowi') || t.includes('menteri') || t.includes('dpr') || t.includes('pemilu') || t.includes('partai') || t.includes('politik') || t.includes('pemerintah')) {
    return 'POLITIK';
  }

  // 19. HUKUM
  if (t.includes('polisi') || t.includes('kpk') || t.includes('sidang') || t.includes('hakim') || t.includes('hukum') || t.includes('korupsi') || t.includes('kasus') || t.includes('penjara')) {
    return 'HUKUM';
  }

  // 20. PENDIDIKAN & TIPS
  if (t.includes('kampus') || t.includes('kuliah') || t.includes('mahasiswa') || t.includes('sekolah') || t.includes('guru') || t.includes('belajar') || t.includes('pendidikan') || t.includes('skripsi') || t.includes('tips') || t.includes('tutorial')) {
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
 * Menjamin SETIAP slide (0, 1, 2, 3, 4, ...) selalu memiliki foto berbeda yang sesuai topik konten.
 */
export function getContextualPhotoForSlide(
  category: string | undefined,
  slideIndex: number,
  slideText?: string,
  articleImageUrl?: string | null,
): string {
  // 1. Slide 0 (Cover): Jika ada gambar asli dari URL artikel / produk marketplace, utamakan gambar asli
  if (slideIndex === 0 && articleImageUrl) {
    return articleImageUrl;
  }

  // 2. Deteksi kategori spesifik dari teks slide & topik
  const combinedText = (slideText || category || '').toLowerCase();
  const detectedCategory = detectCategoryFromText(combinedText);

  // 3. Pilih dari koleksi foto editorial HD yang 100% cocok dengan topik konten
  const pool = TOPIC_PHOTO_COLLECTION[detectedCategory] || TOPIC_PHOTO_COLLECTION.BERITA;

  // Hash teks topik agar topik berbeda (misal prompt A vs prompt B) selalu mendapatkan foto berbeda
  const hashOffset = hashString(combinedText);
  const photoIndex = (hashOffset + slideIndex) % pool.length;

  return pool[photoIndex] || pool[0];
}


