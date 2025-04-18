
import React from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"

function DREHeader({ period, setPeriod, handleExport }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">DRE</h2>
        <p className="text-muted-foreground">Demonstrativo de Resultados do Exercício</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setPeriod("month")}>
          <Calendar className="h-4 w-4 mr-2" />
          Mensal
        </Button>
        <Button variant="outline" onClick={() => setPeriod("quarter")}>
          <Calendar className="h-4 w-4 mr-2" />
          Trimestral
        </Button>
        <Button variant="outline" onClick={() => setPeriod("year")}>
          <Calendar className="h-4 w-4 mr-2" />
          Anual
        </Button>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>
    </div>
  )
}

export default DREHeader
