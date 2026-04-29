import React from 'react'

export function ProductSkeleton({ view = 'grid' }) {
  if (view === 'list') {
    return (
      <div className="card flex gap-3 p-3 animate-pulse">
        <div className="skeleton w-20 h-20 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-2/3 rounded" />
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="flex gap-1">
            <div className="skeleton h-5 w-16 rounded-full" />
            <div className="skeleton h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="skeleton aspect-square w-full" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-5 w-1/2 rounded" />
        <div className="skeleton h-8 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8, view = 'grid' }) {
  return (
    <div className={view === 'list'
      ? 'flex flex-col gap-3'
      : 'grid grid-cols-2 gap-3'}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} view={view} />
      ))}
    </div>
  )
}
