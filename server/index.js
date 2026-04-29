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
    { id:'MLC1001', title:'iPhone 15 128GB Negro - Apple', price:749990, original_price:899990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_iphone15.jpg', permalink:'https://www.mercadolibre.cl/MLCiphone15', shipping:{free_shipping:true}, sold_quantity:234, condition:'new', currency_id:'CLP' },
    { id:'MLC1002', title:'Samsung Galaxy S24 256GB Violeta', price:649990, original_price:799990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_samsungs24.jpg', permalink:'https://www.mercadolibre.cl/MLCsamsungs24', shipping:{free_shipping:true}, sold_quantity:189, condition:'new', currency_id:'CLP' },
    { id:'MLC1003', title:'Notebook Lenovo IdeaPad 15" i5 16GB 512GB SSD', price:499990, original_price:649990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_lenovo.jpg', permalink:'https://www.mercadolibre.cl/MLClenovo', shipping:{free_shipping:true}, sold_quantity:156, condition:'new', currency_id:'CLP' },
    { id:'MLC1004', title:'Smart TV Samsung 55" 4K QLED 2024', price:449990, original_price:599990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_samsungtv.jpg', permalink:'https://www.mercadolibre.cl/MLCsamsungtv', shipping:{free_shipping:true}, sold_quantity:98, condition:'new', currency_id:'CLP' },
    { id:'MLC1005', title:'AirPods Pro 2da Generación Apple', price:179990, original_price:229990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_airpods.jpg', permalink:'https://www.mercadolibre.cl/MLCairpods', shipping:{free_shipping:true}, sold_quantity:445, condition:'new', currency_id:'CLP' },
    { id:'MLC1006', title:'PlayStation 5 Slim 1TB + 2 Controles', price:599990, original_price:749990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_ps5.jpg', permalink:'https://www.mercadolibre.cl/MLCps5', shipping:{free_shipping:true}, sold_quantity:67, condition:'new', currency_id:'CLP' },
    { id:'MLC1007', title:'iPad 10ma Generación 64GB WiFi', price:329990, original_price:419990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_ipad.jpg', permalink:'https://www.mercadolibre.cl/MLCipad', shipping:{free_shipping:true}, sold_quantity:123, condition:'new', currency_id:'CLP' },
    { id:'MLC1008', title:'Xiaomi Redmi Note 13 Pro 256GB', price:249990, original_price:329990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_xiaomi.jpg', permalink:'https://www.mercadolibre.cl/MLCxiaomi', shipping:{free_shipping:false}, sold_quantity:312, condition:'new', currency_id:'CLP' },
    { id:'MLC1009', title:'Aspiradora Robot Roomba i3 WiFi', price:199990, original_price:289990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_roomba.jpg', permalink:'https://www.mercadolibre.cl/MLCroomba', shipping:{free_shipping:true}, sold_quantity:78, condition:'new', currency_id:'CLP' },
    { id:'MLC1010', title:'Zapatillas Nike Air Max 270 Hombre', price:79990, original_price:109990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_nikeairmax.jpg', permalink:'https://www.mercadolibre.cl/MLCnikeairmax', shipping:{free_shipping:false}, sold_quantity:567, condition:'new', currency_id:'CLP' },
    { id:'MLC1011', title:'MacBook Air M2 13" 8GB 256GB', price:899990, original_price:1099990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_macbook.jpg', permalink:'https://www.mercadolibre.cl/MLCmacbook', shipping:{free_shipping:true}, sold_quantity:45, condition:'new', currency_id:'CLP' },
    { id:'MLC1012', title:'Monitor LG 27" 4K IPS 144Hz', price:299990, original_price:399990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_lgmonitor.jpg', permalink:'https://www.mercadolibre.cl/MLClgmonitor', shipping:{free_shipping:true}, sold_quantity:134, condition:'new', currency_id:'CLP' },
    { id:'MLC1013', title:'Microondas Electrolux 25L Digital', price:89990, original_price:129990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_microondas.jpg', permalink:'https://www.mercadolibre.cl/MLCmicroondas', shipping:{free_shipping:false}, sold_quantity:201, condition:'new', currency_id:'CLP' },
    { id:'MLC1014', title:'Auriculares Sony WH-1000XM5 Noise Cancelling', price:279990, original_price:369990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_sony.jpg', permalink:'https://www.mercadolibre.cl/MLCsony', shipping:{free_shipping:true}, sold_quantity:89, condition:'new', currency_id:'CLP' },
    { id:'MLC1015', title:'Smartwatch Samsung Galaxy Watch 6 44mm', price:149990, original_price:199990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_watch6.jpg', permalink:'https://www.mercadolibre.cl/MLCwatch6', shipping:{free_shipping:true}, sold_quantity:167, condition:'new', currency_id:'CLP' },
    { id:'MLC1016', title:'Tablet Samsung Galaxy Tab S9 256GB', price:549990, original_price:699990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_tabs9.jpg', permalink:'https://www.mercadolibre.cl/MLCtabs9', shipping:{free_shipping:true}, sold_quantity:56, condition:'new', currency_id:'CLP' },
    { id:'MLC1017', title:'Frigobar Samsung 85L Twin Cooling', price:229990, original_price:299990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_frigobar.jpg', permalink:'https://www.mercadolibre.cl/MLCfrigobar', shipping:{free_shipping:false}, sold_quantity:43, condition:'new', currency_id:'CLP' },
    { id:'MLC1018', title:'Teclado Mecánico Logitech G Pro X TKL', price:129990, original_price:179990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_logitech.jpg', permalink:'https://www.mercadolibre.cl/MLClogitech', shipping:{free_shipping:true}, sold_quantity:234, condition:'new', currency_id:'CLP' },
    { id:'MLC1019', title:'Cámara GoPro Hero 12 Black + Accesorios', price:249990, original_price:329990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_gopro.jpg', permalink:'https://www.mercadolibre.cl/MLCgopro', shipping:{free_shipping:true}, sold_quantity:78, condition:'new', currency_id:'CLP' },
    { id:'MLC1020', title:'Parlante JBL Charge 5 Bluetooth Waterproof', price:89990, original_price:129990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_jbl.jpg', permalink:'https://www.mercadolibre.cl/MLCjbl', shipping:{free_shipping:false}, sold_quantity:456, condition:'new', currency_id:'CLP' },
    { id:'MLC1021', title:'Zapatillas Adidas Ultraboost 22 Running', price:84990, original_price:119990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_adidas.jpg', permalink:'https://www.mercadolibre.cl/MLCadidas', shipping:{free_shipping:false}, sold_quantity:389, condition:'new', currency_id:'CLP' },
    { id:'MLC1022', title:'Drone DJI Mini 4 Pro con Control RC2', price:799990, original_price:999990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_dji.jpg', permalink:'https://www.mercadolibre.cl/MLCdji', shipping:{free_shipping:true}, sold_quantity:23, condition:'new', currency_id:'CLP' },
    { id:'MLC1023', title:'Consola Nintendo Switch OLED Blanca', price:349990, original_price:429990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_switch.jpg', permalink:'https://www.mercadolibre.cl/MLCswitch', shipping:{free_shipping:true}, sold_quantity:145, condition:'new', currency_id:'CLP' },
    { id:'MLC1024', title:'Refrigerador LG French Door 27 pies No Frost', price:1299990, original_price:1599990, thumbnail:'https://http2.mlstatic.com/D_NQ_NP_lgfridge.jpg', permalink:'https://www.mercadolibre.cl/MLClgfridge', shipping:{free_shipping:true}, sold_quantity:12, condition:'new', currency_id:'CLP' },
  ]

  if (!query) return all
  const q = query.toLowerCase()
  const filtered = all.filter(p => p.title.toLowerCase().includes(q))
  return filtered.length ? filtered : all.slice(0, 8)
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
