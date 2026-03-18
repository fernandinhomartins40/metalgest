import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Loading } from "../components/ui/loading"
import { useToast } from "../components/ui/use-toast"
import { api } from "../services/api"
import { formatCurrency, formatDate, quoteStatusLabel, statusTone } from "../lib/formatters"

function PublicQuote() {
  const { token } = useParams()
  const { toast } = useToast()
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) return

    const loadQuote = async () => {
      try {
        setLoading(true)
        const data = await api.quotes.getByPublicToken(token)
        setQuote(data)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadQuote()
  }, [token])

  const handleStatus = async (status) => {
    if (!token) return

    try {
      setActionLoading(true)
      const updated = await api.quotes.updatePublicQuoteResponse(token, { status })
      setQuote(updated)
      toast({
        title: "Resposta registrada",
        description: `O orçamento foi marcado como ${quoteStatusLabel(updated.status).toLowerCase()}.`,
      })
    } catch (requestError) {
      toast({
        variant: "destructive",
        title: "Falha ao responder",
        description: requestError.message,
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loading size="lg" />
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Link indisponível</CardTitle>
            <CardDescription>{error || "O orçamento solicitado não foi encontrado."}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b border-slate-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Orçamento</p>
                <CardTitle className="mt-2">{quote.quoteNumber}</CardTitle>
                <CardDescription className="mt-2">
                  Emitido em {formatDate(quote.createdAt)} para {quote.client?.name}
                </CardDescription>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusTone(quote.status)}`}>
                {quoteStatusLabel(quote.status)}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Cliente</h3>
                <p className="mt-3 font-medium text-slate-900">{quote.client?.name}</p>
                <p className="text-sm text-slate-600">{quote.client?.email || "Sem e-mail"}</p>
                <p className="text-sm text-slate-600">{quote.client?.phone || "Sem telefone"}</p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Condições</h3>
                <p className="mt-3 text-sm text-slate-700">
                  Validade: {quote.validUntil ? formatDate(quote.validUntil) : "Sem vencimento"}
                </p>
                <p className="text-sm text-slate-700">Subtotal: {formatCurrency(quote.subtotal)}</p>
                <p className="text-sm text-slate-700">Desconto: {formatCurrency(quote.discount)}</p>
                <p className="text-sm text-slate-700">Impostos: {formatCurrency(quote.tax)}</p>
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Quantidade
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Unitário
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {quote.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {item.description || item.product?.name || item.service?.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-slate-700" colSpan={3}>
                      Total do orçamento
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900">
                      {formatCurrency(quote.totalValue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </section>

            {quote.notes ? (
              <section className="rounded-lg border border-slate-200 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Observações</h3>
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{quote.notes}</p>
              </section>
            ) : null}

            <div className="flex flex-col gap-3 md:flex-row md:justify-end">
              <Button variant="outline" onClick={() => window.print()}>
                Imprimir / PDF
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatus("REJECTED")}
                disabled={actionLoading}
              >
                Rejeitar
              </Button>
              <Button onClick={() => handleStatus("APPROVED")} disabled={actionLoading}>
                Aprovar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PublicQuote
