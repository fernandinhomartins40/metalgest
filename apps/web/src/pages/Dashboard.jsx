import React, { useEffect, useMemo, useState } from "react"
import { AlertTriangle, Boxes, FileText, TrendingUp, Users, Wrench } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Loading } from "../components/ui/loading"
import { useToast } from "../components/ui/use-toast"
import { api } from "../services/api"
import { formatCurrency, formatDate, quoteStatusLabel, statusTone } from "../lib/formatters"

function Dashboard() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [revenueChart, setRevenueChart] = useState([])
  const [topClients, setTopClients] = useState([])

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        const [statsResult, revenueResult, topClientsResult] = await Promise.all([
          api.dashboard.getStats(),
          api.dashboard.getRevenueChart(new Date().getFullYear()),
          api.dashboard.getTopClients(5),
        ])

        setStats(statsResult)
        setRevenueChart(revenueResult.data || [])
        setTopClients(topClientsResult)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Falha ao carregar dashboard",
          description: error.message,
        })
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [toast])

  const cards = useMemo(() => {
    if (!stats) return []

    return [
      { label: "Clientes ativos", value: stats.counts.clients, icon: Users },
      { label: "Produtos ativos", value: stats.counts.products, icon: Boxes },
      { label: "Serviços ativos", value: stats.counts.services, icon: Wrench },
      { label: "Orçamentos", value: stats.counts.quotes, icon: FileText },
      { label: "Receita do mês", value: formatCurrency(stats.revenue.monthly), icon: TrendingUp },
      {
        label: "Alertas de estoque",
        value: stats.alerts.lowStockProducts,
        icon: AlertTriangle,
      },
    ]
  }, [stats])

  if (loading) {
    return <Loading />
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard indisponível</CardTitle>
          <CardDescription>Não foi possível carregar os indicadores principais.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <p className="mt-2 text-slate-600">Visão consolidada da operação atual.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardDescription>{card.label}</CardDescription>
              <card.icon className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receita anual por mês</CardTitle>
            <CardDescription>Somatório de entradas registradas no financeiro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {revenueChart.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum dado financeiro disponível.</p>
            ) : (
              revenueChart.map((entry) => (
                <div key={entry.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Mês {entry.month}</span>
                    <span className="font-medium text-slate-900">{formatCurrency(entry.amount)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-slate-900"
                      style={{
                        width: `${Math.min(
                          100,
                          (Number(entry.amount || 0) /
                            Math.max(...revenueChart.map((item) => Number(item.amount || 0)), 1)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top clientes</CardTitle>
            <CardDescription>Clientes com maior receita em orçamentos aprovados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topClients.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum cliente com receita consolidada ainda.</p>
            ) : (
              topClients.map((entry) => (
                <div key={entry.client.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium text-slate-900">{entry.client.name}</p>
                    <p className="text-sm text-slate-500">{entry.quotesCount} orçamento(s)</p>
                  </div>
                  <strong className="text-slate-900">{formatCurrency(entry.totalRevenue)}</strong>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orçamentos recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(stats.recent.quotes || []).map((quote) => (
              <div key={quote.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{quote.quoteNumber}</p>
                    <p className="text-sm text-slate-500">{quote.client?.name}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone(quote.status)}`}>
                    {quoteStatusLabel(quote.status)}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500">{formatDate(quote.createdAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ordens de serviço recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(stats.recent.serviceOrders || []).map((order) => (
              <div key={order.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{order.orderNumber}</p>
                    <p className="text-sm text-slate-500">{order.client?.name}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500">{formatDate(order.createdAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default Dashboard
