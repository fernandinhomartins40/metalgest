
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
      <label className="text-sm font-medium text-slate-800" htmlFor={inputId}>
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
            "flex h-11 w-full rounded-xl border bg-background/95 px-3 py-2 pr-10 text-sm shadow-[0_1px_0_rgba(255,255,255,0.3)] ring-offset-background transition placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            error
              ? "border-red-300 bg-red-50"
              : "border-input",
            inputClassName
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-[#eef2ff] hover:text-[#2f2960] focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!error && hint ? <p className="text-sm text-slate-500">{hint}</p> : null}
    </div>
  )
}

export default PasswordInput
