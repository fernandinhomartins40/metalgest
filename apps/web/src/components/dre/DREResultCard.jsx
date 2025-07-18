
import React from "react"
import { format } from "date-fns"
import { Card, CardContent } from "../ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

function DREResultCard({ lucroLiquido }) {
  return (
    <Card className={lucroLiquido >= 0 ? "bg-green-50" : "bg-red-50"}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Resultado do Período</h3>
            <p className="text-sm text-gray-500">
              {format(new Date(), "MMMM 'de' yyyy")}
            </p>
          </div>
          {lucroLiquido >= 0 ? (
            <TrendingUp className="h-8 w-8 text-green-600" />
          ) : (
            <TrendingDown className="h-8 w-8 text-red-600" />
          )}
        </div>
        <p className={`text-3xl font-bold mt-2 ${
          lucroLiquido >= 0 ? "text-green-600" : "text-red-600"
        }`}>
          R$ {lucroLiquido.toFixed(2)}
        </p>
      </CardContent>
    </Card>
  )
}

export default DREResultCard
