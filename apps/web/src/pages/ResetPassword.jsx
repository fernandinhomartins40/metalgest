import React, { useMemo, useState } from "react"
import { ArrowLeft, KeyRound, LockKeyhole, ShieldCheck, TimerReset } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import AuthNotice from "../components/auth/AuthNotice"
import AuthShell from "../components/auth/AuthShell"
import PasswordInput from "../components/auth/PasswordInput"
import PasswordRequirements from "../components/auth/PasswordRequirements"
import { Button } from "../components/ui/button"
import { useToast } from "../components/ui/use-toast"
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
  const strengthPercent = form.password ? Math.max(passwordValidation.strength * 100, 12) : 0

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
    <AuthShell
      pageLabel="Nova credencial"
      pageTitle="Crie uma nova senha e retome o controle da conta."
      pageDescription="O link do e-mail leva direto para esta tela. Depois da troca, o usuario pode entrar novamente com a nova credencial."
      panelBadge="Seguranca do fluxo"
      panelTitle="Troca de senha com contexto claro"
      panelDescription="A tela orienta a criacao da nova senha, mostra a forca em tempo real e deixa explicito quando o link esta ausente ou expirado."
      panelItems={[
        {
          icon: LockKeyhole,
          title: "Nova senha valida",
          description: "O formulario exige padrao forte antes de aceitar a redefinicao.",
        },
        {
          icon: TimerReset,
          title: "Link temporario",
          description: "O token enviado por e-mail expira rapidamente para evitar reuso indevido.",
        },
        {
          icon: ShieldCheck,
          title: "Acesso restaurado",
          description: "Depois da troca, o usuario volta ao login com a nova senha e sem depender de suporte.",
        },
      ]}
      panelFooter="Se este link foi aberto fora do prazo, solicite outro e-mail de recuperacao e descarte o anterior."
      cardBadge="Redefinir senha"
      cardTitle={isCompleted ? "Senha atualizada" : "Criar nova senha"}
      cardDescription={
        isCompleted
          ? "A conta ja pode ser acessada com a nova credencial."
          : "Defina uma senha forte para voltar a acessar sua operacao com seguranca."
      }
    >
      {isCompleted ? (
        <div className="space-y-5">
          <AuthNotice tone="success" title="Tudo certo">
            Sua senha foi atualizada. Acesse o login e continue normalmente com a nova combinacao.
          </AuthNotice>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-12 flex-1 rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
              onClick={() => navigate("/login")}
            >
              Ir para o login
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-2xl border-slate-200 px-5"
              onClick={() => navigate("/forgot-password")}
            >
              Pedir novo link
            </Button>
          </div>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          {!token ? (
            <AuthNotice tone="warning" title="Link incompleto">
              O token de recuperacao nao foi encontrado ou ja expirou. Solicite um novo e-mail para continuar.
            </AuthNotice>
          ) : (
            <AuthNotice tone="neutral" title="Link recebido">
              Este formulario conclui o processo iniciado no e-mail de recuperacao.
            </AuthNotice>
          )}

          <PasswordInput
            id="password"
            name="password"
            label="Nova senha"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            hint="Misture letras, numeros e simbolos para reduzir risco de acesso indevido."
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

          <PasswordRequirements
            strengthLabel={form.password ? passwordStrength.label : "Aguardando senha"}
            strengthClassName={form.password ? passwordStrength.textClassName : "text-slate-400"}
            strengthPercent={strengthPercent}
            checks={checks}
            footer="Assim que a senha atender aos requisitos, voce podera concluir a redefinicao."
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              className="h-12 flex-1 gap-2 rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
              disabled={isSubmitting || !token}
            >
              <KeyRound className="h-4 w-4" />
              {isSubmitting ? "Salvando..." : "Atualizar senha"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-2xl border-slate-200 px-5"
              onClick={() => navigate("/forgot-password")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Pedir novo link
            </Button>
          </div>
        </form>
      )}
    </AuthShell>
  )
}

export default ResetPassword
