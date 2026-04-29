// OfertasCL - Llama ML directo desde el browser (CORS permitido)
const ML_BASE = 'https://api.mercadolibre.com'
const ML_AFFILIATE_ID = 'ARROYOBRAULIO20230821195606'

export function buildAffiliateUrl(permalink) {
  if (!permalink || permalink === '#') return '#'
  const sep = permalink.includes('?') ? '&' : '?'
  return `${permalink}${sep}matt_tool=afiliados&matt_word=${ML_AFFILIATE_ID}`
}

export function formatCLP(amount) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
  }).format(Math.round(amount))
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

async function mlFetch(path, params = {}) {
  const url = new URL(ML_BASE + path)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) url.searchParams.set(k, v)
  })
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`ML API error ${res.status}`)
  return res.json()
}

export async function searchProducts({ q, limit = 20, offset = 0, sort, minPrice, maxPrice }) {
  const params = { q, limit, offset }
  if (sort === 'price_asc') params.sort = 'price_asc'
  if (sort === 'price_desc') params.sort = 'price_desc'
  const data = await mlFetch('/sites/MLC/search', params)
  let products = (data.results || []).map(formatProduct)
  if (minPrice) products = products.filter(p => p.price >= Number(minPrice))
  if (maxPrice) products = products.filter(p => p.price <= Number(maxPrice))
  return { query: q, total: data.paging?.total || 0, offset: data.paging?.offset || 0, limit: data.paging?.limit || 20, products }
}

export async function getDeals() {
  const queries = ['oferta especial electronica', 'descuento celular', 'liquidacion notebook']
  const results = await Promise.allSettled(
    queries.map(q => mlFetch('/sites/MLC/search', { q, sort: 'price_asc', limit: 12 }))
  )
  const seen = new Set()
  const products = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value.results || [])
    .filter(p => p.original_price && p.original_price > p.price)
    .filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true })
    .sort((a, b) => (1 - b.price / b.original_price) - (1 - a.price / a.original_price))
    .slice(0, 24)
    .map(formatProduct)
  return { products }
}

export async function getCategories() {
  return {
    categories: [
      { id: 'MLC1051', name: 'Celulares', icon: '📱', query: 'celulares smartphones' },
      { id: 'MLC1648', name: 'Computación', icon: '💻', query: 'notebook computador' },
      { id: 'MLC1000', name: 'Electrónica', icon: '🎧', query: 'electronica auriculares' },
      { id: 'MLC1276', name: 'Televisores', icon: '📺', query: 'televisor smart tv' },
      { id: 'MLC1574', name: 'Electrohogar', icon: '🏠', query: 'electrohogar cocina' },
      { id: 'MLC1132', name: 'Ropa', icon: '👕', query: 'ropa moda' },
      { id: 'MLC1168', name: 'Zapatillas', icon: '👟', query: 'zapatillas nike adidas' },
      { id: 'MLC1499', name: 'Videojuegos', icon: '🎮', query: 'videojuegos consolas ps5' },
      { id: 'MLC1367', name: 'Deportes', icon: '⚽', query: 'deportes fitness' },
      { id: 'MLC1459', name: 'Belleza', icon: '💄', query: 'belleza cosmeticos' },
    ]
  }
}

export async function getProduct(id) {
  const item = await mlFetch(`/items/${id}`)
  return formatProduct(item)
}

export async function copyAffiliateLink(permalink) {
  const url = buildAffiliateUrl(permalink)
  await navigator.clipboard.writeText(url)
  return url
}