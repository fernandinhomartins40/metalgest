import React, { useEffect, useState } from "react"
import { ArrowRight, KeyRound, LogIn, MailCheck, ShieldCheck } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import AuthField from "../components/auth/AuthField"
import AuthNotice from "../components/auth/AuthNotice"
import AuthShell from "../components/auth/AuthShell"
import PasswordInput from "../components/auth/PasswordInput"
import { Button } from "../components/ui/button"
import { useToast } from "../components/ui/use-toast"
import { useAuth } from "../providers/AuthProvider"
import auth from "../services/auth"

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { login, isAuthenticated } = useAuth()
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const saved = auth.getSavedCredentials()
    if (saved?.email) {
      setForm((current) => ({
        ...current,
        email: saved.email,
        rememberMe: true,
      }))
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/app", { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await login(form.email, form.password, form.rememberMe)

      toast({
        title: "Sessao iniciada",
        description: "Autenticacao concluida com sucesso.",
      })

      const redirectTo = location.state?.from?.pathname || "/app"
      navigate(redirectTo, { replace: true })
    } catch (error) {
      if (error.code === "EMAIL_NOT_VERIFIED") {
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`, {
          replace: true,
        })
      }

      toast({
        variant: "destructive",
        title: "Falha no login",
        description: error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      pageLabel="Acesso da operacao"
      pageTitle="Entre e continue de onde a sua metalurgica parou."
      pageDescription="Login, recuperacao de senha e confirmacao de e-mail agora seguem o mesmo fluxo. O usuario recebe o link certo e cai direto na tela certa."
      panelBadge="Fluxo publico"
      panelTitle="Acesso mais claro, sem suporte manual"
      panelDescription="O MetalGest agora orienta a entrada da conta com a mesma logica usada nos e-mails transacionais. Quem esquece a senha ou ainda nao confirmou o cadastro nao fica preso no meio do caminho."
      panelItems={[
        {
          icon: ShieldCheck,
          title: "Sessao segura",
          description: "A autenticacao continua protegida por token e a conta so libera acesso completo apos confirmacao.",
        },
        {
          icon: KeyRound,
          title: "Recuperacao direta",
          description: "O usuario pede um novo link e chega no formulario de troca de senha sem depender do suporte.",
        },
        {
          icon: MailCheck,
          title: "Cadastro validado",
          description: "Se o e-mail ainda nao foi confirmado, o sistema reenvia a verificacao e aponta a proxima acao.",
        },
      ]}
      panelFooter="Se o responsavel pela conta estiver acessando pela primeira vez, crie o cadastro e confirme o e-mail antes de entrar na area interna."
      cardBadge="Entrar"
      cardTitle="Acessar plataforma"
      cardDescription="Use o e-mail cadastrado para entrar no painel da MetalGest."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthField
          id="email"
          name="email"
          label="E-mail"
          type="email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          placeholder="voce@empresa.com.br"
          hint="Este e-mail tambem recebe os links de confirmacao e recuperacao."
          required
        />

        <PasswordInput
          id="password"
          name="password"
          label="Senha"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
          hint="Se perdeu o acesso, solicite um novo link logo abaixo."
        />

        <AuthNotice tone="neutral" title="Lembrete">
          Se esta conta ainda nao foi confirmada, o login redireciona voce para a validacao do e-mail e pode reenviar o link automaticamente.
        </AuthNotice>

        <label className="flex items-start gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm text-slate-700">
          <input
            name="rememberMe"
            type="checkbox"
            checked={form.rememberMe}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-slate-300"
          />
          <span>
            <span className="block font-semibold text-slate-800">Manter conectado neste dispositivo</span>
            <span className="mt-1 block leading-6 text-slate-500">
              Ideal para o computador da empresa. Evite em maquinas compartilhadas.
            </span>
          </span>
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            className="h-12 flex-1 gap-2 rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
            disabled={isSubmitting}
          >
            <LogIn className="h-4 w-4" />
            {isSubmitting ? "Entrando..." : "Entrar na plataforma"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-2xl border-slate-200 px-5"
            onClick={() => navigate("/forgot-password")}
          >
            Esqueci minha senha
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="h-11 w-full justify-between rounded-2xl border border-transparent px-4 text-slate-700 hover:border-slate-200 hover:bg-slate-50"
          onClick={() => navigate("/register")}
        >
          Criar conta
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthShell>
  )
}

export default Login
