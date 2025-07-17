
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { useToast } from "../components/ui/use-toast"
import { Button } from "../components/ui/button"
import { auth } from "../services/auth.js"
import { ArrowRight, LogIn, KeyRound } from "lucide-react"
import PasswordInput from "../components/auth/PasswordInput"

function Login() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isResetting, setIsResetting] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues, setValue } = useForm()

  // Load saved credentials on mount
  useEffect(() => {
    const savedCredentials = auth.getSavedCredentials()
    if (savedCredentials?.email) {
      setValue("email", savedCredentials.email)
      setValue("password", savedCredentials.password)
      setValue("rememberMe", true)
    }
  }, [setValue])

  const onSubmit = async (data) => {
    try {
      const result = await auth.login(data.email, data.password, data.rememberMe, data.keepConnected)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      // Show success state
      setLoginSuccess(true)
      
      // Show success toast with user name if available
      const userName = result.user?.name || "Usuário"
      toast({
        title: "✅ Login realizado com sucesso!",
        description: `Bem-vindo de volta, ${userName}!`,
        duration: 3000
      })
      
      // Delay to show success state and toast before navigation
      setTimeout(() => {
        navigate("/app", { replace: true })
      }, 1500)
      
    } catch (error) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "❌ Erro no login",
        description: error.message || "Credenciais inválidas. Verifique seus dados e tente novamente.",
        duration: 5000
      })
    }
  }

  const handleResetPassword = async () => {
    try {
      setIsResetting(true)
      const email = getValues("email")
      if (!email) {
        throw new Error("Por favor, insira seu email")
      }
      await auth.resetPassword(email)
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao resetar senha",
        description: error.message
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md w-full"
          >
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent"
              >
                Metalgest
              </motion.h1>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Bem-vindo de volta
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Entre com suas credenciais para acessar o sistema
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <div className="bg-white/60 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-gray-100">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      {...register("email", { required: "Email é obrigatório" })}
                      type="email"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
                      placeholder="seu@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <PasswordInput
                    register={register}
                    name="password"
                    label="Senha"
                    placeholder="••••••••"
                    error={errors.password}
                    validation={{ required: "Senha é obrigatória" }}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        {...register("rememberMe")}
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Lembrar-me
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        {...register("keepConnected")}
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="keep-connected" className="ml-2 block text-sm text-gray-700">
                        Manter-me conectado
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="link"
                      disabled={isResetting}
                      onClick={handleResetPassword}
                      className="text-sm text-primary hover:text-primary/90 flex items-center gap-1"
                    >
                      <KeyRound className="w-4 h-4" />
                      {isResetting ? "Enviando..." : "Esqueci minha senha"}
                    </Button>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting || loginSuccess}
                      className={`w-full py-2 px-4 flex items-center justify-center gap-2 transition-all duration-200 text-white rounded-lg ${
                        loginSuccess 
                          ? 'bg-green-500 hover:bg-green-500' 
                          : 'bg-primary hover:bg-primary/90'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loginSuccess ? (
                        <>
                          <div className="w-4 h-4 rounded-full bg-white text-green-500 flex items-center justify-center text-xs">✓</div>
                          Sucesso! Redirecionando...
                        </>
                      ) : isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Entrando...
                        </>
                      ) : (
                        <>
                          Entrar
                          <LogIn className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </div>

              <div className="mt-6 text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate("/register")}
                  className="text-sm text-primary hover:text-primary/90 flex items-center justify-center gap-2"
                >
                  Não tem uma conta? Cadastre-se
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login
