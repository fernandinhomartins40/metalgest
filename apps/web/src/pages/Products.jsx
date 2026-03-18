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
  unit: "un",
  costPrice: "",
  salePrice: "",
  stock: "0",
  minStock: "0",
  description: "",
  active: true,
}

function Products() {
  const { toast } = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await api.products.list()
      setProducts(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao carregar produtos",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      [product.name, product.code, product.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search.toLowerCase()))
    )
  }, [products, search])

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

  const handleEdit = (product) => {
    setEditingId(product.id)
    setForm({
      code: product.code || "",
      name: product.name || "",
      category: product.category || "",
      unit: product.unit || "un",
      costPrice: String(product.costPrice ?? ""),
      salePrice: String(product.salePrice ?? ""),
      stock: String(product.stock ?? 0),
      minStock: String(product.minStock ?? 0),
      description: product.description || "",
      active: product.active,
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
      stock: Number(form.stock || 0),
      minStock: Number(form.minStock || 0),
      description: form.description || undefined,
      active: form.active,
    }

    try {
      if (editingId) {
        await api.products.update(editingId, payload)
      } else {
        await api.products.create(payload)
      }

      toast({
        title: editingId ? "Produto atualizado" : "Produto criado",
        description: `${payload.name} foi salvo com sucesso.`,
      })

      resetForm()
      await loadProducts()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao salvar produto",
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.products.delete(id)
      toast({
        title: "Produto removido",
        description: "O item foi excluído da base.",
      })
      await loadProducts()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao excluir produto",
        description: error.message,
      })
    }
  }

  const handleStockAdjustment = async (product) => {
    const value = window.prompt(`Novo estoque para ${product.name}:`, String(product.stock))
    if (value === null) return

    try {
      await api.products.updateStock(product.id, Number(value), "set")
      toast({
        title: "Estoque atualizado",
        description: `Novo estoque de ${product.name}: ${value}.`,
      })
      await loadProducts()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao atualizar estoque",
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
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Produtos</h2>
        <p className="mt-2 text-slate-600">Cadastro e controle de estoque do catálogo físico.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar produto" : "Novo produto"}</CardTitle>
            <CardDescription>Informações principais para venda e controle interno.</CardDescription>
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
                <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="Estoque" className="rounded-md border px-3 py-2" />
                <input name="minStock" type="number" value={form.minStock} onChange={handleChange} placeholder="Estoque mínimo" className="rounded-md border px-3 py-2" />
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
                Produto ativo
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
                <CardTitle>Catálogo</CardTitle>
                <CardDescription>{products.length} produto(s) cadastrados.</CardDescription>
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
            {filteredProducts.map((product) => (
              <div key={product.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">
                      {product.code || "Sem código"} · {product.category || "Sem categoria"} · {product.unit}
                    </p>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                      <span>Venda: {formatCurrency(product.salePrice)}</span>
                      <span>Custo: {formatCurrency(product.costPrice)}</span>
                      <span className={product.stock <= product.minStock ? "font-medium text-amber-700" : ""}>
                        Estoque: {product.stock}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleStockAdjustment(product)}>
                      Estoque
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                Nenhum produto encontrado com o filtro atual.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Products
