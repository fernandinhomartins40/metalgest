import React, { useEffect, useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Loading } from "../components/ui/loading"
import { useToast } from "../components/ui/use-toast"
import { api } from "../services/api"
import { formatDate, orderStatusLabel, statusTone, toDateInputValue } from "../lib/formatters"

const initialForm = {
  clientId: "",
  quoteId: "",
  description: "",
  priority: "MEDIUM",
  startDate: toDateInputValue(),
  estimatedEndDate: toDateInputValue(),
  notes: "",
}

function Production() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [quotes, setQuotes] = useState([])
  const [form, setForm] = useState(initialForm)

  const loadData = async () => {
    try {
      setLoading(true)
      const [ordersResult, clientsResult, quotesResult] = await Promise.all([
        api.serviceOrders.list(),
        api.clients.list(),
        api.quotes.list(),
      ])

      setOrders(ordersResult)
      setClients(clientsResult)
      setQuotes(quotesResult.filter((quote) => quote.status === "APPROVED"))
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao carregar produção",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const counters = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((order) => order.status === "PENDING").length,
      inProgress: orders.filter((order) => order.status === "IN_PROGRESS").length,
      completed: orders.filter((order) => order.status === "COMPLETED").length,
      cancelled: orders.filter((order) => order.status === "CANCELLED").length,
    }
  }, [orders])

  const availableQuotes = useMemo(() => {
    if (!form.clientId) return quotes
    return quotes.filter((quote) => quote.clientId === form.clientId)
  }, [quotes, form.clientId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setForm(initialForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      await api.serviceOrders.create({
        clientId: form.clientId,
        quoteId: form.quoteId || undefined,
        description: form.description,
        priority: form.priority,
        startDate: form.startDate || undefined,
        estimatedEndDate: form.estimatedEndDate || undefined,
        notes: form.notes || undefined,
      })

      toast({
        title: "Ordem criada",
        description: "A ordem de serviço foi registrada.",
      })

      resetForm()
      await loadData()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao criar ordem",
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (order, status) => {
    try {
      await api.serviceOrders.updateStatus(order.id, status)
      await loadData()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao alterar status",
        description: error.message,
      })
    }
  }

  const handleDelete = async (order) => {
    if (!window.confirm(`Excluir ${order.orderNumber}?`)) return

    try {
      await api.serviceOrders.delete(order.id)
      toast({
        title: "Ordem removida",
        description: `${order.orderNumber} foi excluída.`,
      })
      await loadData()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao excluir ordem",
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
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Produção</h2>
        <p className="mt-2 text-slate-600">Ordens de serviço originadas do fluxo comercial aprovado.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Total", counters.total],
          ["Pendentes", counters.pending],
          ["Em produção", counters.inProgress],
          ["Concluídas", counters.completed],
          ["Canceladas", counters.cancelled],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-3">
              <CardDescription>{label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[420px,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nova ordem de serviço</CardTitle>
            <CardDescription>Crie uma OS vinculada a cliente e, opcionalmente, a um orçamento aprovado.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <select name="clientId" value={form.clientId} onChange={handleChange} className="w-full rounded-md border px-3 py-2" required>
                <option value="">Selecione o cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>

              <select name="quoteId" value={form.quoteId} onChange={handleChange} className="w-full rounded-md border px-3 py-2">
                <option value="">Sem orçamento vinculado</option>
                {availableQuotes.map((quote) => (
                  <option key={quote.id} value={quote.id}>
                    {quote.quoteNumber}
                  </option>
                ))}
              </select>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Descrição operacional"
                rows={4}
                className="w-full rounded-md border px-3 py-2"
                required
              />

              <div className="grid gap-4 md:grid-cols-2">
                <select name="priority" value={form.priority} onChange={handleChange} className="rounded-md border px-3 py-2">
                  <option value="LOW">Baixa</option>
                  <option value="MEDIUM">Média</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>
                <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="rounded-md border px-3 py-2" />
                <input name="estimatedEndDate" type="date" value={form.estimatedEndDate} onChange={handleChange} className="rounded-md border px-3 py-2 md:col-span-2" />
              </div>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Observações internas"
                rows={3}
                className="w-full rounded-md border px-3 py-2"
              />

              <Button type="submit" className="w-full gap-2" disabled={saving}>
                <Plus className="h-4 w-4" />
                {saving ? "Criando..." : "Criar ordem"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ordens em andamento</CardTitle>
            <CardDescription>{orders.length} ordem(ns) registradas no backend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{order.orderNumber}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone(order.status)}`}>
                        {orderStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{order.client?.name}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                      <span>Prioridade: {order.priority}</span>
                      <span>Início: {order.startDate ? formatDate(order.startDate) : "Não definido"}</span>
                      <span>Fim previsto: {order.estimatedEndDate ? formatDate(order.estimatedEndDate) : "Não definido"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select
                      value={order.status}
                      onChange={(event) => handleStatusChange(order, event.target.value)}
                      className="rounded-md border px-3 py-2 text-sm"
                    >
                      <option value="PENDING">Pendente</option>
                      <option value="IN_PROGRESS">Em produção</option>
                      <option value="COMPLETED">Concluída</option>
                      <option value="CANCELLED">Cancelada</option>
                    </select>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(order)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {orders.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                Nenhuma ordem de serviço cadastrada ainda.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Production
