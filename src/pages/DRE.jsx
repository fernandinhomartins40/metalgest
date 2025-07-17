
import React from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { useToast } from "../components/ui/use-toast"
import { useApi } from "../hooks/useApi"
import { api } from "../services/api"
import { exportUtils } from "../lib/export"
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import DREHeader from "../components/dre/DREHeader"
import DREResultCard from "../components/dre/DREResultCard"
import DRECharts from "../components/dre/DRECharts"

function DRE() {
  const { toast } = useToast()
  const [period, setPeriod] = React.useState("month")
  const [showDetails, setShowDetails] = React.useState({})
  const [dreData, setDreData] = React.useState(null)
  const [historicalData, setHistoricalData] = React.useState([])
  const [comparativeData, setComparativeData] = React.useState(null)

  const { execute: getDreReport, loading: loadingDre } = useApi(api.dre.getReport)
  const { execute: getHistorical, loading: loadingHistorical } = useApi(api.dre.getHistorical)
  const { execute: getComparative, loading: loadingComparative } = useApi(api.dre.getComparative)

  React.useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    try {
      const [dreResult, historicalResult, comparativeResult] = await Promise.all([
        getDreReport(period),
        getHistorical(12),
        getComparative(period)
      ])

      setDreData(dreResult)
      setHistoricalData(historicalResult)
      setComparativeData(comparativeResult)
    } catch (error) {
      console.error("Error loading DRE data:", error)
    }
  }

  const handleExport = () => {
    try {
      const exportData = {
        periodo: period,
        receitaBruta: dreData.receitaBruta,
        impostos: dreData.impostos,
        receitaLiquida: dreData.receitaLiquida,
        custos: dreData.custos,
        lucroBruto: dreData.lucroBruto,
        despesasOperacionais: dreData.despesasOperacionais,
        resultadoOperacional: dreData.resultadoOperacional,
        resultadoFinanceiro: dreData.resultadoFinanceiro,
        lucroLiquido: dreData.lucroLiquido
      }

      exportUtils.toExcel([exportData], `dre_${period}_${format(new Date(), "yyyy-MM-dd")}.xlsx`)

      toast({
        title: "Relatório exportado!",
        description: "O DRE foi exportado com sucesso."
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: "Não foi possível exportar o relatório."
      })
    }
  }

  const calculateVariation = (atual, anterior) => {
    if (!anterior) return 0
    const variation = ((atual - anterior) / anterior) * 100
    return variation.toFixed(1)
  }

  if (!dreData || loadingDre) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Carregando DRE...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DREHeader 
        period={period}
        setPeriod={setPeriod}
        handleExport={handleExport}
      />

      <DREResultCard lucroLiquido={dreData.lucroLiquido} />

      {/* DRE Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Demonstrativo Detalhado</CardTitle>
          <CardDescription>
            Análise completa dos resultados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Receita Bruta */}
            <div>
              <div 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => setShowDetails(prev => ({ ...prev, receitaBruta: !prev.receitaBruta }))}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">Receita Bruta</span>
                  {showDetails.receitaBruta ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <span className="font-medium text-green-600">
                  R$ {dreData.receitaBruta.toFixed(2)}
                </span>
              </div>
              {showDetails.receitaBruta && (
                <div className="mt-2 pl-4 space-y-2">
                  {Object.entries(dreData.detalhamento.receitas).map(([categoria, valor]) => (
                    <div key={categoria} className="flex justify-between p-2 border-b">
                      <span className="text-sm">{categoria}</span>
                      <span className="text-sm">R$ {valor.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Impostos e Deduções */}
            <div>
              <div 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => setShowDetails(prev => ({ ...prev, impostos: !prev.impostos }))}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">(-) Impostos e Deduções</span>
                  {showDetails.impostos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <span className="font-medium text-red-600">
                  R$ {dreData.impostos.toFixed(2)}
                </span>
              </div>
              {showDetails.impostos && (
                <div className="mt-2 pl-4 space-y-2">
                  {Object.entries(dreData.detalhamento.impostos).map(([imposto, valor]) => (
                    <div key={imposto} className="flex justify-between p-2 border-b">
                      <span className="text-sm">{imposto}</span>
                      <span className="text-sm text-red-600">R$ {valor.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Receita Líquida */}
            <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium">= Receita Líquida</span>
              <span className="font-medium text-blue-600">
                R$ {dreData.receitaLiquida.toFixed(2)}
              </span>
            </div>

            {/* Custos */}
            <div>
              <div 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => setShowDetails(prev => ({ ...prev, custos: !prev.custos }))}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">(-) Custos</span>
                  {showDetails.custos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <span className="font-medium text-red-600">
                  R$ {dreData.custos.toFixed(2)}
                </span>
              </div>
              {showDetails.custos && (
                <div className="mt-2 pl-4 space-y-2">
                  {Object.entries(dreData.detalhamento.custos).map(([categoria, valor]) => (
                    <div key={categoria} className="flex justify-between p-2 border-b">
                      <span className="text-sm">{categoria}</span>
                      <span className="text-sm text-red-600">R$ {valor.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lucro Bruto */}
            <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium">= Lucro Bruto</span>
              <span className="font-medium text-blue-600">
                R$ {dreData.lucroBruto.toFixed(2)}
              </span>
            </div>

            {/* Despesas Operacionais */}
            <div>
              <div 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => setShowDetails(prev => ({ ...prev, despesas: !prev.despesas }))}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">(-) Despesas Operacionais</span>
                  {showDetails.despesas ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <span className="font-medium text-red-600">
                  R$ {dreData.despesasOperacionais.toFixed(2)}
                </span>
              </div>
              {showDetails.despesas && (
                <div className="mt-2 pl-4 space-y-2">
                  {Object.entries(dreData.detalhamento.despesas).map(([categoria, valor]) => (
                    <div key={categoria} className="flex justify-between p-2 border-b">
                      <span className="text-sm">{categoria}</span>
                      <span className="text-sm text-red-600">R$ {valor.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resultado Operacional */}
            <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium">= Resultado Operacional</span>
              <span className="font-medium text-blue-600">
                R$ {dreData.resultadoOperacional.toFixed(2)}
              </span>
            </div>

            {/* Resultado Financeiro */}
            <div>
              <div 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => setShowDetails(prev => ({ ...prev, financeiro: !prev.financeiro }))}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">(+/-) Resultado Financeiro</span>
                  {showDetails.financeiro ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
                <span className={`font-medium ${dreData.resultadoFinanceiro >= 0 ? "text-green-600" : "text-red-600"}`}>
                  R$ {dreData.resultadoFinanceiro.toFixed(2)}
                </span>
              </div>
              {showDetails.financeiro && (
                <div className="mt-2 pl-4 space-y-2">
                  <div className="flex justify-between p-2 border-b">
                    <span className="text-sm">Receitas Financeiras</span>
                    <span className="text-sm text-green-600">
                      R$ {dreData.detalhamento.financeiro.receitas.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 border-b">
                    <span className="text-sm">Despesas Financeiras</span>
                    <span className="text-sm text-red-600">
                      R$ {dreData.detalhamento.financeiro.despesas.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Lucro/Prejuízo */}
            <div className={`flex justify-between p-4 rounded-lg ${
              dreData.lucroLiquido >= 0 ? "bg-green-100" : "bg-red-100"
            }`}>
              <span className="font-bold">= Lucro/Prejuízo do Período</span>
              <span className={`font-bold ${
                dreData.lucroLiquido >= 0 ? "text-green-700" : "text-red-700"
              }`}>
                R$ {dreData.lucroLiquido.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <DRECharts 
        historicalData={historicalData}
        comparativeData={comparativeData}
        calculateVariation={calculateVariation}
      />

      {/* Alertas */}
      {dreData.lucroLiquido < 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-600 font-medium">
                Atenção: Prejuízo identificado no período atual
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DRE
