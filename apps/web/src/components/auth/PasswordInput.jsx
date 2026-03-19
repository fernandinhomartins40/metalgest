
import React, { useId, useState } from "react"
import { Eye, EyeOff } from "lucide-react"

function PasswordInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  autoComplete = "current-password",
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700" htmlFor={inputId}>
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
          className={`w-full rounded-md border px-3 py-2 pr-11 transition focus:outline-none focus:ring-2 ${
            error
              ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
              : "border-slate-300 focus:border-slate-400 focus:ring-slate-200"
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
          aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}

export default PasswordInput
