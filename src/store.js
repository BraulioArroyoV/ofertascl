import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─────────────────────────────────────────────
// Store principal de OfertasCL
// ─────────────────────────────────────────────

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Búsqueda ──────────────────────────
      query: '',
      results: [],
      totalResults: 0,
      isLoading: false,
      error: null,
      currentPage: 0,
      sortBy: 'relevance',
      filters: { minPrice: '', maxPrice: '', freeShipping: false, condition: 'all' },

      setQuery: (q) => set({ query: q }),
      setResults: (results, total) => set({ results, totalResults: total }),
      setLoading: (v) => set({ isLoading: v }),
      setError: (e) => set({ error: e }),
      setPage: (p) => set({ currentPage: p }),
      setSortBy: (s) => set({ sortBy: s }),
      setFilters: (f) => set({ filters: { ...get().filters, ...f } }),
      clearFilters: () => set({ filters: { minPrice: '', maxPrice: '', freeShipping: false, condition: 'all' } }),

      // ── Favoritos (persiste en localStorage) ──
      favorites: [],
      addFavorite: (product) => set(s => ({
        favorites: s.favorites.find(f => f.id === product.id)
          ? s.favorites
          : [product, ...s.favorites]
      })),
      removeFavorite: (id) => set(s => ({ favorites: s.favorites.filter(f => f.id !== id) })),
      isFavorite: (id) => get().favorites.some(f => f.id === id),

      // ── Historial de búsqueda ──
      searchHistory: [],
      addToHistory: (q) => set(s => ({
        searchHistory: [q, ...s.searchHistory.filter(h => h !== q)].slice(0, 10)
      })),
      clearHistory: () => set({ searchHistory: [] }),

      // ── Deals del día ──
      deals: [],
      setDeals: (deals) => set({ deals }),

      // ── Categorías ──
      categories: [],
      setCategories: (cats) => set({ categories: cats }),

      // ── Toast notifications ──
      toast: null,
      showToast: (msg, type = 'success') => {
        set({ toast: { msg, type, id: Date.now() } })
        setTimeout(() => set({ toast: null }), 2500)
      },

      // ── Stats de afiliado (local, sin servidor) ──
      affiliateClicks: 0,
      copiedLinks: 0,
      addAffiliateClick: () => set(s => ({ affiliateClicks: s.affiliateClicks + 1 })),
      addCopiedLink: () => set(s => ({ copiedLinks: s.copiedLinks + 1 })),
    }),
    {
      name: 'ofertascl-storage',
      partialize: (s) => ({
        favorites: s.favorites,
        searchHistory: s.searchHistory,
        affiliateClicks: s.affiliateClicks,
        copiedLinks: s.copiedLinks,
      })
    }
  )
)
