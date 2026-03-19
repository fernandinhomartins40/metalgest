import React from "react"
import { ToastContext, useToastState } from "./use-toast"

export function ToastProvider({ children }) {
  const value = useToastState()
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}
