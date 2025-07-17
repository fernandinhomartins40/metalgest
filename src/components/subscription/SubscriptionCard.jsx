
import React from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Crown, Check, AlertTriangle } from "lucide-react"
import { mercadopago } from "@/lib/mercadopago"
import { auth } from "@/services/auth"
import { api } from "@/services/api"

function SubscriptionCard() {
  const [loading, setLoading] = React.useState(false)
  const [userData, setUserData] = React.useState(null)
  const { toast } = useToast()

  React.useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const currentUser = await auth.getCurrentUser()
      if (currentUser) {
        // User data already includes subscription info from JWT
        setUserData({
          plan: currentUser.plan || "free",
          subscription_status: currentUser.subscription_status || "inactive",
          subscription_expires_at: currentUser.subscription_expires_at || null
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      const currentUser = await auth.getCurrentUser()
      if (!currentUser) throw new Error("User not found")

      const checkoutUrl = await mercadopago.createSubscription(currentUser.id)
      window.location.href = checkoutUrl
    } catch (error) {
      console.error("Error subscribing:", error)
      toast({
        variant: "destructive",
        title: "Erro na assinatura",
        description: "Não foi possível processar sua assinatura. Tente novamente."
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = () => {
    if (!userData?.subscription_status) return "text-gray-500"
    switch (userData.subscription_status) {
      case "active":
        return "text-green-500"
      case "failed":
        return "text-red-500"
      default:
        return "text-yellow-500"
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            {userData?.plan === "premium" ? "Premium" : "Plano Gratuito"}
          </CardTitle>
          <Crown className={`h-6 w-6 ${userData?.plan === "premium" ? "text-yellow-500" : "text-gray-400"}`} />
        </div>
        <CardDescription>
          {userData?.plan === "premium" 
            ? "Você tem acesso a todos os recursos premium"
            : "Atualize para o plano premium e tenha acesso a todos os recursos"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {userData?.subscription_status && (
          <div className="flex items-center gap-2 text-sm">
            <div className={`flex items-center gap-1 ${getStatusColor()}`}>
              {userData.subscription_status === "active" ? (
                <Check className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <span className="capitalize">{userData.subscription_status}</span>
            </div>
            {userData.subscription_expires_at && (
              <span className="text-gray-500">
                • Expira em {new Date(userData.subscription_expires_at).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-medium">Recursos inclusos:</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Orçamentos ilimitados</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Gestão completa de produção</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Relatórios avançados</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Suporte prioritário</span>
            </li>
          </ul>
        </div>

        <div className="pt-4">
          <div className="text-center">
            <span className="text-3xl font-bold">R$ 197</span>
            <span className="text-gray-500">/mês</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        {userData?.plan !== "premium" && (
          <Button 
            className="w-full"
            onClick={handleSubscribe}
            disabled={loading}
          >
            <Crown className="h-4 w-4 mr-2" />
            {loading ? "Processando..." : "Assinar Premium"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export default SubscriptionCard
