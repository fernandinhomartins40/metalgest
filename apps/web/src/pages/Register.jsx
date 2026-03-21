import React, { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthPageFrame from "../components/auth/AuthPageFrame"
import PasswordInput from "../components/auth/PasswordInput"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
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
    label: "Média",
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
        description: "Sua conta foi registrada e a sessão já foi iniciada.",
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
    <AuthPageFrame
      maxWidth="max-w-lg"
      introTitle="Crie o primeiro acesso"
      introDescription="Cadastre o responsável e ative a operação da empresa em um só lugar."
      eyebrow="Cadastro"
      title="Criar conta"
      description="Depois do cadastro, o sistema pode pedir a confirmação do e-mail antes do primeiro login."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Alert className="border-[#ddd8ff] bg-[linear-gradient(135deg,#f8f7ff_0%,#ffffff_100%)]">
          <AlertTitle>Validação por e-mail</AlertTitle>
          <AlertDescription>
            Enviamos um link de confirmação para liberar o acesso com segurança.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="name">
            Nome do responsável
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
            placeholder="você@empresa.com.br"
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
              ? "As senhas informadas não conferem."
              : ""
          }
        />

        <div className="rounded-2xl border border-[#dce6ef] bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_100%)] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">Força da senha</p>
            <span
              className={`text-sm font-medium ${
                form.password ? passwordStrength.textClassName : "text-slate-500"
              }`}
            >
              {form.password ? passwordStrength.label : "Aguardando"}
            </span>
          </div>
          <ul className="mt-3 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
            {checks.map(([label, passed]) => (
              <li key={label}>
                {passed ? "OK" : "Pendente"} - {label}
              </li>
            ))}
          </ul>
        </div>

        <Button
          type="submit"
          className="h-11 w-full rounded-xl text-base font-semibold shadow-[0_16px_32px_rgba(25,216,143,0.22)]"
          disabled={!canSubmit}
        >
          {isSubmitting ? "Criando..." : "Criar conta"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl border-[#d6dfeb]"
          onClick={() => navigate("/login")}
        >
          Voltar ao login
        </Button>
      </form>
    </AuthPageFrame>
  )
}

export default Register
