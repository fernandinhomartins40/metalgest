import React from "react"
import { cn } from "../../utils/utils.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

function AuthPageFrame({
  introLabel = "MetalGest",
  introTitle,
  introDescription,
  eyebrow,
  title,
  description,
  maxWidth = "max-w-md",
  cardClassName,
  cardContentClassName,
  children,
}) {
  return (
    <div className="auth-page-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className={cn("relative z-10 w-full", maxWidth)}>
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-[#8df3c8]">{introLabel}</p>
          {introTitle ? (
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-[2.15rem]">
              {introTitle}
            </h1>
          ) : null}
          {introDescription ? (
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              {introDescription}
            </p>
          ) : null}
        </div>

        <Card className={cn("auth-page-card w-full border-white/10", cardClassName)}>
          <CardHeader className="space-y-2 pb-5">
            {eyebrow ? (
              <p className="text-xs uppercase tracking-[0.3em] text-[#7c5cff]">{eyebrow}</p>
            ) : null}
            <CardTitle className="text-[1.9rem] text-slate-950">{title}</CardTitle>
            {description ? (
              <CardDescription className="text-[15px] leading-6 text-slate-600">
                {description}
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className={cardContentClassName}>{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AuthPageFrame
