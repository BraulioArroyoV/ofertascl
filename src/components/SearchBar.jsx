import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'

export default function SearchBar({ onSearch, initialValue = '', autoFocus = false }) {
  const [val, setVal] = useState(initialValue)
  const [showHistory, setShowHistory] = useState(false)
  const { searchHistory, addToHistory } = useStore()
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => { setVal(initialValue) }, [initialValue])
  useEffect(() => { if (autoFocus) inputRef.current?.focus() }, [autoFocus])

  const submit = (q) => {
    const term = (q || val).trim()
    if (!term) return
    addToHistory(term)
    setShowHistory(false)
    setVal(term)
    if (onSearch) {
      onSearch(term)
    } else {
      navigate(`/buscar?q=${encodeURIComponent(term)}`)
    }
  }

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={val}
            placeholder="iPhone, zapatillas Nike, Samsung TV..."
            className="input pl-9 pr-3"
            onChange={e => setVal(e.target.value)}
            onFocus={() => searchHistory.length && setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 150)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>
        <button className="btn-primary" onClick={() => submit()}>
          Buscar
        </button>
      </div>

      {showHistory && searchHistory.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-lg z-50 overflow-hidden">
          <p className="text-xs text-gray-400 px-3 pt-2 pb-1">Búsquedas recientes</p>
          {searchHistory.map((h, i) => (
            <button key={i}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              onClick={() => submit(h)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {h}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
