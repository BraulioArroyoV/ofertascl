import React from 'react'
import { useStore } from '../store'

export default function Toast() {
  const { toast } = useStore()
  if (!toast) return null

  const bg = toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900'

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 toast-enter
      ${bg} text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg whitespace-nowrap`}>
      {toast.msg}
    </div>
  )
}
