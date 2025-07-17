
import { toast } from "@/components/ui/use-toast"

const STORAGE_PREFIX = "metalgest_"

export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
      toast({
        title: "Erro ao salvar dados",
        description: "Não foi possível salvar os dados localmente.",
        variant: "destructive"
      })
    }
  },

  get: (key) => {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return null
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
    } catch (error) {
      console.error("Error removing from localStorage:", error)
    }
  },

  clear: () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  }
}
