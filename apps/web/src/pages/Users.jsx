import React, { useEffect, useMemo, useState } from "react"
import { Pencil, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Loading } from "../components/ui/loading"
import { useToast } from "../components/ui/use-toast"
import { api } from "../services/api"
import { formatDate, userRoleLabel } from "../lib/formatters"

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "USER",
  active: true,
}

function Users() {
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await api.users.list()
      setUsers(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao carregar usuários",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      [user.name, user.email, user.role]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search.toLowerCase()))
    )
  }, [users, search])

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

  const handleEdit = (user) => {
    setEditingId(user.id)
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      active: user.active,
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      if (editingId) {
        await api.users.update(editingId, {
          name: form.name,
          email: form.email,
          role: form.role,
          active: form.active,
        })
      } else {
        await api.users.create({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          active: form.active,
        })
      }

      toast({
        title: editingId ? "Usuário atualizado" : "Usuário criado",
        description: `${form.name} foi salvo com sucesso.`,
      })

      resetForm()
      await loadUsers()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao salvar usuário",
        description: error.message,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (user) => {
    try {
      await api.users.toggleStatus(user.id, !user.active)
      toast({
        title: "Status atualizado",
        description: `${user.name} foi ${user.active ? "desativado" : "ativado"}.`,
      })
      await loadUsers()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao alterar status",
        description: error.message,
      })
    }
  }

  const handleResetPassword = async (user) => {
    const newPassword = window.prompt(`Nova senha para ${user.name}:`)
    if (!newPassword) return

    try {
      await api.users.resetPassword(user.id, newPassword)
      toast({
        title: "Senha redefinida",
        description: `A senha de ${user.name} foi atualizada.`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao redefinir senha",
        description: error.message,
      })
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Excluir ${user.name}?`)) return

    try {
      await api.users.delete(user.id)
      toast({
        title: "Usuário removido",
        description: `${user.name} foi excluído da base.`,
      })
      await loadUsers()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao excluir usuário",
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
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Usuários</h2>
        <p className="mt-2 text-slate-600">Gestão de acesso administrativo da instalação.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar usuário" : "Novo usuário"}</CardTitle>
            <CardDescription>Perfis internos com autenticação própria do backend.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Nome completo" className="w-full rounded-md border px-3 py-2" required />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="E-mail" className="w-full rounded-md border px-3 py-2" required />
              {!editingId ? (
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Senha inicial" className="w-full rounded-md border px-3 py-2" required />
              ) : null}

              <select name="role" value={form.role} onChange={handleChange} className="w-full rounded-md border px-3 py-2">
                <option value="ADMIN">Administrador</option>
                <option value="MANAGER">Gerente</option>
                <option value="USER">Usuário</option>
              </select>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input name="active" type="checkbox" checked={form.active} onChange={handleChange} />
                Usuário ativo
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
                <CardTitle>Usuários cadastrados</CardTitle>
                <CardDescription>{users.length} conta(s) administrativas registradas.</CardDescription>
              </div>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, e-mail ou papel"
                className="w-full rounded-md border px-3 py-2 md:w-80"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          user.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {user.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        {userRoleLabel(user.role)}
                      </span>
                      <span>Criado em {formatDate(user.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleToggleStatus(user)}>
                      {user.active ? "Desativar" : "Ativar"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleResetPassword(user)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Senha
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 ? (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500">
                Nenhum usuário encontrado com o filtro atual.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Users
