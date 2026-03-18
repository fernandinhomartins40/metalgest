import React, { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, UserPlus } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { useToast } from "../components/ui/use-toast"
import auth from "../services/auth"

function Register() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passwordValidation = useMemo(
    () => auth.validatePassword(form.password),
    [form.password]
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!passwordValidation.isValid) {
      toast({
        variant: "destructive",
        title: "Senha fora do padrão",
        description: "Use ao menos 8 caracteres com maiúscula, minúscula, número e símbolo.",
      })
      return
    }

    if (form.password !== form.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Confirmação inválida",
        description: "As senhas informadas não conferem.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await auth.register(form.name, form.email, form.password)
      toast({
        title: "Conta criada",
        description: "O usuário administrador inicial foi registrado com sucesso.",
      })
      navigate("/app", { replace: true })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha no cadastro",
        description: error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const checks = [
    ["8 caracteres", passwordValidation.requirements.hasMinLength],
    ["Letra maiúscula", passwordValidation.requirements.hasUpperCase],
    ["Letra minúscula", passwordValidation.requirements.hasLowerCase],
    ["Número", passwordValidation.requirements.hasNumber],
    ["Símbolo", passwordValidation.requirements.hasSymbol],
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <Card className="w-full max-w-lg border-0 shadow-xl">
        <CardHeader className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Bootstrap</p>
          <CardTitle>Criar conta inicial</CardTitle>
          <CardDescription>
            Use esta tela para provisionar o primeiro acesso administrativo da instalação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="name">
                  Nome
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="password">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                  Confirmar senha
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  required
                />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Requisitos da senha</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {checks.map(([label, passed]) => (
                  <li key={label} className={passed ? "text-emerald-700" : "text-slate-500"}>
                    {passed ? "OK" : "Pendente"} · {label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
                <UserPlus className="h-4 w-4" />
                {isSubmitting ? "Criando..." : "Criar conta"}
              </Button>
              <Button type="button" variant="outline" className="gap-2" onClick={() => navigate("/login")}>
                <ArrowLeft className="h-4 w-4" />
                Voltar ao login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Register
