
import React from "react"
import { cn } from "../utils/utils.js"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { motion } from "framer-motion"
import {
  FileText,
  CheckCircle,
  Timer,
  DollarSign,
  Package,
  TrendingUp,
  ArrowUp,
  ArrowDown
} from "lucide-react"

function Dashboard() {
  const stats = [
    {
      title: "Total de Orçamentos",
      value: "24",
      icon: FileText,
      trend: "+12%",
      isPositive: true,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Orçamentos Aprovados",
      value: "18",
      icon: CheckCircle,
      trend: "+8%",
      isPositive: true,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Em Produção",
      value: "7",
      icon: Timer,
      trend: "+2%",
      isPositive: true,
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Fluxo de Caixa",
      value: "R$ 45.670",
      icon: DollarSign,
      trend: "+15%",
      isPositive: true,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Estoque Baixo",
      value: "3 itens",
      icon: Package,
      trend: "-1",
      isPositive: false,
      color: "from-red-500 to-red-600"
    },
    {
      title: "Lucro Estimado",
      value: "R$ 12.450",
      icon: TrendingUp,
      trend: "+18%",
      isPositive: true,
      color: "from-indigo-500 to-indigo-600"
    }
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-8">
      <div>
        <motion.h2 
          className="text-3xl font-bold tracking-tight text-gray-900"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Dashboard
        </motion.h2>
        <motion.p 
          className="mt-2 text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Visão geral do seu negócio
        </motion.p>
      </div>

      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "p-3 rounded-lg bg-gradient-to-br",
                    stat.color
                  )}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={cn(
                    "flex items-center space-x-1 text-sm",
                    stat.isPositive ? "text-green-600" : "text-red-600"
                  )}>
                    {stat.isPositive ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                    <span>{stat.trend}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Desempenho Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Gráfico será implementado aqui
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Orçamentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Lista será implementada aqui
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
