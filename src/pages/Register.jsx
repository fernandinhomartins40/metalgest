
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { auth } from "@/services/auth.js"
import { ArrowLeft, UserPlus, Check, X } from "lucide-react"
import PasswordInput from "@/components/auth/PasswordInput"

function Register() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm()
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, requirements: {} })
  
  const password = watch("password", "")
  const confirmPassword = watch("confirmPassword", "")

  useEffect(() => {
    if (password) {
      setPasswordStrength(auth.validatePassword(password))
    }
  }, [password])

  const getStrengthColor = (strength) => {
    if (strength <= 0.3) return "bg-red-500"
    if (strength <= 0.6) return "bg-yellow-500"
    return "bg-green-500"
  }

  const onSubmit = async (data) => {
    try {
      await auth.register(data.email, data.password, data.name)
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Verifique seu email para confirmar sua conta"
      })
      navigate("/login")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.message
      })
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
                Crie sua conta
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Comece a gerenciar sua metalúrgica de forma eficiente
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
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nome completo
                    </label>
                    <input
                      {...register("name", { required: "Nome é obrigatório" })}
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
                      placeholder="Seu nome"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      {...register("email", { 
                        required: "Email é obrigatório",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Email inválido"
                        }
                      })}
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
                    validation={{
                      required: "Senha é obrigatória",
                      validate: value => 
                        auth.validatePassword(value).isValid || 
                        "A senha não atende aos requisitos mínimos"
                    }}
                  />

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getStrengthColor(passwordStrength.strength)} transition-all duration-300`}
                          style={{ width: `${passwordStrength.strength * 100}%` }}
                        />
                      </div>
                      <div className="mt-2 space-y-1">
                        {Object.entries({
                          "Mínimo 8 caracteres": passwordStrength.requirements.hasMinLength,
                          "Uma letra maiúscula": passwordStrength.requirements.hasUpperCase,
                          "Uma letra minúscula": passwordStrength.requirements.hasLowerCase,
                          "Um número": passwordStrength.requirements.hasNumber,
                          "Um símbolo": passwordStrength.requirements.hasSymbol
                        }).map(([requirement, isMet]) => (
                          <div key={requirement} className="flex items-center text-sm">
                            {isMet ? (
                              <Check className="w-4 h-4 text-green-500 mr-2" />
                            ) : (
                              <X className="w-4 h-4 text-red-500 mr-2" />
                            )}
                            <span className={isMet ? "text-green-700" : "text-red-700"}>
                              {requirement}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <PasswordInput
                    register={register}
                    name="confirmPassword"
                    label="Confirme sua senha"
                    placeholder="••••••••"
                    error={errors.confirmPassword}
                    validation={{
                      required: "Confirme sua senha",
                      validate: value => value === password || "As senhas não conferem"
                    }}
                  />
                    
                  {/* Password Match Indicator */}
                  {password && confirmPassword && (
                    <div className="mt-2 flex items-center text-sm">
                      {password === confirmPassword ? (
                        <>
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-green-700">Senhas conferem</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 text-red-500 mr-2" />
                          <span className="text-red-700">Senhas não conferem</span>
                        </>
                      )}
                    </div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2 px-4 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-200"
                    >
                      {isSubmitting ? (
                        "Criando conta..."
                      ) : (
                        <>
                          Criar conta
                          <UserPlus className="w-4 h-4" />
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
                  onClick={() => navigate("/login")}
                  className="text-sm text-primary hover:text-primary/90 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Já tem uma conta? Entre
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Register
