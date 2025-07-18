
const CACHE_PREFIX = "metalgest_cache_"
const DEFAULT_TTL = 1000 * 60 * 5 // 5 minutes

export const cache = {
  set: (key, value, ttl = DEFAULT_TTL) => {
    const item = {
      value,
      timestamp: Date.now(),
      ttl
    }
    
    try {
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item))
    } catch (error) {
      console.error("Error saving to cache:", error)
      this.clear() // Clear cache if storage is full
    }
  },
  
  get: (key) => {
    try {
      const item = localStorage.getItem(`${CACHE_PREFIX}${key}`)
      if (!item) return null
      
      const { value, timestamp, ttl } = JSON.parse(item)
      
      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`)
        return null
      }
      
      return value
    } catch (error) {
      console.error("Error reading from cache:", error)
      return null
    }
  },
  
  clear: () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error("Error clearing cache:", error)
    }
  },
  
  clearExpired: () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          const item = JSON.parse(localStorage.getItem(key))
          if (Date.now() - item.timestamp > item.ttl) {
            localStorage.removeItem(key)
          }
        }
      })
    } catch (error) {
      console.error("Error clearing expired cache:", error)
    }
  }
}
