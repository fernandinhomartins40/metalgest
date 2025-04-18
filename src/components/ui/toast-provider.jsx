
import React from "react"
import { useToast, ToastContext } from "@/components/ui/use-toast"

export function ToastProvider({ children }) {
  const value = useToast()
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
