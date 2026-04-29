import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import ProductCard from '../components/ProductCard'
import { SkeletonGrid } from '../components/Skeleton'
import { useStore } from '../store'
import { searchProducts, formatCLP } from '../api/client'

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
]

export default function Search() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const q = params.get('q') || ''
  const { sortBy, setSortBy, filters, setFilters, showToast } = useStore()

  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [offset, setOffset] = useState(0)
  const [view, setView] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const LIMIT = 20

  const doSearch = useCallback(async (query, off = 0, append = false) => {
    if (!query) return
    if (off === 0) setLoading(true)
    else setLoadingMore(true)
    setError(null)
    try {
      const data = await searchProducts({
        q: query,
        limit: LIMIT,
        offset: off,
        sort: sortBy,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
      })
      if (append) {
        setResults(r => [...r, ...data.products])
      } else {
        setResults(data.products)
        setOffset(0)
      }
      setTotal(data.total)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [sortBy, filters])

  useEffect(() => {
    if (q) doSearch(q, 0)
  }, [q, sortBy, filters])

  const loadMore = () => {
    const newOffset = offset + LIMIT
    setOffset(newOffset)
    doSearch(q, newOffset, true)
  }

  const handleNewSearch = (term) => {
    navigate(`/buscar?q=${encodeURIComponent(term)}`)
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div className="flex-1">
              <SearchBar onSearch={handleNewSearch} initialValue={q} />
            </div>
          </div>

          {/* Controles */}
          <div className="flex gap-2 items-center">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 outline-none">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1
                ${showFilters ? 'bg-brand-orange text-white border-brand-orange' : 'border-gray-200 text-gray-600'}`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/>
                <line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filtros
            </button>

            <label className="flex items-center gap-1 text-xs text-gray-600 ml-auto">
              <input type="checkbox"
                checked={filters.freeShipping}
                onChange={e => setFilters({ freeShipping: e.target.checked })}
                className="accent-brand-orange" />
              Envío gratis
            </label>

            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              {['grid', 'list'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`p-1.5 transition-colors ${view === v ? 'bg-gray-100' : ''}`}>
                  {v === 'grid' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
                      <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros expandibles */}
          {showFilters && (
            <div className="mt-2 pt-2 border-t border-gray-100 flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Precio mínimo</label>
                <input type="number" placeholder="$0"
                  value={filters.minPrice}
                  onChange={e => setFilters({ minPrice: e.target.value })}
                  className="input text-xs h-8" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Precio máximo</label>
                <input type="number" placeholder="Sin límite"
                  value={filters.maxPrice}
                  onChange={e => setFilters({ maxPrice: e.target.value })}
                  className="input text-xs h-8" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-3">
        {/* Stats */}
        {!loading && q && (
          <p className="text-xs text-gray-400 mb-3">
            {total > 0 ? `${total.toLocaleString('es-CL')} resultados para "${q}"` : `Sin resultados para "${q}"`}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-xl p-4 mb-4">
            ⚠️ {error}
            <button className="ml-2 underline" onClick={() => doSearch(q)}>Reintentar</button>
          </div>
        )}

        {/* Resultados */}
        {loading ? (
          <SkeletonGrid count={8} view={view} />
        ) : !q ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm">Escribe algo para buscar</p>
          </div>
        ) : results.length === 0 && !error ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-sm font-medium text-gray-600">Sin resultados para "{q}"</p>
            <p className="text-xs mt-1">Prueba con otras palabras</p>
          </div>
        ) : (
          <>
            <div className={view === 'list' ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-3'}>
              {results
                .filter(p => !filters.freeShipping || p.freeShipping)
                .map(p => <ProductCard key={p.id} product={p} view={view} />)
              }
            </div>

            {/* Load more */}
            {results.length < total && (
              <div className="mt-6 text-center">
                <button
                  className="btn-ghost"
                  onClick={loadMore}
                  disabled={loadingMore}>
                  {loadingMore ? 'Cargando...' : `Ver más (${total - results.length} restantes)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
