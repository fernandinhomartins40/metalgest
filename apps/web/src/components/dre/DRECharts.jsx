import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

function DRECharts({ historicalData, comparativeData, calculateVariation }) {
  const current = comparativeData?.current ?? comparativeData?.atual
  const previous = comparativeData?.previous ?? comparativeData?.anterior
  const comparisonItems = current && previous
    ? [
        { label: "Receita Bruta", atual: current.receitaBruta, anterior: previous.receitaBruta },
        { label: "Lucro Bruto", atual: current.lucroBruto, anterior: previous.lucroBruto },
        { label: "Lucro Liquido", atual: current.lucroLiquido, anterior: previous.lucroLiquido },
      ]
    : []

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Evolucao do Resultado</CardTitle>
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
          <CardTitle>Comparativo com Periodo Anterior</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonItems.map((item) => {
              const variation = Number(calculateVariation(item.atual, item.anterior))

              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span className={variation >= 0 ? "text-green-600" : "text-red-600"}>
                      {variation.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full ${variation >= 0 ? "bg-green-500" : "bg-red-500"}`}
                      style={{
                        width: `${Math.min(Math.abs(variation), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DRECharts
