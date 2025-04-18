
import React from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "@/components/layout/Sidebar"
import Navbar from "@/components/layout/Navbar"
import OnboardingModal from "@/components/onboarding/OnboardingModal"
import HelpPanel from "@/components/help/HelpPanel"
import { supabase } from "@/lib/supabase"

function Layout() {
  const [showOnboarding, setShowOnboarding] = React.useState(false)
  const [showHelp, setShowHelp] = React.useState(false)
  
  React.useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: preferences } = await supabase
          .from("user_preferences")
          .select("show_onboarding, onboarding_completed")
          .eq("user_id", user.id)
          .single()

        if (!preferences) {
          setShowOnboarding(true)
        } else if (preferences.show_onboarding && !preferences.onboarding_completed) {
          setShowOnboarding(true)
        }
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
