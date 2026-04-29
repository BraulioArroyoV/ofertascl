import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const ML_AFFILIATE_ID = process.env.ML_AFFILIATE_ID || 'ARROYOBRAULIO20230821195606'

app.use(cors({ origin: '*' }))
app.use(express.json())

const ML_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Origin': 'https://www.mercadolibre.cl',
  'Referer': 'https://www.mercadolibre.cl/',
  'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124"',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
}

function buildAffiliateUrl(permalink) {
  if (!permalink) return '#'
  const sep = permalink.includes('?') ? '&' : '?'
  return `${permalink}${sep}matt_tool=afiliados&matt_word=${ML_AFFILIATE_ID}`
}

function formatProduct(item) {
  const hasDiscount = item.original_price && item.original_price > item.price
  const discountPct = hasDiscount ? Math.round((1 - item.price / item.original_price) * 100) : 0
  return {
    id: item.id,
    title: item.title,
    price: item.price,
    originalPrice: item.original_price || null,
    discountPct,
    currency: item.currency_id || 'CLP',
    thumbnail: (item.thumbnail || '').replace('http:', 'https:'),
    permalink: item.permalink,
    affiliateUrl: buildAffiliateUrl(item.permalink),
    freeShipping: item.shipping?.free_shipping || false,
    soldQuantity: item.sold_quantity || 0,
    condition: item.condition || 'new',
    source: 'mercadolibre',
    sourceName: 'MercadoLibre',
  }
}

// Seed data para cuando ML API no responde
function getSeedProducts(query = '') {
  const all = [
    // Celulares
    { id:'MLC1001', title:'iPhone 15 128GB Negro - Apple', price:749990, original_price:899990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_875711-MLC71782869946_092023-O.jpg', permalink:'https://www.mercadolibre.cl/p/MLC21684747', shipping:{free_shipping:true}, sold_quantity:234, condition:'new', currency_id:'CLP' },
    { id:'MLC1002', title:'Samsung Galaxy S24 256GB Violeta', price:649990, original_price:799990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_617325-MLC71516355757_092023-O.jpg', permalink:'https://www.mercadolibre.cl/p/MLC22041585', shipping:{free_shipping:true}, sold_quantity:189, condition:'new', currency_id:'CLP' },
    { id:'MLC1003', title:'Xiaomi Redmi Note 13 Pro 256GB 8GB RAM', price:249990, original_price:329990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_xiaomi13pro.jpg', permalink:'https://www.mercadolibre.cl/p/MLC23456789', shipping:{free_shipping:false}, sold_quantity:312, condition:'new', currency_id:'CLP' },
    { id:'MLC1004', title:'iPhone 14 128GB Azul Medianoche', price:599990, original_price:749990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_iphone14blue.jpg', permalink:'https://www.mercadolibre.cl/p/MLC21234567', shipping:{free_shipping:true}, sold_quantity:445, condition:'new', currency_id:'CLP' },
    { id:'MLC1005', title:'Samsung Galaxy A54 256GB Negro', price:299990, original_price:389990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_galaxya54.jpg', permalink:'https://www.mercadolibre.cl/p/MLC22345678', shipping:{free_shipping:true}, sold_quantity:267, condition:'new', currency_id:'CLP' },
    { id:'MLC1006', title:'Motorola Edge 40 Neo 256GB Negro', price:219990, original_price:299990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_motoedge.jpg', permalink:'https://www.mercadolibre.cl/p/MLC23123456', shipping:{free_shipping:false}, sold_quantity:134, condition:'new', currency_id:'CLP' },
    // Computación
    { id:'MLC1007', title:'Notebook Lenovo IdeaPad 15" i5 16GB 512GB SSD', price:499990, original_price:649990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_lenovo.jpg', permalink:'https://www.mercadolibre.cl/p/MLC20987654', shipping:{free_shipping:true}, sold_quantity:156, condition:'new', currency_id:'CLP' },
    { id:'MLC1008', title:'MacBook Air M2 13" 8GB 256GB Gris Espacial', price:899990, original_price:1099990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_macbook.jpg', permalink:'https://www.mercadolibre.cl/p/MLC21098765', shipping:{free_shipping:true}, sold_quantity:45, condition:'new', currency_id:'CLP' },
    { id:'MLC1009', title:'Notebook HP Pavilion 15" Ryzen 5 16GB 512GB', price:449990, original_price:579990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_hppavilion.jpg', permalink:'https://www.mercadolibre.cl/p/MLC20876543', shipping:{free_shipping:true}, sold_quantity:198, condition:'new', currency_id:'CLP' },
    { id:'MLC1010', title:'Monitor LG 27" 4K IPS 144Hz HDR', price:299990, original_price:399990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_lgmonitor.jpg', permalink:'https://www.mercadolibre.cl/p/MLC20765432', shipping:{free_shipping:true}, sold_quantity:134, condition:'new', currency_id:'CLP' },
    { id:'MLC1011', title:'Teclado Mecánico Logitech G Pro X TKL RGB', price:129990, original_price:179990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_logitech.jpg', permalink:'https://www.mercadolibre.cl/p/MLC20654321', shipping:{free_shipping:true}, sold_quantity:234, condition:'new', currency_id:'CLP' },
    { id:'MLC1012', title:'Mouse Razer DeathAdder V3 Pro Inalámbrico', price:89990, original_price:129990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_razer.jpg', permalink:'https://www.mercadolibre.cl/p/MLC20543210', shipping:{free_shipping:false}, sold_quantity:178, condition:'new', currency_id:'CLP' },
    // TV y Audio
    { id:'MLC1013', title:'Smart TV Samsung 55" 4K QLED 2024', price:449990, original_price:599990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_samsungtv.jpg', permalink:'https://www.mercadolibre.cl/p/MLC20432109', shipping:{free_shipping:true}, sold_quantity:98, condition:'new', currency_id:'CLP' },
    { id:'MLC1014', title:'Smart TV LG 65" 4K OLED evo C3', price:999990, original_price:1299990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_lgoled.jpg', permalink:'https://www.mercadolibre.cl/p/MLC20321098', shipping:{free_shipping:true}, sold_quantity:34, condition:'new', currency_id:'CLP' },
    { id:'MLC1015', title:'AirPods Pro 2da Generación Apple USB-C', price:179990, original_price:229990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_airpods.jpg', permalink:'https://www.mercadolibre.cl/p/MLC20210987', shipping:{free_shipping:true}, sold_quantity:445, condition:'new', currency_id:'CLP' },
    { id:'MLC1016', title:'Auriculares Sony WH-1000XM5 Noise Cancelling', price:279990, original_price:369990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_sony.jpg', permalink:'https://www.mercadolibre.cl/p/MLC20109876', shipping:{free_shipping:true}, sold_quantity:89, condition:'new', currency_id:'CLP' },
    { id:'MLC1017', title:'Parlante JBL Charge 5 Bluetooth Waterproof', price:89990, original_price:129990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_jbl.jpg', permalink:'https://www.mercadolibre.cl/p/MLC19998765', shipping:{free_shipping:false}, sold_quantity:456, condition:'new', currency_id:'CLP' },
    { id:'MLC1018', title:'Soundbar Samsung HW-Q60C 3.1 340W', price:199990, original_price:279990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_soundbar.jpg', permalink:'https://www.mercadolibre.cl/p/MLC19887654', shipping:{free_shipping:true}, sold_quantity:67, condition:'new', currency_id:'CLP' },
    // Gaming
    { id:'MLC1019', title:'PlayStation 5 Slim 1TB + 2 Controles DualSense', price:599990, original_price:749990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_ps5.jpg', permalink:'https://www.mercadolibre.cl/p/MLC19776543', shipping:{free_shipping:true}, sold_quantity:67, condition:'new', currency_id:'CLP' },
    { id:'MLC1020', title:'Consola Nintendo Switch OLED Blanca', price:349990, original_price:429990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_switch.jpg', permalink:'https://www.mercadolibre.cl/p/MLC19665432', shipping:{free_shipping:true}, sold_quantity:145, condition:'new', currency_id:'CLP' },
    { id:'MLC1021', title:'Xbox Series X 1TB + 3 meses Game Pass', price:549990, original_price:699990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_xboxseriesx.jpg', permalink:'https://www.mercadolibre.cl/p/MLC19554321', shipping:{free_shipping:true}, sold_quantity:56, condition:'new', currency_id:'CLP' },
    { id:'MLC1022', title:'Silla Gamer DXRacer Formula Series Negra', price:249990, original_price:329990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_dxracer.jpg', permalink:'https://www.mercadolibre.cl/p/MLC19443210', shipping:{free_shipping:false}, sold_quantity:123, condition:'new', currency_id:'CLP' },
    // Tablets y Wearables
    { id:'MLC1023', title:'iPad 10ma Generación 64GB WiFi Azul', price:329990, original_price:419990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_ipad.jpg', permalink:'https://www.mercadolibre.cl/p/MLC19332109', shipping:{free_shipping:true}, sold_quantity:123, condition:'new', currency_id:'CLP' },
    { id:'MLC1024', title:'Tablet Samsung Galaxy Tab S9 256GB WiFi', price:549990, original_price:699990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_tabs9.jpg', permalink:'https://www.mercadolibre.cl/p/MLC19221098', shipping:{free_shipping:true}, sold_quantity:56, condition:'new', currency_id:'CLP' },
    { id:'MLC1025', title:'Apple Watch Series 9 41mm GPS Medianoche', price:279990, original_price:359990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_applewatch9.jpg', permalink:'https://www.mercadolibre.cl/p/MLC19110987', shipping:{free_shipping:true}, sold_quantity:198, condition:'new', currency_id:'CLP' },
    { id:'MLC1026', title:'Smartwatch Samsung Galaxy Watch 6 44mm', price:149990, original_price:199990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_watch6.jpg', permalink:'https://www.mercadolibre.cl/p/MLC19009876', shipping:{free_shipping:true}, sold_quantity:167, condition:'new', currency_id:'CLP' },
    // Electrohogar
    { id:'MLC1027', title:'Aspiradora Robot iRobot Roomba j7+ WiFi', price:399990, original_price:529990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_roomba.jpg', permalink:'https://www.mercadolibre.cl/p/MLC18998765', shipping:{free_shipping:true}, sold_quantity:78, condition:'new', currency_id:'CLP' },
    { id:'MLC1028', title:'Microondas Electrolux 25L Digital Grill', price:89990, original_price:129990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_microondas.jpg', permalink:'https://www.mercadolibre.cl/p/MLC18887654', shipping:{free_shipping:false}, sold_quantity:201, condition:'new', currency_id:'CLP' },
    { id:'MLC1029', title:'Refrigerador LG French Door 27 pies No Frost', price:1299990, original_price:1599990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_lgfridge.jpg', permalink:'https://www.mercadolibre.cl/p/MLC18776543', shipping:{free_shipping:true}, sold_quantity:12, condition:'new', currency_id:'CLP' },
    { id:'MLC1030', title:'Lavadora Samsung 12kg AI Inverter', price:449990, original_price:579990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_lavadora.jpg', permalink:'https://www.mercadolibre.cl/p/MLC18665432', shipping:{free_shipping:true}, sold_quantity:34, condition:'new', currency_id:'CLP' },
    { id:'MLC1031', title:'Aire Acondicionado Inverter 12000 BTU Frío/Calor', price:299990, original_price:399990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_aire.jpg', permalink:'https://www.mercadolibre.cl/p/MLC18554321', shipping:{free_shipping:false}, sold_quantity:89, condition:'new', currency_id:'CLP' },
    { id:'MLC1032', title:'Cafetera Nespresso Vertuo Next Negro', price:79990, original_price:119990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_nespresso.jpg', permalink:'https://www.mercadolibre.cl/p/MLC18443210', shipping:{free_shipping:false}, sold_quantity:345, condition:'new', currency_id:'CLP' },
    // Zapatillas y Ropa
    { id:'MLC1033', title:'Zapatillas Nike Air Max 270 Hombre Negro', price:79990, original_price:109990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_nikeairmax.jpg', permalink:'https://www.mercadolibre.cl/p/MLC18332109', shipping:{free_shipping:false}, sold_quantity:567, condition:'new', currency_id:'CLP' },
    { id:'MLC1034', title:'Zapatillas Adidas Ultraboost 22 Running Blanco', price:84990, original_price:119990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_adidas.jpg', permalink:'https://www.mercadolibre.cl/p/MLC18221098', shipping:{free_shipping:false}, sold_quantity:389, condition:'new', currency_id:'CLP' },
    { id:'MLC1035', title:'Zapatillas New Balance 574 Unisex Gris', price:69990, original_price:99990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_newbalance.jpg', permalink:'https://www.mercadolibre.cl/p/MLC18110987', shipping:{free_shipping:false}, sold_quantity:423, condition:'new', currency_id:'CLP' },
    { id:'MLC1036', title:'Parka Columbia Hombre Impermeable Azul', price:89990, original_price:129990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_columbia.jpg', permalink:'https://www.mercadolibre.cl/p/MLC18009876', shipping:{free_shipping:false}, sold_quantity:234, condition:'new', currency_id:'CLP' },
    // Cámaras y Drones
    { id:'MLC1037', title:'Cámara GoPro Hero 12 Black + Accesorios Kit', price:249990, original_price:329990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_gopro.jpg', permalink:'https://www.mercadolibre.cl/p/MLC17998765', shipping:{free_shipping:true}, sold_quantity:78, condition:'new', currency_id:'CLP' },
    { id:'MLC1038', title:'Drone DJI Mini 4 Pro Fly More Combo RC2', price:899990, original_price:1099990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_dji.jpg', permalink:'https://www.mercadolibre.cl/p/MLC17887654', shipping:{free_shipping:true}, sold_quantity:23, condition:'new', currency_id:'CLP' },
    { id:'MLC1039', title:'Cámara Sony Alpha ZV-E10 + Lente 16-50mm', price:549990, original_price:699990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_sonyalpha.jpg', permalink:'https://www.mercadolibre.cl/p/MLC17776543', shipping:{free_shipping:true}, sold_quantity:45, condition:'new', currency_id:'CLP' },
    // Deportes
    { id:'MLC1040', title:'Bicicleta MTB Aluminio 29" 21 velocidades', price:199990, original_price:279990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_bicicleta.jpg', permalink:'https://www.mercadolibre.cl/p/MLC17665432', shipping:{free_shipping:false}, sold_quantity:167, condition:'new', currency_id:'CLP' },
    { id:'MLC1041', title:'Trotadora Eléctrica 2HP Plegable con WiFi', price:349990, original_price:469990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_trotadora.jpg', permalink:'https://www.mercadolibre.cl/p/MLC17554321', shipping:{free_shipping:true}, sold_quantity:89, condition:'new', currency_id:'CLP' },
    { id:'MLC1042', title:'Set Mancuernas Ajustables 2-24kg Bowflex', price:249990, original_price:329990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_mancuernas.jpg', permalink:'https://www.mercadolibre.cl/p/MLC17443210', shipping:{free_shipping:false}, sold_quantity:134, condition:'new', currency_id:'CLP' },
    // Varios
    { id:'MLC1043', title:'Kindle Paperwhite 16GB Waterproof 2023', price:79990, original_price:109990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_kindle.jpg', permalink:'https://www.mercadolibre.cl/p/MLC17332109', shipping:{free_shipping:true}, sold_quantity:289, condition:'new', currency_id:'CLP' },
    { id:'MLC1044', title:'Power Bank 20000mAh Anker 67W USB-C', price:39990, original_price:59990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_anker.jpg', permalink:'https://www.mercadolibre.cl/p/MLC17221098', shipping:{free_shipping:false}, sold_quantity:678, condition:'new', currency_id:'CLP' },
    { id:'MLC1045', title:'Impresora HP LaserJet Pro M404dn Monocromática', price:199990, original_price:269990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_hpprinter.jpg', permalink:'https://www.mercadolibre.cl/p/MLC17110987', shipping:{free_shipping:true}, sold_quantity:123, condition:'new', currency_id:'CLP' },
    { id:'MLC1046', title:'Router WiFi 6 TP-Link Archer AX73 AX5400', price:89990, original_price:129990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_tplink.jpg', permalink:'https://www.mercadolibre.cl/p/MLC17009876', shipping:{free_shipping:false}, sold_quantity:234, condition:'new', currency_id:'CLP' },
    { id:'MLC1047', title:'SSD Externo Samsung T7 1TB USB 3.2', price:79990, original_price:109990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_samsungssd.jpg', permalink:'https://www.mercadolibre.cl/p/MLC16998765', shipping:{free_shipping:false}, sold_quantity:456, condition:'new', currency_id:'CLP' },
    { id:'MLC1048', title:'Mochila Samsonite Porta Notebook 15.6" Negra', price:49990, original_price:74990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_samsonite.jpg', permalink:'https://www.mercadolibre.cl/p/MLC16887654', shipping:{free_shipping:false}, sold_quantity:345, condition:'new', currency_id:'CLP' },
  ]

  if (!query) return all
  const q = query.toLowerCase()
  const filtered = all.filter(p => p.title.toLowerCase().includes(q))
  return filtered.length ? filtered : all.slice(0, 12)
}

async function fetchML(url) {
  try {
    const res = await fetch(url, { headers: ML_HEADERS })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// SEARCH
app.get('/api/search', async (req, res) => {
  const { q, limit = 20, offset = 0, sort } = req.query
  if (!q) return res.status(400).json({ error: 'Query requerido' })

  let url = `https://api.mercadolibre.com/sites/MLC/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`
  if (sort === 'price_asc') url += '&sort=price_asc'
  if (sort === 'price_desc') url += '&sort=price_desc'

  const data = await fetchML(url)
  if (data && data.results) {
    return res.json({
      query: q, total: data.paging?.total || 0,
      offset: data.paging?.offset || 0, limit: data.paging?.limit || 20,
      products: data.results.map(formatProduct), source: 'live'
    })
  }

  // Fallback seed
  const products = getSeedProducts(q).map(formatProduct)
  res.json({ query: q, total: products.length, offset: 0, limit: products.length, products, source: 'seed' })
})

// DEALS
app.get('/api/deals', async (req, res) => {
  const data = await fetchML('https://api.mercadolibre.com/sites/MLC/search?q=oferta+especial&sort=price_asc&limit=20')
  if (data && data.results) {
    const products = data.results
      .filter(p => p.original_price && p.original_price > p.price)
      .map(formatProduct)
    if (products.length) return res.json({ products, source: 'live' })
  }
  const products = getSeedProducts().map(formatProduct)
  res.json({ products, source: 'seed' })
})

// CATEGORIES
app.get('/api/categories', (req, res) => {
  res.json({ categories: [
    { id:'MLC1051', name:'Celulares', icon:'📱', query:'celulares smartphones' },
    { id:'MLC1648', name:'Computación', icon:'💻', query:'notebook computador' },
    { id:'MLC1000', name:'Electrónica', icon:'🎧', query:'electronica auriculares' },
    { id:'MLC1276', name:'Televisores', icon:'📺', query:'televisor smart tv' },
    { id:'MLC1574', name:'Electrohogar', icon:'🏠', query:'electrohogar cocina' },
    { id:'MLC1132', name:'Ropa', icon:'👕', query:'ropa moda' },
    { id:'MLC1168', name:'Zapatillas', icon:'👟', query:'zapatillas nike adidas' },
    { id:'MLC1499', name:'Videojuegos', icon:'🎮', query:'videojuegos consolas' },
    { id:'MLC1367', name:'Deportes', icon:'⚽', query:'deportes fitness' },
    { id:'MLC1459', name:'Belleza', icon:'💄', query:'belleza cosmeticos' },
  ]})
})

// PRODUCT
app.get('/api/product/:id', async (req, res) => {
  const data = await fetchML(`https://api.mercadolibre.com/items/${req.params.id}`)
  if (data && data.id) return res.json(formatProduct(data))
  res.status(404).json({ error: 'Producto no encontrado' })
})

// HEALTH
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', affiliateId: ML_AFFILIATE_ID, timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`\n🚀 OfertasCL Backend en http://localhost:${PORT}`)
  console.log(`   Afiliado: ${ML_AFFILIATE_ID}`)
})
