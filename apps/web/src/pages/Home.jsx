import React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, BarChart3, CheckCircle2, Clock3, Factory, FileText, Package, ShieldCheck, Truck, Users, Wallet, Wrench } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"

const heroStats = [
  {
    value: "4 frentes",
    label: "Comercial, produção, estoque e financeiro conectados",
  },
  {
    value: "100% web",
    label: "Acesse a operação sem depender da máquina do escritório",
  },
  {
    value: "1 fluxo",
    label: "Do orçamento ao recebimento em um único sistema",
  },
  {
    value: "Tempo real",
    label: "Visibilidade das prioridades e gargalos do dia",
  },
]

const quickSignals = [
  "Orçamentos acompanhados",
  "Pedidos em execução",
  "Estoque visível",
  "Recebimentos no radar",
]

const segmentCards = [
  {
    icon: Wrench,
    title: "Serralherias",
    description: "Organize pedidos sob medida, acompanhamento de fabricação e entregas.",
    accentClassName: "bg-[#19d88f]/12 text-[#19d88f]",
  },
  {
    icon: Factory,
    title: "Usinagem",
    description: "Controle ordens, materiais, prazos e custos por serviço com mais previsibilidade.",
    accentClassName: "bg-[#7c5cff]/12 text-[#7c5cff]",
  },
  {
    icon: Package,
    title: "Estruturas metálicas",
    description: "Ganhe visibilidade sobre etapas, reposição de materiais e cronograma de obra.",
    accentClassName: "bg-[#f3b53f]/12 text-[#c98916]",
  },
  {
    icon: FileText,
    title: "Fabricação sob encomenda",
    description: "Transforme o pedido do cliente em execução sem perder informação no caminho.",
    accentClassName: "bg-[#7c5cff]/12 text-[#7c5cff]",
  },
  {
    icon: Truck,
    title: "Montagem e entrega",
    description: "Acompanhe o que sai da fabrica, o que precisa instalar e o que ainda falta concluir.",
    accentClassName: "bg-[#19d88f]/12 text-[#19d88f]",
  },
  {
    icon: Wallet,
    title: "Operação administrativa",
    description: "Conecte proposta, estoque, faturamento e recebimento em uma rotina única.",
    accentClassName: "bg-[#f3b53f]/12 text-[#c98916]",
  },
]

const moduleTabs = {
  comercial: {
    label: "Comercial",
    title: "Mais controle sobre propostas e retorno dos clientes",
    description:
      "O time comercial para de depender de memória e mensagens soltas para saber o que foi enviado, aprovado ou esquecido.",
    features: [
      "Orçamentos e propostas com histórico",
      "Acompanhamento de negociação",
      "Cadastro completo de clientes",
      "Conversão do pedido para execução",
      "Visão rápida do que precisa de retorno",
      "Registro do combinado desde o primeiro contato",
    ],
  },
  producao: {
    label: "Produção",
    title: "Ordens mais claras para reduzir improviso no chão de fábrica",
    description:
      "Depois da venda, a equipe enxerga o que precisa produzir, em qual prioridade e com quais materiais.",
    features: [
      "Ordens de produção organizadas",
      "Priorização de serviços e pedidos",
      "Acompanhamento do andamento da execução",
      "Informações técnicas centralizadas",
      "Menos retrabalho por falta de contexto",
      "Visibilidade do que está travando o prazo",
    ],
  },
  estoque: {
    label: "Estoque",
    title: "Materiais e itens sob controle antes de virar urgência",
    description:
      "O estoque deixa de ser descoberto no susto e passa a entrar no planejamento da operação.",
    features: [
      "Cadastro de materiais e itens",
      "Controle de entradas e saídas",
      "Visão do consumo por pedido ou serviço",
      "Reposição com mais previsibilidade",
      "Menos falta de material no meio da execução",
      "Histórico do que foi usado e movimentado",
    ],
  },
  financeiro: {
    label: "Financeiro",
    title: "Recebimentos, despesas e caixa acompanhados no momento certo",
    description:
      "A administração acompanha o que entrou, o que falta receber e onde a margem está escapando.",
    features: [
      "Contas a pagar e a receber",
      "Fluxo financeiro mais claro",
      "Acompanhamento de cobranças",
      "Menos atraso por esquecimento",
      "Visão do que já virou faturamento",
      "Base única para tomada de decisão",
    ],
  },
  relatorios: {
    label: "Relatórios",
    title: "Indicadores para enxergar a operação sem montar planilha paralela",
    description:
      "Comercial, produção e financeiro passam a gerar leitura de negócio sem depender de consolidação manual.",
    features: [
      "Dashboards operacionais",
      "Indicadores de andamento dos pedidos",
      "Visão de gargalos da rotina",
      "Resumo financeiro e comercial",
      "Acompanhamento de produtividade",
      "Mais segurança para decidir com base no que está acontecendo",
    ],
  },
}

const differenceCards = [
  {
    icon: ShieldCheck,
    title: "Fluxo claro entre as áreas",
    description:
      "O comercial vende, a produção executa e o financeiro acompanha sem depender de recado perdido.",
  },
  {
    icon: Clock3,
    title: "Menos correria de última hora",
    description:
      "Prazos, prioridades e pendências ficam visíveis antes de virarem retrabalho ou atraso.",
  },
  {
    icon: Users,
    title: "Mais alinhamento da equipe",
    description:
      "Todos trabalham olhando para a mesma base, com menos desencontro entre escritório e fábrica.",
  },
  {
    icon: BarChart3,
    title: "Decisão com contexto real",
    description:
      "Você entende o que está funcionando, o que travou e onde precisa agir na operação.",
  },
]

const workflowCards = [
  {
    icon: FileText,
    title: "Receba e acompanhe o pedido",
    description: "Cliente, prazo, escopo e orçamento ficam registrados desde o início.",
  },
  {
    icon: Wrench,
    title: "Transforme venda em execução",
    description: "A equipe de produção recebe a informação organizada para trabalhar com prioridade.",
  },
  {
    icon: Package,
    title: "Controle materiais e andamento",
    description: "Estoque, consumo e pendências entram no radar antes de comprometer a entrega.",
  },
  {
    icon: Wallet,
    title: "Fature e acompanhe o recebimento",
    description: "A administração acompanha o fechamento do pedido e o que ainda precisa entrar no caixa.",
  },
]

const mobileHighlights = [
  "Acesse o sistema no escritório, na fábrica ou na rua",
  "Consulte pedidos, prioridades e recebimentos sem planilha paralela",
  "Decida com a mesma base usada pelo time inteiro",
]

const footerLinks = [
  { label: "Soluções", href: "#solucoes" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Operação", href: "#operacao" },
  { label: "Diferenciais", href: "#diferenciais" },
]

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071826] text-white shadow-[0_14px_34px_rgba(7,24,38,0.18)]">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-[0.18em] text-slate-950">METALGEST</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">gestão para metalúrgicas</p>
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
            <Button className="rounded-full bg-[#19d88f] px-5 text-[#072235] hover:bg-[#16c17f]" onClick={() => navigate("/register")}>
              Criar conta
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#10283c] bg-[linear-gradient(135deg,#06121d_0%,#0b2235_56%,#07111a_100%)] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(25,216,143,0.18),transparent_26%),radial-gradient(circle_at_top_right,rgba(124,92,255,0.18),transparent_24%),radial-gradient(circle_at_bottom_center,rgba(243,181,63,0.12),transparent_30%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-medium text-slate-200">
              <span className="h-2.5 w-2.5 rounded-full bg-[#19d88f]" />
              Sistema completo para a rotina da metalúrgica
            </div>
            <h1 className="mt-8 text-4xl font-black leading-[1.04] text-white sm:text-5xl lg:text-[4rem]">
              Sistema completo
              <br />
              para sua metalúrgica
              <br />
              <span className="text-[#19d88f]">evoluir com</span>{" "}
              <span className="text-[#f3b53f]">controle.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              O MetalGest organiza o fluxo da metalúrgica do primeiro contato com o cliente até o recebimento. Orçamentos, execução, materiais e financeiro deixam de ficar espalhados entre planilhas, mensagens e memória da equipe.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-12 rounded-full bg-[#19d88f] px-7 text-base font-semibold text-[#072235] shadow-[0_16px_40px_rgba(25,216,143,0.22)] hover:bg-[#16c17f]"
                onClick={() => navigate("/register")}
              >
                Quero criar minha conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-full border-white/12 bg-white/6 px-7 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
                onClick={() => navigate("/login")}
              >
                Entrar no sistema
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {quickSignals.map((item, index) => (
                <div
                  key={item}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    index % 3 === 0
                      ? "bg-[#19d88f]/14 text-[#8df3c8]"
                      : index % 3 === 1
                        ? "bg-[#7c5cff]/14 text-[#b7a5ff]"
                        : "bg-[#f3b53f]/14 text-[#ffd98a]"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {heroStats.map((item) => (
                <Card key={item.value} className="border-white/10 bg-white/6 text-white shadow-none backdrop-blur">
                  <CardContent className="p-5">
                    <p className="text-lg font-bold text-white">{item.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-8 h-32 w-32 rounded-full bg-[#19d88f]/20 blur-3xl" />
            <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-[#7c5cff]/20 blur-3xl" />
            <Card className="relative rounded-[2rem] border-white/10 bg-[linear-gradient(180deg,rgba(13,31,46,0.95)_0%,rgba(7,20,31,0.92)_100%)] text-white shadow-[0_30px_80px_rgba(2,10,18,0.55)]">
            <CardHeader>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7c5cff]">Visão da operação</p>
              <CardTitle className="text-3xl text-white">O que precisa da sua atenção agora</CardTitle>
              <CardDescription className="text-base leading-7">
                Uma leitura executiva da rotina, inspirada no que realmente pesa no dia a dia da metalúrgica.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "Comercial",
                  description: "Orçamentos enviados, pedidos em negociação e clientes que precisam de retorno.",
                },
                {
                  title: "Produção",
                  description: "Ordens em andamento, prioridades do dia e serviços que exigem ação imediata.",
                },
                {
                  title: "Estoque",
                  description: "Materiais em baixa, consumo por pedido e reposição antes de comprometer o prazo.",
                },
                {
                  title: "Financeiro",
                  description: "Recebimentos pendentes, despesas da operação e faturamento no radar.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white">
                      {item.title}
                    </p>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">
                      Tempo real
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
                </div>
              ))}

              <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.14)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#19d88f]">
                  Resultado esperado
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Menos informação perdida, menos improviso entre setores e muito mais previsibilidade sobre prazo e caixa.
                </p>
              </div>
            </CardContent>
          </Card>
            <div className="absolute -left-3 top-16 rounded-2xl border border-[#19d88f]/30 bg-[#0f2f28] px-4 py-3 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8df3c8]">Caixa hoje</p>
              <p className="mt-1 text-sm font-bold text-white">Recebimentos sob controle</p>
            </div>
            <div className="absolute -right-2 top-28 rounded-2xl border border-[#7c5cff]/30 bg-[#231b45] px-4 py-3 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b7a5ff]">Pedidos</p>
              <p className="mt-1 text-sm font-bold text-white">Fila com prioridade definida</p>
            </div>
          </div>
        </div>
      </section>

      <section id="solucoes" className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(124,92,255,0.12)_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="relative mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7c5cff]">Soluções por rotina</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
            Sua metalúrgica não trabalha de forma genérica. <span className="text-[#7c5cff]">O sistema também não deveria.</span>
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            O MetalGest foi pensado para operações que vivem de pedido sob medida, produção, materiais e prazo apertado.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {segmentCards.map((card) => (
            <Card key={card.title} className="rounded-[1.75rem] border-slate-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(15,23,42,0.1)]">
              <CardHeader className="pb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.accentClassName}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <CardTitle className="pt-4 text-xl">{card.title}</CardTitle>
                <CardDescription className="text-sm leading-7">{card.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        </div>
      </section>

      <section id="funcionalidades" className="bg-[#f5f7fb] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#143047] bg-[linear-gradient(180deg,#081827_0%,#0b2235_100%)] p-6 shadow-[0_30px_80px_rgba(6,18,29,0.28)] sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#19d88f]">Funcionalidades</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Tudo que a operação precisa em um só lugar
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Explore os módulos do MetalGest e veja como comercial, produção, estoque, financeiro e indicadores passam a conversar na mesma rotina.
            </p>
          </div>

          <Tabs defaultValue="comercial" className="mt-12">
            <TabsList className="h-auto flex-wrap justify-start gap-2 rounded-full bg-white/6 p-2">
              {Object.entries(moduleTabs).map(([key, item], index) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className={`rounded-full px-4 py-2 text-sm font-medium text-slate-300 data-[state=active]:text-white ${
                    index === 1
                      ? "data-[state=active]:bg-[#19d88f] data-[state=active]:text-[#072235]"
                      : index === 2
                        ? "data-[state=active]:bg-[#f3b53f] data-[state=active]:text-[#2d2208]"
                        : "data-[state=active]:bg-[#7c5cff]"
                  }`}
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(moduleTabs).map(([key, item]) => (
              <TabsContent key={key} value={key} className="mt-6">
                <Card className="border-white/10 bg-transparent shadow-none">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">{item.title}</CardTitle>
                    <CardDescription className="text-base leading-7 text-slate-300">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {item.features.map((feature) => (
                        <div key={feature} className="flex gap-3 rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3b53f]/18 text-[#ffd98a]">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <p className="text-sm leading-6 text-slate-200">{feature}</p>
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

      <section id="operacao" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7c5cff]">Visão da operação</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              Mais clareza do que entra, do que está em execução e do que ainda precisa virar caixa.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Quando o fluxo fica centralizado, a empresa consegue agir antes do atraso, da falta de material ou da cobrança esquecida.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { value: "4 áreas", label: "Comercial, produção, estoque e financeiro" },
                { value: "1 base", label: "Menos planilhas, mensagens e retrabalho" },
                { value: "Tempo real", label: "Prioridades e gargalos mais visíveis" },
                { value: "Mais contexto", label: "Decisão com informação da rotina" },
              ].map((item) => (
                <Card key={item.value} className="rounded-[1.5rem] border-slate-200 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
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
              <Card key={item.title} className="rounded-[1.5rem] border-slate-200 bg-[linear-gradient(135deg,#eef7ff_0%,#ffffff_50%,#f7f4ff_100%)] shadow-[0_18px_44px_rgba(15,23,42,0.06)]">
                <CardHeader className="pb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#071826] text-white">
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

      <section className="bg-[#f5f7fb] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[#143047] bg-[linear-gradient(135deg,#071826_0%,#0b2235_60%,#0d1622_100%)] shadow-[0_30px_80px_rgba(6,18,29,0.28)]">
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
            <div className="p-8 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#19d88f]">Mobilidade</p>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
                Sua empresa na palma da mão.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-300">
                Como a operação é 100% web, você acompanha pedidos, prioridades, materiais e recebimentos sem ficar preso ao escritório.
              </p>

              <div className="mt-6 space-y-3">
                {mobileHighlights.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#19d88f]" />
                    <p className="text-sm leading-7 text-slate-200">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button className="h-11 rounded-full bg-[#19d88f] px-6 text-[#072235] hover:bg-[#16c17f]" onClick={() => navigate("/register")}>
                  Criar conta
                </Button>
                <Button variant="outline" className="h-11 rounded-full border-white/12 bg-white/6 px-6 text-white hover:bg-white/10 hover:text-white" onClick={() => navigate("/login")}>
                  Acessar agora
                </Button>
              </div>
            </div>

            <div className="relative min-h-[360px] bg-[radial-gradient(circle_at_top,rgba(124,92,255,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]">
              <div className="absolute left-8 top-10 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-200 backdrop-blur">
                Prioridades do dia
              </div>

              <div className="absolute bottom-10 right-8 h-[300px] w-[170px] rounded-[2rem] border border-white/10 bg-[#08111c] p-3 shadow-[0_28px_60px_rgba(0,0,0,0.45)]">
                <div className="mx-auto mt-1 h-1.5 w-16 rounded-full bg-white/12" />
                <div className="mt-5 rounded-[1.5rem] bg-[linear-gradient(180deg,#0f2337_0%,#09131f_100%)] p-3">
                  <div className="rounded-2xl bg-[#19d88f]/16 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8df3c8]">Produção</p>
                    <p className="mt-2 text-sm font-bold text-white">Pedido 184 em execução</p>
                  </div>
                  <div className="mt-3 space-y-3">
                    {[
                      ["Estoque", "bg-[#f3b53f]"],
                      ["Comercial", "bg-[#7c5cff]"],
                      ["Financeiro", "bg-[#19d88f]"],
                    ].map(([label, color]) => (
                      <div key={label} className="rounded-xl border border-white/8 bg-white/6 p-3">
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>{label}</span>
                          <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                          <div className={`h-full rounded-full ${color}`} style={{ width: "72%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute left-12 top-28 w-52 rounded-[1.6rem] border border-white/10 bg-[#10243a] p-4 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b7a5ff]">Comercial</p>
                <p className="mt-2 text-sm font-bold text-white">3 propostas aguardando retorno</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="diferenciais" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#7c5cff]">Por que escolher</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
              Detalhes que fazem a <span className="text-[#7c5cff]">diferença</span> na rotina da metalúrgica
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              O foco não é só organizar tela. É dar visibilidade operacional para a empresa trabalhar com menos retrabalho e mais controle.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {differenceCards.map((card, index) => (
              <Card key={card.title} className={`rounded-[1.7rem] border-slate-200 shadow-[0_18px_44px_rgba(15,23,42,0.05)] ${index % 2 === 0 ? "bg-white" : "bg-[#fbfbff]"}`}>
                <CardHeader className="pb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    index === 0
                      ? "bg-[#19d88f]/12 text-[#19d88f]"
                      : index === 1
                        ? "bg-[#f3b53f]/12 text-[#c98916]"
                        : index === 2
                          ? "bg-[#7c5cff]/12 text-[#7c5cff]"
                          : "bg-slate-100 text-slate-800"
                  }`}>
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
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#153049] bg-[linear-gradient(135deg,#06121d_0%,#0a2133_60%,#07111a_100%)] px-6 py-12 shadow-[0_30px_80px_rgba(6,18,29,0.3)] sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f3b53f]">Comece hoje</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Se a desorganização já está pesando em prazo, entrega e caixa, este é o momento de estruturar a operação.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Coloque comercial, produção, estoque e financeiro no mesmo fluxo e acompanhe a rotina com mais previsibilidade.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 lg:mt-0 lg:min-w-[250px]">
            <Button
              className="h-12 rounded-full bg-[#19d88f] text-base text-[#072235] hover:bg-[#16c17f]"
              onClick={() => navigate("/register")}
            >
              Criar minha conta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-full border-white/12 bg-white/6 text-base text-white hover:bg-white/10 hover:text-white"
              onClick={() => navigate("/login")}
            >
              Entrar no sistema
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-[#071826] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 border-b border-white/10 pb-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Factory className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-black tracking-[0.18em] text-white">METALGEST</p>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">gestão para metalúrgicas</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                Plataforma para organizar comercial, produção, estoque e financeiro em uma rotina mais previsível para a metalúrgica.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {[
                ["Produto", ["Comercial", "Produção", "Estoque", "Financeiro"]],
                ["Fluxos", ["Orçamentos", "Pedidos", "Execução", "Recebimentos"]],
                ["Acesso", ["Criar conta", "Entrar", "Sistema web", "Landing page"]],
              ].map(([title, links]) => (
                <div key={title}>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#19d88f]">{title}</p>
                  <div className="mt-4 space-y-3">
                    {links.map((link) => (
                      <div key={link} className="text-sm text-slate-300">{link}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 text-sm text-slate-400">© 2026 MetalGest. Sistema web para rotina de metalúrgicas.</div>
        </div>
      </footer>
    </div>
  )
}

export default Home
