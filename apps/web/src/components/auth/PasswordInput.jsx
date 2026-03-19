
import React, { useId, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "../../utils/utils.js"

function PasswordInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  required = false,
  autoComplete = "current-password",
  className,
  inputClassName,
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={cn("space-y-2.5", className)}>
      <label className="text-sm font-semibold text-slate-700" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={cn(
            "w-full rounded-2xl border bg-white px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-4",
            error
              ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
              : "border-slate-200 focus:border-amber-400 focus:ring-amber-100",
            inputClassName
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
          aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!error && hint ? <p className="text-sm leading-6 text-slate-500">{hint}</p> : null}
    </div>
  )
}

export default PasswordInput
