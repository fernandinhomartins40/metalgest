import React from "react"
import { AlertCircle, CheckCircle2, Info, MailWarning } from "lucide-react"
import { cn } from "../../utils/utils.js"

const toneMap = {
  neutral: {
    wrapper: "border-slate-200 bg-slate-50 text-slate-700",
    icon: Info,
  },
  success: {
    wrapper: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: CheckCircle2,
  },
  warning: {
    wrapper: "border-amber-200 bg-amber-50 text-amber-900",
    icon: MailWarning,
  },
  error: {
    wrapper: "border-red-200 bg-red-50 text-red-900",
    icon: AlertCircle,
  },
}

function AuthNotice({ tone = "neutral", title, children, className, icon: CustomIcon }) {
  const config = toneMap[tone] || toneMap.neutral
  const Icon = CustomIcon || config.icon

  return (
    <div className={cn("rounded-2xl border px-4 py-4", config.wrapper, className)}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="space-y-1">
          {title ? <p className="text-sm font-semibold">{title}</p> : null}
          <div className="text-sm leading-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default AuthNotice
