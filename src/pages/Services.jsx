
import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loading } from "@/components/ui/loading"
import { useApi } from "@/hooks/useApi"
import { api } from "@/services/api"
import { ServiceForm } from "@/components/services/ServiceForm"
import { ServiceList } from "@/components/services/ServiceList"

function Services() {
  const { toast } = useToast()
  const [services, setServices] = React.useState([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [loading, setLoading] = React.useState(true)

  const { execute: executeList } = useApi(api.services.list)
  const { execute: executeCreate } = useApi(api.services.create)
  const { execute: executeDelete } = useApi(api.services.delete)
  const { execute: executeSearch } = useApi(api.services.search)

  React.useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      const data = await executeList()
      setServices(data)
    } catch (error) {
      console.error("Error loading services:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data) => {
    try {
      await executeCreate(data)
      toast({
        title: "Serviço cadastrado com sucesso!",
        description: "O serviço foi adicionado ao catálogo.",
      })
      loadServices()
    } catch (error) {
      console.error("Error creating service:", error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await executeDelete(id)
      toast({
        title: "Serviço excluído com sucesso!",
        description: "O serviço foi removido do catálogo.",
      })
      loadServices()
    } catch (error) {
      console.error("Error deleting service:", error)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const data = await executeSearch({
        term: searchTerm,
        category: selectedCategory
      })
      setServices(data)
    } catch (error) {
      console.error("Error searching services:", error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    const timer = setTimeout(handleSearch, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, selectedCategory])

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Serviços</h2>
        <p className="text-muted-foreground">Gerencie seu catálogo de serviços</p>
      </div>

      <Tabs defaultValue="register" className="space-y-4">
        <TabsList>
          <TabsTrigger value="register">Cadastrar</TabsTrigger>
          <TabsTrigger value="list">Catálogo</TabsTrigger>
        </TabsList>

        <TabsContent value="register">
          <ServiceForm onSubmit={handleCreate} />
        </TabsContent>

        <TabsContent value="list">
          <ServiceList
            services={services}
            onDelete={handleDelete}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Services
