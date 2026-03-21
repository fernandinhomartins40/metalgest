import React from "react"
import { format } from "date-fns"
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { useToast } from "../components/ui/use-toast"
import { useApi } from "../hooks/useApi"
import { api } from "../services/api"
import { exportUtils } from "../lib/export"
import DREHeader from "../components/dre/DREHeader"
import DREResultCard from "../components/dre/DREResultCard"
import DRECharts from "../components/dre/DRECharts"

const EMPTY_DRE_DATA = {
  receitaBruta: 0,
  impostos: 0,
  receitaLiquida: 0,
  custos: 0,
  lucroBruto: 0,
  despesasOperacionais: 0,
  resultadoOperacional: 0,
  resultadoFinanceiro: 0,
  lucroLiquido: 0,
  detalhamento: {
    receitas: {},
    impostos: {},
    custos: {},
    despesas: {},
    financeiro: {
      receitas: 0,
      despesas: 0,
    },
  },
}

const normalizeAmount = (value) => Number(value || 0)

const normalizeEntries = (entries) =>
  Object.fromEntries(
    Object.entries(entries || {}).map(([key, value]) => [key, normalizeAmount(value)])
  )

const normalizeDreData = (data) => ({
  ...EMPTY_DRE_DATA,
  ...data,
  receitaBruta: normalizeAmount(data?.receitaBruta),
  impostos: normalizeAmount(data?.impostos),
  receitaLiquida: normalizeAmount(data?.receitaLiquida),
  custos: normalizeAmount(data?.custos),
  lucroBruto: normalizeAmount(data?.lucroBruto),
  despesasOperacionais: normalizeAmount(data?.despesasOperacionais),
  resultadoOperacional: normalizeAmount(data?.resultadoOperacional),
  resultadoFinanceiro: normalizeAmount(data?.resultadoFinanceiro),
  lucroLiquido: normalizeAmount(data?.lucroLiquido),
  detalhamento: {
    ...EMPTY_DRE_DATA.detalhamento,
    ...data?.detalhamento,
    receitas: normalizeEntries(data?.detalhamento?.receitas),
    impostos: normalizeEntries(data?.detalhamento?.impostos),
    custos: normalizeEntries(data?.detalhamento?.custos),
    despesas: normalizeEntries(data?.detalhamento?.despesas),
    financeiro: {
      ...EMPTY_DRE_DATA.detalhamento.financeiro,
      ...data?.detalhamento?.financeiro,
      receitas: normalizeAmount(data?.detalhamento?.financeiro?.receitas),
      despesas: normalizeAmount(data?.detalhamento?.financeiro?.despesas),
    },
  },
})

const normalizeHistoricalData = (entries) =>
  (Array.isArray(entries) ? entries : []).map((entry) => ({
    month: entry?.month ?? "-",
    resultado: normalizeAmount(entry?.resultado ?? entry?.lucroLiquido),
    lucroLiquido: normalizeAmount(entry?.lucroLiquido ?? entry?.resultado),
    receitas: normalizeAmount(entry?.receitas ?? entry?.income),
    despesas: normalizeAmount(entry?.despesas ?? entry?.expenses),
  }))

const normalizeComparativeData = (data) => ({
  current: normalizeDreData(data?.current ?? data?.atual),
  previous: normalizeDreData(data?.previous ?? data?.anterior),
})

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

  const loadData = React.useCallback(async () => {
    try {
      const [dreResult, historicalResult, comparativeResult] = await Promise.all([
        getDreReport(period),
        getHistorical(12),
        getComparative(period),
      ])

      setDreData(normalizeDreData(dreResult))
      setHistoricalData(normalizeHistoricalData(historicalResult))
      setComparativeData(normalizeComparativeData(comparativeResult))
    } catch (error) {
      console.error("Error loading DRE data:", error)
    }
  }, [getComparative, getDreReport, getHistorical, period])

  React.useEffect(() => {
    void loadData()
  }, [loadData])

  const handleExport = () => {
    if (!dreData) {
      return
    }

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
        lucroLiquido: dreData.lucroLiquido,
      }

      exportUtils.toExcel([exportData], `dre_${period}_${format(new Date(), "yyyy-MM-dd")}.xlsx`)

      toast({
        title: "Relatorio exportado!",
        description: "O DRE foi exportado com sucesso.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: "Não foi possível exportar o relatório.",
      })
    }
  }

  const calculateVariation = (atual, anterior) => {
    if (!anterior) return 0
    const variation = ((atual - anterior) / anterior) * 100
    return variation.toFixed(1)
  }

  if (!dreData || loadingDre || loadingHistorical || loadingComparative) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
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

      <Card>
        <CardHeader>
          <CardTitle>Demonstrativo Detalhado</CardTitle>
          <CardDescription>Analise completa dos resultados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div
                className="cursor-pointer rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
                onClick={() => setShowDetails((prev) => ({ ...prev, receitaBruta: !prev.receitaBruta }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Receita Bruta</span>
                    {showDetails.receitaBruta ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                  <span className="font-medium text-green-600">R$ {dreData.receitaBruta.toFixed(2)}</span>
                </div>
              </div>
              {showDetails.receitaBruta && (
                <div className="mt-2 space-y-2 pl-4">
                  {Object.entries(dreData.detalhamento.receitas).map(([categoria, valor]) => (
                    <div key={categoria} className="flex justify-between border-b p-2">
                      <span className="text-sm">{categoria}</span>
                      <span className="text-sm">R$ {valor.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div
                className="cursor-pointer rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
                onClick={() => setShowDetails((prev) => ({ ...prev, impostos: !prev.impostos }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">(-) Impostos e Deducoes</span>
                    {showDetails.impostos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                  <span className="font-medium text-red-600">R$ {dreData.impostos.toFixed(2)}</span>
                </div>
              </div>
              {showDetails.impostos && (
                <div className="mt-2 space-y-2 pl-4">
                  {Object.entries(dreData.detalhamento.impostos).map(([imposto, valor]) => (
                    <div key={imposto} className="flex justify-between border-b p-2">
                      <span className="text-sm">{imposto}</span>
                      <span className="text-sm text-red-600">R$ {valor.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between rounded-lg bg-blue-50 p-3">
              <span className="font-medium">= Receita Liquida</span>
              <span className="font-medium text-blue-600">R$ {dreData.receitaLiquida.toFixed(2)}</span>
            </div>

            <div>
              <div
                className="cursor-pointer rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
                onClick={() => setShowDetails((prev) => ({ ...prev, custos: !prev.custos }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">(-) Custos</span>
                    {showDetails.custos ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                  <span className="font-medium text-red-600">R$ {dreData.custos.toFixed(2)}</span>
                </div>
              </div>
              {showDetails.custos && (
                <div className="mt-2 space-y-2 pl-4">
                  {Object.entries(dreData.detalhamento.custos).map(([categoria, valor]) => (
                    <div key={categoria} className="flex justify-between border-b p-2">
                      <span className="text-sm">{categoria}</span>
                      <span className="text-sm text-red-600">R$ {valor.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between rounded-lg bg-blue-50 p-3">
              <span className="font-medium">= Lucro Bruto</span>
              <span className="font-medium text-blue-600">R$ {dreData.lucroBruto.toFixed(2)}</span>
            </div>

            <div>
              <div
                className="cursor-pointer rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
                onClick={() => setShowDetails((prev) => ({ ...prev, despesas: !prev.despesas }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">(-) Despesas Operacionais</span>
                    {showDetails.despesas ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                  <span className="font-medium text-red-600">R$ {dreData.despesasOperacionais.toFixed(2)}</span>
                </div>
              </div>
              {showDetails.despesas && (
                <div className="mt-2 space-y-2 pl-4">
                  {Object.entries(dreData.detalhamento.despesas).map(([categoria, valor]) => (
                    <div key={categoria} className="flex justify-between border-b p-2">
                      <span className="text-sm">{categoria}</span>
                      <span className="text-sm text-red-600">R$ {valor.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between rounded-lg bg-blue-50 p-3">
              <span className="font-medium">= Resultado Operacional</span>
              <span className="font-medium text-blue-600">R$ {dreData.resultadoOperacional.toFixed(2)}</span>
            </div>

            <div>
              <div
                className="cursor-pointer rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
                onClick={() => setShowDetails((prev) => ({ ...prev, financeiro: !prev.financeiro }))}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">(+/-) Resultado Financeiro</span>
                    {showDetails.financeiro ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                  <span className={`font-medium ${dreData.resultadoFinanceiro >= 0 ? "text-green-600" : "text-red-600"}`}>
                    R$ {dreData.resultadoFinanceiro.toFixed(2)}
                  </span>
                </div>
              </div>
              {showDetails.financeiro && (
                <div className="mt-2 space-y-2 pl-4">
                  <div className="flex justify-between border-b p-2">
                    <span className="text-sm">Receitas Financeiras</span>
                    <span className="text-sm text-green-600">R$ {dreData.detalhamento.financeiro.receitas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-b p-2">
                    <span className="text-sm">Despesas Financeiras</span>
                    <span className="text-sm text-red-600">R$ {dreData.detalhamento.financeiro.despesas.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className={`flex justify-between rounded-lg p-4 ${dreData.lucroLiquido >= 0 ? "bg-green-100" : "bg-red-100"}`}>
              <span className="font-bold">= Lucro/Prejuizo do Periodo</span>
              <span className={`font-bold ${dreData.lucroLiquido >= 0 ? "text-green-700" : "text-red-700"}`}>
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

      {dreData.lucroLiquido < 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="font-medium text-red-600">
                Atencao: prejuizo identificado no periodo atual
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DRE
