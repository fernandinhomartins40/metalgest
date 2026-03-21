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
    <aside className="hidden w-72 shrink-0 border-r border-[#143047] bg-[linear-gradient(180deg,#071826_0%,#0b2235_100%)] text-white lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[#8df3c8]">Operação</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">MetalGest</h2>
        <p className="mt-2 text-sm text-slate-300">Comercial, produção e financeiro no mesmo fluxo.</p>
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
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[linear-gradient(135deg,#19d88f_0%,#14c882_100%)] text-[#072235] shadow-[0_16px_30px_rgba(25,216,143,0.18)]"
                      : "text-slate-300 hover:bg-white/6 hover:text-white"
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

      <div className="border-t border-white/10 px-6 py-4">
        <p className="text-sm font-medium text-white">{user?.name || "Usuário"}</p>
        <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{user?.role || "USER"}</p>
      </div>
    </aside>
  )
}

export default Sidebar
