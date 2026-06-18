'use client'
import { useEffect, useState } from 'react'
import { GuidedTour } from './GuidedTour'

const TOUR_KEY = 'sq:tour:seen'

/**
 * Mounts on the dashboard. Shows the guided tour if:
 *  – the user has never seen it (no localStorage key), OR
 *  – the URL contains ?tour=1  (triggered from Profile → "Take the tour")
 */
export function TourLauncher() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get('tour') === '1'
    const seen   = localStorage.getItem(TOUR_KEY)

    if (forced || !seen) {
      // Small delay so the page content fully renders before the tour starts
      const t = setTimeout(() => setShow(true), 900)
      return () => clearTimeout(t)
    }
  }, [])

  if (!show) return null
  return <GuidedTour onDone={() => setShow(false)} />
}
