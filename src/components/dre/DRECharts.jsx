
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

function DRECharts({ historicalData, comparativeData, calculateVariation }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Evolução do Resultado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="resultado" 
                  name="Resultado"
                  stroke="#4F46E5" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="receitas" 
                  name="Receitas"
                  stroke="#22C55E" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="despesas" 
                  name="Despesas"
                  stroke="#EF4444" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comparativo com Período Anterior</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparativeData && [
              { label: "Receita Bruta", atual: comparativeData.current.receitaBruta, anterior: comparativeData.previous.receitaBruta },
              { label: "Lucro Bruto", atual: comparativeData.current.lucroBruto, anterior: comparativeData.previous.lucroBruto },
              { label: "Lucro Líquido", atual: comparativeData.current.lucroLiquido, anterior: comparativeData.previous.lucroLiquido }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className={
                    calculateVariation(item.atual, item.anterior) >= 0 
                      ? "text-green-600" 
                      : "text-red-600"
                  }>
                    {calculateVariation(item.atual, item.anterior)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-2 rounded-full ${
                      calculateVariation(item.atual, item.anterior) >= 0 
                        ? "bg-green-500" 
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(Math.abs(calculateVariation(item.atual, item.anterior)), 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DRECharts
