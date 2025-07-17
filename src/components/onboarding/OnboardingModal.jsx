
import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/button"
import { useToast } from "../ui/use-toast"
import { auth } from "../../services/auth"
import { api } from "../../services/api"
import {
  FileText,
  Users,
  Hammer,
  DollarSign,
  PieChart,
  ArrowRight,
  X
} from "lucide-react"

const steps = [
  {
    title: "Bem-vindo ao MetalGest",
    description: "Seu sistema completo de gestão para metalúrgicas. Vamos conhecer os principais módulos?",
    icon: null
  },
  {
    title: "Clientes e Orçamentos",
    description: "Gerencie seus clientes e crie orçamentos profissionais com poucos cliques.",
    icon: Users
  },
  {
    title: "Produção",
    description: "Acompanhe todas as ordens de serviço, desde a aprovação até a entrega.",
    icon: Hammer
  },
  {
    title: "Financeiro",
    description: "Controle completo das finanças, com fluxo de caixa e relatórios detalhados.",
    icon: DollarSign
  },
  {
    title: "DRE",
    description: "Análise detalhada do desempenho financeiro da sua empresa.",
    icon: PieChart
  }
]

function OnboardingModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const { toast } = useToast()
  const [showAgain, setShowAgain] = React.useState(true)

  const handleClose = async () => {
    if (!showAgain) {
      try {
        const currentUser = await auth.getCurrentUser()
        if (currentUser) {
          // For now, we'll just close the modal
          // TODO: Implement user preferences endpoint in backend
          // await api.settings.updateUserPreferences({
          //   show_onboarding: false,
          //   onboarding_completed: true
          // })
        }
      } catch (error) {
        console.error("Error saving preferences:", error)
        toast({
          variant: "destructive",
          title: "Erro ao salvar preferências",
          description: "Suas preferências serão restauradas no próximo acesso."
        })
      }
    }
    onClose()
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleClose()
    }
  }

  if (!isOpen) return null

  const CurrentIcon = steps[currentStep].icon

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4"
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1"
              >
                <h2 className="text-2xl font-bold text-gray-900">
                  {steps[currentStep].title}
                </h2>
                <p className="mt-2 text-gray-600">
                  {steps[currentStep].description}
                </p>
              </motion.div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-8">
              {CurrentIcon && (
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="p-4 rounded-full bg-primary/10"
                  >
                    <CurrentIcon className="h-12 w-12 text-primary" />
                  </motion.div>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={!showAgain}
                  onChange={(e) => setShowAgain(!e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span>Não mostrar novamente</span>
              </label>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  Pular
                </Button>
                <Button onClick={nextStep}>
                  {currentStep === steps.length - 1 ? (
                    "Começar"
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 rounded-b-lg">
            <div className="flex justify-center gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 w-8 rounded-full transition-colors ${
                    index === currentStep ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default OnboardingModal
