
import React from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import OnboardingModal from "../onboarding/OnboardingModal"
import HelpPanel from "../help/HelpPanel"
import { auth } from "../../services/auth"
import { api } from "../../services/api"

function Layout() {
  const [showOnboarding, setShowOnboarding] = React.useState(false)
  const [showHelp, setShowHelp] = React.useState(false)
  
  React.useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const currentUser = await auth.getCurrentUser()
      if (currentUser) {
        // For now, we'll disable onboarding until user preferences endpoint is implemented
        // This prevents errors while the backend is being fully implemented
        setShowOnboarding(false)
        
        // TODO: Implement user preferences endpoint in backend
        // const preferences = await api.settings.getUserPreferences()
        // if (!preferences || (preferences.show_onboarding && !preferences.onboarding_completed)) {
        //   setShowOnboarding(true)
        // }
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar onHelpClick={() => setShowHelp(true)} />
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      <HelpPanel
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  )
}

export default Layout
