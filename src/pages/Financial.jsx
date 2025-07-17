
import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useApi } from "@/hooks/useApi"
import { api } from "@/services/api"
import {
  Download,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts"

const transactionSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  type: z.enum(["income", "expense"]),
  value: z.number().min(0.01, "Valor deve ser maior que zero"),
  description: z.string().min(3, "Descrição deve ter no mínimo 3 caracteres"),
  paymentMethod: z.string().min(1, "Forma de pagamento é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória"),
  notes: z.string().optional(),
})

const paymentMethods = [
  "Dinheiro",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Transferência",
  "PIX",
  "Boleto"
]

const incomeCategories = [
  "Receita de Vendas de Produtos",
  "Receita de Prestação de Serviços",
  "Outras Receitas Operacionais",
  "Receita Financeira"
]

const expenseCategories = [
  "CMV - Custo de Mercadoria Vendida",
  "Custo de Serviços Prestados",
  "Despesas com Pessoal",
  "Despesas Administrativas",
  "Despesas Comerciais",
  "Despesas Operacionais",
  "Despesas Financeiras",
  "Tributos e Impostos",
  "Outras Despesas"
]

function Financial() {
  const { toast } = useToast()
  const { execute: createTransaction, loading: creating } = useApi(api.financial.create)
  const { execute: listTransactions, loading: listing } = useApi(api.financial.list)
  const { execute: getSummary, loading: loadingSummary } = useApi(api.financial.getSummary)
  
  const [transactions, setTransactions] = React.useState([])
  const [summary, setSummary] = React.useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    categorySummary: {}
  })

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "income",
      date: format(new Date(), "yyyy-MM-dd")
    }
  })

  const [dateFilter, setDateFilter] = React.useState("week")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [searchTerm, setSearchTerm] = React.useState("")

  const transactionType = watch("type")

  React.useEffect(() => {
    loadTransactions()
    loadSummary()
  }, [])

  const loadTransactions = async () => {
    try {
      const data = await listTransactions()
      setTransactions(data)
    } catch (error) {
      console.error("Error loading transactions:", error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar transações",
        description: error.message
      })
    }
  }

  const loadSummary = async () => {
    try {
      const startDate = format(new Date().setDate(1), "yyyy-MM-dd")
      const endDate = format(new Date(), "yyyy-MM-dd")
      const data = await getSummary(startDate, endDate)
      setSummary(data)
    } catch (error) {
      console.error("Error loading summary:", error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar resumo",
        description: error.message
      })
    }
  }

  const onSubmit = async (data) => {
    try {
      await createTransaction(data)
      toast({
        title: "Lançamento registrado com sucesso!",
        description: `${data.type === "income" ? "Entrada" : "Saída"} de R$ ${data.value} registrada.`
      })
      reset()
      loadTransactions()
      loadSummary()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar lançamento",
        description: error.message
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financeiro</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {summary.totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {summary.totalExpense.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            {summary.netBalance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {summary.netBalance.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Lançamentos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Novo Lançamento</CardTitle>
              <CardDescription>Registre uma nova entrada ou saída financeira</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <select
                      {...register("type")}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="income">Entrada</option>
                      <option value="expense">Saída</option>
                    </select>
                    {errors.type && (
                      <span className="text-sm text-red-500">{errors.type.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data</label>
                    <input
                      type="date"
                      {...register("date")}
                      className="w-full p-2 border rounded-md"
                    />
                    {errors.date && (
                      <span className="text-sm text-red-500">{errors.date.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("value", { valueAsNumber: true })}
                      className="w-full p-2 border rounded-md"
                    />
                    {errors.value && (
                      <span className="text-sm text-red-500">{errors.value.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Forma de Pagamento</label>
                    <select
                      {...register("paymentMethod")}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Selecione...</option>
                      {paymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                    {errors.paymentMethod && (
                      <span className="text-sm text-red-500">{errors.paymentMethod.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria</label>
                    <select
                      {...register("category")}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Selecione...</option>
                      {transactionType === "income" ? (
                        incomeCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))
                      ) : (
                        expenseCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))
                      )}
                    </select>
                    {errors.category && (
                      <span className="text-sm text-red-500">{errors.category.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <input
                      type="text"
                      {...register("description")}
                      className="w-full p-2 border rounded-md"
                    />
                    {errors.description && (
                      <span className="text-sm text-red-500">{errors.description.message}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Observações</label>
                  <textarea
                    {...register("notes")}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={creating}>
                  {creating ? "Registrando..." : "Registrar Lançamento"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Lançamentos</CardTitle>
              <CardDescription>Visualize e gerencie todos os lançamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Pesquisar lançamentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="p-2 border rounded-md"
                    >
                      <option value="week">Última Semana</option>
                      <option value="month">Último Mês</option>
                      <option value="quarter">Último Trimestre</option>
                      <option value="year">Último Ano</option>
                    </select>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="p-2 border rounded-md"
                    >
                      <option value="all">Todas Categorias</option>
                      {[...incomeCategories, ...expenseCategories].map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {listing ? (
                  <div className="flex justify-center items-center py-8">
                    <AlertCircle className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum lançamento encontrado
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          {transaction.type === "income" ? (
                            <ArrowUpCircle className="h-8 w-8 text-green-500" />
                          ) : (
                            <ArrowDownCircle className="h-8 w-8 text-red-500" />
                          )}
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(transaction.date), "dd/MM/yyyy")} • {transaction.category}
                            </div>
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${
                          transaction.type === "income" ? "text-green-600" : "text-red-600"
                        }`}>
                          R$ {transaction.value.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
              <CardDescription>Análise detalhada das movimentações financeiras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transactions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#4ade80" name="Receitas" />
                      <Bar dataKey="value" fill="#f87171" name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={transactions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Fluxo de Caixa"
                        stroke="#3b82f6"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Financial
