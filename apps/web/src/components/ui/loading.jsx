
import React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "../../utils/utils.js"

export function Loading({ className, size = "default", fullScreen = false }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071826]/35 backdrop-blur-sm">
        <div className="auth-page-card rounded-[1.35rem] p-6 flex flex-col items-center gap-4">
          <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
          <p className="text-sm text-slate-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  )
}
