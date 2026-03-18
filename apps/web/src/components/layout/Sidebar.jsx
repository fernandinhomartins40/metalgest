import React from "react"
import { NavLink } from "react-router-dom"
import {
  DollarSign,
  FileText,
  Hammer,
  LayoutDashboard,
  Package,
  PieChart,
  Settings,
  UserCog,
  Users,
  Wrench,
} from "lucide-react"
import { cn } from "../../utils/utils.js"
import { permissions } from "../../lib/permissions"
import { useAuth } from "../../providers/AuthProvider"

const navigation = [
  { name: "Dashboard", to: "/app", icon: LayoutDashboard, module: permissions.MODULES.DASHBOARD },
  { name: "Clientes", to: "/app/clients", icon: Users, module: permissions.MODULES.CLIENTS },
  { name: "Orçamentos", to: "/app/quotes", icon: FileText, module: permissions.MODULES.QUOTES },
  { name: "Produção", to: "/app/production", icon: Hammer, module: permissions.MODULES.PRODUCTION },
  { name: "Produtos", to: "/app/products", icon: Package, module: permissions.MODULES.PRODUCTS },
  { name: "Serviços", to: "/app/services", icon: Wrench, module: permissions.MODULES.SERVICES },
  { name: "Financeiro", to: "/app/financial", icon: DollarSign, module: permissions.MODULES.FINANCIAL },
  { name: "DRE", to: "/app/dre", icon: PieChart, module: permissions.MODULES.DRE },
  { name: "Usuários", to: "/app/users", icon: UserCog, module: permissions.MODULES.USERS },
  { name: "Configurações", to: "/app/settings", icon: Settings, module: permissions.MODULES.SETTINGS },
]

function Sidebar() {
  const { user } = useAuth()
  const accessibleModules = permissions.getAccessibleModules(user)
  const filteredNavigation = navigation.filter((item) => accessibleModules.includes(item.module))

  return (
    <aside className="hidden w-72 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
      <div className="border-b border-gray-200 px-6 py-6">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Operação</p>
        <h2 className="mt-2 text-2xl font-semibold text-gray-900">MetalGest</h2>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-1">
          {filteredNavigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.to}
                end={item.to === "/app"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-gray-200 px-6 py-4">
        <p className="text-sm font-medium text-gray-900">{user?.name || "Usuário"}</p>
        <p className="text-xs uppercase tracking-[0.15em] text-gray-500">{user?.role || "USER"}</p>
      </div>
    </aside>
  )
}

export default Sidebar
