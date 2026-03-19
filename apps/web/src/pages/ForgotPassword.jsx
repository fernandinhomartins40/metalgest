import React, { useState } from "react"
import { ArrowLeft, KeyRound, Mail, ShieldCheck, TimerReset } from "lucide-react"
import { useNavigate } from "react-router-dom"
import AuthField from "../components/auth/AuthField"
import AuthNotice from "../components/auth/AuthNotice"
import AuthShell from "../components/auth/AuthShell"
import { Button } from "../components/ui/button"
import { useToast } from "../components/ui/use-toast"
import auth from "../services/auth"

function ForgotPassword() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFeedback(null)
    setIsSubmitting(true)

    try {
      const result = await auth.requestPasswordReset(email)
      setFeedback({
        tone: result.recoveryAvailable ? "success" : "warning",
        message: result.message,
        email: email.trim(),
      })
      toast({
        variant: result.recoveryAvailable ? "default" : "destructive",
        title: result.recoveryAvailable ? "Confira seu e-mail" : "Recuperacao indisponivel",
        description: result.message,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Nao foi possivel enviar",
        description: error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      pageLabel="Recuperacao de conta"
      pageTitle="Peça um novo link e redefina a senha sem abrir chamado."
      pageDescription="O sistema envia um link temporario para o e-mail cadastrado. A partir dele, o responsavel define uma nova senha e retoma o acesso."
      panelBadge="Como funciona"
      panelTitle="Reset guiado do inicio ao fim"
      panelDescription="A experiencia agora cobre o e-mail, o clique e o formulario final. O usuario nao precisa adivinhar em qual pagina deve cair."
      panelItems={[
        {
          icon: Mail,
          title: "Link por e-mail",
          description: "O pedido gera uma mensagem transacional com botao e link direto para a tela de troca de senha.",
        },
        {
          icon: TimerReset,
          title: "Validade curta",
          description: "Cada token expira rapidamente para reduzir risco em caso de encaminhamento indevido.",
        },
        {
          icon: ShieldCheck,
          title: "Sem exposicao",
          description: "A interface continua respondendo de forma neutra para nao revelar se um e-mail existe ou nao na base.",
        },
      ]}
      panelFooter="Se o botao do e-mail nao abrir, o usuario ainda recebe a URL completa para copiar no navegador."
      cardBadge="Senha esquecida"
      cardTitle="Recuperar acesso"
      cardDescription="Informe o e-mail da conta para receber um link temporario de redefinicao."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthField
          id="email"
          name="email"
          label="E-mail da conta"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="voce@empresa.com.br"
          hint="Use o mesmo e-mail que recebe notificacoes da plataforma."
          required
        />

        {feedback ? (
          <AuthNotice
            tone={feedback.tone}
            title={feedback.tone === "success" ? "Pedido registrado" : "Recuperacao indisponivel"}
          >
            <p>{feedback.message}</p>
            {feedback.email ? (
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em]">
                Endereco usado: {feedback.email}
              </p>
            ) : null}
          </AuthNotice>
        ) : (
          <AuthNotice tone="neutral" title="Antes de continuar">
            O e-mail leva voce para a pagina de criacao de nova senha. Confira tambem as abas spam e promocoes.
          </AuthNotice>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            className="h-12 flex-1 gap-2 rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
            disabled={isSubmitting}
          >
            <Mail className="h-4 w-4" />
            {isSubmitting ? "Enviando..." : "Enviar link de recuperacao"}
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

        <Button
          type="button"
          variant="ghost"
          className="h-11 w-full justify-between rounded-2xl px-4 text-slate-700 hover:bg-slate-50"
          onClick={() => navigate("/verify-email")}
        >
          Precisa reenviar a confirmacao de cadastro?
          <KeyRound className="h-4 w-4" />
        </Button>
      </form>
    </AuthShell>
  )
}

export default ForgotPassword
