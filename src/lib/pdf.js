
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const pdf = {
  generateQuote: (quote, options = { hideCosts: false }) => {
    const doc = new jsPDF()
    
    // Add company logo if available
    if (quote.company?.logo) {
      doc.addImage(quote.company.logo, "JPEG", 10, 10, 50, 20)
    }

    // Header
    doc.setFontSize(20)
    doc.text("Orçamento", 105, 20, { align: "center" })
    doc.setFontSize(12)
    doc.text(`#${quote.id.substring(0, 8)}`, 105, 30, { align: "center" })

    // Company Info
    doc.setFontSize(10)
    doc.text([
      quote.company?.name || "Sua Empresa",
      quote.company?.address || "Endereço da Empresa",
      quote.company?.phone || "Telefone da Empresa",
      quote.company?.email || "Email da Empresa"
    ], 10, 45)

    // Client Info
    doc.text("Cliente:", 10, 75)
    doc.text([
      quote.client.name,
      `${quote.client.street}, ${quote.client.number}`,
      `${quote.client.city} - ${quote.client.state}`,
      `Tel: ${quote.client.phone}`
    ], 10, 80)

    // Quote Details
    doc.text("Data:", 150, 75)
    doc.text(format(new Date(quote.created_at), "dd/MM/yyyy"), 150, 80)

    // Items Table
    const tableColumns = [
      { header: "Item", dataKey: "name" },
      { header: "Qtd", dataKey: "quantity" },
      { header: "Valor Unit.", dataKey: "unitPrice" },
      { header: "Total", dataKey: "total" }
    ]

    const tableRows = quote.items.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: options.hideCosts ? "---" : 
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL"
        }).format(item.unitPrice),
      total: options.hideCosts ? "---" :
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL"
        }).format(item.quantity * item.unitPrice)
    }))

    doc.autoTable({
      head: [tableColumns.map(col => col.header)],
      body: tableRows.map(row => tableColumns.map(col => row[col.dataKey])),
      startY: 100,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] }
    })

    // Total
    if (!options.hideCosts) {
      doc.text(
        `Total: ${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL"
        }).format(quote.total_value)}`,
        150,
        doc.autoTable.previous.finalY + 10,
        { align: "right" }
      )
    }

    // Terms and Conditions
    doc.setFontSize(8)
    doc.text([
      "Condições:",
      "- Validade: 15 dias",
      "- Prazo de entrega: A combinar",
      "- Forma de pagamento: A combinar",
      quote.company?.terms || ""
    ], 10, doc.autoTable.previous.finalY + 20)

    return doc
  }
}
