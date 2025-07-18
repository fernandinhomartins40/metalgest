
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./index.css"
import { Toaster } from "./components/ui/toaster"
import { ToastProvider } from "./components/ui/toast-provider"
import { TRPCProvider } from "./providers/TRPCProvider"
import { AuthProvider } from "./providers/AuthProvider"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
            <Toaster />
          </ToastProvider>
        </AuthProvider>
      </TRPCProvider>
    </BrowserRouter>
  </React.StrictMode>
)
