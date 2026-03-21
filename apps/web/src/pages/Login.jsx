import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import AuthPageFrame from "../components/auth/AuthPageFrame"
import PasswordInput from "../components/auth/PasswordInput"
import { Button } from "../components/ui/button"
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
        title: "Sessão iniciada",
        description: "Autenticação concluída com sucesso.",
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
    <AuthPageFrame
      introTitle="Acesse sua operação"
      introDescription="Comercial, produção, estoque e financeiro no mesmo fluxo."
      eyebrow="Login"
      title="Entrar no MetalGest"
      description="Use seu e-mail e senha para continuar."
    >
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
            placeholder="você@empresa.com.br"
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
              className="h-4 w-4 rounded border-[#c7d6e3] text-primary focus:ring-primary focus:ring-offset-0"
            />
            Manter conectado
          </label>

          <Button
            type="button"
            variant="link"
            className="h-auto px-0 text-[#2f2960]"
            onClick={() => navigate("/forgot-password")}
          >
            Esqueci minha senha
          </Button>
        </div>

        <Button
          type="submit"
          className="h-11 w-full rounded-xl text-base font-semibold shadow-[0_16px_32px_rgba(25,216,143,0.22)]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl border-[#d6dfeb]"
          onClick={() => navigate("/register")}
        >
          Criar conta
        </Button>
      </form>
    </AuthPageFrame>
  )
}

export default Login
