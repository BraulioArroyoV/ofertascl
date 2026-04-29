import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fetch from 'node-fetch'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const ML_AFFILIATE_ID = process.env.ML_AFFILIATE_ID || 'ARROYOBRAULIO20230821195606'
const ML_CLIENT_ID = process.env.ML_CLIENT_ID || ''
const ML_CLIENT_SECRET = process.env.ML_CLIENT_SECRET || ''

app.use(cors({ origin: '*' }))
app.use(express.json())

// ── Auto token manager ──────────────────────────────────────────────────────
let mlToken = null
let tokenExpiry = 0

async function getMLToken() {
  if (mlToken && Date.now() < tokenExpiry) return mlToken
  if (!ML_CLIENT_ID || !ML_CLIENT_SECRET) return null
  try {
    const res = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${ML_CLIENT_ID}&client_secret=${ML_CLIENT_SECRET}`
    })
    const data = await res.json()
    if (data.access_token) {
      mlToken = data.access_token
      tokenExpiry = Date.now() + (data.expires_in - 300) * 1000
      console.log('ML token renovado, expira en', Math.round(data.expires_in / 3600), 'horas')
      return mlToken
    }
  } catch (e) { console.error('Error obteniendo token ML:', e.message) }
  return null
}

async function mlFetch(url) {
  const token = await getMLToken()
  const headers = { 'Accept': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  try {
    const res = await fetch(url, { headers })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
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
    id: item.id, title: item.title, price: item.price,
    originalPrice: item.original_price || null, discountPct,
    currency: item.currency_id || 'CLP',
    thumbnail: (item.thumbnail || '').replace('http:', 'https:'),
    permalink: item.permalink, affiliateUrl: buildAffiliateUrl(item.permalink),
    freeShipping: item.shipping?.free_shipping || false,
    soldQuantity: item.sold_quantity || 0,
    condition: item.condition || 'new', source: 'mercadolibre', sourceName: 'MercadoLibre',
  }
}

// ── SEARCH ──────────────────────────────────────────────────────────────────
app.get('/api/search', async (req, res) => {
  const { q, limit = 20, offset = 0, sort } = req.query
  if (!q) return res.status(400).json({ error: 'Query requerido' })
  let url = `https://api.mercadolibre.com/sites/MLC/search?q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`
  if (sort === 'price_asc') url += '&sort=price_asc'
  if (sort === 'price_desc') url += '&sort=price_desc'
  const data = await mlFetch(url)
  if (data?.results?.length >= 0) {
    return res.json({
      query: q, total: data.paging?.total || 0,
      offset: data.paging?.offset || 0, limit: data.paging?.limit || 20,
      products: data.results.map(formatProduct), source: 'live'
    })
  }
  res.json({ query: q, total: 0, offset: 0, limit: 0, products: [],
    mlFallbackUrl: `https://listado.mercadolibre.cl/${encodeURIComponent(q)}?matt_tool=afiliados&matt_word=${ML_AFFILIATE_ID}`,
    source: 'no_match' })
})

// ── DEALS ───────────────────────────────────────────────────────────────────
app.get('/api/deals', async (req, res) => {
  const queries = ['oferta especial electronica', 'descuento celular notebook', 'liquidacion televisor']
  const results = await Promise.allSettled(
    queries.map(q => mlFetch(`https://api.mercadolibre.com/sites/MLC/search?q=${encodeURIComponent(q)}&sort=price_asc&limit=12`))
  )
  const seen = new Set()
  const products = results
    .filter(r => r.status === 'fulfilled' && r.value?.results)
    .flatMap(r => r.value.results)
    .filter(p => p.original_price && p.original_price > p.price)
    .filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true })
    .sort((a, b) => (1 - b.price / b.original_price) - (1 - a.price / a.original_price))
    .slice(0, 24).map(formatProduct)
  res.json({ products, source: products.length ? 'live' : 'empty' })
})

// ── CATEGORIES ──────────────────────────────────────────────────────────────
app.get('/api/categories', (_, res) => {
  res.json({ categories: [
    { id:'MLC1051', name:'Celulares', icon:'📱', query:'celulares smartphones' },
    { id:'MLC1648', name:'Computación', icon:'💻', query:'notebook computador' },
    { id:'MLC1000', name:'Electrónica', icon:'🎧', query:'electronica auriculares' },
    { id:'MLC1276', name:'Televisores', icon:'📺', query:'televisor smart tv' },
    { id:'MLC1574', name:'Electrohogar', icon:'🏠', query:'electrohogar cocina' },
    { id:'MLC1132', name:'Ropa', icon:'👕', query:'ropa moda' },
    { id:'MLC1168', name:'Zapatillas', icon:'👟', query:'zapatillas nike adidas' },
    { id:'MLC1499', name:'Videojuegos', icon:'🎮', query:'videojuegos ps5 xbox' },
    { id:'MLC1367', name:'Deportes', icon:'⚽', query:'deportes fitness' },
    { id:'MLC1459', name:'Belleza', icon:'💄', query:'belleza cosmeticos' },
  ]})
})

// ── HEALTH ──────────────────────────────────────────────────────────────────
app.get('/api/health', async (_, res) => {
  const token = await getMLToken()
  res.json({ status: 'ok', affiliateId: ML_AFFILIATE_ID, hasToken: !!token, timestamp: new Date().toISOString() })
})

getMLToken().then(() => {
  app.listen(PORT, () => {
    console.log(`\n OfertasCL Backend en http://localhost:${PORT}`)
    console.log(`   Afiliado: ${ML_AFFILIATE_ID}`)
    console.log(`   ML Token: ${mlToken ? 'activo' : 'sin credenciales'}`)
  })
})