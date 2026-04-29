import React from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useStore } from '../store'

export default function Favorites() {
  const navigate = useNavigate()
  const { favorites } = useStore()

  return (
    <div className="pb-24">
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <button onClick={() => navigate('/')} className="text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="text-base font-semibold">❤️ Favoritos</h1>
          <span className="ml-auto text-xs text-gray-400">{favorites.length} guardados</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {favorites.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">🤍</p>
            <p className="text-sm font-medium text-gray-600 mb-1">No tienes favoritos aún</p>
            <p className="text-xs mb-4">Toca el corazón en cualquier producto para guardarlo</p>
            <button className="btn-primary" onClick={() => navigate('/buscar')}>
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {favorites.map(p => <ProductCard key={p.id} product={p} view="grid" />)}
          </div>
        )}
      </div>
    </div>
  )
}
