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
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-gray-400">MetalGest</p>
        <h1 className="text-lg font-semibold text-gray-900">
          {user?.name || "Workspace"}
        </h1>
      </div>

      <Button variant="outline" onClick={handleLogout} className="gap-2">
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    </header>
  )
}

export default Navbar
