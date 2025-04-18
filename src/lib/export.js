
import { utils, write } from "xlsx"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

export const exportUtils = {
  toExcel: (data, filename = "export.xlsx") => {
    const wb = utils.book_new()
    const ws = utils.json_to_sheet(data)
    utils.book_append_sheet(wb, ws, "Sheet1")
    write(wb, { bookType: "xlsx", type: "array" })
    
    const blob = new Blob([write(wb, { bookType: "xlsx", type: "array" })], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },
  
  toPDF: (data, columns, filename = "export.pdf") => {
    const doc = new jsPDF()
    
    doc.autoTable({
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => row[col.key])),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] }
    })
    
    doc.save(filename)
  },
  
  toCSV: (data, filename = "export.csv") => {
    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || "")
        ).join(",")
      )
    ]
    
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
