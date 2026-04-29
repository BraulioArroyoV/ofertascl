import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { SkeletonGrid } from '../components/Skeleton'
import { useStore } from '../store'
import { getDeals } from '../api/client'

export default function Deals() {
  const navigate = useNavigate()
  const { deals, setDeals } = useStore()
  const [loading, setLoading] = useState(!deals.length)

  useEffect(() => {
    setLoading(true)
    getDeals()
      .then(d => setDeals(d.products || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="pb-24">
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <button onClick={() => navigate('/')} className="text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="text-base font-semibold">🔥 Ofertas del día</h1>
          <span className="ml-auto text-xs text-gray-400">{deals.length} productos</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {loading ? (
          <SkeletonGrid count={12} view="grid" />
        ) : deals.length ? (
          <div className="grid grid-cols-2 gap-3">
            {deals.map(p => <ProductCard key={p.id} product={p} view="grid" />)}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-sm">No hay ofertas disponibles ahora</p>
          </div>
        )}
      </div>
    </div>
  )
}
