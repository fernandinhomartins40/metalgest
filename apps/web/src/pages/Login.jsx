import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { LogIn } from "lucide-react"
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
    rememberMe: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const saved = auth.getSavedCredentials()
    if (saved?.email) {
      setForm((current) => ({ ...current, email: saved.email }))
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
        title: "Sessão iniciada",
        description: "Autenticação concluída com sucesso.",
      })

      const redirectTo = location.state?.from?.pathname || "/app"
      navigate(redirectTo, { replace: true })
    } catch (error) {
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
          <CardDescription>Use as credenciais da sua instalação para entrar.</CardDescription>
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
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                required
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                name="rememberMe"
                type="checkbox"
                checked={form.rememberMe}
                onChange={handleChange}
              />
              Lembrar e-mail neste navegador
            </label>

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
              Criar primeira conta
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
