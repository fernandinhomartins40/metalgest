
import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Button } from "../components/ui/button"
import { useToast } from "../components/ui/use-toast"
import { FileText, Tag, AlertCircle } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

const serviceOrderSchema = z.object({
  quoteId: z.string().min(1, "Orçamento é obrigatório"),
  clientId: z.string().min(1, "Cliente é obrigatório"),
  responsibleId: z.string().min(1, "Responsável é obrigatório"),
  status: z.enum(["waiting", "in_progress", "paused", "finished", "delivered"]),
  deadline: z.string().min(1, "Data de entrega é obrigatória"),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// Mock data - substituir por dados reais
const mockUsers = [
  { id: "1", name: "João Silva" },
  { id: "2", name: "Maria Santos" },
]

const mockQuotes = [
  { 
    id: "1", 
    clientName: "Cliente A",
    items: [
      { description: "Produto 1", quantity: 2, price: 100 },
      { description: "Serviço 1", quantity: 1, price: 150 }
    ]
  },
]

const mockServiceOrders = [
  {
    id: "1",
    clientName: "Cliente A",
    responsibleName: "João Silva",
    status: "in_progress",
    deadline: "2025-04-30",
    items: [
      { description: "Produto 1", quantity: 2 }
    ]
  },
]

const mockPerformanceData = [
  { month: "Jan", completed: 12 },
  { month: "Fev", completed: 19 },
  { month: "Mar", completed: 15 },
  { month: "Abr", completed: 22 },
]

function Production() {
  const { toast } = useToast()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: {
      status: "waiting",
      tags: [],
      createdAt: format(new Date(), "yyyy-MM-dd"),
    }
  })

  const onSubmit = (data) => {
    console.log(data)
    toast({
      title: "Ordem de serviço criada com sucesso!",
      description: "A OS foi registrada e os responsáveis foram notificados.",
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      waiting: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      paused: "bg-orange-100 text-orange-800",
      finished: "bg-green-100 text-green-800",
      delivered: "bg-purple-100 text-purple-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusText = (status) => {
    const texts = {
      waiting: "Em Espera",
      in_progress: "Em Produção",
      paused: "Pausada",
      finished: "Finalizada",
      delivered: "Entregue",
    }
    return texts[status] || status
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Produção</h2>
        <p className="text-muted-foreground">Gerencie suas ordens de serviço</p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="new">Nova OS</TabsTrigger>
          <TabsTrigger value="list">Lista de OS</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Total de OS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">24</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Em Produção</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">8</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Finalizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">12</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atrasadas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">4</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho da Produção</CardTitle>
                <CardDescription>OS finalizadas por mês</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Nova OS */}
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Nova Ordem de Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Orçamento *</label>
                    <select
                      {...register("quoteId")}
                      className="w-full rounded-md border p-2"
                    >
                      <option value="">Selecione um orçamento</option>
                      {mockQuotes.map(quote => (
                        <option key={quote.id} value={quote.id}>
                          {quote.clientName}
                        </option>
                      ))}
                    </select>
                    {errors.quoteId && (
                      <span className="text-sm text-red-500">{errors.quoteId.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Responsável *</label>
                    <select
                      {...register("responsibleId")}
                      className="w-full rounded-md border p-2"
                    >
                      <option value="">Selecione um responsável</option>
                      {mockUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    {errors.responsibleId && (
                      <span className="text-sm text-red-500">{errors.responsibleId.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <select
                      {...register("status")}
                      className="w-full rounded-md border p-2"
                    >
                      <option value="waiting">Em Espera</option>
                      <option value="in_progress">Em Produção</option>
                      <option value="paused">Pausada</option>
                      <option value="finished">Finalizada</option>
                      <option value="delivered">Entregue</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prazo de Entrega *</label>
                    <input
                      type="date"
                      {...register("deadline")}
                      className="w-full rounded-md border p-2"
                    />
                    {errors.deadline && (
                      <span className="text-sm text-red-500">{errors.deadline.message}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Observações</label>
                  <textarea
                    {...register("notes")}
                    className="w-full rounded-md border p-2"
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentTags = watch("tags") || []
                      setValue("tags", [...currentTags, "urgente"])
                    }}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Urgente
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentTags = watch("tags") || []
                      setValue("tags", [...currentTags, "pendente"])
                    }}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Pendente
                  </Button>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar PDF
                  </Button>
                  <Button type="submit">
                    Criar Ordem de Serviço
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lista de OS */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Ordens de Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockServiceOrders.map(order => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{order.clientName}</h3>
                        <p className="text-sm text-gray-500">
                          Responsável: {order.responsibleName}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <p className="text-sm text-gray-500">
                          Entrega: {format(new Date(order.deadline), "dd/MM/yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Itens:</h4>
                      <ul className="text-sm text-gray-600">
                        {order.items.map((item, index) => (
                          <li key={index}>
                            {item.description} - Qtd: {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Production
