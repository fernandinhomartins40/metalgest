import React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, BarChart3, CheckCircle2, Clock3, Factory, FileText, Package, ShieldCheck, Truck, Users, Wallet, Wrench } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"

const heroFloatingCards = [
  {
    title: "Comercial",
    value: "Orçamentos no radar",
    icon: FileText,
    positionClassName: "left-0 top-2 w-[248px]",
    cardClassName:
      "bg-[linear-gradient(135deg,rgba(70,90,218,0.72)_0%,rgba(49,63,162,0.84)_100%)]",
    iconAccentClassName: "bg-[#22d3a6]/14 text-[#22d3a6]",
    animationName: "heroFloatUp",
    animationDuration: "7.2s",
    animationDelay: "0s",
  },
  {
    title: "Estoque",
    value: "Materiais disponíveis",
    icon: Package,
    positionClassName: "right-4 top-20 w-[248px]",
    cardClassName:
      "bg-[linear-gradient(135deg,rgba(164,146,255,0.58)_0%,rgba(89,81,232,0.86)_100%)]",
    iconAccentClassName: "bg-[#8b7dff]/14 text-[#8b7dff]",
    animationName: "heroFloatDown",
    animationDuration: "8s",
    animationDelay: "0.6s",
  },
  {
    title: "Produção",
    value: "Pedido 184 em execução",
    icon: Wrench,
    positionClassName: "left-8 top-52 w-[272px]",
    cardClassName:
      "bg-[linear-gradient(135deg,rgba(171,198,255,0.82)_0%,rgba(107,146,248,0.92)_100%)]",
    iconAccentClassName: "bg-[#90b3ff]/14 text-[#90b3ff]",
    animationName: "heroFloatUp",
    animationDuration: "7.8s",
    animationDelay: "1.2s",
  },
  {
    title: "Financeiro",
    value: "Recebimentos do dia",
    icon: Wallet,
    positionClassName: "right-10 top-[18.75rem] w-[248px]",
    cardClassName:
      "bg-[linear-gradient(135deg,rgba(121,139,222,0.48)_0%,rgba(86,101,197,0.74)_100%)]",
    iconAccentClassName: "bg-[#f3b53f]/14 text-[#f3b53f]",
    animationName: "heroFloatDown",
    animationDuration: "8.4s",
    animationDelay: "0.9s",
  },
  {
    title: "Relatórios",
    value: "Indicadores ao vivo",
    icon: BarChart3,
    positionClassName: "left-36 bottom-8 w-[248px]",
    cardClassName:
      "bg-[linear-gradient(135deg,rgba(119,137,217,0.44)_0%,rgba(85,98,190,0.72)_100%)]",
    iconAccentClassName: "bg-white/12 text-slate-200",
    animationName: "heroFloatUp",
    animationDuration: "7.6s",
    animationDelay: "1.5s",
  },
]

const segmentCards = [
  {
    icon: Wrench,
    title: "Serralherias",
    description: "Pedidos sob medida com mais organização.",
    accentClassName: "bg-[#19d88f]/12 text-[#19d88f]",
  },
  {
    icon: Factory,
    title: "Usinagem",
    description: "Ordens, materiais e prazos sob controle.",
    accentClassName: "bg-[#7c5cff]/12 text-[#7c5cff]",
  },
  {
    icon: Package,
    title: "Estruturas metálicas",
    description: "Etapas, materiais e obra no mesmo fluxo.",
    accentClassName: "bg-[#f3b53f]/12 text-[#c98916]",
  },
  {
    icon: FileText,
    title: "Fabricação sob encomenda",
    description: "Do pedido à execução sem perder contexto.",
    accentClassName: "bg-[#7c5cff]/12 text-[#7c5cff]",
  },
  {
    icon: Truck,
    title: "Montagem e entrega",
    description: "Saída, instalação e pendências acompanhadas.",
    accentClassName: "bg-[#19d88f]/12 text-[#19d88f]",
  },
  {
    icon: Wallet,
    title: "Operação administrativa",
    description: "Proposta, faturamento e recebimento conectados.",
    accentClassName: "bg-[#f3b53f]/12 text-[#c98916]",
  },
]

const moduleTabs = {
  comercial: {
    label: "Comercial",
    title: "Propostas e clientes acompanhados sem planilha paralela",
    description: "Tudo o que o comercial precisa para não perder retorno nem contexto.",
    features: [
      "Orçamentos e propostas com histórico",
      "Acompanhamento de negociação",
      "Conversão do pedido para execução",
      "Registro do combinado com o cliente",
    ],
  },
  producao: {
    label: "Produção",
    title: "Ordens claras para a fábrica trabalhar com prioridade",
    description: "A equipe recebe o que precisa produzir com menos improviso.",
    features: [
      "Ordens de produção organizadas",
      "Priorização de serviços e pedidos",
      "Informações técnicas centralizadas",
      "Visibilidade do que trava o prazo",
    ],
  },
  estoque: {
    label: "Estoque",
    title: "Materiais sob controle antes de virarem urgência",
    description: "O estoque entra no planejamento em vez de virar surpresa.",
    features: [
      "Cadastro de materiais e itens",
      "Controle de entradas e saídas",
      "Visão do consumo por pedido ou serviço",
      "Reposição com mais previsibilidade",
    ],
  },
  financeiro: {
    label: "Financeiro",
    title: "Caixa, despesas e recebimentos no momento certo",
    description: "O financeiro acompanha o que entrou, o que falta e o que já virou faturamento.",
    features: [
      "Contas a pagar e a receber",
      "Fluxo financeiro mais claro",
      "Acompanhamento de cobranças",
      "Visão do que já virou faturamento",
    ],
  },
  relatorios: {
    label: "Relatórios",
    title: "Indicadores para decidir sem consolidar tudo na mão",
    description: "A operação passa a gerar leitura de negócio com mais rapidez.",
    features: [
      "Dashboards operacionais",
      "Indicadores de andamento dos pedidos",
      "Visão de gargalos da rotina",
      "Resumo financeiro e comercial",
      "Acompanhamento de produtividade",
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
    title: "Receba o pedido",
    description: "Cliente, prazo e escopo registrados no início.",
  },
  {
    icon: Wrench,
    title: "Envie para produção",
    description: "A fábrica recebe a demanda com prioridade definida.",
  },
  {
    icon: Package,
    title: "Controle materiais",
    description: "Consumo e pendências entram no radar antes da entrega.",
  },
  {
    icon: Wallet,
    title: "Receba com clareza",
    description: "Faturamento e recebimento conectados ao pedido.",
  },
]

const mobileHighlights = [
  "Acesse pedidos e prioridades em qualquer lugar",
  "Consulte materiais e recebimentos sem depender do escritório",
  "Use a mesma base da equipe inteira",
]

const mobilityFloatingCards = [
  {
    title: "Comercial",
    value: "3 retornos pendentes",
    icon: FileText,
    positionClassName: "left-0 top-6 w-[250px]",
    cardClassName:
      "bg-[linear-gradient(135deg,rgba(81,101,220,0.72)_0%,rgba(50,65,167,0.84)_100%)]",
    iconAccentClassName: "bg-[#8b7dff]/14 text-[#8b7dff]",
    animationName: "heroFloatUp",
    animationDuration: "7.4s",
    animationDelay: "0.2s",
  },
  {
    title: "Produção",
    value: "Pedido 184 em execução",
    icon: Wrench,
    positionClassName: "right-0 top-16 w-[268px]",
    cardClassName:
      "bg-[linear-gradient(135deg,rgba(80,99,221,0.72)_0%,rgba(48,63,165,0.84)_100%)]",
    iconAccentClassName: "bg-[#22d3a6]/14 text-[#22d3a6]",
    animationName: "heroFloatDown",
    animationDuration: "8s",
    animationDelay: "0.7s",
  },
  {
    title: "Estoque",
    value: "Materiais no radar",
    icon: Package,
    positionClassName: "left-12 bottom-10 w-[238px]",
    cardClassName:
      "bg-[linear-gradient(135deg,rgba(171,198,255,0.82)_0%,rgba(107,146,248,0.9)_100%)]",
    iconAccentClassName: "bg-[#8b7dff]/14 text-[#8b7dff]",
    animationName: "heroFloatDown",
    animationDuration: "7.6s",
    animationDelay: "0.4s",
  },
  {
    title: "Financeiro",
    value: "Recebimentos do dia",
    icon: Wallet,
    positionClassName: "right-2 bottom-2 w-[258px]",
    cardClassName:
      "bg-[linear-gradient(135deg,rgba(119,137,217,0.54)_0%,rgba(85,98,190,0.76)_100%)]",
    iconAccentClassName: "bg-[#f3b53f]/14 text-[#f3b53f]",
    animationName: "heroFloatUp",
    animationDuration: "7.8s",
    animationDelay: "1.1s",
  },
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
      <style>{`
        @keyframes heroFloatUp {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -14px, 0); }
        }

        @keyframes heroFloatDown {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, 12px, 0); }
        }
      `}</style>
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
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-[13px] font-semibold tracking-[0.08em] text-slate-200">
              <span className="h-2.5 w-2.5 rounded-full bg-[#19d88f]" />
              ERP para metalúrgicas
            </div>
            <h1 className="mt-8 max-w-4xl text-[2.8rem] font-black leading-[0.98] tracking-tight text-white sm:text-[3.5rem] lg:text-[4.35rem]">
              Sistema completo
              <br />
              para sua metalúrgica
              <br />
              <span className="text-[#19d88f]">com mais</span>{" "}
              <span className="text-[#f3b53f]">controle.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl sm:leading-9">
              Do orçamento ao recebimento no mesmo sistema.
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

          </div>

          <div className="relative">
            <div className="absolute left-8 top-8 h-32 w-32 rounded-full bg-[#19d88f]/20 blur-3xl" />
            <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-[#7c5cff]/20 blur-3xl" />

            <div className="relative hidden min-h-[540px] lg:block">
              <div className="absolute left-12 top-12 h-[260px] w-[260px] rounded-full bg-[#7c5cff]/20 blur-[110px]" />
              <div className="absolute left-28 top-40 h-[240px] w-[240px] rounded-full bg-[#19d88f]/12 blur-[120px]" />
              <div className="absolute left-16 top-20 h-[340px] w-[438px] -rotate-[8deg] rounded-[2.8rem] bg-[linear-gradient(135deg,rgba(79,100,233,0.22)_0%,rgba(13,30,52,0.08)_100%)] shadow-[0_40px_90px_rgba(2,10,18,0.44)]" />
              <div className="absolute left-20 top-24 h-[332px] w-[430px] -rotate-[7deg] overflow-hidden rounded-[2.6rem] border border-white/12 bg-[linear-gradient(180deg,rgba(170,187,255,0.16)_0%,rgba(92,116,243,0.12)_28%,rgba(7,20,31,0.56)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_35px_70px_rgba(3,10,18,0.42)]">
                <div className="absolute inset-0 opacity-22 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />
                <div className="absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),transparent)]" />
                <div className="absolute left-8 top-10 h-4 w-48 rounded-full bg-white/16" />
                <div className="absolute left-8 top-24 h-[210px] w-[315px] rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03))]" />
                <div className="absolute right-9 top-24 h-[170px] w-[68px] rounded-[1.7rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))]" />
              </div>

              {heroFloatingCards.map((item) => (
                <div
                  key={item.title}
                  className={`absolute rounded-[1.6rem] border border-white/24 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_24px_44px_rgba(7,12,22,0.32)] backdrop-blur-xl ${item.cardClassName} ${item.positionClassName}`}
                  style={{
                    animationName: item.animationName,
                    animationDuration: item.animationDuration,
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDelay: item.animationDelay,
                    willChange: "transform",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconAccentClassName}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-200/80">{item.title}</p>
                      <p className="mt-2 text-[1.08rem] font-bold leading-tight text-white">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative grid gap-4 pt-4 sm:grid-cols-2 lg:hidden">
              {heroFloatingCards.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-[1.5rem] border border-white/14 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_24px_44px_rgba(7,12,22,0.24)] backdrop-blur-xl ${item.cardClassName}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.iconAccentClassName}`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300/80">{item.title}</p>
                      <p className="mt-2 text-base font-bold leading-6 text-white">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="solucoes" className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(124,92,255,0.12)_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl space-y-4 text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#7c5cff]">Soluções por rotina</p>
          <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-[3.15rem]">
            Sua metalúrgica não trabalha de forma genérica. <span className="text-[#7c5cff]">O sistema também não deveria.</span>
          </h2>
          <p className="text-lg leading-8 text-slate-600 sm:text-xl">
            Feito para operações que vivem de pedido, produção, material e prazo.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {segmentCards.map((card) => (
            <Card key={card.title} className="rounded-[1.75rem] border-slate-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_56px_rgba(15,23,42,0.1)]">
              <CardHeader className="space-y-4 pb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.accentClassName}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-[1.45rem] leading-tight tracking-tight">{card.title}</CardTitle>
                <CardDescription className="text-base leading-7">{card.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        </div>
      </section>

      <section id="funcionalidades" className="bg-[#f5f7fb] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#143047] bg-[linear-gradient(180deg,#081827_0%,#0b2235_100%)] p-6 shadow-[0_30px_80px_rgba(6,18,29,0.28)] sm:p-8 lg:p-10">
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#19d88f]">Funcionalidades</p>
            <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-[3.05rem]">
              Tudo que a operação precisa em um só lugar
            </h2>
            <p className="text-lg leading-8 text-slate-300 sm:text-xl">
              Comercial, produção, estoque, financeiro e indicadores na mesma rotina.
            </p>
          </div>

          <Tabs defaultValue="comercial" className="mt-12">
            <TabsList className="h-auto flex-wrap justify-center gap-2 rounded-full bg-white/6 p-2">
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
                  <CardHeader className="space-y-4">
                    <CardTitle className="text-[2rem] leading-tight tracking-tight text-white sm:text-[2.2rem]">{item.title}</CardTitle>
                    <CardDescription className="text-base leading-7 text-slate-300 sm:text-lg">{item.description}</CardDescription>
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
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#7c5cff]">Fluxo da rotina</p>
            <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-[3.05rem]">
              Do orçamento ao recebimento em uma sequência clara.
            </h2>
            <p className="text-lg leading-8 text-slate-600 sm:text-xl">
              O MetalGest conecta pedido, produção, estoque e financeiro sem retrabalho desnecessário.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflowCards.map((item) => (
              <Card key={item.title} className="rounded-[1.5rem] border-slate-200 bg-[linear-gradient(135deg,#eef7ff_0%,#ffffff_52%,#f7f4ff_100%)] shadow-[0_18px_44px_rgba(15,23,42,0.06)]">
                <CardHeader className="space-y-4 pb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071826] text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-[1.32rem] leading-tight tracking-tight">{item.title}</CardTitle>
                  <CardDescription className="text-base leading-7">{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5f7fb] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-[#143047] bg-[linear-gradient(135deg,#071826_0%,#0b2235_60%,#0d1622_100%)] shadow-[0_30px_80px_rgba(6,18,29,0.28)]">
          <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="p-8 sm:p-10">
              <div className="mx-auto max-w-2xl space-y-4 text-center">
                <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#19d88f]">Mobilidade</p>
                <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-[3.05rem]">
                  Sua empresa na palma da mão.
                </h2>
                <p className="text-lg leading-8 text-slate-300 sm:text-xl">
                  Acompanhe pedidos, materiais e recebimentos sem depender do computador da empresa.
                </p>
              </div>

              <div className="mx-auto mt-6 max-w-xl space-y-3">
                {mobileHighlights.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#19d88f]" />
                    <p className="text-base leading-7 text-slate-200">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button className="h-11 rounded-full bg-[#19d88f] px-6 text-[#072235] hover:bg-[#16c17f]" onClick={() => navigate("/register")}>
                  Criar conta
                </Button>
                <Button variant="outline" className="h-11 rounded-full border-white/12 bg-white/6 px-6 text-white hover:bg-white/10 hover:text-white" onClick={() => navigate("/login")}>
                  Acessar agora
                </Button>
              </div>
            </div>

            <div className="relative min-h-[360px] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(124,92,255,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
              <div className="relative mx-auto hidden h-full min-h-[308px] max-w-[560px] lg:block">
                {mobilityFloatingCards.map((item) => (
                  <div
                    key={item.title}
                    className={`absolute rounded-[1.6rem] border border-white/20 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_24px_44px_rgba(7,12,22,0.32)] backdrop-blur-xl ${item.cardClassName} ${item.positionClassName}`}
                    style={{
                      animationName: item.animationName,
                      animationDuration: item.animationDuration,
                      animationTimingFunction: "ease-in-out",
                      animationIterationCount: "infinite",
                      animationDelay: item.animationDelay,
                      willChange: "transform",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconAccentClassName}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300/80">{item.title}</p>
                        <p className="mt-2 text-[1.1rem] font-bold leading-tight text-white">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:hidden">
                {mobilityFloatingCards.map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-[1.5rem] border border-white/16 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_24px_44px_rgba(7,12,22,0.24)] backdrop-blur-xl ${item.cardClassName}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.iconAccentClassName}`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300/80">{item.title}</p>
                        <p className="mt-2 text-base font-bold leading-6 text-white">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="diferenciais" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#7c5cff]">Por que escolher</p>
            <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-[3.05rem]">
              Detalhes que fazem a <span className="text-[#7c5cff]">diferença</span> na rotina da metalúrgica
            </h2>
            <p className="text-lg leading-8 text-slate-600 sm:text-xl">
              Menos retrabalho, mais alinhamento e mais clareza na operação.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {differenceCards.map((card, index) => (
              <Card key={card.title} className={`rounded-[1.7rem] border-slate-200 shadow-[0_18px_44px_rgba(15,23,42,0.05)] ${index % 2 === 0 ? "bg-white" : "bg-[#fbfbff]"}`}>
                <CardHeader className="space-y-4 pb-4">
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
                  <CardTitle className="text-[1.4rem] leading-tight tracking-tight">{card.title}</CardTitle>
                  <CardDescription className="text-base leading-7">{card.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-[#153049] bg-[linear-gradient(135deg,#06121d_0%,#0a2133_60%,#07111a_100%)] px-6 py-12 text-center shadow-[0_30px_80px_rgba(6,18,29,0.3)] sm:px-10">
          <div className="mx-auto max-w-4xl space-y-4">
            <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#f3b53f]">Comece hoje</p>
            <h2 className="mx-auto max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-[3.05rem]">
              Se a desorganização já está pesando em prazo, entrega e caixa, este é o momento de estruturar a operação.
            </h2>
            <p className="text-lg leading-8 text-slate-300 sm:text-xl">
              Coloque comercial, produção, estoque e financeiro no mesmo fluxo.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:items-center">
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
