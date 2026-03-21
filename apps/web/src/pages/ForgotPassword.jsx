import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
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
      })
      toast({
        variant: result.recoveryAvailable ? "default" : "destructive",
        title: result.recoveryAvailable ? "Confira seu e-mail" : "Recuperação indisponível",
        description: result.message,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Não foi possível enviar",
        description: error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const feedbackClassName =
    feedback?.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-amber-200 bg-amber-50 text-amber-800"

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">MetalGest</p>
          <CardTitle>Recuperar acesso</CardTitle>
          <CardDescription>Informe o e-mail da conta para receber o link de redefinição.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
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
                placeholder="você@empresa.com.br"
                required
              />
            </div>

            {feedback ? (
              <Alert className={feedbackClassName}>
                <AlertTitle>
                  {feedback.tone === "success" ? "Pedido registrado" : "Recuperação indisponível"}
                </AlertTitle>
                <AlertDescription>{feedback.message}</AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertTitle>Como funciona</AlertTitle>
                <AlertDescription>
                  Se o e-mail existir, você receberá um link para criar uma nova senha.
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
            </Button>

            <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/login")}>
              Voltar ao login
            </Button>

            <Button type="button" variant="link" className="w-full" onClick={() => navigate("/verify-email")}>
              Reenviar confirmação de cadastro
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPassword
