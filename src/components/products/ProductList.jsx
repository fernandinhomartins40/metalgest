
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Edit, Trash2, Package, Wrench as Tool } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

const categories = [
  "Matéria-prima",
  "Ferramenta",
  "Acessório",
  "Serviço",
  "Outro"
]

export function ProductList({ 
  products, 
  onDelete, 
  searchTerm, 
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  stockFilter,
  setStockFilter
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Catálogo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtros */}
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full rounded-md border p-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="w-full rounded-md border p-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas Categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="w-full rounded-md border p-2"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="low">Estoque Baixo</option>
                <option value="out">Sem Estoque</option>
              </select>
            </div>
            <div>
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Lista */}
          <div className="space-y-4">
            {products.map(product => (
              <div
                key={product.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {product.type === "product" ? (
                        <Package className="h-4 w-4" />
                      ) : (
                        <Tool className="h-4 w-4" />
                      )}
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {product.category} • {product.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {product.type === "product" && (
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Estoque: {product.stock} {product.unit}
                        </p>
                        {product.stock <= product.min_stock && (
                          <p className="text-sm text-red-500">
                            Estoque Baixo
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        title="Excluir Produto"
                        description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
                        variant="destructive"
                        onConfirm={() => onDelete(product.id)}
                      >
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </ConfirmDialog>
                    </div>
                  </div>
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {product.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full text-xs bg-gray-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
