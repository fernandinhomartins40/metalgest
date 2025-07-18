
import React from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Search, LogOut, HelpCircle } from "lucide-react"
import { Button } from "../ui/button"
import { motion } from "framer-motion"
import { auth } from "../../services/auth.js"
import { useToast } from "../ui/use-toast"

function Navbar({ onHelpClick }) {
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await auth.logout()
      toast({
        title: "Logged out successfully",
        description: "See you soon!"
      })
      navigate("/login")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message
      })
    }
  }

  return (
    <div className="flex items-center justify-between h-16 px-8 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar em todo o sistema..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 rounded-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size="icon"
            className="w-10 h-10 rounded-lg hover:bg-gray-50"
            onClick={onHelpClick}
          >
            <HelpCircle className="h-5 w-5 text-gray-600" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative w-10 h-10 rounded-lg hover:bg-gray-50"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size="icon"
            className="w-10 h-10 rounded-lg hover:bg-gray-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 text-gray-600" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default Navbar
