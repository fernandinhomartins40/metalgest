import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

function AuthShell({
  pageLabel,
  pageTitle,
  pageDescription,
  cardBadge,
  cardTitle,
  cardDescription,
  panelBadge,
  panelTitle,
  panelDescription,
  panelItems = [],
  panelFooter,
  children,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07131a] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.18),transparent_32%),linear-gradient(135deg,#07131a_0%,#10212d_48%,#07131a_100%)]" />
      <div className="absolute left-[-3rem] top-20 h-48 w-48 rounded-full border border-white/10 bg-white/5 blur-3xl" />
      <div className="absolute bottom-12 right-[-2rem] h-56 w-56 rounded-full border border-amber-400/10 bg-amber-300/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="order-2 flex animate-in fade-in slide-in-from-left-4 duration-500 flex-col justify-between rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8 lg:order-1 lg:p-10">
            <div className="space-y-8">
              <div className="space-y-5">
                <div className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.32em] text-slate-200/80">
                  MetalGest
                </div>

                <div className="space-y-3">
                  {pageLabel ? (
                    <p className="text-sm font-medium uppercase tracking-[0.22em] text-amber-300/85">
                      {pageLabel}
                    </p>
                  ) : null}
                  <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                    {pageTitle}
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                    {pageDescription}
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/30 p-5">
                {panelBadge ? (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300/85">
                    {panelBadge}
                  </p>
                ) : null}
                <h2 className="text-2xl font-semibold text-white">{panelTitle}</h2>
                {panelDescription ? (
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{panelDescription}</p>
                ) : null}

                {panelItems.length > 0 ? (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {panelItems.map((item) => {
                      const Icon = item.icon

                      return (
                        <div
                          key={item.title}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-transform duration-300 hover:-translate-y-1"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/12 text-amber-200">
                              {Icon ? <Icon className="h-5 w-5" /> : null}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-white">{item.title}</p>
                              <p className="text-sm leading-6 text-slate-300">{item.description}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </div>

            {panelFooter ? <div className="mt-8 text-sm leading-7 text-slate-300">{panelFooter}</div> : null}
          </section>

          <section className="order-1 flex items-center justify-center lg:order-2">
            <Card className="w-full max-w-xl animate-in fade-in zoom-in-95 duration-500 rounded-[32px] border border-slate-200/80 bg-white/96 shadow-[0_28px_100px_rgba(15,23,42,0.28)]">
              <CardHeader className="space-y-4 border-b border-slate-100 px-6 pb-6 pt-7 sm:px-8">
                {cardBadge ? (
                  <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {cardBadge}
                  </div>
                ) : null}
                <div className="space-y-2">
                  <CardTitle className="text-3xl leading-tight text-slate-950">{cardTitle}</CardTitle>
                  {cardDescription ? (
                    <CardDescription className="text-sm leading-7 text-slate-600">
                      {cardDescription}
                    </CardDescription>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-7 pt-6 sm:px-8">{children}</CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}

export default AuthShell
