
import React, { Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import Layout from "@/components/layout/Layout"
import { Loading } from "@/components/ui/loading"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { permissions } from "@/lib/permissions"

// Lazy loaded components
const Home = React.lazy(() => import("@/pages/Home"))
const Dashboard = React.lazy(() => import("@/pages/Dashboard"))
const Clients = React.lazy(() => import("@/pages/Clients"))
const Quotes = React.lazy(() => import("@/pages/Quotes"))
const Production = React.lazy(() => import("@/pages/Production"))
const Products = React.lazy(() => import("@/pages/Products"))
const Services = React.lazy(() => import("@/pages/Services"))
const Financial = React.lazy(() => import("@/pages/Financial"))
const DRE = React.lazy(() => import("@/pages/DRE"))
const Users = React.lazy(() => import("@/pages/Users"))
const Settings = React.lazy(() => import("@/pages/Settings"))
const Login = React.lazy(() => import("@/pages/Login"))
const Register = React.lazy(() => import("@/pages/Register"))

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <Suspense fallback={<Loading fullScreen />}>
          <Home />
        </Suspense>
      } />
      <Route path="/login" element={
        <Suspense fallback={<Loading fullScreen />}>
          <Login />
        </Suspense>
      } />
      <Route path="/register" element={
        <Suspense fallback={<Loading fullScreen />}>
          <Register />
        </Suspense>
      } />
      
      <Route path="/app" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={
          <Suspense fallback={<Loading fullScreen />}>
            <Dashboard />
          </Suspense>
        } />
        <Route path="clients" element={
          <ProtectedRoute requiredModule={permissions.MODULES.CLIENTS}>
            <Suspense fallback={<Loading fullScreen />}>
              <Clients />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="quotes" element={
          <ProtectedRoute requiredModule={permissions.MODULES.QUOTES}>
            <Suspense fallback={<Loading fullScreen />}>
              <Quotes />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="production" element={
          <ProtectedRoute requiredModule={permissions.MODULES.PRODUCTION}>
            <Suspense fallback={<Loading fullScreen />}>
              <Production />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="products" element={
          <ProtectedRoute requiredModule={permissions.MODULES.PRODUCTS}>
            <Suspense fallback={<Loading fullScreen />}>
              <Products />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="services" element={
          <ProtectedRoute requiredModule={permissions.MODULES.SERVICES}>
            <Suspense fallback={<Loading fullScreen />}>
              <Services />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="financial" element={
          <ProtectedRoute requiredModule={permissions.MODULES.FINANCIAL}>
            <Suspense fallback={<Loading fullScreen />}>
              <Financial />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="dre" element={
          <ProtectedRoute requiredModule={permissions.MODULES.DRE}>
            <Suspense fallback={<Loading fullScreen />}>
              <DRE />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="users" element={
          <ProtectedRoute requiredModule={permissions.MODULES.USERS}>
            <Suspense fallback={<Loading fullScreen />}>
              <Users />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute requiredModule={permissions.MODULES.SETTINGS}>
            <Suspense fallback={<Loading fullScreen />}>
              <Settings />
            </Suspense>
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}

export default App
