
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useApi } from "@/hooks/useApi"
import { api } from "@/lib/api"
import {
  Building2,
  Settings as SettingsIcon,
  Bell,
  Download,
  Upload,
  Save,
  Trash2,
  Eye,
  QrCode,
  Globe,
  Clock,
  Volume2,
  Mail,
  AlertTriangle
} from "lucide-react"

const companySchema = z.object({
  razaoSocial: z.string().min(3, "Razão Social é obrigatória"),
  nomeFantasia: z.string(),
  cnpj: z.string().min(14, "CNPJ inválido"),
  ie: z.string().optional(),
  cep: z.string().min(8, "CEP inválido"),
  endereco: z.string().min(3, "Endereço é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().length(2, "Estado inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("E-mail inválido"),
  site: z.string().url().optional(),
})

const systemSchema = z.object({
  estoqueMinimo: z.number().min(0),
  templateOrcamento: z.string().min(1, "Template é obrigatório"),
  linkExterno: z.boolean(),
  pixAtivo: z.boolean(),
  chavePix: z.string().optional(),
  fusoHorario: z.string(),
  notificacoes: z.object({
    email: z.boolean(),
    orcamentoAprovado: z.boolean(),
    estoqueBaixo: z.boolean(),
    falhaLogin: z.boolean(),
    notificacaoSonora: z.boolean(),
    tipoExibicao: z.enum(["toast", "modal", "banner"])
  })
})

function Settings() {
  const { toast } = useToast()
  const [logoPreview, setLogoPreview] = React.useState(null)
  const [templateValue, setTemplateValue] = React.useState("")
  const [logoFile, setLogoFile] = React.useState(null)
  
  const { execute: getCompanyData, loading: loadingCompany } = useApi(api.settings.getCompanyData)
  const { execute: saveCompanyData, loading: savingCompany } = useApi(api.settings.saveCompanyData)
  const { execute: getSystemSettings, loading: loadingSystem } = useApi(api.settings.getSystemSettings)
  const { execute: saveSystemSettings, loading: savingSystem } = useApi(api.settings.saveSystemSettings)
  
  const companyForm = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      razaoSocial: "",
      nomeFantasia: "",
      cnpj: "",
      ie: "",
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      telefone: "",
      email: "",
      site: ""
    }
  })

  const systemForm = useForm({
    resolver: zodResolver(systemSchema),
    defaultValues: {
      estoqueMinimo: 10,
      templateOrcamento: "",
      linkExterno: true,
      pixAtivo: false,
      chavePix: "",
      fusoHorario: "America/Sao_Paulo",
      notificacoes: {
        email: true,
        orcamentoAprovado: true,
        estoqueBaixo: true,
        falhaLogin: true,
        notificacaoSonora: false,
        tipoExibicao: "toast"
      }
    }
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load company data
        const companyData = await getCompanyData()
        if (companyData) {
          companyForm.reset(companyData)
          if (companyData.logo) {
            setLogoPreview(companyData.logo)
          }
        }

        // Load system settings
        const systemSettings = await getSystemSettings()
        if (systemSettings) {
          systemForm.reset(systemSettings)
          if (systemSettings.templateOrcamento) {
            setTemplateValue(systemSettings.templateOrcamento)
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        toast({
          variant: "destructive",
          title: "Erro ao carregar configurações",
          description: "Não foi possível carregar as configurações. Tente novamente."
        })
      }
    }

    loadSettings()
  }, [])

  const handleLogoChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCompanySubmit = async (data) => {
    try {
      await saveCompanyData(data, logoFile)
      toast({
        title: "Configurações salvas!",
        description: "Os dados da empresa foram atualizados com sucesso."
      })
    } catch (error) {
      console.error("Error saving company data:", error)
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados da empresa. Tente novamente."
      })
    }
  }

  const handleSystemSubmit = async (data) => {
    try {
      const settings = {
        ...data,
        templateOrcamento: templateValue
      }
      await saveSystemSettings(settings)
      toast({
        title: "Configurações salvas!",
        description: "As configurações do sistema foram atualizadas com sucesso."
      })
    } catch (error) {
      console.error("Error saving system settings:", error)
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações do sistema. Tente novamente."
      })
    }
  }

  const handleBackup = () => {
    const data = {
      company: companyForm.getValues(),
      system: systemForm.getValues()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Backup gerado!",
      description: "O arquivo de backup foi gerado com sucesso."
    })
  }

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, "")
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()
        if (!data.erro) {
          companyForm.setValue("endereco", data.logradouro)
          companyForm.setValue("bairro", data.bairro)
          companyForm.setValue("cidade", data.localidade)
          companyForm.setValue("estado", data.uf)
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>
        <Button variant="outline" onClick={handleBackup}>
          <Download className="h-4 w-4 mr-2" />
          Gerar Backup
        </Button>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="company">
            <Building2 className="h-4 w-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="system">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificações
          </TabsTrigger>
        </TabsList>

        {/* Dados da Empresa */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Dados Cadastrais</CardTitle>
              <CardDescription>
                Informações da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={companyForm.handleSubmit(handleCompanySubmit)} className="space-y-6">
                <div className="space-y-4">
                  {/* Logo Upload */}
                  <div className="flex items-center space-x-4">
                    <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center relative">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto text-gray-400" />
                          <span className="text-sm text-gray-500">Logo</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">Logo da Empresa</h4>
                      <p className="text-sm text-gray-500">
                        Recomendado: PNG ou JPG, 400x400px
                      </p>
                    </div>
                  </div>

                  {/* Dados Principais */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Razão Social *</label>
                      <input
                        {...companyForm.register("razaoSocial")}
                        className="w-full rounded-md border p-2"
                      />
                      {companyForm.formState.errors.razaoSocial && (
                        <span className="text-sm text-red-500">
                          {companyForm.formState.errors.razaoSocial.message}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome Fantasia</label>
                      <input
                        {...companyForm.register("nomeFantasia")}
                        className="w-full rounded-md border p-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">CNPJ *</label>
                      <input
                        {...companyForm.register("cnpj")}
                        className="w-full rounded-md border p-2"
                      />
                      {companyForm.formState.errors.cnpj && (
                        <span className="text-sm text-red-500">
                          {companyForm.formState.errors.cnpj.message}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Inscrição Estadual</label>
                      <input
                        {...companyForm.register("ie")}
                        className="w-full rounded-md border p-2"
                      />
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Endereço</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">CEP *</label>
                        <input
                          {...companyForm.register("cep")}
                          onBlur={handleCepBlur}
                          className="w-full rounded-md border p-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Endereço *</label>
                        <input
                          {...companyForm.register("endereco")}
                          className="w-full rounded-md border p-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Número *</label>
                        <input
                          {...companyForm.register("numero")}
                          className="w-full rounded-md border p-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Complemento</label>
                        <input
                          {...companyForm.register("complemento")}
                          className="w-full rounded-md border p-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Bairro *</label>
                        <input
                          {...companyForm.register("bairro")}
                          className="w-full rounded-md border p-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Cidade *</label>
                        <input
                          {...companyForm.register("cidade")}
                          className="w-full rounded-md border p-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Estado *</label>
                        <select
                          {...companyForm.register("estado")}
                          className="w-full rounded-md border p-2"
                        >
                          <option value="">Selecione...</option>
                          <option value="AC">Acre</option>
                          <option value="AL">Alagoas</option>
                          <option value="AP">Amapá</option>
                          <option value="AM">Amazonas</option>
                          <option value="BA">Bahia</option>
                          <option value="CE">Ceará</option>
                          <option value="DF">Distrito Federal</option>
                          <option value="ES">Espírito Santo</option>
                          <option value="GO">Goiás</option>
                          <option value="MA">Maranhão</option>
                          <option value="MT">Mato Grosso</option>
                          <option value="MS">Mato Grosso do Sul</option>
                          <option value="MG">Minas Gerais</option>
                          <option value="PA">Pará</option>
                          <option value="PB">Paraíba</option>
                          <option value="PR">Paraná</option>
                          <option value="PE">Pernambuco</option>
                          <option value="PI">Piauí</option>
                          <option value="RJ">Rio de Janeiro</option>
                          <option value="RN">Rio Grande do Norte</option>
                          <option value="RS">Rio Grande do Sul</option>
                          <option value="RO">Rondônia</option>
                          <option value="RR">Roraima</option>
                          <option value="SC">Santa Catarina</option>
                          <option value="SP">São Paulo</option>
                          <option value="SE">Sergipe</option>
                          <option value="TO">Tocantins</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contato */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Contato</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                                     <div className="space-y-2">
                        <label className="text-sm font-medium">Telefone *</label>
                        <input
                          {...companyForm.register("telefone")}
                          className="w-full rounded-md border p-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">E-mail *</label>
                        <input
                          {...companyForm.register("email")}
                          type="email"
                          className="w-full rounded-md border p-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Site</label>
                        <input
                          {...companyForm.register("site")}
                          type="url"
                          className="w-full rounded-md border p-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={savingCompany}>
                    <Save className="h-4 w-4 mr-2" />
                    {savingCompany ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações do Sistema */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Configurações gerais de funcionamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={systemForm.handleSubmit(handleSystemSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {/* Configurações Gerais */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Limite de Estoque Mínimo</label>
                      <input
                        type="number"
                        {...systemForm.register("estoqueMinimo", { valueAsNumber: true })}
                        className="w-full rounded-md border p-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fuso Horário</label>
                      <select
                        {...systemForm.register("fusoHorario")}
                        className="w-full rounded-md border p-2"
                      >
                        <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                        <option value="America/Manaus">Manaus (GMT-4)</option>
                        <option value="America/Belem">Belém (GMT-3)</option>
                      </select>
                    </div>
                  </div>

                  {/* Template de Orçamento */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Template de Orçamento</label>
                    <div className="border rounded-md">
                      <ReactQuill
                        value={templateValue}
                        onChange={setTemplateValue}
                        className="h-[200px]"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Use variáveis como {"{cliente}"}, {"{data}"}, {"{total}"} para campos dinâmicos
                    </p>
                  </div>

                  {/* Configurações de Link e PIX */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Link Externo de Orçamento</h4>
                        <p className="text-sm text-gray-500">
                          Permite compartilhar orçamentos via link
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          {...systemForm.register("linkExterno")}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">QR Code PIX</h4>
                        <p className="text-sm text-gray-500">
                          Habilita pagamento via PIX
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          {...systemForm.register("pixAtivo")}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {systemForm.watch("pixAtivo") && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Chave PIX</label>
                        <input
                          {...systemForm.register("chavePix")}
                          className="w-full rounded-md border p-2"
                          placeholder="CPF, CNPJ, E-mail ou Telefone"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={savingSystem}>
                    <Save className="h-4 w-4 mr-2" />
                    {savingSystem ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Gerencie como deseja receber as notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-4">
                  {/* Notificações por E-mail */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notificações por E-mail</h4>
                      <p className="text-sm text-gray-500">
                        Receba atualizações importantes por e-mail
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...systemForm.register("notificacoes.email")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Eventos */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Eventos</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...systemForm.register("notificacoes.orcamentoAprovado")}
                          className="rounded border-gray-300"
                        />
                        <span>Orçamento Aprovado</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...systemForm.register("notificacoes.estoqueBaixo")}
                          className="rounded border-gray-300"
                        />
                        <span>Estoque Baixo</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...systemForm.register("notificacoes.falhaLogin")}
                          className="rounded border-gray-300"
                        />
                        <span>Falha no Login</span>
                      </label>
                    </div>
                  </div>

                  {/* Notificação Sonora */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notificação Sonora</h4>
                      <p className="text-sm text-gray-500">
                        Alerta sonoro para notificações importantes
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...systemForm.register("notificacoes.notificacaoSonora")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Tipo de Exibição */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Exibição</label>
                    <select
                      {...systemForm.register("notificacoes.tipoExibicao")}
                      className="w-full rounded-md border p-2"
                    >
                      <option value="toast">Toast</option>
                      <option value="modal">Modal</option>
                      <option value="banner">Banner</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Preferências
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings
