import React, { useEffect, useState } from "react"
import { Save } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Loading } from "../components/ui/loading"
import { useToast } from "../components/ui/use-toast"
import { api } from "../services/api"

const initialCompanyForm = {
  name: "",
  email: "",
  phone: "",
  taxId: "",
  website: "",
  logo: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Brasil",
}

const initialSystemForm = {
  lowStockThreshold: "10",
  quoteTemplate: "",
  publicLinkEnabled: true,
  pixEnabled: false,
  pixKey: "",
  timezone: "America/Sao_Paulo",
  notificationEmail: true,
  notificationQuoteApproved: true,
  notificationLowStock: true,
  notificationLoginFailure: true,
}

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") {
    return fallback
  }

  if (typeof value === "boolean") {
    return value
  }

  return String(value).toLowerCase() === "true"
}

function Settings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [savingCompany, setSavingCompany] = useState(false)
  const [savingSystem, setSavingSystem] = useState(false)
  const [companyForm, setCompanyForm] = useState(initialCompanyForm)
  const [systemForm, setSystemForm] = useState(initialSystemForm)
  const [logoFile, setLogoFile] = useState(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)

        const [company, system] = await Promise.all([
          api.settings.getCompany(),
          api.settings.list(),
        ])

        setCompanyForm((current) => ({
          ...current,
          ...company,
        }))

        setSystemForm({
          lowStockThreshold: system["system.lowStockThreshold"]?.value || "10",
          quoteTemplate: system["quote.template"]?.value || "",
          publicLinkEnabled: toBoolean(system["quote.publicLinkEnabled"]?.value, true),
          pixEnabled: toBoolean(system["payment.pixEnabled"]?.value, false),
          pixKey: system["payment.pixKey"]?.value || "",
          timezone: system["system.timezone"]?.value || "America/Sao_Paulo",
          notificationEmail: toBoolean(system["notification.email"]?.value, true),
          notificationQuoteApproved: toBoolean(system["notification.quoteApproved"]?.value, true),
          notificationLowStock: toBoolean(system["notification.lowStock"]?.value, true),
          notificationLoginFailure: toBoolean(system["notification.loginFailure"]?.value, true),
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Falha ao carregar configurações",
          description: error.message,
        })
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [toast])

  const handleCompanyChange = (event) => {
    const { name, value } = event.target
    setCompanyForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSystemChange = (event) => {
    const { name, value, type, checked } = event.target
    setSystemForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleLogoChange = (event) => {
    setLogoFile(event.target.files?.[0] || null)
  }

  const handleCompanySubmit = async (event) => {
    event.preventDefault()
    setSavingCompany(true)

    try {
      const updatedCompany = await api.settings.saveCompanyData(companyForm, logoFile)
      setCompanyForm((current) => ({
        ...current,
        ...updatedCompany,
      }))
      setLogoFile(null)
      toast({
        title: "Dados da empresa salvos",
        description: "As informações institucionais foram persistidas no backend.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao salvar empresa",
        description: error.message,
      })
    } finally {
      setSavingCompany(false)
    }
  }

  const handleSystemSubmit = async (event) => {
    event.preventDefault()
    setSavingSystem(true)

    try {
      await api.settings.updateBulk({
        "system.lowStockThreshold": String(systemForm.lowStockThreshold),
        "quote.template": systemForm.quoteTemplate,
        "quote.publicLinkEnabled": String(systemForm.publicLinkEnabled),
        "payment.pixEnabled": String(systemForm.pixEnabled),
        "payment.pixKey": systemForm.pixKey,
        "system.timezone": systemForm.timezone,
        "notification.email": String(systemForm.notificationEmail),
        "notification.quoteApproved": String(systemForm.notificationQuoteApproved),
        "notification.lowStock": String(systemForm.notificationLowStock),
        "notification.loginFailure": String(systemForm.notificationLoginFailure),
      })

      toast({
        title: "Configurações salvas",
        description: "Os parâmetros operacionais foram atualizados.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha ao salvar sistema",
        description: error.message,
      })
    } finally {
      setSavingSystem(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Configurações</h2>
        <p className="mt-2 text-slate-600">Parâmetros institucionais e operacionais mantidos no banco próprio.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Empresa</CardTitle>
            <CardDescription>Informações exibidas em documentos, links públicos e interface.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCompanySubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <input name="name" value={companyForm.name} onChange={handleCompanyChange} placeholder="Razão social / nome" className="rounded-md border px-3 py-2 md:col-span-2" />
                <input name="taxId" value={companyForm.taxId} onChange={handleCompanyChange} placeholder="CNPJ / documento fiscal" className="rounded-md border px-3 py-2" />
                <input name="phone" value={companyForm.phone} onChange={handleCompanyChange} placeholder="Telefone" className="rounded-md border px-3 py-2" />
                <input name="email" type="email" value={companyForm.email} onChange={handleCompanyChange} placeholder="E-mail" className="rounded-md border px-3 py-2" />
                <input name="website" value={companyForm.website} onChange={handleCompanyChange} placeholder="Site" className="rounded-md border px-3 py-2" />
                <input name="logo" value={companyForm.logo} onChange={handleCompanyChange} placeholder="URL da logo" className="rounded-md border px-3 py-2 md:col-span-2" />
                <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoChange} className="rounded-md border px-3 py-2 md:col-span-2" />
                <input name="address" value={companyForm.address} onChange={handleCompanyChange} placeholder="Endereço" className="rounded-md border px-3 py-2 md:col-span-2" />
                <input name="city" value={companyForm.city} onChange={handleCompanyChange} placeholder="Cidade" className="rounded-md border px-3 py-2" />
                <input name="state" value={companyForm.state} onChange={handleCompanyChange} placeholder="UF" className="rounded-md border px-3 py-2" />
                <input name="zipCode" value={companyForm.zipCode} onChange={handleCompanyChange} placeholder="CEP" className="rounded-md border px-3 py-2" />
                <input name="country" value={companyForm.country} onChange={handleCompanyChange} placeholder="País" className="rounded-md border px-3 py-2" />
              </div>

              <Button type="submit" className="w-full gap-2" disabled={savingCompany}>
                <Save className="h-4 w-4" />
                {savingCompany ? "Salvando..." : "Salvar dados da empresa"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sistema</CardTitle>
            <CardDescription>Chaves de configuração utilizadas internamente pela aplicação.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSystemSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  name="lowStockThreshold"
                  type="number"
                  value={systemForm.lowStockThreshold}
                  onChange={handleSystemChange}
                  placeholder="Estoque mínimo padrão"
                  className="rounded-md border px-3 py-2"
                />
                <input
                  name="timezone"
                  value={systemForm.timezone}
                  onChange={handleSystemChange}
                  placeholder="Timezone"
                  className="rounded-md border px-3 py-2"
                />
              </div>

              <textarea
                name="quoteTemplate"
                value={systemForm.quoteTemplate}
                onChange={handleSystemChange}
                placeholder="Template de observação / rodapé de orçamento"
                rows={6}
                className="w-full rounded-md border px-3 py-2"
              />

              <div className="grid gap-3 text-sm text-slate-600">
                <label className="flex items-center gap-2">
                  <input name="publicLinkEnabled" type="checkbox" checked={systemForm.publicLinkEnabled} onChange={handleSystemChange} />
                  Habilitar links públicos de orçamento por padrão
                </label>
                <label className="flex items-center gap-2">
                  <input name="pixEnabled" type="checkbox" checked={systemForm.pixEnabled} onChange={handleSystemChange} />
                  Exibir PIX em fluxos comerciais
                </label>
                <label className="flex items-center gap-2">
                  <input name="notificationEmail" type="checkbox" checked={systemForm.notificationEmail} onChange={handleSystemChange} />
                  Notificações por e-mail habilitadas
                </label>
                <label className="flex items-center gap-2">
                  <input name="notificationQuoteApproved" type="checkbox" checked={systemForm.notificationQuoteApproved} onChange={handleSystemChange} />
                  Alertar aprovação de orçamento
                </label>
                <label className="flex items-center gap-2">
                  <input name="notificationLowStock" type="checkbox" checked={systemForm.notificationLowStock} onChange={handleSystemChange} />
                  Alertar estoque baixo
                </label>
                <label className="flex items-center gap-2">
                  <input name="notificationLoginFailure" type="checkbox" checked={systemForm.notificationLoginFailure} onChange={handleSystemChange} />
                  Alertar falhas de login
                </label>
              </div>

              <input
                name="pixKey"
                value={systemForm.pixKey}
                onChange={handleSystemChange}
                placeholder="Chave PIX"
                className="w-full rounded-md border px-3 py-2"
              />

              <Button type="submit" className="w-full gap-2" disabled={savingSystem}>
                <Save className="h-4 w-4" />
                {savingSystem ? "Salvando..." : "Salvar parâmetros do sistema"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Settings
