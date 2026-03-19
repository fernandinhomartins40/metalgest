import React, { useMemo, useState } from "react"
import { ArrowLeft, Building2, MailCheck, ShieldCheck, UserPlus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import AuthField from "../components/auth/AuthField"
import AuthNotice from "../components/auth/AuthNotice"
import AuthShell from "../components/auth/AuthShell"
import PasswordInput from "../components/auth/PasswordInput"
import PasswordRequirements from "../components/auth/PasswordRequirements"
import { Button } from "../components/ui/button"
import { useToast } from "../components/ui/use-toast"
import { useAuth } from "../providers/AuthProvider"
import auth from "../services/auth"

const strengthScale = [
  {
    limit: 0.4,
    label: "Fraca",
    textClassName: "text-amber-600",
  },
  {
    limit: 0.8,
    label: "Media",
    textClassName: "text-orange-600",
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
  const strengthPercent = form.password ? Math.max(passwordValidation.strength * 100, 12) : 0
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
    <AuthShell
      pageLabel="Primeiro acesso"
      pageTitle="Cadastre a empresa e confirme o e-mail do responsavel."
      pageDescription="O cadastro cria a conta inicial da operacao. Depois disso, o sistema envia a confirmacao de e-mail e libera o acesso completo."
      panelBadge="Novo onboarding"
      panelTitle="Cadastro alinhado ao envio transacional"
      panelDescription="A confirmacao apos o cadastro faz parte do fluxo padrao. O usuario cria a conta, recebe o template certo e valida o e-mail antes de entrar na area interna."
      panelItems={[
        {
          icon: Building2,
          title: "Conta inicial da empresa",
          description: "Este formulario cria o primeiro usuario administrador da operacao.",
        },
        {
          icon: MailCheck,
          title: "Confirmacao apos cadastro",
          description: "Se a verificacao estiver ativa, um e-mail com link direto e enviado imediatamente.",
        },
        {
          icon: ShieldCheck,
          title: "Senha forte desde o inicio",
          description: "A conta nasce com politica de senha mais rigida e feedback visual em tempo real.",
        },
      ]}
      panelFooter="Use um e-mail real e acessivel. Ele sera o canal para recuperar senha, confirmar cadastro e receber avisos importantes."
      cardBadge="Criar conta"
      cardTitle="Cadastrar responsavel"
      cardDescription="Preencha os dados do primeiro acesso administrativo da sua empresa."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthNotice tone="neutral" title="Importante">
          Ao concluir o cadastro, voce pode precisar confirmar o e-mail antes de entrar na plataforma.
        </AuthNotice>

        <div className="grid gap-5">
          <AuthField
            id="name"
            name="name"
            label="Nome do responsavel"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            placeholder="Nome e sobrenome"
            required
          />

          <AuthField
            id="email"
            name="email"
            type="email"
            label="E-mail"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            placeholder="voce@empresa.com.br"
            hint="Este endereco sera usado para confirmar cadastro e recuperar senha."
            required
          />

          <div className="grid gap-5 md:grid-cols-2">
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
        </div>

        <PasswordRequirements
          strengthLabel={form.password ? passwordStrength.label : "Aguardando senha"}
          strengthClassName={form.password ? passwordStrength.textClassName : "text-slate-400"}
          strengthPercent={strengthPercent}
          checks={checks}
          footer="A senha precisa atender a todos os requisitos antes de liberar o cadastro."
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            className="h-12 flex-1 gap-2 rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
            disabled={!canSubmit}
          >
            <UserPlus className="h-4 w-4" />
            {isSubmitting ? "Criando..." : "Criar conta"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-2xl border-slate-200 px-5"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao login
          </Button>
        </div>
      </form>
    </AuthShell>
  )
}

export default Register
