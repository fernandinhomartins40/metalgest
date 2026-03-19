import React, { useId } from "react"
import { cn } from "../../utils/utils.js"

function AuthField({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
  error,
  hint,
  className,
  inputClassName,
}) {
  const generatedId = useId()
  const inputId = id || generatedId

  return (
    <div className={cn("space-y-2.5", className)}>
      <label className="text-sm font-semibold text-slate-700" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={cn(
          "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-4",
          error
            ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
            : "border-slate-200 focus:border-amber-400 focus:ring-amber-100",
          inputClassName
        )}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!error && hint ? <p className="text-sm leading-6 text-slate-500">{hint}</p> : null}
    </div>
  )
}

export default AuthField
