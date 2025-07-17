
import React from "react"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loading } from "@/components/ui/loading"
import { useApi } from "@/hooks/useApi"
import { api } from "@/services/api"
import { ProductForm } from "@/components/products/ProductForm"
import { ProductList } from "@/components/products/ProductList"
import { ProductDashboard } from "@/components/products/ProductDashboard"

function Products() {
  const { toast } = useToast()
  const [products, setProducts] = React.useState([])
  const [stockData, setStockData] = React.useState([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [stockFilter, setStockFilter] = React.useState("all")
  const [loading, setLoading] = React.useState(true)

  const { execute: executeList } = useApi(api.products.list)
  const { execute: executeCreate } = useApi(api.products.create)
  const { execute: executeDelete } = useApi(api.products.delete)
  const { execute: executeSearch } = useApi(api.products.search)

  React.useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await executeList()
      setProducts(data)
      
      // Process stock data for chart
      const stockHistory = data
        .filter(p => p.type === "product")
        .reduce((acc, p) => {
          const month = format(new Date(p.created_at), "MMM")
          acc[month] = (acc[month] || 0) + (p.stock || 0)
          return acc
        }, {})

      setStockData(
        Object.entries(stockHistory).map(([month, quantity]) => ({
          month,
          quantity
        }))
      )
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data) => {
    try {
      await executeCreate(data)
      toast({
        title: "Produto cadastrado com sucesso!",
        description: "O item foi adicionado ao catálogo.",
      })
      loadProducts()
    } catch (error) {
      console.error("Error creating product:", error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await executeDelete(id)
      toast({
        title: "Produto excluído com sucesso!",
        description: "O item foi removido do catálogo.",
      })
      loadProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const data = await executeSearch({
        term: searchTerm,
        category: selectedCategory,
        stock: stockFilter
      })
      setProducts(data)
    } catch (error) {
      console.error("Error searching products:", error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    const timer = setTimeout(handleSearch, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, selectedCategory, stockFilter])

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Produtos e Serviços</h2>
        <p className="text-muted-foreground">Gerencie seu catálogo</p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="register">Cadastrar</TabsTrigger>
          <TabsTrigger value="list">Catálogo</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ProductDashboard products={products} stockData={stockData} />
        </TabsContent>

        <TabsContent value="register">
          <ProductForm onSubmit={handleCreate} />
        </TabsContent>

        <TabsContent value="list">
          <ProductList
            products={products}
            onDelete={handleDelete}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            stockFilter={stockFilter}
            setStockFilter={setStockFilter}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Products
