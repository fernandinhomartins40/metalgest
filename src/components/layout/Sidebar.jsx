
import React from "react"
import { NavLink } from "react-router-dom"
import { cn } from "@/utils/utils.js"
import { motion } from "framer-motion"
import { permissions } from "@/lib/permissions"
import { useUser } from "@/contexts/UserContext"
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  Settings,
  Hammer,
  DollarSign,
  PieChart,
  UserCog,
  Wrench
} from "lucide-react"

const navigation = [
  { name: "Dashboard", to: "/app", icon: LayoutDashboard, module: permissions.MODULES.DASHBOARD },
  { name: "Clientes", to: "/app/clients", icon: Users, module: permissions.MODULES.CLIENTS },
  { name: "Orçamentos", to: "/app/quotes", icon: FileText, module: permissions.MODULES.QUOTES },
  { name: "Produção", to: "/app/production", icon: Hammer, module: permissions.MODULES.PRODUCTION },
  { name: "Produtos e Serviços", to: "/app/products", icon: Package, module: permissions.MODULES.PRODUCTS },
  { name: "Serviços", to: "/app/services", icon: Wrench, module: permissions.MODULES.SERVICES },
  { name: "Financeiro", to: "/app/financial", icon: DollarSign, module: permissions.MODULES.FINANCIAL },
  { name: "DRE", to: "/app/dre", icon: PieChart, module: permissions.MODULES.DRE },
  { name: "Usuários", to: "/app/users", icon: UserCog, module: permissions.MODULES.USERS },
  { name: "Configurações", to: "/app/settings", icon: Settings, module: permissions.MODULES.SETTINGS },
]

function Sidebar() {
  const { user } = useUser()
  const accessibleModules = permissions.getAccessibleModules()
  const filteredNavigation = navigation.filter(item => accessibleModules.includes(item.module))

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-16 border-b border-gray-100">
        <motion.h1 
          className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          MetalGest
        </motion.h1>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="p-4 space-y-1">
          {filteredNavigation.map((item) => (
            <motion.li 
              key={item.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200",
                    "hover:bg-gray-50",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-600 hover:text-primary"
                  )
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center p-3 rounded-lg bg-gray-50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-medium">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user?.name || "Usuário"}</p>
            <p className="text-xs text-gray-500">{user?.email || "usuario@metalgest.com"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
