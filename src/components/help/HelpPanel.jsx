
import React from "react"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { X, ExternalLink, HelpCircle } from "lucide-react"
import { useLocation } from "react-router-dom"

const helpContent = {
  "/app": {
    title: "Dashboard",
    description: "Visão geral do seu negócio com indicadores importantes e gráficos.",
    topics: [
      "Acompanhe o desempenho em tempo real",
      "Visualize orçamentos e produção",
      "Monitore o fluxo de caixa",
      "Identifique produtos com estoque baixo"
    ],
    links: [
      {
        title: "Como usar o Dashboard",
        url: "#"
      }
    ]
  },
  "/app/clients": {
    title: "Clientes",
    description: "Gerencie sua carteira de clientes de forma eficiente.",
    topics: [
      "Cadastre novos clientes",
      "Mantenha informações atualizadas",
      "Acompanhe histórico de interações",
      "Categorize por tipo de cliente"
    ],
    links: [
      {
        title: "Guia de cadastro de clientes",
        url: "#"
      }
    ]
  },
  "/app/quotes": {
    title: "Orçamentos",
    description: "Crie e gerencie orçamentos para seus clientes.",
    topics: [
      "Crie orçamentos detalhados",
      "Calcule custos e margens",
      "Envie por e-mail",
      "Acompanhe status de aprovação"
    ],
    links: [
      {
        title: "Como criar orçamentos",
        url: "#"
      }
    ]
  },
  "/app/production": {
    title: "Produção",
    description: "Controle todo o processo produtivo.",
    topics: [
      "Gerencie ordens de serviço",
      "Acompanhe status de produção",
      "Defina prazos e prioridades",
      "Registre etapas concluídas"
    ],
    links: [
      {
        title: "Gestão da produção",
        url: "#"
      }
    ]
  },
  "/app/financial": {
    title: "Financeiro",
    description: "Controle completo das finanças da empresa.",
    topics: [
      "Registre entradas e saídas",
      "Acompanhe fluxo de caixa",
      "Gere relatórios financeiros",
      "Controle contas a pagar/receber"
    ],
    links: [
      {
        title: "Gestão financeira",
        url: "#"
      }
    ]
  },
  "/app/dre": {
    title: "DRE",
    description: "Demonstrativo de Resultados do Exercício.",
    topics: [
      "Analise resultados financeiros",
      "Compare períodos",
      "Visualize margens e lucros",
      "Exporte relatórios"
    ],
    links: [
      {
        title: "Como interpretar o DRE",
        url: "#"
      }
    ]
  }
}

function HelpPanel({ isOpen, onClose }) {
  const location = useLocation()
  const content = helpContent[location.pathname] || {
    title: "Ajuda",
    description: "Como podemos ajudar?",
    topics: [],
    links: []
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? 0 : "100%" }}
      transition={{ type: "spring", damping: 20 }}
      className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-40"
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">{content.title}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-gray-600">{content.description}</p>
          </div>

          {content.topics.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Principais recursos:</h3>
              <ul className="space-y-2">
                {content.topics.map((topic, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {content.links.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Links úteis:</h3>
              <ul className="space-y-2">
                {content.links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default HelpPanel
