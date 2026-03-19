import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { LogIn } from "lucide-react"
import PasswordInput from "../components/auth/PasswordInput"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">MetalGest</p>
          <CardTitle>Acessar plataforma</CardTitle>
          <CardDescription>Entre com a sua conta para continuar gerenciando a operacao.</CardDescription>
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
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                required
              />
            </div>

            <PasswordInput
              id="password"
              name="password"
              label="Senha"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />

            <div className="space-y-3">
              <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                <input
                  name="rememberMe"
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300"
                />
                <span>
                  <span className="block font-medium text-slate-800">Manter conectado</span>
                  <span className="block text-slate-500">
                    Mantem sua sessao ativa neste dispositivo mesmo apos fechar o navegador.
                  </span>
                </span>
              </label>

              <button
                type="button"
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                onClick={() => navigate("/forgot-password")}
              >
                Esqueci minha senha
              </button>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              <LogIn className="h-4 w-4" />
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>

            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => navigate("/register")}
            >
              Criar conta
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
