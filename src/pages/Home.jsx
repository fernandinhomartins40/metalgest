
import React from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Settings, Users, BarChart2, Package } from "lucide-react"

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
              Metalgest
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              A plataforma completa de gestão para sua metalúrgica. 
              Controle produção, estoque, vendas e finanças em um só lugar.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate("/register")}
                  className="w-full sm:w-auto text-lg px-8 py-6 bg-primary hover:bg-primary/90"
                >
                  Criar Conta
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="w-full sm:w-auto text-lg px-8 py-6 border-2"
                >
                  Entrar
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: Package,
                title: "Gestão de Produção",
                description: "Controle total do seu processo produtivo"
              },
              {
                icon: Users,
                title: "Gestão de Clientes",
                description: "Relacionamento e histórico completo"
              },
              {
                icon: BarChart2,
                title: "Controle Financeiro",
                description: "Análises e relatórios detalhados"
              },
              {
                icon: Settings,
                title: "Automatização",
                description: "Processos otimizados e integrados"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8 }}
                className="relative p-6 bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="absolute -top-4 -left-4 p-3 bg-primary/10 rounded-xl">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Home
