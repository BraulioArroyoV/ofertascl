import React, { useState } from 'react'
import { buildAffiliateUrl, formatCLP, copyAffiliateLink } from '../api/client'
import { useStore } from '../store'

const ML_LOGO = (
  <svg width="14" height="14" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#FFE600"/>
    <path d="M10 24l5-8 5 6 5-6 5 8" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default function ProductCard({ product, view = 'grid' }) {
  const [imgError, setImgError] = useState(false)
  const [copying, setCopying] = useState(false)
  const { isFavorite, addFavorite, removeFavorite, showToast, addAffiliateClick, addCopiedLink } = useStore()
  const fav = isFavorite(product.id)

  const handleClick = () => {
    addAffiliateClick()
    window.open(buildAffiliateUrl(product.permalink), '_blank', 'noopener')
  }

  const handleCopy = async (e) => {
    e.stopPropagation()
    if (copying) return
    setCopying(true)
    try {
      await copyAffiliateLink(product.permalink)
      addCopiedLink()
      showToast('Link de afiliado copiado ✓')
    } catch {
      showToast('Error al copiar', 'error')
    }
    setTimeout(() => setCopying(false), 1500)
  }

  const handleFav = (e) => {
    e.stopPropagation()
    if (fav) {
      removeFavorite(product.id)
      showToast('Eliminado de favoritos')
    } else {
      addFavorite(product)
      showToast('Guardado en favoritos ♥')
    }
  }

  if (view === 'list') {
    return (
      <div className="product-card card flex gap-3 p-3 cursor-pointer" onClick={handleClick}>
        <div className="w-20 h-20 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden">
          {!imgError && product.thumbnail ? (
            <img src={product.thumbnail} alt={product.title} className="w-full h-full object-contain"
              onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-600 leading-snug line-clamp-2 mb-1">{product.title}</p>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-semibold text-brand-orange">{formatCLP(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">{formatCLP(product.originalPrice)}</span>
            )}
            {product.discountPct > 0 && (
              <span className="badge badge-orange">-{product.discountPct}%</span>
            )}
          </div>
          <div className="flex gap-1.5 mt-1.5 flex-wrap items-center">
            {product.freeShipping && <span className="badge badge-green">Envío gratis</span>}
            {product.soldQuantity > 0 && (
              <span className="badge badge-blue">{product.soldQuantity}+ vendidos</span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-400">{ML_LOGO} MercadoLibre</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 justify-center">
          <button onClick={handleFav}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-red-300 transition-colors">
            <span className="text-xs">{fav ? '❤️' : '🤍'}</span>
          </button>
          <button onClick={handleCopy}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-orange transition-colors"
            title="Copiar link de afiliado">
            {copying ? (
              <span className="text-xs">✓</span>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Grid view (default)
  return (
    <div className="product-card card flex flex-col cursor-pointer overflow-hidden" onClick={handleClick}>
      <div className="relative bg-gray-50 aspect-square overflow-hidden">
        {!imgError && product.thumbnail ? (
          <img src={product.thumbnail} alt={product.title}
            className="w-full h-full object-contain p-2"
            onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
        )}
        {product.discountPct > 0 && (
          <div className="absolute top-2 left-2 badge badge-orange font-semibold">
            -{product.discountPct}%
          </div>
        )}
        <button onClick={handleFav}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
          <span className="text-xs">{fav ? '❤️' : '🤍'}</span>
        </button>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-gray-600 leading-snug line-clamp-2 flex-1 mb-2">{product.title}</p>
        <div className="flex items-baseline gap-1 flex-wrap mb-1">
          <span className="text-sm font-semibold text-brand-orange">{formatCLP(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">{formatCLP(product.originalPrice)}</span>
          )}
        </div>
        <div className="flex gap-1 flex-wrap mb-2">
          {product.freeShipping && <span className="badge badge-green text-[10px]">Envío gratis</span>}
          {product.soldQuantity > 10 && <span className="badge badge-blue text-[10px]">{product.soldQuantity}+ vendidos</span>}
        </div>
        <div className="flex gap-1.5">
          <button
            className="flex-1 text-xs py-1.5 rounded-lg bg-brand-orange text-white font-medium hover:bg-brand-dark transition-colors"
            onClick={handleClick}>
            Ver oferta
          </button>
          <button
            onClick={handleCopy}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-brand-orange transition-colors"
            title="Copiar link afiliado">
            {copying ? (
              <span className="text-xs text-green-600">✓</span>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
