import React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, BarChart3, CheckCircle2, Clock3, Factory, FileText, Package, ShieldCheck, Truck, Users, Wallet, Wrench } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"

const heroStats = [
  {
    value: "4 frentes",
    label: "Comercial, producao, estoque e financeiro conectados",
  },
  {
    value: "100% web",
    label: "Acesse a operacao sem depender da maquina do escritorio",
  },
  {
    value: "1 fluxo",
    label: "Do orcamento ao recebimento em um unico sistema",
  },
  {
    value: "Tempo real",
    label: "Visibilidade das prioridades e gargalos do dia",
  },
]

const segmentCards = [
  {
    title: "Serralherias",
    description: "Organize pedidos sob medida, acompanhamento de fabricacao e entregas.",
  },
  {
    title: "Usinagem",
    description: "Controle ordens, materiais, prazos e custos por servico com mais previsibilidade.",
  },
  {
    title: "Estruturas metalicas",
    description: "Ganhe visibilidade sobre etapas, reposicao de materiais e cronograma de obra.",
  },
  {
    title: "Fabricacao sob encomenda",
    description: "Transforme o pedido do cliente em execucao sem perder informacao no caminho.",
  },
  {
    title: "Montagem e entrega",
    description: "Acompanhe o que sai da fabrica, o que precisa instalar e o que ainda falta concluir.",
  },
  {
    title: "Operacao administrativa",
    description: "Conecte proposta, estoque, faturamento e recebimento em uma rotina unica.",
  },
]

const moduleTabs = {
  comercial: {
    label: "Comercial",
    title: "Mais controle sobre propostas e retorno dos clientes",
    description:
      "O time comercial para de depender de memoria e mensagens soltas para saber o que foi enviado, aprovado ou esquecido.",
    features: [
      "Orcamentos e propostas com historico",
      "Acompanhamento de negociacao",
      "Cadastro completo de clientes",
      "Conversao do pedido para execucao",
      "Visao rapida do que precisa de retorno",
      "Registro do combinado desde o primeiro contato",
    ],
  },
  producao: {
    label: "Producao",
    title: "Ordens mais claras para reduzir improviso no chao de fabrica",
    description:
      "Depois da venda, a equipe enxerga o que precisa produzir, em qual prioridade e com quais materiais.",
    features: [
      "Ordens de producao organizadas",
      "Priorizacao de servicos e pedidos",
      "Acompanhamento do andamento da execucao",
      "Informacoes tecnicas centralizadas",
      "Menos retrabalho por falta de contexto",
      "Visibilidade do que esta travando o prazo",
    ],
  },
  estoque: {
    label: "Estoque",
    title: "Materiais e itens sob controle antes de virar urgencia",
    description:
      "O estoque deixa de ser descoberto no susto e passa a entrar no planejamento da operacao.",
    features: [
      "Cadastro de materiais e itens",
      "Controle de entradas e saidas",
      "Visao do consumo por pedido ou servico",
      "Reposicao com mais previsibilidade",
      "Menos falta de material no meio da execucao",
      "Historico do que foi usado e movimentado",
    ],
  },
  financeiro: {
    label: "Financeiro",
    title: "Recebimentos, despesas e caixa acompanhados no momento certo",
    description:
      "A administracao acompanha o que entrou, o que falta receber e onde a margem esta escapando.",
    features: [
      "Contas a pagar e a receber",
      "Fluxo financeiro mais claro",
      "Acompanhamento de cobrancas",
      "Menos atraso por esquecimento",
      "Visao do que ja virou faturamento",
      "Base unica para tomada de decisao",
    ],
  },
  relatorios: {
    label: "Relatorios",
    title: "Indicadores para enxergar a operacao sem montar planilha paralela",
    description:
      "Comercial, producao e financeiro passam a gerar leitura de negocio sem depender de consolidacao manual.",
    features: [
      "Dashboards operacionais",
      "Indicadores de andamento dos pedidos",
      "Visao de gargalos da rotina",
      "Resumo financeiro e comercial",
      "Acompanhamento de produtividade",
      "Mais seguranca para decidir com base no que esta acontecendo",
    ],
  },
}

const differenceCards = [
  {
    icon: ShieldCheck,
    title: "Fluxo claro entre as areas",
    description:
      "O comercial vende, a producao executa e o financeiro acompanha sem depender de recado perdido.",
  },
  {
    icon: Clock3,
    title: "Menos correria de ultima hora",
    description:
      "Prazos, prioridades e pendencias ficam visiveis antes de virarem retrabalho ou atraso.",
  },
  {
    icon: Users,
    title: "Mais alinhamento da equipe",
    description:
      "Todos trabalham olhando para a mesma base, com menos desencontro entre escritorio e fabrica.",
  },
  {
    icon: BarChart3,
    title: "Decisao com contexto real",
    description:
      "Voce entende o que esta funcionando, o que travou e onde precisa agir na operacao.",
  },
]

const workflowCards = [
  {
    icon: FileText,
    title: "Receba e acompanhe o pedido",
    description: "Cliente, prazo, escopo e orcamento ficam registrados desde o inicio.",
  },
  {
    icon: Wrench,
    title: "Transforme venda em execucao",
    description: "A equipe de producao recebe a informacao organizada para trabalhar com prioridade.",
  },
  {
    icon: Package,
    title: "Controle materiais e andamento",
    description: "Estoque, consumo e pendencias entram no radar antes de comprometer a entrega.",
  },
  {
    icon: Wallet,
    title: "Fature e acompanhe o recebimento",
    description: "A administracao acompanha o fechamento do pedido e o que ainda precisa entrar no caixa.",
  },
]

const footerLinks = [
  { label: "Solucoes", href: "#solucoes" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Operacao", href: "#operacao" },
  { label: "Diferenciais", href: "#diferenciais" },
]

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-[0.18em] text-slate-950">METALGEST</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">gestao para metalurgicas</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
            {footerLinks.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-slate-950">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate("/login")}>
              Entrar
            </Button>
            <Button className="bg-[#c96e28] text-white hover:bg-[#b8601f]" onClick={() => navigate("/register")}>
              Criar conta
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#c96e28]">
              Sistema completo para a rotina da metalurgica
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Venda, produza, entregue e receba com mais controle em um unico lugar.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              O MetalGest organiza o fluxo da metalurgica do primeiro contato com o cliente ate o recebimento. Orcamentos, execucao, materiais e financeiro deixam de ficar espalhados entre planilhas, mensagens e memoria da equipe.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-12 bg-[#c96e28] px-6 text-base text-white hover:bg-[#b8601f]"
                onClick={() => navigate("/register")}
              >
                Quero criar minha conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 px-6 text-base"
                onClick={() => navigate("/login")}
              >
                Entrar no sistema
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {heroStats.map((item) => (
                <Card key={item.value} className="border-slate-200 shadow-none">
                  <CardContent className="p-5">
                    <p className="text-lg font-bold text-slate-950">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-slate-200 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c96e28]">Visao da operacao</p>
              <CardTitle className="text-3xl">O que precisa da sua atencao agora</CardTitle>
              <CardDescription className="text-base leading-7">
                Uma leitura executiva da rotina, inspirada no que realmente pesa no dia a dia da metalurgica.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "Comercial",
                  description: "Orcamentos enviados, pedidos em negociacao e clientes que precisam de retorno.",
                },
                {
                  title: "Producao",
                  description: "Ordens em andamento, prioridades do dia e servicos que exigem acao imediata.",
                },
                {
                  title: "Estoque",
                  description: "Materiais em baixa, consumo por pedido e reposicao antes de comprometer o prazo.",
                },
                {
                  title: "Financeiro",
                  description: "Recebimentos pendentes, despesas da operacao e faturamento no radar.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">
                      {item.title}
                    </p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                      Tempo real
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              ))}

              <div className="rounded-xl bg-slate-900 p-5 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d8a06f]">
                  Resultado esperado
                </p>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Menos informacao perdida, menos improviso entre setores e muito mais previsibilidade sobre prazo e caixa.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="solucoes" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c96e28]">Solucoes por rotina</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
            Sua metalurgica nao trabalha de forma generica. O sistema tambem nao deveria.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            O MetalGest foi pensado para operacoes que vivem de pedido sob medida, producao, materiais e prazo apertado.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {segmentCards.map((card) => (
            <Card key={card.title} className="border-slate-200 shadow-none transition hover:-translate-y-1 hover:shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{card.title}</CardTitle>
                <CardDescription className="text-sm leading-7">{card.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="funcionalidades" className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c96e28]">Funcionalidades</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              Tudo que a operacao precisa em um so lugar
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Explore os modulos do MetalGest e veja como comercial, producao, estoque, financeiro e indicadores passam a conversar na mesma rotina.
            </p>
          </div>

          <Tabs defaultValue="comercial" className="mt-12">
            <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-xl bg-transparent p-0">
              {Object.entries(moduleTabs).map(([key, item]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 data-[state=active]:border-slate-900 data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(moduleTabs).map(([key, item]) => (
              <TabsContent key={key} value={key} className="mt-6">
                <Card className="border-slate-200 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-2xl">{item.title}</CardTitle>
                    <CardDescription className="text-base leading-7">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {item.features.map((feature) => (
                        <div key={feature} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#c96e28]" />
                          <p className="text-sm leading-6 text-slate-700">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <section id="operacao" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c96e28]">Visao da operacao</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              Mais clareza do que entra, do que esta em execucao e do que ainda precisa virar caixa.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Quando o fluxo fica centralizado, a empresa consegue agir antes do atraso, da falta de material ou da cobranca esquecida.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { value: "4 areas", label: "Comercial, producao, estoque e financeiro" },
                { value: "1 base", label: "Menos planilhas, mensagens e retrabalho" },
                { value: "Tempo real", label: "Prioridades e gargalos mais visiveis" },
                { value: "Mais contexto", label: "Decisao com informacao da rotina" },
              ].map((item) => (
                <Card key={item.value} className="border-slate-200 shadow-none">
                  <CardContent className="p-5">
                    <p className="text-lg font-bold text-slate-950">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {workflowCards.map((item) => (
              <Card key={item.title} className="border-slate-200 shadow-none">
                <CardHeader className="pb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-[#c96e28]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="pt-2 text-xl">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-7">{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="diferenciais" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c96e28]">Por que escolher</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              Detalhes que fazem a diferenca na rotina da metalurgica
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              O foco nao e so organizar tela. E dar visibilidade operacional para a empresa trabalhar com menos retrabalho e mais controle.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {differenceCards.map((card) => (
              <Card key={card.title} className="border-slate-200 shadow-none">
                <CardHeader className="pb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="pt-2 text-xl">{card.title}</CardTitle>
                  <CardDescription className="text-sm leading-7">{card.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#fff7ef_0%,#ffffff_55%,#f7fafc_100%)] px-6 py-12 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c96e28]">Comece hoje</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              Se a desorganizacao ja esta pesando em prazo, entrega e caixa, este e o momento de estruturar a operacao.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Coloque comercial, producao, estoque e financeiro no mesmo fluxo e acompanhe a rotina com mais previsibilidade.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 lg:mt-0 lg:min-w-[250px]">
            <Button
              className="h-12 bg-[#c96e28] text-base text-white hover:bg-[#b8601f]"
              onClick={() => navigate("/register")}
            >
              Criar minha conta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-12 text-base"
              onClick={() => navigate("/login")}
            >
              Entrar no sistema
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
