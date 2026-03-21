import React from "react"
import { useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { Button } from "../ui/button"
import { useToast } from "../ui/use-toast"
import { useAuth } from "../../providers/AuthProvider"

function Navbar() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login", { replace: true })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao encerrar sessão",
        description: error.message,
      })
    }
  }

  return (
    <header className="border-b border-[#d9e2ec] bg-white/80 px-6 py-4 shadow-[0_14px_30px_rgba(8,23,39,0.04)] backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#7c5cff]">MetalGest</p>
          <h1 className="text-lg font-semibold text-slate-900">{user?.name || "Workspace"}</h1>
        </div>

        <Button
          variant="outline"
          onClick={handleLogout}
          className="gap-2 border-[#d6dfeb] bg-white/80"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </header>
  )
}

export default Navbar
