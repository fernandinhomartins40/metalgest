import React, { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
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
      : "Abra o e-mail recebido e use o link para confirmar o cadastro."
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

  const alertClassName =
    status === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "error"
        ? "border-red-200 bg-red-50 text-red-800"
        : "border-slate-200"

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">MetalGest</p>
          <CardTitle>Confirmar e-mail</CardTitle>
          <CardDescription>Conclua a validacao do cadastro para liberar o acesso.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className={alertClassName}>
            <AlertTitle>Status da confirmacao</AlertTitle>
            <AlertDescription>
              <span className={status === "verifying" ? "inline-flex items-center gap-2" : undefined}>
                {status === "verifying" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {message}
              </span>
            </AlertDescription>
          </Alert>

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
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="voce@empresa.com.br"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isResending}>
                {isResending ? "Reenviando..." : "Reenviar confirmacao"}
              </Button>
            </form>
          )}

          <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/login")}>
            Voltar ao login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default VerifyEmail
