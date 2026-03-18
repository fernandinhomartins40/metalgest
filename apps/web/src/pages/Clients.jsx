import React, { useEffect, useMemo, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Loading } from "../components/ui/loading"
import { useToast } from "../components/ui/use-toast"
import { api } from "../services/api"

const initialForm = {
  type: "BUSINESS",
  name: "",
  email: "",
  phone: "",
  document: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Brasil",
  notes: "",
  active: true,
}

function Clients() {
  const { toast } = useToast()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)

  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await api.clients.list()
      setClients(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao carregar clientes",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      [client.name, client.email, client.document, client.phone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search.toLowerCase()))
    )
  }, [clients, search])

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

  const handleEdit = (client) => {
    setEditingId(client.id)
    setForm({
      type: client.type || "BUSINESS",
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      document: client.document || "",
      address: client.address || "",
      city: client.city || "",
      state: client.state || "",
      zipCode: client.zipCode || "",
      country: client.country || "Brasil",
      notes: client.notes || "",
      active: client.active,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    const payload = {
      ...form,
      email: form.email || undefined,
      phone: form.phone || undefined,
      document: form.document || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      zipCode: form.zipCode || undefined,
      country: form.country || undefined,
      notes: form.notes || undefined,
    }

    try {
      if (editingId) {
        await api.clients.update(editingId, payload)
      } else {
        await api.clients.create(payload)
      }

      toast({
        title: editingId ? "Cliente atualizado" : "Cliente criado",
        description: `${payload.name} foi salvo com sucesso.`,
      })

      resetForm()
      await loadClients()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao salvar cliente",
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (client) => {
    if (!window.confirm(`Excluir ${client.name}?`)) return

    try {
      await api.clients.delete(client.id)
      toast({
        title: "Cliente removido",
        description: `${client.name} foi excluído da base.`,
      })
      await loadClients()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao excluir cliente",
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
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Clientes</h2>
        <p className="mt-2 text-slate-600">Base comercial própria, sem dependência de APIs externas.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar cliente" : "Novo cliente"}</CardTitle>
            <CardDescription>Dados cadastrais e de contato usados em orçamentos e ordens.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <select name="type" value={form.type} onChange={handleChange} className="w-full rounded-md border px-3 py-2">
                <option value="BUSINESS">Pessoa jurídica</option>
                <option value="INDIVIDUAL">Pessoa física</option>
              </select>

              <input name="name" value={form.name} onChange={handleChange} placeholder="Nome ou razão social" className="w-full rounded-md border px-3 py-2" required />
              <input name="document" value={form.document} onChange={handleChange} placeholder="CPF/CNPJ" className="w-full rounded-md border px-3 py-2" />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="E-mail" className="w-full rounded-md border px-3 py-2" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Telefone" className="w-full rounded-md border px-3 py-2" />
              <input name="address" value={form.address} onChange={handleChange} placeholder="Endereço" className="w-full rounded-md border px-3 py-2" />

              <div className="grid gap-4 md:grid-cols-2">
                <input name="city" value={form.city} onChange={handleChange} placeholder="Cidade" className="rounded-md border px-3 py-2" />
                <input name="state" value={form.state} onChange={handleChange} placeholder="UF" className="rounded-md border px-3 py-2" />
                <input name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="CEP" className="rounded-md border px-3 py-2" />
                <input name="country" value={form.country} onChange={handleChange} placeholder="País" className="rounded-md border px-3 py-2" />
              </div>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Observações"
                rows={4}
                className="w-full rounded-md border px-3 py-2"
              />

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input name="active" type="checkbox" checked={form.active} onChange={handleChange} />
                Cliente ativo
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
                <CardTitle>Carteira de clientes</CardTitle>
                <CardDescription>{clients.length} registro(s) disponíveis para a operação.</CardDescription>
              </div>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, documento, e-mail ou telefone"
                className="w-full rounded-md border px-3 py-2 md:w-96"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredClients.map((client) => (
              <div key={client.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{client.name}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          client.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {client.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{client.email || "Sem e-mail"}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                      <span>{client.document || "Sem documento"}</span>
                      <span>{client.phone || "Sem telefone"}</span>
                      <span>{client.city && client.state ? `${client.city}/${client.state}` : "Sem localidade"}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(client)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredClients.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                Nenhum cliente encontrado com o filtro atual.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Clients
