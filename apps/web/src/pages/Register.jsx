import React, { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, UserPlus } from "lucide-react"
import PasswordInput from "../components/auth/PasswordInput"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { useToast } from "../components/ui/use-toast"
import { useAuth } from "../providers/AuthProvider"
import auth from "../services/auth"

const strengthScale = [
  {
    limit: 0.4,
    label: "Fraca",
    barClassName: "bg-red-500",
    textClassName: "text-red-600",
  },
  {
    limit: 0.8,
    label: "Media",
    barClassName: "bg-amber-500",
    textClassName: "text-amber-600",
  },
  {
    limit: 1,
    label: "Forte",
    barClassName: "bg-emerald-500",
    textClassName: "text-emerald-600",
  },
]

function Register() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { register: registerAccount } = useAuth()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passwordValidation = useMemo(() => auth.validatePassword(form.password), [form.password])
  const passwordStrength =
    strengthScale.find((item) => passwordValidation.strength <= item.limit) || strengthScale[2]
  const strengthPercent = Math.max(passwordValidation.strength * 100, form.password ? 12 : 0)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!passwordValidation.isValid) {
      toast({
        variant: "destructive",
        title: "Senha fora do padrao",
        description: "Use ao menos 8 caracteres com maiuscula, minuscula, numero e simbolo.",
      })
      return
    }

    if (form.password !== form.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Confirmacao invalida",
        description: "As senhas informadas nao conferem.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await registerAccount(form.name, form.email, form.password, true)

      if (result.verificationRequired) {
        toast({
          title: "Confirme seu e-mail",
          description: result.message || "Enviamos um link para validar o cadastro da sua conta.",
        })
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`, { replace: true })
        return
      }

      toast({
        title: "Conta criada",
        description: "Sua conta foi registrada e a sessao ja foi iniciada.",
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
    ["Letra maiuscula", passwordValidation.requirements.hasUpperCase],
    ["Letra minuscula", passwordValidation.requirements.hasLowerCase],
    ["Numero", passwordValidation.requirements.hasNumber],
    ["Simbolo", passwordValidation.requirements.hasSymbol],
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <Card className="w-full max-w-lg border-0 shadow-xl">
        <CardHeader className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">MetalGest</p>
          <CardTitle>Criar sua conta</CardTitle>
          <CardDescription>
            Cadastre o primeiro acesso da empresa e confirme o e-mail para liberar a operacao.
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
                  autoComplete="name"
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
                  autoComplete="email"
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  required
                />
              </div>

              <PasswordInput
                id="password"
                name="password"
                label="Senha"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />

              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirmar senha"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                error={
                  form.confirmPassword && form.confirmPassword !== form.password
                    ? "As senhas informadas nao conferem."
                    : ""
                }
              />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-700">Forca da senha</p>
                <span
                  className={`text-sm font-semibold ${
                    form.password ? passwordStrength.textClassName : "text-slate-400"
                  }`}
                >
                  {form.password ? passwordStrength.label : "Aguardando senha"}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    form.password ? passwordStrength.barClassName : "bg-slate-300"
                  }`}
                  style={{ width: `${strengthPercent}%` }}
                />
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
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
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/login")}
              >
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
