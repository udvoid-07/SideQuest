'use client'
import { useEffect, useState } from 'react'
import { MapPin, Star, Navigation, ExternalLink, AlertCircle } from 'lucide-react'
import type { PlaceResult } from '@/app/api/places/route'

interface NearbyLocationsProps {
  readonly searchQuery: string
  readonly city: string
}

function StarRating({ rating }: { readonly rating: number }) {
  const full  = Math.floor(rating)
  const half  = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: full  }).map((_, i) => <span key={`f${i}`} className="text-amber-400 text-xs">★</span>)}
      {half && <span className="text-amber-300 text-xs">½</span>}
      {Array.from({ length: empty }).map((_, i) => <span key={`e${i}`} className="text-void-600 text-xs">★</span>)}
    </span>
  )
}

function SafetyBadge({ rating }: { readonly rating: number | null }) {
  if (rating === null) return <span className="text-[10px] text-ash">No rating yet</span>
  const label = rating >= 4.5 ? 'Highly Trusted'
              : rating >= 4.0 ? 'Well Rated'
              : rating >= 3.5 ? 'Generally Positive'
              : 'Mixed Reviews'
  const color = rating >= 4.5 ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
              : rating >= 4.0 ? 'text-blue-400 bg-blue-500/15 border-blue-500/30'
              : rating >= 3.5 ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
              : 'text-red-400 bg-red-500/15 border-red-500/30'
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      {label}
    </span>
  )
}

export function NearbyLocations({ searchQuery, city }: NearbyLocationsProps) {
  const [places, setPlaces]   = useState<PlaceResult[]>([])
  const [loading, setLoading] = useState(true)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    fetch(`/api/places?query=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(city)}`)
      .then(r => r.json())
      .then(data => {
        setPlaces(data.places ?? [])
        setFallback(!!data.fallback)
      })
      .catch(() => setFallback(true))
      .finally(() => setLoading(false))
  }, [searchQuery, city])

  if (loading) {
    return (
      <div className="space-y-2 mt-1">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ))}
      </div>
    )
  }

  if (fallback || places.length === 0) {
    const mapsSearchUrl = `https://www.google.com/maps/search/${encodeURIComponent(`${searchQuery} in ${city}`)}`
    return (
      <a
        href={mapsSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-void-800/50 hover:border-ember/40 hover:bg-void-700/50 transition-all group"
      >
        <div className="w-9 h-9 rounded-lg bg-ember/15 flex items-center justify-center flex-shrink-0">
          <MapPin size={16} className="text-ember" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">Search on Google Maps</p>
          <p className="text-xs text-ash">Find {searchQuery} near {city}</p>
        </div>
        <ExternalLink size={14} className="text-ash group-hover:text-ember transition-colors flex-shrink-0" />
      </a>
    )
  }

  return (
    <div className="space-y-2 mt-1">
      {places.map(place => (
        <div
          key={place.placeId}
          className="rounded-xl border border-white/8 bg-void-800/40 overflow-hidden"
        >
          <div className="p-3 flex items-start gap-3">
            {/* Map pin */}
            <div className="w-8 h-8 rounded-lg bg-ember/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin size={14} className="text-ember" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-snug">{place.name}</p>
              <p className="text-[11px] text-ash mt-0.5 leading-relaxed line-clamp-2">{place.address}</p>

              {/* Rating row */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {place.rating !== null && (
                  <div className="flex items-center gap-1">
                    <StarRating rating={place.rating} />
                    <span className="text-[11px] text-amber-400 font-semibold">{place.rating.toFixed(1)}</span>
                    {place.totalRatings > 0 && (
                      <span className="text-[10px] text-ash">({place.totalRatings.toLocaleString()})</span>
                    )}
                  </div>
                )}
                <SafetyBadge rating={place.rating} />
              </div>
            </div>

            {/* Navigate button */}
            <a
              href={place.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-void-700 border border-white/10 flex items-center justify-center hover:bg-ember/20 hover:border-ember/40 transition-all group"
              title={`Navigate to ${place.name}`}
              aria-label={`Open ${place.name} in Google Maps`}
            >
              <Navigation size={14} className="text-ash group-hover:text-ember transition-colors" />
            </a>
          </div>
        </div>
      ))}

      <p className="text-[10px] text-ash text-center pt-1 flex items-center justify-center gap-1">
        <AlertCircle size={10} />
        Location data from OpenStreetMap contributors. Always verify before visiting.
      </p>
    </div>
  )
}
