import React, { useMemo, useState } from "react"
import { ArrowLeft, KeyRound } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import PasswordInput from "../components/auth/PasswordInput"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { useToast } from "../components/ui/use-toast"
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

function ResetPassword() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

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

    if (!token) {
      toast({
        variant: "destructive",
        title: "Link invalido",
        description: "O token de recuperacao nao foi encontrado neste link.",
      })
      return
    }

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
      const result = await auth.resetPassword(token, form.password)
      setIsCompleted(true)
      toast({
        title: "Senha atualizada",
        description: result.message,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Nao foi possivel atualizar",
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
          <CardTitle>Criar nova senha</CardTitle>
          <CardDescription>
            Defina uma senha forte para voltar a acessar sua operacao sem depender de suporte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCompleted ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Sua senha foi atualizada. Agora voce pode entrar com a nova credencial.
              </div>
              <Button className="w-full" onClick={() => navigate("/login")}>
                Ir para o login
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {!token ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  O link de recuperacao esta incompleto ou expirou. Solicite um novo email de redefinicao.
                </div>
              ) : null}

              <PasswordInput
                id="password"
                name="password"
                label="Nova senha"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />

              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirmar nova senha"
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
                <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting || !token}>
                  <KeyRound className="h-4 w-4" />
                  {isSubmitting ? "Salvando..." : "Atualizar senha"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => navigate("/forgot-password")}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Pedir novo link
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPassword
