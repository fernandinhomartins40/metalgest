import React, { useState } from "react"
import { ArrowLeft, Mail } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { useToast } from "../components/ui/use-toast"
import auth from "../services/auth"

function ForgotPassword() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await auth.requestPasswordReset(email)
      setSuccessMessage(result.message)
      toast({
        title: "Confira seu e-mail",
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">MetalGest</p>
          <CardTitle>Recuperar acesso</CardTitle>
          <CardDescription>
            Informe o e-mail da sua conta para receber o link de criacao de uma nova senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                required
              />
            </div>

            {successMessage ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {successMessage}
              </div>
            ) : null}

            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              <Mail className="h-4 w-4" />
              {isSubmitting ? "Enviando..." : "Enviar link de recuperacao"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPassword
