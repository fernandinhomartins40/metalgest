import React, { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import PasswordInput from "../components/auth/PasswordInput"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { useToast } from "../components/ui/use-toast"
import { useAuth } from "../providers/AuthProvider"
import auth from "../services/auth"

const strengthScale = [
  {
    limit: 0.4,
    label: "Fraca",
    textClassName: "text-red-600",
  },
  {
    limit: 0.8,
    label: "Media",
    textClassName: "text-amber-600",
  },
  {
    limit: 1,
    label: "Forte",
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
  const passwordsMatch = form.password.length > 0 && form.password === form.confirmPassword
  const canSubmit =
    form.name.trim().length >= 2 &&
    form.email.trim().length > 0 &&
    passwordValidation.isValid &&
    passwordsMatch &&
    !isSubmitting

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">MetalGest</p>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Cadastre o primeiro acesso da empresa.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Alert>
              <AlertTitle>Confirmacao de e-mail</AlertTitle>
              <AlertDescription>
                Depois do cadastro, o sistema pode solicitar a confirmacao do e-mail antes do login.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="name">
                Nome do responsavel
              </label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                placeholder="Nome e sobrenome"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                E-mail
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="voce@empresa.com.br"
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

            <div className="rounded-md border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Forca da senha</p>
                <span className={`text-sm font-medium ${form.password ? passwordStrength.textClassName : "text-slate-500"}`}>
                  {form.password ? passwordStrength.label : "Aguardando"}
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {checks.map(([label, passed]) => (
                  <li key={label}>
                    {passed ? "OK" : "Pendente"} - {label}
                  </li>
                ))}
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={!canSubmit}>
              {isSubmitting ? "Criando..." : "Criar conta"}
            </Button>

            <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/login")}>
              Voltar ao login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Register
