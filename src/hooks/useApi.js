
import { useState, useCallback } from "react"
import { useToast } from "../components/ui/use-toast"

export function useApi(apiFunction) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const { toast } = useToast()

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err)
      setData(null)
      
      // Don't show toast for auth errors (handled by httpClient)
      if (err.status !== 401) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: err.message || "Ocorreu um erro inesperado"
        })
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFunction, toast])

  const reset = useCallback(() => {
    setError(null)
    setData(null)
    setLoading(false)
  }, [])

  return {
    execute,
    loading,
    error,
    data,
    reset
  }
}
