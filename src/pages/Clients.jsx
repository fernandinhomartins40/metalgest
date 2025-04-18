
import React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import InputMask from "react-input-mask"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

const clientSchema = z.object({
  // Dados Cadastrais
  personType: z.enum(["fisica", "juridica"]),
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  tradingName: z.string().optional(),
  document: z.string().min(11, "Documento inválido"),
  stateRegistration: z.string().optional(),
  municipalRegistration: z.string().optional(),
  
  // Endereço
  zipCode: z.string().min(8, "CEP inválido"),
  street: z.string().min(3, "Endereço obrigatório"),
  number: z.string().min(1, "Número obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "Estado inválido"),
  
  // Contato
  phone: z.string().min(10, "Telefone inválido"),
  mobile: z.string().min(11, "Celular inválido"),
  email: z.string().email("E-mail inválido"),
  contactName: z.string().min(3, "Nome do contato obrigatório"),
  contactRole: z.string().min(2, "Cargo obrigatório"),
  
  // Outros
  category: z.enum(["potential", "regular", "vip"]),
  notes: z.string().optional(),
})

function Clients() {
  const { toast } = useToast()
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      personType: "juridica",
      category: "regular",
      registrationDate: format(new Date(), "yyyy-MM-dd")
    }
  })

  const personType = watch("personType")

  const fetchAddressByCep = async (cep) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()
      if (!data.erro) {
        setValue("street", data.logradouro)
        setValue("neighborhood", data.bairro)
        setValue("city", data.localidade)
        setValue("state", data.uf)
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
    }
  }

  const onSubmit = (data) => {
    // Aqui implementaremos a persistência dos dados
    console.log(data)
    toast({
      title: "Cliente cadastrado com sucesso!",
      description: "Os dados foram salvos corretamente.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
        <p className="text-muted-foreground">Gerencie seus clientes</p>
      </div>

      <Tabs defaultValue="register" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="register">Cadastrar</TabsTrigger>
          <TabsTrigger value="list">Lista de Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Novo Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Dados Cadastrais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados Cadastrais</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo de Pessoa</label>
                      <select
                        {...register("personType")}
                        className="w-full rounded-md border p-2"
                      >
                        <option value="juridica">Jurídica</option>
                        <option value="fisica">Física</option>
                      </select>
                      {errors.personType && (
                        <span className="text-sm text-red-500">{errors.personType.message}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {personType === "juridica" ? "Razão Social" : "Nome Completo"}
                      </label>
                      <input
                        {...register("name")}
                        className="w-full rounded-md border p-2"
                      />
                      {errors.name && (
                        <span className="text-sm text-red-500">{errors.name.message}</span>
                      )}
                    </div>

                    {personType === "juridica" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nome Fantasia</label>
                        <input
                          {...register("tradingName")}
                          className="w-full rounded-md border p-2"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {personType === "juridica" ? "CNPJ" : "CPF"}
                      </label>
                      <Controller
                        name="document"
                        control={control}
                        render={({ field }) => (
                          <InputMask
                            mask={personType === "juridica" ? "99.999.999/9999-99" : "999.999.999-99"}
                            {...field}
                            className="w-full rounded-md border p-2"
                          />
                        )}
                      />
                      {errors.document && (
                        <span className="text-sm text-red-500">{errors.document.message}</span>
                      )}
                    </div>

                    {personType === "juridica" && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Inscrição Estadual</label>
                          <input
                            {...register("stateRegistration")}
                            className="w-full rounded-md border p-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Inscrição Municipal</label>
                          <input
                            {...register("municipalRegistration")}
                            className="w-full rounded-md border p-2"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Endereço</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CEP</label>
                      <Controller
                        name="zipCode"
                        control={control}
                        render={({ field }) => (
                          <InputMask
                            mask="99999-999"
                            {...field}
                            onBlur={(e) => {
                              field.onBlur()
                              const cep = e.target.value.replace(/\D/g, "")
                              if (cep.length === 8) {
                                fetchAddressByCep(cep)
                              }
                            }}
                            className="w-full rounded-md border p-2"
                          />
                        )}
                      />
                      {errors.zipCode && (
                        <span className="text-sm text-red-500">{errors.zipCode.message}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rua</label>
                      <input
                        {...register("street")}
                        className="w-full rounded-md border p-2"
                      />
                      {errors.street && (
                        <span className="text-sm text-red-500">{errors.street.message}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Número</label>
                      <input
                        {...register("number")}
                        className="w-full rounded-md border p-2"
                      />
                      {errors.number && (
                        <span className="text-sm text-red-500">{errors.number.message}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Complemento</label>
                      <input
                        {...register("complement")}
                        className="w-full rounded-md border p-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bairro</label>
                      <input
                        {...register("neighborhood")}
                        className="w-full rounded-md border p-2"
                      />
                      {errors.neighborhood && (
                        <span className="text-sm text-red-500">{errors.neighborhood.message}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cidade</label>
                      <input
                        {...register("city")}
                        className="w-full rounded-md border p-2"
                      />
                      {errors.city && (
                        <span className="text-sm text-red-500">{errors.city.message}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Estado</label>
                      <select
                        {...register("state")}
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
                      {errors.state && (
                        <span className="text-sm text-red-500">{errors.state.message}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contato */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contato</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Telefone</label>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <InputMask
                            mask="(99) 9999-9999"
                            {...field}
                            className="w-full rounded-md border p-2"
                          />
                        )}
                      />
                      {errors.phone && (
                        <span className="text-sm text-red-500">{errors.phone.message}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Celular</label>
                      <Controller
                        name="mobile"
                        control={control}
                        render={({ field }) => (
                          <InputMask
                            mask="(99) 99999-9999"
                            {...field}
                            className="w-full rounded-md border p-2"
                          />
                        )}
                      />
                      {errors.mobile && (
                        <span className="text-sm text-red-500">{errors.mobile.message}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">E-mail</label>
                      <input
                        type="email"
                        {...register("email")}
                        className="w-full rounded-md border p-2"
                      />
                      {errors.email && (
                        <span className="text-sm text-red-500">{errors.email.message}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome do Contato</label>
                      <input
                        {...register("contactName")}
                        className="w-full rounded-md border p-2"
                      />
                      {errors.contactName && (
                        <span className="text-sm text-red-500">{errors.contactName.message}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cargo</label>
                      <input
                        {...register("contactRole")}
                        className="w-full rounded-md border p-2"
                      />
                      {errors.contactRole && (
                        <span className="text-sm text-red-500">{errors.contactRole.message}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Outros */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Outros</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Categoria</label>
                      <select
                        {...register("category")}
                        className="w-full rounded-md border p-2"
                      >
                        <option value="potential">Potencial</option>
                        <option value="regular">Recorrente</option>
                        <option value="vip">VIP</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data de Cadastro</label>
                      <input
                        type="date"
                        {...register("registrationDate")}
                        className="w-full rounded-md border p-2"
                        disabled
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium">Observações</label>
                      <textarea
                        {...register("notes")}
                        className="w-full rounded-md border p-2"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // Limpar formulário
                    }}
                  >
                    Limpar
                  </Button>
                  <Button type="submit">
                    Cadastrar Cliente
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Lista será implementada aqui */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Clients
