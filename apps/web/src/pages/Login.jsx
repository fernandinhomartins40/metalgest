import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import PasswordInput from "../components/auth/PasswordInput"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">MetalGest</p>
          <CardTitle>Acessar plataforma</CardTitle>
          <CardDescription>Entre com o e-mail cadastrado para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                E-mail
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="voce@empresa.com.br"
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

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  name="rememberMe"
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Manter conectado
              </label>

              <Button type="button" variant="link" className="h-auto px-0" onClick={() => navigate("/forgot-password")}>
                Esqueci minha senha
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>

            <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/register")}>
              Criar conta
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
