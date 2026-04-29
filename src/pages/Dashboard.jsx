import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { formatCLP } from '../api/client'

const ML_AFFILIATE_ID = 'ARROYOBRAULIO20230821195606'

const StatCard = ({ label, value, sub, color = 'text-gray-900' }) => (
  <div className="card p-4">
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className={`text-2xl font-semibold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
)

export default function Dashboard() {
  const navigate = useNavigate()
  const { affiliateClicks, copiedLinks, favorites, searchHistory } = useStore()

  const pendingSetup = [
    { done: true, label: 'Usuario ML configurado', detail: ML_AFFILIATE_ID },
    { done: false, label: 'App ID de MercadoLibre', detail: 'Regístrate en developers.mercadolibre.cl' },
    { done: false, label: 'Token de acceso ML', detail: 'Necesario para más resultados' },
    { done: false, label: 'Cuenta Soicos', detail: 'Red de afiliados para Falabella, Ripley, Paris' },
    { done: false, label: 'Dominio ofertascl.cl', detail: 'Registrar en NIC Chile o GoDaddy' },
    { done: false, label: 'Deploy backend', detail: 'Railway.app — gratis hasta cierto límite' },
  ]

  return (
    <div className="pb-24">
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <button onClick={() => navigate('/')} className="text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="text-base font-semibold">📊 Mi Dashboard</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-5">
        {/* Stats de actividad */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Actividad (esta sesión)</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Links de afiliado copiados" value={copiedLinks} color="text-brand-orange" sub="para compartir en redes" />
            <StatCard label="Clicks a productos" value={affiliateClicks} color="text-blue-600" sub="visitas generadas" />
            <StatCard label="Favoritos guardados" value={favorites.length} sub="productos guardados" />
            <StatCard label="Búsquedas realizadas" value={searchHistory.length} sub="historial total" />
          </div>
        </section>

        {/* ID de Afiliado */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Configuración de afiliado</h2>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-sm font-medium">MercadoLibre Chile</p>
            </div>
            <p className="text-xs text-gray-400 mb-1">Tu ID de afiliado</p>
            <p className="font-mono text-xs bg-gray-50 rounded-lg px-3 py-2 text-brand-orange break-all">
              {ML_AFFILIATE_ID}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Todos los links generados incluyen este parámetro automáticamente.
            </p>
          </div>
        </section>

        {/* Checklist de setup */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Checklist de setup</h2>
          <div className="card divide-y divide-gray-50">
            {pendingSetup.map((item, i) => (
              <div key={i} className="flex gap-3 items-start px-4 py-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                  ${item.done ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {item.done ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                </div>
                <div>
                  <p className={`text-sm ${item.done ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{item.label}</p>
                  <p className="text-xs text-gray-400">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Roadmap del proyecto</h2>
          <div className="card divide-y divide-gray-50">
            {[
              { phase: 'Fase 1', title: 'MercadoLibre Chile', status: 'En curso', color: 'bg-orange-100 text-orange-700' },
              { phase: 'Fase 2', title: 'Falabella + Ripley + Paris (Soicos)', status: 'Pendiente', color: 'bg-gray-100 text-gray-500' },
              { phase: 'Fase 3', title: 'AliExpress + Temu + Shein', status: 'Pendiente', color: 'bg-gray-100 text-gray-500' },
              { phase: 'Fase 4', title: 'App móvil (PWA / React Native)', status: 'Pendiente', color: 'bg-gray-100 text-gray-500' },
              { phase: 'Fase 5', title: 'Alertas de precio + Notificaciones', status: 'Pendiente', color: 'bg-gray-100 text-gray-500' },
              { phase: 'Fase 6', title: 'Comparador de precios multi-tienda', status: 'Pendiente', color: 'bg-gray-100 text-gray-500' },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-xs text-gray-400">{r.phase}</p>
                  <p className="text-sm text-gray-700">{r.title}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.color}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
