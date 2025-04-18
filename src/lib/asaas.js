
import { supabase } from "@/lib/supabase"

const ASAAS_API_URL = "https://api.asaas.com/v3"
const ASAAS_API_KEY = process.env.ASAAS_API_KEY
const WALLET_ID = "7e25baba-8d4c-4789-94a4-9d4b55ebe76a"

export const asaas = {
  createCustomer: async (userData) => {
    try {
      const response = await fetch(`${ASAAS_API_URL}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access_token": ASAAS_API_KEY
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          mobilePhone: userData.phone,
          cpfCnpj: userData.document,
          notificationDisabled: false
        })
      })

      if (!response.ok) {
        throw new Error("Failed to create ASAAS customer")
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("ASAAS createCustomer error:", error)
      throw error
    }
  },

  createSubscription: async (customerId) => {
    try {
      const response = await fetch(`${ASAAS_API_URL}/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access_token": ASAAS_API_KEY
        },
        body: JSON.stringify({
          customer: customerId,
          billingType: "UNDEFINED",
          value: 197,
          nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          cycle: "MONTHLY",
          description: "Assinatura Metalgest Premium",
          walletId: WALLET_ID
        })
      })

      if (!response.ok) {
        throw new Error("Failed to create ASAAS subscription")
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("ASAAS createSubscription error:", error)
      throw error
    }
  },

  getPaymentLink: async (subscriptionId) => {
    try {
      const response = await fetch(`${ASAAS_API_URL}/subscriptions/${subscriptionId}/paymentLink`, {
        headers: {
          "access_token": ASAAS_API_KEY
        }
      })

      if (!response.ok) {
        throw new Error("Failed to get payment link")
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("ASAAS getPaymentLink error:", error)
      throw error
    }
  },

  handleWebhook: async (event) => {
    try {
      const { payment } = event
      const { subscription } = payment

      if (payment.status === "CONFIRMED" || payment.status === "RECEIVED") {
        // Update user subscription status
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from("users")
          .update({
            plan: "premium",
            subscription_status: "active",
            subscription_expires_at: new Date(payment.dueDate).toISOString()
          })
          .eq("subscription_id", subscription.id)
          .select()
          .single()

        if (subscriptionError) throw subscriptionError

        // Log the successful payment
        await supabase.from("audit_logs").insert({
          user_id: subscriptionData.id,
          action: "subscription_payment",
          module: "billing",
          details: {
            payment_id: payment.id,
            subscription_id: subscription.id,
            value: payment.value,
            status: payment.status
          }
        })
      } else if (payment.status === "OVERDUE" || payment.status === "CANCELED") {
        // Update user subscription status
        const { error: updateError } = await supabase
          .from("users")
          .update({
            plan: "free",
            subscription_status: payment.status.toLowerCase()
          })
          .eq("subscription_id", subscription.id)
      }

      return { success: true }
    } catch (error) {
      console.error("Webhook handling error:", error)
      throw error
    }
  }
}
