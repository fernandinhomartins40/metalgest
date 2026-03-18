import React, { useEffect, useMemo, useState } from "react"
import { Copy, Link2, Plus, Trash2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Loading } from "../components/ui/loading"
import { useToast } from "../components/ui/use-toast"
import { api } from "../services/api"
import { formatCurrency, formatDate, quoteStatusLabel, statusTone, toDateInputValue } from "../lib/formatters"

const initialItem = {
  kind: "product",
  productId: "",
  serviceId: "",
  description: "",
  quantity: "1",
  unitPrice: "0",
}

const initialForm = {
  clientId: "",
  validUntil: toDateInputValue(),
  discount: "0",
  tax: "0",
  notes: "",
  termsAndConditions: "",
  items: [initialItem],
}

function Quotes() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [quotes, setQuotes] = useState([])
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [form, setForm] = useState(initialForm)

  const loadData = async () => {
    try {
      setLoading(true)
      const [quotesResult, clientsResult, productsResult, servicesResult] = await Promise.all([
        api.quotes.list(),
        api.clients.list(),
        api.products.list(),
        api.services.list(),
      ])

      setQuotes(quotesResult)
      setClients(clientsResult)
      setProducts(productsResult)
      setServices(servicesResult)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao carregar orçamentos",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const subtotal = useMemo(() => {
    return form.items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
      0
    )
  }, [form.items])

  const total = subtotal - Number(form.discount || 0) + Number(form.tax || 0)

  const updateItem = (index, patch) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }))
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const addItem = () => {
    setForm((current) => ({
      ...current,
      items: [...current.items, initialItem],
    }))
  }

  const removeItem = (index) => {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const applyCatalogItem = (index, kind, selectedId) => {
    if (kind === "product") {
      const selected = products.find((item) => item.id === selectedId)
      updateItem(index, {
        kind,
        productId: selectedId,
        serviceId: "",
        description: selected?.name || "",
        unitPrice: String(selected?.salePrice || 0),
      })
      return
    }

    if (kind === "service") {
      const selected = services.find((item) => item.id === selectedId)
      updateItem(index, {
        kind,
        productId: "",
        serviceId: selectedId,
        description: selected?.name || "",
        unitPrice: String(selected?.salePrice || 0),
      })
      return
    }

    updateItem(index, {
      kind: "custom",
      productId: "",
      serviceId: "",
    })
  }

  const resetForm = () => {
    setForm(initialForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      await api.quotes.create({
        clientId: form.clientId,
        validUntil: form.validUntil || undefined,
        discount: Number(form.discount || 0),
        tax: Number(form.tax || 0),
        notes: form.notes || undefined,
        termsAndConditions: form.termsAndConditions || undefined,
        items: form.items.map((item) => ({
          productId: item.kind === "product" ? item.productId || undefined : undefined,
          serviceId: item.kind === "service" ? item.serviceId || undefined : undefined,
          description: item.description,
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice || 0),
        })),
      })

      toast({
        title: "Orçamento criado",
        description: "O documento foi salvo como rascunho.",
      })

      resetForm()
      await loadData()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao criar orçamento",
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (quote) => {
    if (!window.confirm(`Excluir ${quote.quoteNumber}?`)) return

    try {
      await api.quotes.delete(quote.id)
      toast({
        title: "Orçamento removido",
        description: `${quote.quoteNumber} foi excluído.`,
      })
      await loadData()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao excluir orçamento",
        description: error.message,
      })
    }
  }

  const handleDuplicate = async (quote) => {
    try {
      await api.quotes.duplicate(quote.id)
      toast({
        title: "Orçamento duplicado",
        description: `${quote.quoteNumber} foi copiado com sucesso.`,
      })
      await loadData()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao duplicar orçamento",
        description: error.message,
      })
    }
  }

  const handleStatusChange = async (quote, status) => {
    try {
      await api.quotes.updateStatus(quote.id, status)
      await loadData()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao alterar status",
        description: error.message,
      })
    }
  }

  const handleTogglePublicLink = async (quote) => {
    try {
      const result = await api.quotes.togglePublicLink(quote.id, !quote.publicLinkEnabled)
      await loadData()

      if (result.publicLinkEnabled && result.publicToken) {
        const publicUrl = `${window.location.origin}/quote/${result.publicToken}`
        await navigator.clipboard.writeText(publicUrl)
        toast({
          title: "Link público ativado",
          description: "A URL foi copiada para a área de transferência.",
        })
      } else {
        toast({
          title: "Link público desativado",
          description: "O orçamento deixou de estar acessível externamente.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao alternar link público",
        description: error.message,
      })
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Orçamentos</h2>
        <p className="mt-2 text-slate-600">Criação, aprovação e publicação de propostas comerciais.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[460px,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Novo orçamento</CardTitle>
            <CardDescription>Os itens são calculados localmente e persistidos no backend próprio.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <select name="clientId" value={form.clientId} onChange={handleFormChange} className="w-full rounded-md border px-3 py-2" required>
                <option value="">Selecione o cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>

              <input
                name="validUntil"
                type="date"
                value={form.validUntil}
                onChange={handleFormChange}
                className="w-full rounded-md border px-3 py-2"
              />

              <div className="space-y-3">
                {form.items.map((item, index) => (
                  <div key={`${index}-${item.kind}`} className="rounded-lg border p-4">
                    <div className="grid gap-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <select
                          value={item.kind}
                          onChange={(event) => applyCatalogItem(index, event.target.value, "")}
                          className="rounded-md border px-3 py-2"
                        >
                          <option value="product">Produto</option>
                          <option value="service">Serviço</option>
                          <option value="custom">Item livre</option>
                        </select>

                        {item.kind === "product" ? (
                          <select
                            value={item.productId}
                            onChange={(event) => applyCatalogItem(index, "product", event.target.value)}
                            className="rounded-md border px-3 py-2"
                          >
                            <option value="">Selecione o produto</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        ) : item.kind === "service" ? (
                          <select
                            value={item.serviceId}
                            onChange={(event) => applyCatalogItem(index, "service", event.target.value)}
                            className="rounded-md border px-3 py-2"
                          >
                            <option value="">Selecione o serviço</option>
                            {services.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.name}
                              </option>
                            ))}
                          </select>
                        ) : null}
                      </div>

                      <input
                        value={item.description}
                        onChange={(event) => updateItem(index, { description: event.target.value })}
                        placeholder="Descrição"
                        className="rounded-md border px-3 py-2"
                        required
                      />

                      <div className="grid gap-3 md:grid-cols-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) => updateItem(index, { quantity: event.target.value })}
                          placeholder="Quantidade"
                          className="rounded-md border px-3 py-2"
                          required
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(event) => updateItem(index, { unitPrice: event.target.value })}
                          placeholder="Valor unitário"
                          className="rounded-md border px-3 py-2"
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeItem(index)}
                          disabled={form.items.length === 1}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="button" variant="outline" className="w-full" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar item
              </Button>

              <div className="grid gap-3 md:grid-cols-2">
                <input
                  name="discount"
                  type="number"
                  step="0.01"
                  value={form.discount}
                  onChange={handleFormChange}
                  placeholder="Desconto"
                  className="rounded-md border px-3 py-2"
                />
                <input
                  name="tax"
                  type="number"
                  step="0.01"
                  value={form.tax}
                  onChange={handleFormChange}
                  placeholder="Impostos"
                  className="rounded-md border px-3 py-2"
                />
              </div>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleFormChange}
                placeholder="Observações"
                rows={3}
                className="w-full rounded-md border px-3 py-2"
              />

              <textarea
                name="termsAndConditions"
                value={form.termsAndConditions}
                onChange={handleFormChange}
                placeholder="Condições comerciais"
                rows={3}
                className="w-full rounded-md border px-3 py-2"
              />

              <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <strong>{formatCurrency(subtotal)}</strong>
                </div>
                <div className="mt-2 flex justify-between">
                  <span>Total</span>
                  <strong>{formatCurrency(total)}</strong>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Salvando..." : "Criar orçamento"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
            <CardDescription>{quotes.length} orçamento(s) registrados na base.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quotes.map((quote) => (
              <div key={quote.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{quote.quoteNumber}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone(quote.status)}`}>
                        {quoteStatusLabel(quote.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{quote.client?.name}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                      <span>Total: {formatCurrency(quote.totalValue)}</span>
                      <span>Validade: {quote.validUntil ? formatDate(quote.validUntil) : "Sem prazo"}</span>
                      <span>Emissão: {formatDate(quote.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select
                      value={quote.status}
                      onChange={(event) => handleStatusChange(quote, event.target.value)}
                      className="rounded-md border px-3 py-2 text-sm"
                    >
                      <option value="DRAFT">Rascunho</option>
                      <option value="PENDING">Pendente</option>
                      <option value="APPROVED">Aprovado</option>
                      <option value="REJECTED">Rejeitado</option>
                      <option value="EXPIRED">Expirado</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={() => handleTogglePublicLink(quote)}>
                      <Link2 className="mr-2 h-4 w-4" />
                      {quote.publicLinkEnabled ? "Desativar link" : "Publicar"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDuplicate(quote)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(quote)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {quotes.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                Nenhum orçamento cadastrado ainda.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Quotes
