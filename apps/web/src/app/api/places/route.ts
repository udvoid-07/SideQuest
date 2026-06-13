import { NextResponse } from 'next/server'

export interface PlaceResult {
  name: string
  address: string
  rating: number | null
  totalRatings: number
  placeId: string
  lat: number
  lng: number
  mapsUrl: string
}

// Module-level cache: key = `${query}|${city}` → results
// Nominatim enforces 1 req/sec; caching prevents hammering on re-renders
const resultCache = new Map<string, PlaceResult[]>()

interface NominatimResult {
  place_id: number
  osm_type: string
  osm_id: number
  display_name: string
  lat: string
  lon: string
  address?: {
    amenity?: string
    leisure?: string
    tourism?: string
    shop?: string
    road?: string
    suburb?: string
    neighbourhood?: string
    city?: string
    town?: string
    state?: string
    house_number?: string
  }
}

function buildAddress(r: NominatimResult): string {
  const a = r.address ?? {}
  const parts = [
    a.house_number && a.road ? `${a.house_number} ${a.road}` : a.road,
    a.suburb ?? a.neighbourhood,
    a.city ?? a.town,
    a.state,
  ].filter(Boolean)

  if (parts.length >= 2) return parts.join(', ')
  // Fallback: trim display_name to first 3 comma-segments
  return r.display_name.split(',').slice(0, 3).join(',').trim()
}

function nominatimToPlace(r: NominatimResult, query: string): PlaceResult | null {
  const lat = parseFloat(r.lat)
  const lng = parseFloat(r.lon)
  if (isNaN(lat) || isNaN(lng)) return null

  // Derive a short name: prefer amenity/leisure/tourism/shop tag, else first segment of display_name
  const a = r.address ?? {}
  const name = a.amenity ?? a.leisure ?? a.tourism ?? a.shop
    ?? r.display_name.split(',')[0].trim()

  // Skip results whose name looks like a city/region (too broad)
  if (!name || name.length > 80) return null

  return {
    name,
    address: buildAddress(r),
    rating: null,
    totalRatings: 0,
    placeId: `osm-${r.osm_type}-${r.osm_id}`,
    lat,
    lng,
    mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')?.trim()
  const city  = searchParams.get('city')?.trim() ?? ''

  // Input validation — prevent oversized/malformed inputs reaching Nominatim
  if (!query || query.length > 100) {
    return NextResponse.json({ error: 'query required (max 100 chars)' }, { status: 400 })
  }
  if (city.length > 80) {
    return NextResponse.json({ error: 'city too long (max 80 chars)' }, { status: 400 })
  }
  // Only allow safe characters for place-name queries
  if (!/^[\w\s',\-&.()]+$/i.test(query) || (city && !/^[\w\s',\-&.()]+$/i.test(city))) {
    return NextResponse.json({ error: 'Invalid characters in query or city' }, { status: 400 })
  }

  const cacheKey = `${query.toLowerCase()}|${city.toLowerCase()}`
  const cached = resultCache.get(cacheKey)
  if (cached) return NextResponse.json({ places: cached })

  // Combine query + city for a single Nominatim search — no separate geocoding step
  const searchTerm = city ? `${query} ${city} India` : `${query} India`
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&limit=10&addressdetails=1&countrycodes=in`

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)

    let res: Response
    try {
      res = await fetch(url, {
        headers: { 'User-Agent': 'SideQuest/1.0 (tools@stratschool.org)' },
        signal: controller.signal,
        next: { revalidate: 3600 },
      })
    } finally {
      clearTimeout(timer)
    }

    const data: NominatimResult[] = await res.json()

    const places: PlaceResult[] = data
      .map(r => nominatimToPlace(r, query))
      .filter((p): p is PlaceResult => p !== null)
      .slice(0, 6)

    if (places.length === 0) {
      return NextResponse.json({ places: [], fallback: true })
    }

    resultCache.set(cacheKey, places)
    return NextResponse.json({ places })
  } catch {
    return NextResponse.json({ places: [], fallback: true })
  }
}
