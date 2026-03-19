import React, { useEffect, useState } from "react"
import { ArrowLeft, CheckCircle2, Loader2, MailCheck, RefreshCw } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
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
      ? "Estamos validando o link enviado para o seu email."
      : "Enviamos um link de confirmacao. Abra seu email e siga o passo indicado."
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
          title: "Email confirmado",
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
        title: result.alreadyVerified ? "Email ja confirmado" : "Link reenviado",
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">MetalGest</p>
          <CardTitle>Confirmar email</CardTitle>
          <CardDescription>
            Este passo protege o acesso da sua empresa e garante que os avisos importantes cheguem ao responsavel certo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`rounded-lg border px-4 py-4 text-sm ${
              status === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : status === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            <div className="flex items-start gap-3">
              {status === "verifying" ? (
                <Loader2 className="mt-0.5 h-4 w-4 animate-spin" />
              ) : status === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4" />
              ) : (
                <MailCheck className="mt-0.5 h-4 w-4" />
              )}
              <span>{message}</span>
            </div>
          </div>

          {status === "success" ? (
            <Button className="w-full" onClick={() => navigate("/login")}>
              Ir para o login
            </Button>
          ) : (
            <form className="space-y-4" onSubmit={handleResend}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="email">
                  E-mail da conta
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className="w-full rounded-md border border-slate-300 px-3 py-2"
                  placeholder="voce@empresa.com.br"
                  required
                />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isResending}>
                <RefreshCw className={`h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
                {isResending ? "Reenviando..." : "Reenviar confirmacao"}
              </Button>
            </form>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default VerifyEmail
