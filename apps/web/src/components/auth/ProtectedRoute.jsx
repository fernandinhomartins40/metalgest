import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { permissions } from "../../lib/permissions"
import { Loading } from "../ui/loading"
import { useAuth } from "../../providers/AuthProvider"

function ProtectedRoute({ children, requiredModule }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <Loading fullScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredModule && !permissions.hasAccess(requiredModule, user)) {
    return <Navigate to="/app" replace />
  }

  return children
}

export default ProtectedRoute
