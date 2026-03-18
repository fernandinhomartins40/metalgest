export const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0))

export const formatDate = (value) => {
  if (!value) return "-"

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}

export const toDateInputValue = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)
  return date.toISOString().slice(0, 10)
}

export const quoteStatusLabel = (status) =>
  (
    {
      DRAFT: "Rascunho",
      PENDING: "Pendente",
      APPROVED: "Aprovado",
      REJECTED: "Rejeitado",
      EXPIRED: "Expirado",
    }[status] || status
  )

export const orderStatusLabel = (status) =>
  (
    {
      PENDING: "Pendente",
      IN_PROGRESS: "Em produção",
      COMPLETED: "Concluída",
      CANCELLED: "Cancelada",
    }[status] || status
  )

export const userRoleLabel = (role) =>
  (
    {
      ADMIN: "Administrador",
      MANAGER: "Gerente",
      USER: "Usuário",
    }[role] || role
  )

export const statusTone = (status) =>
  (
    {
      DRAFT: "bg-gray-100 text-gray-700",
      PENDING: "bg-amber-100 text-amber-700",
      APPROVED: "bg-emerald-100 text-emerald-700",
      REJECTED: "bg-rose-100 text-rose-700",
      EXPIRED: "bg-slate-200 text-slate-700",
      IN_PROGRESS: "bg-blue-100 text-blue-700",
      COMPLETED: "bg-emerald-100 text-emerald-700",
      CANCELLED: "bg-rose-100 text-rose-700",
    }[status] || "bg-gray-100 text-gray-700"
  )
