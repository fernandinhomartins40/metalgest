
import React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2, Copy, FileText, Link, Tag } from "lucide-react"

const quoteSchema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  description: z.string().min(3, "Descrição é obrigatória"),
  items: z.array(z.object({
    productId: z.string().min(1, "Produto é obrigatório"),
    description: z.string(),
    quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
    unitPrice: z.number().min(0, "Preço deve ser maior ou igual a 0"),
  })).min(1, "Adicione pelo menos um item"),
  tags: z.array(z.string()).optional(),
  profitPercentage: z.number().min(0, "Porcentagem de lucro deve ser maior ou igual a 0"),
})

// Mock data - substituir por dados reais
const mockClients = [
  { id: "1", name: "Cliente A" },
  { id: "2", name: "Cliente B" },
]

const mockProducts = [
  { id: "1", name: "Produto A", price: 100 },
  { id: "2", name: "Produto B", price: 200 },
]

function Quotes() {
  const { toast } = useToast()
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      items: [],
      tags: [],
      profitPercentage: 30,
      status: "draft",
      createdAt: format(new Date(), "yyyy-MM-dd"),
    }
  })

  const items = watch("items") || []
  const profitPercentage = watch("profitPercentage")

  const calculateSubtotal = (item) => {
    return item.quantity * item.unitPrice
  }

  const calculateTotal = () => {
    const subtotal = items.reduce((acc, item) => acc + calculateSubtotal(item), 0)
    return subtotal * (1 + profitPercentage / 100)
  }

  const addItem = () => {
    setValue("items", [...items, {
      productId: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
    }])
  }

  const removeItem = (index) => {
    setValue("items", items.filter((_, i) => i !== index))
  }

  const handleProductSelect = (index, productId) => {
    const product = mockProducts.find(p => p.id === productId)
    if (product) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        productId,
        unitPrice: product.price,
      }
      setValue("items", newItems)
    }
  }

  const onSubmit = (data) => {
    console.log(data)
    toast({
      title: "Orçamento salvo com sucesso!",
      description: "O orçamento foi salvo como rascunho.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orçamentos</h2>
        <p className="text-muted-foreground">Gerencie seus orçamentos</p>
      </div>

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">Criar Orçamento</TabsTrigger>
          <TabsTrigger value="list">Lista de Orçamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Novo Orçamento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Cliente e Informações Gerais */}
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cliente *</label>
                      <select
                        {...register("clientId")}
                        className="w-full rounded-md border p-2"
                      >
                        <option value="">Selecione um cliente</option>
                        {mockClients.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                      {errors.clientId && (
                        <span className="text-sm text-red-500">{errors.clientId.message}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data</label>
                      <input
                        type="date"
                        {...register("createdAt")}
                        className="w-full rounded-md border p-2"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição *</label>
                    <textarea
                      {...register("description")}
                      className="w-full rounded-md border p-2"
                      rows={3}
                    />
                    {errors.description && (
                      <span className="text-sm text-red-500">{errors.description.message}</span>
                    )}
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
                        setValue("tags", [...currentTags, "vip"])
                      }}
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      VIP
                    </Button>
                  </div>
                </div>

                {/* Itens do Orçamento */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Itens do Orçamento</h3>
                    <Button type="button" onClick={addItem} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </div>

                  {items.map((item, index) => (
                    <div key={index} className="grid gap-4 md:grid-cols-5 items-start border rounded-lg p-4">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Produto/Serviço *</label>
                        <select
                          {...register(`items.${index}.productId`)}
                          className="w-full rounded-md border p-2"
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                        >
                          <option value="">Selecione...</option>
                          {mockProducts.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Quantidade *</label>
                        <input
                          type="number"
                          {...register(`items.${index}.quantity`)}
                          className="w-full rounded-md border p-2"
                          min="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Valor Unitário *</label>
                        <input
                          type="number"
                          {...register(`items.${index}.unitPrice`)}
                          className="w-full rounded-md border p-2"
                          step="0.01"
                        />
                      </div>

                      <div className="flex items-end justify-end h-full">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {errors.items && (
                    <span className="text-sm text-red-500 block">Adicione pelo menos um item</span>
                  )}
                </div>

                {/* Resumo Financeiro */}
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold">Resumo Financeiro</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Porcentagem de Lucro (%)</label>
                      <input
                        type="number"
                        {...register("profitPercentage")}
                        className="w-full rounded-md border p-2"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Total com Lucro</label>
                      <input
                        type="text"
                        value={`R$ ${calculateTotal().toFixed(2)}`}
                        className="w-full rounded-md border p-2 bg-gray-100"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </Button>
                  <Button type="button" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar PDF
                  </Button>
                  <Button type="button" variant="outline">
                    <Link className="h-4 w-4 mr-2" />
                    Link Externo
                  </Button>
                  <Button type="submit">
                    Salvar Orçamento
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Orçamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Lista será implementada aqui */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Quotes
