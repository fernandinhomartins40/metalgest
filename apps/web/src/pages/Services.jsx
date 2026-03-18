import React, { useEffect, useMemo, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Loading } from "../components/ui/loading"
import { useToast } from "../components/ui/use-toast"
import { api } from "../services/api"
import { formatCurrency } from "../lib/formatters"

const initialForm = {
  code: "",
  name: "",
  category: "",
  unit: "h",
  costPrice: "",
  salePrice: "",
  estimatedDuration: "",
  description: "",
  active: true,
}

function Services() {
  const { toast } = useToast()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)

  const loadServices = async () => {
    try {
      setLoading(true)
      const data = await api.services.list()
      setServices(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao carregar serviços",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  const filteredServices = useMemo(() => {
    return services.filter((service) =>
      [service.name, service.code, service.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search.toLowerCase()))
    )
  }, [services, search])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
  }

  const handleEdit = (service) => {
    setEditingId(service.id)
    setForm({
      code: service.code || "",
      name: service.name || "",
      category: service.category || "",
      unit: service.unit || "h",
      costPrice: String(service.costPrice ?? ""),
      salePrice: String(service.salePrice ?? ""),
      estimatedDuration: String(service.estimatedDuration ?? ""),
      description: service.description || "",
      active: service.active,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    const payload = {
      code: form.code || undefined,
      name: form.name,
      category: form.category || undefined,
      unit: form.unit,
      costPrice: Number(form.costPrice || 0),
      salePrice: Number(form.salePrice || 0),
      estimatedDuration: form.estimatedDuration ? Number(form.estimatedDuration) : undefined,
      description: form.description || undefined,
      active: form.active,
    }

    try {
      if (editingId) {
        await api.services.update(editingId, payload)
      } else {
        await api.services.create(payload)
      }

      toast({
        title: editingId ? "Serviço atualizado" : "Serviço criado",
        description: `${payload.name} foi salvo com sucesso.`,
      })

      resetForm()
      await loadServices()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao salvar serviço",
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.services.delete(id)
      toast({
        title: "Serviço removido",
        description: "O item foi excluído da base.",
      })
      await loadServices()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao excluir serviço",
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
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Serviços</h2>
        <p className="mt-2 text-slate-600">Cadastro e precificação de serviços executados pela operação.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar serviço" : "Novo serviço"}</CardTitle>
            <CardDescription>Informações comerciais e operacionais do catálogo.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <input name="code" value={form.code} onChange={handleChange} placeholder="Código" className="rounded-md border px-3 py-2" />
                <input name="name" value={form.name} onChange={handleChange} placeholder="Nome" className="rounded-md border px-3 py-2 md:col-span-2" required />
                <input name="category" value={form.category} onChange={handleChange} placeholder="Categoria" className="rounded-md border px-3 py-2" />
                <input name="unit" value={form.unit} onChange={handleChange} placeholder="Unidade" className="rounded-md border px-3 py-2" />
                <input name="costPrice" type="number" step="0.01" value={form.costPrice} onChange={handleChange} placeholder="Custo" className="rounded-md border px-3 py-2" />
                <input name="salePrice" type="number" step="0.01" value={form.salePrice} onChange={handleChange} placeholder="Preço de venda" className="rounded-md border px-3 py-2" required />
                <input name="estimatedDuration" type="number" value={form.estimatedDuration} onChange={handleChange} placeholder="Duração estimada (min)" className="rounded-md border px-3 py-2 md:col-span-2" />
              </div>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Descrição"
                rows={4}
                className="w-full rounded-md border px-3 py-2"
              />

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input name="active" type="checkbox" checked={form.active} onChange={handleChange} />
                Serviço ativo
              </label>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1 gap-2" disabled={saving}>
                  <Plus className="h-4 w-4" />
                  {saving ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
                </Button>
                {editingId ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Catálogo de serviços</CardTitle>
                <CardDescription>{services.length} serviço(s) cadastrados.</CardDescription>
              </div>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, código ou categoria"
                className="w-full rounded-md border px-3 py-2 md:w-80"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredServices.map((service) => (
              <div key={service.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{service.name}</p>
                    <p className="text-sm text-slate-500">
                      {service.code || "Sem código"} · {service.category || "Sem categoria"} · {service.unit}
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                      <span>Venda: {formatCurrency(service.salePrice)}</span>
                      <span>Custo: {formatCurrency(service.costPrice)}</span>
                      <span>Duração: {service.estimatedDuration ? `${service.estimatedDuration} min` : "Não informada"}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(service.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredServices.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                Nenhum serviço encontrado com o filtro atual.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Services
