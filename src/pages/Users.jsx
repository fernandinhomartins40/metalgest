
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useApi } from "@/hooks/useApi"
import { api } from "@/lib/api"
import { permissions } from "@/lib/permissions"
import {
  UserPlus,
  Users as UsersIcon,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Clock,
  BarChart2,
  Lock
} from "lucide-react"

const userSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string(),
  role: z.enum(["admin", "financeiro", "comercial", "producao"], {
    required_error: "Selecione um cargo"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
})

function Users() {
  const { toast } = useToast()
  const [users, setUsers] = React.useState([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [selectedUser, setSelectedUser] = React.useState(null)
  const [showActivityLog, setShowActivityLog] = React.useState(false)
  const [confirmDialog, setConfirmDialog] = React.useState({
    open: false,
    title: "",
    description: "",
    action: null
  })

  const { execute: listUsers, loading: loadingUsers } = useApi(api.users.list)
  const { execute: createUser, loading: creatingUser } = useApi(api.users.create)
  const { execute: updateUser, loading: updatingUser } = useApi(api.users.update)
  const { execute: toggleUserStatus, loading: togglingStatus } = useApi(api.users.toggleStatus)
  const { execute: resetPassword, loading: resettingPassword } = useApi(api.users.resetPassword)

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "producao"
    }
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await listUsers()
      setUsers(data)
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const onSubmit = async (data) => {
    try {
      await createUser(data)
      toast({
        title: "Usuário cadastrado com sucesso!",
        description: `${data.name} foi adicionado como ${data.role}.`
      })
      form.reset()
      loadUsers()
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar usuário",
        description: error.message
      })
    }
  }

  const handleStatusChange = async (user) => {
    const newStatus = !user.active
    setConfirmDialog({
      open: true,
      title: `${newStatus ? "Ativar" : "Desativar"} usuário`,
      description: `Tem certeza que deseja ${newStatus ? "ativar" : "desativar"} o usuário ${user.name}?`,
      action: async () => {
        try {
          await toggleUserStatus(user.id, newStatus)
          toast({
            title: `Usuário ${newStatus ? "ativado" : "desativado"}`,
            description: "O status do usuário foi alterado com sucesso."
          })
          loadUsers()
        } catch (error) {
          console.error("Error toggling user status:", error)
          toast({
            variant: "destructive",
            title: "Erro ao alterar status",
            description: error.message
          })
        }
      }
    })
  }

  const handlePasswordReset = async (email) => {
    try {
      await resetPassword(email)
      toast({
        title: "Link de recuperação enviado",
        description: `Um e-mail foi enviado para ${email} com as instruções.`
      })
    } catch (error) {
      console.error("Error resetting password:", error)
      toast({
        variant: "destructive",
        title: "Erro ao resetar senha",
        description: error.message
      })
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "active" && user.active) ||
      (statusFilter === "inactive" && !user.active)

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
        <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista de Usuários</TabsTrigger>
          <TabsTrigger value="new">Novo Usuário</TabsTrigger>
        </TabsList>

        {/* Lista de Usuários */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Usuários do Sistema</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
              <CardDescription>
                Gerencie os usuários e suas permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar usuários..."
                      className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 rounded-lg border border-gray-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-200"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="active">Ativos</option>
                    <option value="inactive">Inativos</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className="p-4 rounded-lg border border-gray-200 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-medium">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-medium">{user.name}</h4>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium rounded-full bg-gray-100">
                              {user.role}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePasswordReset(user.email)}
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Resetar Senha
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(user)}
                            disabled={togglingStatus}
                          >
                            {user.active ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        Criado em: {format(new Date(user.created_at), "dd/MM/yyyy")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Novo Usuário */}
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar Novo Usuário</CardTitle>
              <CardDescription>
                Adicione um novo usuário ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome Completo *</label>
                    <input
                      {...form.register("name")}
                      className="w-full rounded-md border p-2"
                    />
                    {form.formState.errors.name && (
                      <span className="text-sm text-red-500">{form.formState.errors.name.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">E-mail *</label>
                    <input
                      type="email"
                      {...form.register("email")}
                      className="w-full rounded-md border p-2"
                    />
                    {form.formState.errors.email && (
                      <span className="text-sm text-red-500">{form.formState.errors.email.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Senha *</label>
                    <input
                      type="password"
                      {...form.register("password")}
                      className="w-full rounded-md border p-2"
                    />
                    {form.formState.errors.password && (
                      <span className="text-sm text-red-500">{form.formState.errors.password.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirmar Senha *</label>
                    <input
                      type="password"
                      {...form.register("confirmPassword")}
                      className="w-full rounded-md border p-2"
                    />
                    {form.formState.errors.confirmPassword && (
                      <span className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cargo *</label>
                    <select
                      {...form.register("role")}
                      className="w-full rounded-md border p-2"
                    >
                      <option value="">Selecione...</option>
                      <option value="admin">Administrador</option>
                      <option value="financeiro">Financeiro</option>
                      <option value="comercial">Comercial</option>
                      <option value="producao">Produção</option>
                    </select>
                    {form.formState.errors.role && (
                      <span className="text-sm text-red-500">{form.formState.errors.role.message}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={creatingUser}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {creatingUser ? "Cadastrando..." : "Cadastrar Usuário"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.action}
      />
    </div>
  )
}

export default Users
