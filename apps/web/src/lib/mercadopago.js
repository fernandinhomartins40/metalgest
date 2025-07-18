
import { api } from "../services/api"

const MP_USER_ID = "264122170"
const MP_APP_ID = "2886237981414328"
const MP_WEBHOOK_SECRET = "f8abd29180bf44a076b086df0661c9d496e22d29a55e42feb1579ee342aad780"

export const mercadopago = {
  createSubscription: async (userId) => {
    try {
      const response = await fetch("https://api.mercadopago.com/preapproval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MP_USER_ID}`
        },
        body: JSON.stringify({
          reason: "MetalGest Premium",
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 197,
            currency_id: "BRL"
          },
          back_url: `${window.location.origin}/app/settings`,
          payer_email: userId,
          status: "pending"
        })
      })

      const data = await response.json()
      
      if (!response.ok) throw new Error(data.message)

      // Save subscription data
      await api.users.updateSubscription(data.id, {
        subscription_id: data.id,
        subscription_status: "pending"
      })

      return data.init_point
    } catch (error) {
      console.error("Error creating subscription:", error)
      throw error
    }
  },

  validateWebhookSignature: (signature, data) => {
    try {
      const hmac = crypto.createHmac("sha256", MP_WEBHOOK_SECRET)
      const calculatedSignature = hmac.update(JSON.stringify(data)).digest("hex")
      return signature === calculatedSignature
    } catch (error) {
      console.error("Error validating webhook signature:", error)
      return false
    }
  },

  handleWebhook: async (event) => {
    try {
      const { type, data } = event

      switch (type) {
        case "subscription_authorized":
          await api.users.updateSubscription(data.id, {
            plan: "premium",
            subscription_status: "active",
            subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          break

        case "subscription_cancelled":
          await api.users.updateSubscription(data.id, {
            plan: "free",
            subscription_status: "cancelled",
            subscription_expires_at: null
          })
          break

        case "subscription_charged":
          await api.users.updateSubscription(data.id, {
            subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          break

        case "subscription_payment_failed":
          await api.users.updateSubscription(data.id, {
            subscription_status: "failed"
          })
          break
      }
    } catch (error) {
      console.error("Error handling webhook:", error)
      throw error
    }
  }
}
