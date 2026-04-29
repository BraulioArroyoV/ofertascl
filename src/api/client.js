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

async function api(path, params = {}) {
  const url = new URL('http://localhost:3001/api' + path)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) url.searchParams.set(k, v)
  })
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function searchProducts({ q, limit = 20, offset = 0, sort, minPrice, maxPrice }) {
  return api('/search', { q, limit, offset, sort, min_price: minPrice, max_price: maxPrice })
}

export async function getDeals() {
  return api('/deals')
}

export async function getCategories() {
  return api('/categories')
}

export async function getProduct(id) {
  return api(`/product/${id}`)
}

export async function copyAffiliateLink(permalink) {
  const url = buildAffiliateUrl(permalink)
  await navigator.clipboard.writeText(url)
  return url
}
