
import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Tag, Plus, AlertCircle } from "lucide-react"

const productSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  type: z.enum(["product", "service"]),
  unit: z.string().min(1, "Unidade é obrigatória"),
  costPrice: z.number().min(0, "Preço de custo deve ser maior ou igual a 0"),
  suggestedPrice: z.number().min(0, "Preço sugerido deve ser maior ou igual a 0"),
  stock: z.number().min(0, "Estoque deve ser maior ou igual a 0"),
  minStock: z.number().min(0, "Estoque mínimo deve ser maior ou igual a 0"),
  category: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

const categories = [
  "Matéria-prima",
  "Ferramenta",
  "Acessório",
  "Serviço",
  "Outro"
]

export function ProductForm({ onSubmit }) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      type: "product",
      tags: [],
      stock: 0,
      minStock: 0,
    }
  })

  const productType = watch("type")

  const handleFormSubmit = async (data) => {
    await onSubmit(data)
    reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome *</label>
              <input
                {...register("name")}
                className="w-full rounded-md border p-2"
              />
              {errors.name && (
                <span className="text-sm text-red-500">{errors.name.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo *</label>
              <select
                {...register("type")}
                className="w-full rounded-md border p-2"
              >
                <option value="product">Produto</option>
                <option value="service">Serviço</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Unidade *</label>
              <input
                {...register("unit")}
                className="w-full rounded-md border p-2"
                placeholder="kg, m², unidade..."
              />
              {errors.unit && (
                <span className="text-sm text-red-500">{errors.unit.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria *</label>
              <select
                {...register("category")}
                className="w-full rounded-md border p-2"
              >
                <option value="">Selecione...</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className="text-sm text-red-500">{errors.category.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Preço de Custo *</label>
              <input
                type="number"
                step="0.01"
                {...register("costPrice", { valueAsNumber: true })}
                className="w-full rounded-md border p-2"
              />
              {errors.costPrice && (
                <span className="text-sm text-red-500">{errors.costPrice.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Preço Sugerido *</label>
              <input
                type="number"
                step="0.01"
                {...register("suggestedPrice", { valueAsNumber: true })}
                className="w-full rounded-md border p-2"
              />
              {errors.suggestedPrice && (
                <span className="text-sm text-red-500">{errors.suggestedPrice.message}</span>
              )}
            </div>

            {productType === "product" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estoque Atual *</label>
                  <input
                    type="number"
                    {...register("stock", { valueAsNumber: true })}
                    className="w-full rounded-md border p-2"
                  />
                  {errors.stock && (
                    <span className="text-sm text-red-500">{errors.stock.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Estoque Mínimo *</label>
                  <input
                    type="number"
                    {...register("minStock", { valueAsNumber: true })}
                    className="w-full rounded-md border p-2"
                  />
                  {errors.minStock && (
                    <span className="text-sm text-red-500">{errors.minStock.message}</span>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <textarea
              {...register("description")}
              className="w-full rounded-md border p-2"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentTags = watch("tags") || []
                setValue("tags", [...currentTags, "promoção"])
              }}
            >
              <Tag className="h-4 w-4 mr-2" />
              Promoção
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentTags = watch("tags") || []
                setValue("tags", [...currentTags, "novo"])
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentTags = watch("tags") || []
                setValue("tags", [...currentTags, "esgotado"])
              }}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Esgotado
            </Button>
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              Cadastrar Item
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
