import React from "react"
import { ShieldCheck } from "lucide-react"

function PasswordRequirements({
  title = "Forca da senha",
  strengthLabel,
  strengthClassName,
  strengthPercent,
  checks,
  footer,
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            <p className="text-sm text-slate-500">Use uma combinacao dificil de adivinhar.</p>
          </div>
        </div>
        <span className={`text-sm font-semibold ${strengthClassName}`}>{strengthLabel}</span>
      </div>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-300"
          style={{ width: `${strengthPercent}%` }}
        />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {checks.map(([label, passed]) => (
          <div
            key={label}
            className={`rounded-2xl border px-3 py-2 text-sm ${
              passed
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            <span className="font-semibold">{passed ? "OK" : "Pendente"}</span>
            {" - "}
            {label}
          </div>
        ))}
      </div>

      {footer ? <p className="mt-4 text-sm leading-6 text-slate-500">{footer}</p> : null}
    </div>
  )
}

export default PasswordRequirements
