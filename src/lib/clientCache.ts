/**
 * High-performance Client-Side Cache for instant page transitions and SWR revalidation.
 * Stores route and dashboard data in memory & sessionStorage.
 */

const memoryCache = new Map<string, { data: any; timestamp: number }>()

export function saveClientCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  const payload = { data, timestamp: Date.now() }
  memoryCache.set(key, payload)
  try {
    sessionStorage.setItem(`falix_cache_${key}`, JSON.stringify(payload))
  } catch (e) {
    // Ignore storage quota errors
  }
}

export function getClientCache<T>(key: string, maxAgeMs: number = 1000 * 60 * 15): T | null {
  if (typeof window === 'undefined') return null

  // 1. Check in-memory cache first (0ms)
  const mem = memoryCache.get(key)
  if (mem && (Date.now() - mem.timestamp < maxAgeMs)) {
    return mem.data as T
  }

  // 2. Check sessionStorage fallback
  try {
    const raw = sessionStorage.getItem(`falix_cache_${key}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Date.now() - parsed.timestamp < maxAgeMs) {
        memoryCache.set(key, parsed)
        return parsed.data as T
      }
    }
  } catch (e) {
    // Return null if parsing fails
  }

  return null
}

export function clearClientCache(key?: string): void {
  if (typeof window === 'undefined') return
  if (key) {
    memoryCache.delete(key)
    try { sessionStorage.removeItem(`falix_cache_${key}`) } catch (e) {}
  } else {
    memoryCache.clear()
    try {
      Object.keys(sessionStorage).forEach(k => {
        if (k.startsWith('falix_cache_')) sessionStorage.removeItem(k)
      })
    } catch (e) {}
  }
}
