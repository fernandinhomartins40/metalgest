
import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

export function useApi(apiFunction) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction(...args)
      return result
    } catch (err) {
      setError(err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An error occurred"
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFunction, toast])

  return {
    execute,
    loading,
    error
  }
}
