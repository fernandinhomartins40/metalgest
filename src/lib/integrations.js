
import { storage } from "@/lib/storage"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

export const integrations = {
  // Orçamento → Produção
  createServiceOrderFromQuote: async (quoteId) => {
    try {
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .single()

      if (quoteError) throw quoteError

      const serviceOrder = {
        quote_id: quoteId,
        client_id: quote.client_id,
        items: quote.items,
        status: "waiting",
        created_at: new Date().toISOString(),
        deadline: null,
        responsible_id: null,
        notes: "",
        tags: []
      }

      const { data, error } = await supabase
        .from('service_orders')
        .insert(serviceOrder)
        .select()
        .single()

      if (error) throw error

      // Update quote status
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ status: 'approved' })
        .eq('id', quoteId)

      if (updateError) throw updateError

      return data
    } catch (error) {
      console.error('Error creating service order:', error)
      throw error
    }
  },

  // Financeiro → DRE
  generateDREFromFinancial: async (period = "month") => {
    try {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString()

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)

      if (error) throw error

      // Calculate DRE values
      const dre = {
        receitaBruta: transactions
          .filter(t => t.type === "income")
          .reduce((acc, curr) => acc + curr.value, 0),

        impostos: transactions
          .filter(t => t.category.toLowerCase().includes("imposto"))
          .reduce((acc, curr) => acc + curr.value, 0),

        custos: transactions
          .filter(t => t.category.startsWith("CMV") || t.category.startsWith("Custo"))
          .reduce((acc, curr) => acc + curr.value, 0),

        despesasOperacionais: transactions
          .filter(t => t.category.startsWith("Despesa"))
          .reduce((acc, curr) => acc + curr.value, 0),

        resultadoFinanceiro: transactions
          .filter(t => t.category.includes("Financeira"))
          .reduce((acc, curr) => curr.type === "income" ? acc + curr.value : acc - curr.value, 0)
      }

      // Calculate results
      dre.receitaLiquida = dre.receitaBruta - dre.impostos
      dre.lucroBruto = dre.receitaLiquida - dre.custos
      dre.resultadoOperacional = dre.lucroBruto - dre.despesasOperacionais
      dre.lucroLiquido = dre.resultadoOperacional + dre.resultadoFinanceiro

      return dre
    } catch (error) {
      console.error('Error generating DRE:', error)
      throw error
    }
  }
}
