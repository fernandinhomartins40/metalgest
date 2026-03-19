import React from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "../components/ui/button"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Factory,
  FileText,
  Package,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react"

const valueCards = [
  {
    icon: FileText,
    title: "Orcamentos com mais controle",
    description:
      "Veja o que foi enviado, o que esta em negociacao e o que precisa de retorno para nao perder venda por falta de acompanhamento.",
  },
  {
    icon: Wrench,
    title: "Producao menos no improviso",
    description:
      "Organize pedidos, prioridades e execucao para reduzir atraso, retrabalho e desencontro entre escritorio e fabrica.",
  },
  {
    icon: Package,
    title: "Estoque mais previsivel",
    description:
      "Acompanhe materiais, reposicao e itens usados nos servicos para evitar surpresa no meio da entrega.",
  },
  {
    icon: Wallet,
    title: "Financeiro mais claro",
    description:
      "Saiba o que entrou, o que falta receber e onde a operacao esta consumindo margem sem depender de planilhas espalhadas.",
  },
]

const processSteps = [
  {
    step: "01",
    title: "Receba o pedido com contexto",
    description:
      "Cliente, necessidade, prazo e detalhes do servico ficam reunidos desde o primeiro contato.",
  },
  {
    step: "02",
    title: "Envie e acompanhe o orcamento",
    description:
      "A proposta deixa de sumir no meio da rotina e passa a ter acompanhamento real ate a decisao do cliente.",
  },
  {
    step: "03",
    title: "Transforme venda em execucao",
    description:
      "Depois da aprovacao, a equipe enxerga o que precisa ser produzido, separado e entregue.",
  },
  {
    step: "04",
    title: "Feche com entrega e recebimento",
    description:
      "Voce acompanha a conclusao do pedido e cobra no momento certo, com menos atraso e menos esquecimento.",
  },
]

const roleCards = [
  {
    icon: Users,
    title: "Para quem vende",
    description:
      "Mais clareza para montar propostas, acompanhar retorno e nao deixar oportunidade esfriar.",
  },
  {
    icon: Clock3,
    title: "Para quem coordena",
    description:
      "Mais visibilidade sobre prioridade, carga de trabalho e o que esta travando a operacao.",
  },
  {
    icon: Truck,
    title: "Para quem entrega",
    description:
      "Mais alinhamento entre prazo prometido, andamento do servico e finalizacao do pedido.",
  },
  {
    icon: BarChart3,
    title: "Para quem decide",
    description:
      "Mais seguranca para entender o dia a dia da empresa e tomar decisao com base no que esta acontecendo.",
  },
]

const faqs = [
  {
    question: "Serve para metalurgica pequena ou media?",
    answer:
      "Sim. A proposta e justamente organizar a rotina de empresas que ja sentem o peso do crescimento, da desorganizacao e do excesso de informacao solta.",
  },
  {
    question: "Ajuda so no comercial?",
    answer:
      "Nao. O ganho aparece quando comercial, producao, estoque e financeiro passam a conversar melhor dentro da mesma rotina.",
  },
  {
    question: "Preciso mudar tudo de uma vez?",
    answer:
      "Nao. A empresa pode comecar pelos pontos que mais doem hoje e ir estruturando o resto com mais calma.",
  },
  {
    question: "Qual e o principal resultado no dia a dia?",
    answer:
      "Menos correria para procurar informacao, menos retrabalho, mais previsibilidade para vender, produzir e receber.",
  },
]

const quickSignals = [
  "Orcamentos em acompanhamento",
  "Pedidos em execucao",
  "Estoque mais visivel",
  "Recebimentos no radar",
]

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f3f5f7] text-slate-900">
      <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#e7edf2_0%,#f3f5f7_100%)]">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f2937] text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)]">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black tracking-[0.18em] text-slate-900">METALGEST</p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                gestao para metalurgicas
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
            <a href="#beneficios" className="transition hover:text-slate-900">
              Beneficios
            </a>
            <a href="#como-funciona" className="transition hover:text-slate-900">
              Rotina
            </a>
            <a href="#faq" className="transition hover:text-slate-900">
              Perguntas
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="hidden text-slate-700 hover:bg-white hover:text-slate-900 sm:inline-flex"
              onClick={() => navigate("/login")}
            >
              Entrar
            </Button>
            <Button
              className="rounded-full bg-[#c96e28] px-5 text-white hover:bg-[#b96121]"
              onClick={() => navigate("/register")}
            >
              Criar conta
            </Button>
          </div>
        </header>

        <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-24 lg:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-[#c96e28]" />
              Menos improviso para tocar a operacao
            </div>

            <h1 className="mt-7 text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Sua metalurgica com mais controle do orcamento ao recebimento.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              O MetalGest ajuda voce a organizar o que entra, o que esta em execucao,
              o que falta entregar e o que ainda precisa virar dinheiro no caixa.
              Sem depender de planilha espalhada, memoria da equipe ou correria de ultima hora.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button
                className="h-14 rounded-full bg-[#1f2937] px-8 text-base font-semibold text-white hover:bg-slate-800"
                onClick={() => navigate("/register")}
              >
                Comecar a organizar minha empresa
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="h-14 rounded-full border-slate-300 bg-white px-8 text-base font-semibold text-slate-800 hover:bg-slate-50"
                onClick={() => navigate("/login")}
              >
                Ja tenho acesso
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {quickSignals.map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c96e28]">
                    Visao da rotina
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    O que precisa da sua atencao
                  </h2>
                </div>
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-8 grid gap-4">
                {[
                  {
                    label: "Comercial",
                    text: "Propostas enviadas, pendencias de retorno e oportunidades que nao podem esfriar.",
                  },
                  {
                    label: "Producao",
                    text: "Pedidos em andamento, prioridades do dia e servicos que exigem acao imediata.",
                  },
                  {
                    label: "Estoque",
                    text: "Materiais que comecam a comprometer prazo e precisam entrar em reposicao.",
                  },
                  {
                    label: "Financeiro",
                    text: "Contas a receber, despesas e cobrancas que nao podem passar do ponto.",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-[#1f2937] px-5 py-5 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d8a06f]">
                  Resultado no dia a dia
                </p>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Menos retrabalho, menos informacao perdida e muito mais previsibilidade para a empresa crescer com seguranca.
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      <main>
        <section id="beneficios" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c96e28]">
              Onde a empresa ganha
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              O valor aparece quando a rotina deixa de depender do improviso.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              O objetivo nao e complicar a operacao. E dar visibilidade para o que
              hoje trava venda, prazo, entrega e recebimento.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {valueCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-[#c96e28]">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c96e28]">
                Como entra na rotina
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                Um fluxo mais claro para quem vende, produz, entrega e cobra.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                O MetalGest acompanha o caminho real do trabalho na metalurgica.
                Assim, a empresa para de descobrir problema tarde demais.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-4">
              {processSteps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                  className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafb] p-6"
                >
                  <p className="text-sm font-black uppercase tracking-[0.24em] text-[#c96e28]">
                    {item.step}
                  </p>
                  <h3 className="mt-5 text-xl font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c96e28]">
              Feito para quem usa
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              Cada area ganha mais clareza sem virar um sistema pesado para a equipe.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {roleCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.05)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 rounded-[1.8rem] border border-slate-200 bg-[#1f2937] px-6 py-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)] sm:px-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8a06f]">
                  O que muda de verdade
                </p>
                <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                  Mais controle para vender, produzir e receber sem apagar incendio o dia inteiro.
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {[
                  "Mais previsibilidade de prazo",
                  "Menos retrabalho interno",
                  "Mais clareza sobre o caixa",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/8 px-4 py-3">
                    <CheckCircle2 className="h-5 w-5 text-[#d8a06f]" />
                    <span className="text-sm text-white/82">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c96e28]">
                Perguntas frequentes
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                Uma apresentacao direta para a realidade da metalurgica.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {faqs.map((item, index) => (
                <motion.div
                  key={item.question}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafb] p-6"
                >
                  <h3 className="text-lg font-bold text-slate-900">{item.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#fff7ef_0%,#ffffff_52%,#eef2f6_100%)] px-6 py-12 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c96e28]">
                Hora de organizar a operacao
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                Se a desorganizacao ja pesa na venda, no prazo e no caixa, este e o momento de estruturar a empresa.
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Comece a acompanhar sua metalurgica com mais visibilidade e menos improviso.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 lg:mt-0 lg:min-w-[260px]">
              <Button
                className="h-14 rounded-full bg-[#c96e28] text-base font-semibold text-white hover:bg-[#b96121]"
                onClick={() => navigate("/register")}
              >
                Criar minha conta
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="h-14 rounded-full border-slate-300 bg-white text-base font-semibold text-slate-800 hover:bg-slate-50"
                onClick={() => navigate("/login")}
              >
                Entrar no sistema
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Home
