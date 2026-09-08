export type AIImageThemeCategory = 'ALL' | '3D' | 'ILLUSTRATION' | 'ARTISTIC' | 'CRAFT' | 'RETRO' | 'MODERN';

export type AIImageThemeId =
  | 'AUTO'
  | 'PIXAR_3D'
  | 'WOOL_FELT_3D'
  | 'TOY_MINIATURE_3D'
  | 'GHIBLI_ANIME'
  | 'CHALKBOARD'
  | 'COLORING_BOOK'
  | 'CLAYMORPHISM'
  | 'CYBERPUNK_NEON'
  | 'EMBROIDERY'
  | 'FLAT_VECTOR'
  | 'GLASSMORPHISM'
  | 'GOUACHE_MATTE'
  | 'PENCIL_SKETCH'
  | 'SUMI_E_INK'
  | 'ISLAMIC_GEOMETRIC'
  | 'ISOMETRIC_DIORAMA'
  | 'LOW_POLY'
  | 'LUXURY_EDITORIAL'
  | 'MINIMALIST_LINE_ART'
  | 'OIL_PAINTING'
  | 'ORIGAMI_3D'
  | 'PIXEL_ART_RETRO'
  | 'POP_ART_COMIC'
  | 'STEAMPUNK_VINTAGE'
  | 'VINTAGE_BOTANICAL'
  | 'WATERCOLOR_AQUARELLE';

export type AIImageThemeDef = {
  id: AIImageThemeId;
  label: string;
  subLabel?: string;
  description: string;
  icon: string;
  category: AIImageThemeCategory;
  badge?: string;
  promptModifier: string;
  curatedPhotos: string[];
};

export const AI_IMAGE_THEMES: AIImageThemeDef[] = [
  {
    id: 'AUTO',
    label: 'Auto',
    subLabel: 'Sesuai Konteks Konten Otomatis',
    description: 'Menyesuaikan gaya visual secara cerdas berdasarkan kategori dan isi topik konten.',
    icon: '✨',
    category: 'ALL',
    badge: 'POPULAR',
    promptModifier: 'cinematic high-resolution editorial photography, clean studio lighting, realistic details, professional composition, 8k',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'PIXAR_3D',
    label: '3D Cute Render Pixar (Disney)',
    subLabel: 'Karakter 3D Menggemaskan & Lembut',
    description: 'Gaya animasi 3D lucu ala Pixar/Disney dengan pencahayaan hangat, mata ekspresif dan render halus.',
    icon: '🧸',
    category: '3D',
    badge: 'HOT',
    promptModifier: 'cute 3D Pixar animation style, Disney character render, soft studio lighting, subsurface scattering, expressive big eyes, octane render 8k, warm color palette',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'WOOL_FELT_3D',
    label: '3D Realistic Wool / Felt (Original)',
    subLabel: 'Tekstur Wol Rajut & Felt Buatan Tangan',
    description: 'Karakter dan objek berbahan kain felt berbulu halus dan rajutan wol handmade yang menggemaskan.',
    icon: '🧶',
    category: 'CRAFT',
    promptModifier: 'needle felted wool craft, macro photography of felt miniature, fuzzy wool texture, handmade knitted puppet, cozy warm lighting, tactile fabric details, shallow depth of field',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'TOY_MINIATURE_3D',
    label: '3D Toy Miniature Render',
    subLabel: 'Miniatur Mainan & Tilt-Shift Diorama',
    description: 'Mainan vinyl berkilau dalam skala miniatur dengan efek tilt-shift sinematik.',
    icon: '🚗',
    category: '3D',
    promptModifier: 'glossy vinyl designer toy miniature, tilt-shift macro photography, plastic material shader, cute collectible figurine, clean solid studio backdrop, Ray Tracing',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558679908-541bcf1249ff?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'GHIBLI_ANIME',
    label: 'Anime Studio Ghibli Style',
    subLabel: 'Ilustrasi Cat Air Anime Nostalgik Hayao Miyazaki',
    description: 'Suasana magis pedesaan dengan awan gumpal putih lembut, langit biru cerah, dan lukisan tangan memukau.',
    icon: '🍃',
    category: 'ILLUSTRATION',
    badge: 'VIRAL',
    promptModifier: 'Studio Ghibli animation aesthetic, Hayao Miyazaki anime style, painted gouache background, fluffy cumulus clouds, lush green scenery, nostalgic golden hour lighting, hand-drawn anime artwork',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'CHALKBOARD',
    label: 'Chalkboard Art (Kapur)',
    subLabel: 'Gambar Papan Tulis Kapur Cafe & Rustic',
    description: 'Coretan kapur putih dan warna pastel pada latar papan tulis hitam dengan tipografi vintage.',
    icon: '🖍️',
    category: 'ARTISTIC',
    promptModifier: 'chalkboard drawing illustration, white and pastel colored chalk on dark blackboard slate texture, hand-lettered flourishes, rustic cafe menu art style',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1572945753563-804956783694?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'COLORING_BOOK',
    label: 'Children Coloring Book Style',
    subLabel: 'Buku Mewarnai Garis Hitam Ceria',
    description: 'Garis outline hitam bersih tebal siap diwarnai dengan elemen ceria dan ramah anak-anak.',
    icon: '🎨',
    category: 'ILLUSTRATION',
    promptModifier: 'children coloring book page, bold clean black outlines, white background, simple cute shapes, vector coloring line art, no shading',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'CLAYMORPHISM',
    label: 'Claymorphism Plasticine',
    subLabel: 'Patung Liat Plastisin 3D Lembut',
    description: 'Bentuk plastisin tanah liat warna-warni mengkilap dengan sidik jari halus dan bayangan tebal lembut.',
    icon: '🏺',
    category: '3D',
    badge: 'TREND',
    promptModifier: 'claymorphism 3D illustration, soft play-doh plasticine texture, cute rounded edges, matte tactile clay surface, pastel color palette, soft studio shadows',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'CYBERPUNK_NEON',
    label: 'Cyberpunk Neon',
    subLabel: 'Glow Futuristik Malam Hari Kota Neon',
    description: 'Pendaran lampu neon cyan, magenta, dan ungu di tengah jalanan kota futuristik beraspal basah.',
    icon: '⚡',
    category: 'MODERN',
    promptModifier: 'cyberpunk 2077 aesthetic, glowing neon lighting, cyan and magenta bioluminescence, wet reflective asphalt, futuristic sci-fi city atmosphere, volumetric smoke, ultra-detailed 8k',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'EMBROIDERY',
    label: 'Embroidery (Sulaman Benang)',
    subLabel: 'Karya Jahitan Benang Kain & Denim',
    description: 'Detail sulaman benang rajut bertekstur timbul di atas permukaan kain kanvas katun atau denim.',
    icon: '🪡',
    category: 'CRAFT',
    promptModifier: 'detailed embroidery textile art, colorful stitched threads on canvas cloth, raised thread texture, intricate needlework, handcrafted embroidery pattern, macro textile photo',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'FLAT_VECTOR',
    label: 'Flat Vector Illustration',
    subLabel: 'Ilustrasi Vektor Modern Minimalis',
    description: 'Desain grafis datar modern dengan palet warna bersih harmonis ala ilustrasi teknologi Silicon Valley.',
    icon: '📐',
    category: 'ILLUSTRATION',
    badge: 'BIZ',
    promptModifier: 'clean modern flat vector illustration, corporate Memphis aesthetic, vibrant harmonious color scheme, geometric shapes, minimalist design, Behance trending vector art',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'GLASSMORPHISM',
    label: 'Glassmorphism Illustration',
    subLabel: 'Efek Kaca Transparan Frosted Glass',
    description: 'Lapisan kaca akrilik semi-transparan dengan bias cahaya pelangi dan blur latar belakang yang mewah.',
    icon: '🔮',
    category: 'MODERN',
    promptModifier: 'glassmorphism 3D render, frosted glass translucent layers, iridescent chromatic aberration, smooth blur dispersion, sleek modern UI art, Apple iOS glass design',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'GOUACHE_MATTE',
    label: 'Gouache Illustration (Matte)',
    subLabel: 'Lukisan Cat Gouache Matte Bertekstur',
    description: 'Warna cat pekat buram tanpa kilau dengan sapuan kuas tebal dan palet warna vintage menawan.',
    icon: '🖌️',
    category: 'ARTISTIC',
    promptModifier: 'matte gouache painting illustration, opaque layered brushstrokes, rich earthy pigments, textured watercolor paper grain, storybook editorial art',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'PENCIL_SKETCH',
    label: 'Hand Drawn Sketch (Pencil)',
    subLabel: 'Sketsa Pensil & Arsir Manual Halus',
    description: 'Goresan pensil grafit berarsir dengan detail arsitektur atau potret di atas kertas bertekstur.',
    icon: '✏️',
    category: 'ARTISTIC',
    promptModifier: 'detailed graphite pencil sketch, cross-hatching shading, hand-drawn charcoal lines on rough paper texture, classic sketchbook illustration, monochrome elegance',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'SUMI_E_INK',
    label: 'Ink Wash Painting (Sumi-e)',
    subLabel: 'Lukisan Tinta Jepang & Ruang Kosong Zen',
    description: 'Goresan kuas tinta hitam minimalis ala kaligrafi tradisional Jepang dengan konsep estetika wabi-sabi.',
    icon: '🏮',
    category: 'ARTISTIC',
    promptModifier: 'traditional Japanese Sumi-e ink wash painting, black calligraphy brush strokes on washi rice paper, minimalist zen composition, misty ethereal atmosphere',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'ISLAMIC_GEOMETRIC',
    label: 'Islamic Geometric Pattern',
    subLabel: 'Ornamen Geometris Islam & Emas Maroko',
    description: 'Pola arabesque simetris dengan detail mosaik keramik zellij dan aksen garis emas berkilau.',
    icon: '🕌',
    category: 'ARTISTIC',
    promptModifier: 'intricate Islamic geometric pattern, arabesque floral motifs, Moroccan zellige tile mosaic, gold foil inlay accents, symmetrical sacred geometry, rich emerald and navy blue',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'ISOMETRIC_DIORAMA',
    label: 'Isometric 3D Diorama',
    subLabel: 'Sudut Pandang Isometrik Miniatur 3D',
    description: 'Blok ruangan atau pulau miniatur dari sudut 45 derajat dengan detail perabot lengkap yang memanjakan mata.',
    icon: '📦',
    category: '3D',
    badge: 'POPULAR',
    promptModifier: 'isometric 3D diorama cutaway room, floating island low poly miniature, clean orthographic projection, detailed tiny props, vibrant playful lighting, Blender 3D render',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558679908-541bcf1249ff?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'LOW_POLY',
    label: 'Low Poly Art',
    subLabel: 'Bentuk Poligon Geometris Bersudut',
    description: 'Grafis poligon 3D modern dengan permukaan prisma segitiga warna-warni yang estetik dan tajam.',
    icon: '💎',
    category: '3D',
    promptModifier: 'low poly 3D art, faceted polygon mesh geometry, flat-shaded triangular faces, vibrant gradient lighting, modern minimalist abstract 3D artwork',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'LUXURY_EDITORIAL',
    label: 'Luxury Editorial Poster',
    subLabel: 'Poster Majalah Mewah High-Fashion',
    description: 'Pencahayaan studio kontras tinggi ala majalah Vogue dengan komposisi elegan bernilai estetika premium.',
    icon: '👑',
    category: 'MODERN',
    badge: 'PRO',
    promptModifier: 'luxury high-fashion editorial poster, cinematic chiaroscuro studio lighting, elegant minimalist aesthetic, Vogue magazine cover quality, golden ratio composition, 8k luxury brand visual',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'MINIMALIST_LINE_ART',
    label: 'Minimalist Line Art',
    subLabel: 'Satu Garis Kontinyu Elegan (One Line)',
    description: 'Ilustrasi garis tunggal minimalis kontemporer dengan sentuhan warna blok pastel netral.',
    icon: '〰️',
    category: 'ILLUSTRATION',
    promptModifier: 'continuous single line art illustration, minimalist Picasso line drawing, neutral beige and terracotta color blocks, clean white background, Scandinavian modern wall art',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'OIL_PAINTING',
    label: 'Oil Painting Impressionism',
    subLabel: 'Lukisan Cat Minyak Klasik Bertekstur',
    description: 'Sapuan kuas cat minyak tebal ala Claude Monet dengan pendaran cahaya alami yang emosional.',
    icon: '🖼️',
    category: 'ARTISTIC',
    promptModifier: 'classical oil painting on canvas, thick impasto brushstrokes, Claude Monet impressionism lighting, rich textural oil pigments, fine art museum masterpiece',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'ORIGAMI_3D',
    label: 'Origami Paper Craft 3D',
    subLabel: 'Lipatan Kertas Karton Jepang 3D',
    description: 'Karya lipatan seni kertas origami berlapis dengan bayangan realistis dan tekstur kertas lipat presisi.',
    icon: '🦢',
    category: 'CRAFT',
    promptModifier: 'intricate 3D origami papercraft, layered folded paper sculpture, crisp paper creases, realistic soft casting shadows, Japanese paper art, clean pastel background',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'PIXEL_ART_RETRO',
    label: 'Pixel Art Retro 8-Bit',
    subLabel: 'Game Retro Nintendo & Arcade 16-Bit',
    description: 'Karakter dan pemandangan piksel nostalgia era game 90-an dengan palet warna cerah berkarakter.',
    icon: '👾',
    category: 'RETRO',
    promptModifier: 'nostalgic 16-bit pixel art illustration, retro arcade video game aesthetic, vibrant limited color palette, isometric pixelated detailing, crisp clean pixels',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'POP_ART_COMIC',
    label: 'Pop Art Retro Comic',
    subLabel: 'Komik Vintage Titik Ben-Day Roy Lichtenstein',
    description: 'Gaya komik vintage Amerika tahun 60-an dengan pola titik halfton, warna primer kuat, dan balon dialog seru.',
    icon: '💥',
    category: 'RETRO',
    promptModifier: 'vintage pop art comic book illustration, Roy Lichtenstein style, bold halftone Ben-Day dots, strong black inking, vibrant primary colors, retro 1960s graphic novel look',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1563089145-599997674d42?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'STEAMPUNK_VINTAGE',
    label: 'Steampunk Vintage',
    subLabel: 'Mesin Uap Tembaga & Roda Gigi Viktoria',
    description: 'Estetika era revolusi industri dengan mesin uap tembaga antik, roda gigi kuningan, dan kacamata goggle.',
    icon: '⚙️',
    category: 'RETRO',
    promptModifier: 'steampunk Victorian retro-futurism, polished brass and copper gears, steam pipes, mechanical clockwork machinery, warm sepia lighting, intricate vintage engineering details',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'VINTAGE_BOTANICAL',
    label: 'Vintage Botanical Illustration',
    subLabel: 'Ilustrasi Tumbuhan & Bunga Ensiklopedia Klasik',
    description: 'Gambar sketsa ilmiah tanaman dan bunga berarsir halus di atas kertas tua kekuningan antik.',
    icon: '🌸',
    category: 'ARTISTIC',
    promptModifier: 'vintage botanical scientific illustration, delicate watercolor and ink on aged parchment paper, detailed plant taxonomy drawing, 19th-century naturalist field guide style',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1080&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'WATERCOLOR_AQUARELLE',
    label: 'Watercolor Aquarelle Painting',
    subLabel: 'Cat Air Basah Lembut & Transparan',
    description: 'Percikan cat air lembut dengan gradasi warna basah yang mengalir alami dan bercahaya.',
    icon: '💧',
    category: 'ARTISTIC',
    badge: 'POPULAR',
    promptModifier: 'dreamy watercolor aquarelle painting, wet-on-wet paint bleeding, translucent color washes, soft pigment blooms, textured cold press paper edges, luminous gentle lighting',
    curatedPhotos: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1080&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1080&auto=format&fit=crop&q=80',
    ],
  },
];

export function getAIThemeDef(id?: string): AIImageThemeDef {
  const found = AI_IMAGE_THEMES.find((t) => t.id === id);
  return found || AI_IMAGE_THEMES[0];
}
