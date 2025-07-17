
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Download, Edit, Trash2, Wrench } from "lucide-react"
import { ConfirmDialog } from "../ui/confirm-dialog"

const categories = [
  "Instalação",
  "Manutenção",
  "Consultoria",
  "Projeto",
  "Outro"
]

export function ServiceList({ 
  services, 
  onDelete, 
  searchTerm, 
  setSearchTerm,
  selectedCategory,
  setSelectedCategory
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Catálogo de Serviços</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filtros */}
          <div className="grid gap-4 md:grid-cols-3">
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
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Lista */}
          <div className="space-y-4">
            {services.map(service => (
              <div
                key={service.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {service.category} • {service.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Preço Sugerido: R$ {service.suggested_price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        title="Excluir Serviço"
                        description="Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita."
                        variant="destructive"
                        onConfirm={() => onDelete(service.id)}
                      >
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </ConfirmDialog>
                    </div>
                  </div>
                </div>
                {service.tags && service.tags.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {service.tags.map(tag => (
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
