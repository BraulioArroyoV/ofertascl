import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import Home from './pages/Home'
import Search from './pages/Search'
import Deals from './pages/Deals'
import Favorites from './pages/Favorites'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="/ofertas" element={<Deals />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <BottomNav />
        <Toast />
      </div>
    </BrowserRouter>
  )
}
