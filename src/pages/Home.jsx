import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import ProductCard from '../components/ProductCard'
import { SkeletonGrid } from '../components/Skeleton'
import { useStore } from '../store'
import { getDeals, getCategories } from '../api/client'

const TRENDING = ['iPhone 15', 'AirPods', 'Zapatillas Nike', 'PS5', 'Notebook', 'Samsung TV', 'iPad', 'Xiaomi']

export default function Home() {
  const navigate = useNavigate()
  const { deals, setDeals, categories, setCategories } = useStore()
  const [loadingDeals, setLoadingDeals] = useState(!deals.length)
  const [loadingCats, setLoadingCats] = useState(!categories.length)

  useEffect(() => {
    if (!deals.length) {
      getDeals()
        .then(d => setDeals(d.products || []))
        .catch(console.error)
        .finally(() => setLoadingDeals(false))
    }
    if (!categories.length) {
      getCategories()
        .then(d => setCategories(d.categories || []))
        .catch(console.error)
        .finally(() => setLoadingCats(false))
    }
  }, [])

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-brand-orange flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>
              </svg>
            </div>
            <span className="text-lg font-semibold">Ofertas<span className="text-brand-orange">CL</span></span>
            <span className="ml-auto text-xs bg-brand-light text-brand-orange px-2 py-0.5 rounded-full font-medium">
              MercadoLibre
            </span>
          </div>
          <SearchBar />
        </div>

        {/* Trending pills */}
        <div className="scroll-x flex gap-2 px-4 pb-3">
          {TRENDING.map(t => (
            <button key={t}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-brand-light hover:text-brand-orange transition-colors"
              onClick={() => navigate(`/buscar?q=${encodeURIComponent(t)}`)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Categorías */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Categorías</h2>
          {loadingCats ? (
            <div className="grid grid-cols-5 gap-2">
              {Array(10).fill(0).map((_,i) => (
                <div key={i} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {categories.slice(0, 10).map(cat => (
                <button key={cat.id}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white border border-gray-100 hover:border-brand-orange hover:bg-brand-light transition-colors"
                  onClick={() => navigate(`/buscar?q=${encodeURIComponent(cat.query)}`)}>
                  <span className="text-xl leading-none">{cat.icon}</span>
                  <span className="text-[9px] text-gray-500 text-center leading-tight line-clamp-2">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Próximas tiendas banner */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 p-4 text-white">
          <p className="text-xs font-medium text-gray-300 mb-1">Próximamente</p>
          <p className="text-sm font-semibold mb-2">Más tiendas chilenas</p>
          <div className="flex gap-2 flex-wrap">
            {['Falabella', 'Ripley', 'Paris', 'AliExpress', 'Temu', 'Shein'].map(s => (
              <span key={s} className="text-xs bg-white/10 text-white/80 px-2.5 py-1 rounded-full">{s}</span>
            ))}
          </div>
        </div>

        {/* Ofertas del día */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">
              🔥 Ofertas del día
            </h2>
            <button
              className="text-xs text-brand-orange font-medium"
              onClick={() => navigate('/ofertas')}>
              Ver todas →
            </button>
          </div>
          {loadingDeals ? (
            <SkeletonGrid count={6} view="grid" />
          ) : deals.length ? (
            <div className="grid grid-cols-2 gap-3">
              {deals.slice(0, 6).map(p => (
                <ProductCard key={p.id} product={p} view="grid" />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              <p>No hay ofertas disponibles ahora</p>
              <p className="text-xs mt-1">Vuelve a intentarlo en unos minutos</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
