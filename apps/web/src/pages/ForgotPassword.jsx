import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthPageFrame from "../components/auth/AuthPageFrame"
import { Button } from "../components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
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
      ? "border-emerald-200 bg-emerald-50/95 text-emerald-800"
      : "border-amber-200 bg-amber-50/95 text-amber-800"

  return (
    <AuthPageFrame
      introTitle="Recupere seu acesso"
      introDescription="Receba o link de redefinição no e-mail da conta."
      eyebrow="Recuperação"
      title="Recuperar senha"
      description="Informe o e-mail cadastrado para gerar um novo acesso."
    >
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
          <Alert className="border-[#dce6ef] bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_100%)]">
            <AlertTitle>Como funciona</AlertTitle>
            <AlertDescription>
              Se o e-mail existir, enviaremos um link para criar uma nova senha.
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="h-11 w-full rounded-xl text-base font-semibold shadow-[0_16px_32px_rgba(25,216,143,0.22)]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl border-[#d6dfeb]"
          onClick={() => navigate("/login")}
        >
          Voltar ao login
        </Button>

        <Button
          type="button"
          variant="link"
          className="w-full text-[#2f2960]"
          onClick={() => navigate("/verify-email")}
        >
          Reenviar confirmação de cadastro
        </Button>
      </form>
    </AuthPageFrame>
  )
}

export default ForgotPassword
