
import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Tag, Plus } from "lucide-react"

const serviceSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  unit: z.string().min(1, "Unidade é obrigatória"),
  cost_price: z.number().min(0, "Preço de custo deve ser maior ou igual a 0"),
  suggested_price: z.number().min(0, "Preço sugerido deve ser maior ou igual a 0"),
  category: z.string().min(1, "Categoria é obrigatória"),
  tags: z.array(z.string()).optional(),
})

const categories = [
  "Instalação",
  "Manutenção",
  "Consultoria",
  "Projeto",
  "Outro"
]

export function ServiceForm({ onSubmit }) {
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      tags: [],
    }
  })

  const handleFormSubmit = async (data) => {
    await onSubmit(data)
    reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Serviço</CardTitle>
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
              <label className="text-sm font-medium">Unidade *</label>
              <input
                {...register("unit")}
                className="w-full rounded-md border p-2"
                placeholder="hora, projeto, unidade..."
              />
              {errors.unit && (
                <span className="text-sm text-red-500">{errors.unit.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Preço de Custo *</label>
              <input
                type="number"
                step="0.01"
                {...register("cost_price", { valueAsNumber: true })}
                className="w-full rounded-md border p-2"
              />
              {errors.cost_price && (
                <span className="text-sm text-red-500">{errors.cost_price.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Preço Sugerido *</label>
              <input
                type="number"
                step="0.01"
                {...register("suggested_price", { valueAsNumber: true })}
                className="w-full rounded-md border p-2"
              />
              {errors.suggested_price && (
                <span className="text-sm text-red-500">{errors.suggested_price.message}</span>
              )}
            </div>
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
                setValue("tags", [...currentTags, "destaque"])
              }}
            >
              <Tag className="h-4 w-4 mr-2" />
              Destaque
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
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              Cadastrar Serviço
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
