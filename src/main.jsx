
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "@/App"
import "@/index.css"
import { Toaster } from "@/components/ui/toaster"
import { supabase } from "@/lib/supabase"
import { ToastProvider } from "@/components/ui/toast-provider"
import { UserProvider } from "@/contexts/UserContext"

// Make supabase available globally for debugging
window.supabase = supabase

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <UserProvider>
          <App />
          <Toaster />
        </UserProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
)
