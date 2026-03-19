import React, { useEffect, useState } from "react"
import {
  ArrowLeft,
  Loader2,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  UserCheck2,
} from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import AuthField from "../components/auth/AuthField"
import AuthNotice from "../components/auth/AuthNotice"
import AuthShell from "../components/auth/AuthShell"
import { Button } from "../components/ui/button"
import { useToast } from "../components/ui/use-toast"
import auth from "../services/auth"

function VerifyEmail() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""
  const initialEmail = searchParams.get("email") || ""
  const [email, setEmail] = useState(initialEmail)
  const [status, setStatus] = useState(token ? "verifying" : "idle")
  const [message, setMessage] = useState(
    token
      ? "Estamos validando o link enviado para o seu e-mail."
      : "Enviamos um link de confirmacao. Abra sua caixa de entrada e siga o proximo passo."
  )
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (!token) {
      return
    }

    let isMounted = true

    const confirmEmail = async () => {
      try {
        const result = await auth.verifyEmail(token)
        if (!isMounted) {
          return
        }

        setStatus("success")
        setMessage(result.message)
        toast({
          title: "E-mail confirmado",
          description: result.message,
        })
      } catch (error) {
        if (!isMounted) {
          return
        }

        setStatus("error")
        setMessage(error.message)
        toast({
          variant: "destructive",
          title: "Nao foi possivel confirmar",
          description: error.message,
        })
      }
    }

    void confirmEmail()

    return () => {
      isMounted = false
    }
  }, [token, toast])

  const handleResend = async (event) => {
    event.preventDefault()

    if (!email) {
      toast({
        variant: "destructive",
        title: "Informe o e-mail",
        description: "Digite o e-mail da conta para reenviar a confirmacao.",
      })
      return
    }

    setIsResending(true)

    try {
      const result = await auth.resendVerificationEmail(email)
      setStatus(result.alreadyVerified ? "success" : "idle")
      setMessage(result.message)
      toast({
        title: result.alreadyVerified ? "E-mail ja confirmado" : "Link reenviado",
        description: result.message,
      })
    } catch (error) {
      setStatus("error")
      setMessage(error.message)
      toast({
        variant: "destructive",
        title: "Nao foi possivel reenviar",
        description: error.message,
      })
    } finally {
      setIsResending(false)
    }
  }

  const noticeTone =
    status === "success" ? "success" : status === "error" ? "error" : status === "verifying" ? "neutral" : "warning"

  return (
    <AuthShell
      pageLabel="Confirmacao do cadastro"
      pageTitle="Valide o e-mail antes de liberar o primeiro acesso."
      pageDescription="O cadastro da empresa ja existe, mas a conta so fica pronta depois da confirmacao do endereco responsavel."
      panelBadge="Depois do cadastro"
      panelTitle="Mesmo fluxo no e-mail e na interface"
      panelDescription="Quem acabou de criar a conta recebe um template de confirmacao com link direto para esta tela. Se o prazo passar, o proprio usuario pode pedir um novo envio."
      panelItems={[
        {
          icon: MailCheck,
          title: "Clique unico",
          description: "O link abre esta pagina e dispara a validacao imediatamente quando o token esta presente.",
        },
        {
          icon: UserCheck2,
          title: "Cadastro liberado",
          description: "Depois da confirmacao, a conta fica pronta para entrar normalmente pelo login.",
        },
        {
          icon: ShieldCheck,
          title: "Reenvio controlado",
          description: "Se o link expirar, o usuario pode reenviar uma nova confirmacao informando o e-mail da conta.",
        },
      ]}
      panelFooter="Se o e-mail nao aparecer na caixa principal, verifique spam e promocoes antes de pedir novo envio."
      cardBadge="Confirmar e-mail"
      cardTitle={status === "success" ? "Cadastro confirmado" : "Validar cadastro"}
      cardDescription="Este passo garante que os avisos importantes da conta cheguem ao responsavel correto."
    >
      <div className="space-y-5">
        <AuthNotice tone={noticeTone} title="Status da confirmacao">
          <span className={status === "verifying" ? "inline-flex items-center gap-2" : undefined}>
            {status === "verifying" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {message}
          </span>
        </AuthNotice>

        {status === "success" ? (
          <div className="space-y-3">
            <Button
              className="h-12 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
              onClick={() => navigate("/login")}
            >
              Ir para o login
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-2xl border-slate-200"
              onClick={() => navigate("/register")}
            >
              Criar outra conta
            </Button>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleResend}>
            <AuthField
              id="email"
              name="email"
              type="email"
              label="E-mail da conta"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="voce@empresa.com.br"
              hint="Use o mesmo e-mail informado no cadastro para reenviar a confirmacao."
              required
            />

            <Button
              type="submit"
              className="h-12 w-full gap-2 rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
              disabled={isResending}
            >
              <RefreshCw className={`h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
              {isResending ? "Reenviando..." : "Reenviar confirmacao"}
            </Button>
          </form>
        )}

        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-2xl border-slate-200"
          onClick={() => navigate("/login")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao login
        </Button>
      </div>
    </AuthShell>
  )
}

export default VerifyEmail
