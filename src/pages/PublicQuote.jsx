
import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loading } from "@/components/ui/loading"
import { FileText, CheckCircle, XCircle } from "lucide-react"
import { db } from "@/lib/db"
import { pdf } from "@/lib/pdf"

function PublicQuote() {
  const { token } = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [quote, setQuote] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadQuote()
  }, [token])

  const loadQuote = async () => {
    try {
      setLoading(true)
      const data = await db.quotes.getPublicLink(token)
      setQuote(data.quote)
    } catch (error) {
      console.error("Error loading quote:", error)
      setError(error.message)
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao carregar o orçamento.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResponse = async (status) => {
    try {
      setLoading(true)
      await db.quotes.updateQuoteResponse(token, {
        status,
        comments: ""
      })
      
      toast({
        title: "Resposta registrada",
        description: status === "approved" 
          ? "Orçamento aprovado com sucesso!"
          : "Orçamento rejeitado."
      })
      
      loadQuote()
    } catch (error) {
      console.error("Error updating response:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar sua resposta.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      setLoading(true)
      const doc = pdf.generateQuote(quote, { hideCosts: true })
      doc.save(`orcamento-${quote.id.substring(0, 8)}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar o PDF.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-red-500">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Orçamento #{quote.id.substring(0, 8)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Quote Details */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">Cliente</h3>
                <p>{quote.client.name}</p>
                <p>{quote.client.email}</p>
              </div>
              <div>
                <h3 className="font-semibold">Data</h3>
                <p>{new Date(quote.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Descrição</h3>
              <p>{quote.description}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Item</th>
                  <th className="text-left p-2">Quantidade</th>
                  <th className="text-right p-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{item.product.name}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2 text-right">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2" className="p-2 text-right font-semibold">
                    Total:
                  </td>
                  <td className="p-2 text-right font-semibold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(quote.total_value)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between items-center">
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={loading}
            >
              <FileText className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>

            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => handleResponse("rejected")}
                disabled={loading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeitar
              </Button>
              <Button
                variant="default"
                onClick={() => handleResponse("approved")}
                disabled={loading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprovar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PublicQuote
