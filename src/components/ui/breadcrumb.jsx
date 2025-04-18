
import React from "react"
import { ChevronRight, Home } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

const routeNames = {
  "/": "Início",
  "/quotes": "Orçamentos",
  "/production": "Produção",
  "/products": "Produtos",
  "/financial": "Financeiro",
  "/dre": "DRE",
  "/users": "Usuários",
  "/settings": "Configurações"
}

export function Breadcrumb({ className }) {
  const location = useLocation()
  const pathnames = location.pathname.split("/").filter(x => x)
  
  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-gray-500", className)}>
      <Link
        to="/"
        className="flex items-center hover:text-gray-900 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`
        const isLast = index === pathnames.length - 1
        
        return (
          <React.Fragment key={to}>
            <ChevronRight className="h-4 w-4" />
            <Link
              to={to}
              className={cn(
                "hover:text-gray-900 transition-colors",
                isLast && "text-gray-900 font-medium"
              )}
            >
              {routeNames[to] || value}
            </Link>
          </React.Fragment>
        )
      })}
    </nav>
  )
}
