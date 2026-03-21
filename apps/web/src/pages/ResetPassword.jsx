import React, { useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import PasswordInput from "../components/auth/PasswordInput"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { useToast } from "../components/ui/use-toast"
import auth from "../services/auth"

const strengthScale = [
  {
    limit: 0.4,
    label: "Fraca",
    textClassName: "text-red-600",
  },
  {
    limit: 0.8,
    label: "Média",
    textClassName: "text-amber-600",
  },
  {
    limit: 1,
    label: "Forte",
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

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!token) {
      toast({
        variant: "destructive",
        title: "Link inválido",
        description: "O token de recuperação não foi encontrado neste link.",
      })
      return
    }

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
      const result = await auth.resetPassword(token, form.password)
      setIsCompleted(true)
      toast({
        title: "Senha atualizada",
        description: result.message,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível atualizar",
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">MetalGest</p>
          <CardTitle>{isCompleted ? "Senha atualizada" : "Criar nova senha"}</CardTitle>
          <CardDescription>
            {isCompleted
              ? "A conta já pode ser acessada com a nova senha."
              : "Defina uma nova senha para concluir a recuperação."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCompleted ? (
            <div className="space-y-4">
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                <AlertTitle>Tudo certo</AlertTitle>
                <AlertDescription>Sua senha foi alterada com sucesso.</AlertDescription>
              </Alert>

              <Button className="w-full" onClick={() => navigate("/login")}>
                Ir para o login
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {!token ? (
                <Alert variant="destructive">
                  <AlertTitle>Link inválido</AlertTitle>
                  <AlertDescription>Solicite um novo e-mail para continuar.</AlertDescription>
                </Alert>
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
                    ? "As senhas informadas não conferem."
                    : ""
                }
              />

              <div className="rounded-md border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">Força da senha</p>
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

              <Button type="submit" className="w-full" disabled={isSubmitting || !token}>
                {isSubmitting ? "Salvando..." : "Atualizar senha"}
              </Button>

              <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/forgot-password")}>
                Pedir novo link
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetPassword
