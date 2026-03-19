import React from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "../components/ui/button"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Factory,
  FileText,
  Gauge,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react"

const primaryBenefits = [
  {
    icon: FileText,
    title: "Venda com mais seguranca",
    description:
      "Monte orcamentos com mais clareza, acompanhe propostas enviadas e saiba exatamente o que falta para fechar cada pedido.",
  },
  {
    icon: Wrench,
    title: "Organize a producao sem improviso",
    description:
      "Visualize o que entrou, o que esta em andamento e o que precisa de prioridade para reduzir atraso, retrabalho e desencontro entre equipe e escritorio.",
  },
  {
    icon: Wallet,
    title: "Enxergue melhor o dinheiro da operacao",
    description:
      "Acompanhe entradas, despesas, cobrancas pendentes e a saude financeira da empresa sem depender de planilhas espalhadas.",
  },
]

const practicalOutcomes = [
  {
    icon: Users,
    title: "Historico de cada cliente em um so lugar",
    description: "Saiba o que foi pedido, orcado, aprovado e entregue sem perder contexto.",
  },
  {
    icon: Clock3,
    title: "Prazos mais visiveis para toda a equipe",
    description: "Fica mais facil priorizar o que e urgente e evitar promessas que nao cabem na rotina.",
  },
  {
    icon: Package,
    title: "Menos surpresa com material faltando",
    description: "Acompanhe estoque, itens utilizados e necessidades de reposicao com mais antecedencia.",
  },
  {
    icon: BarChart3,
    title: "Decisao mais rapida no dia a dia",
    description: "Quem gerencia a empresa passa a decidir olhando o que realmente esta acontecendo.",
  },
  {
    icon: Truck,
    title: "Entrega e recebimento com mais controle",
    description: "Voce acompanha o pedido ate a finalizacao e cobra no momento certo.",
  },
  {
    icon: ShieldCheck,
    title: "Mais confianca para crescer",
    description: "Quando a operacao fica organizada, vender mais deixa de ser um risco e vira uma oportunidade real.",
  },
]

const workflowSteps = [
  {
    step: "01",
    title: "Receba e organize o pedido",
    description:
      "Centralize informacoes do cliente, detalhes do servico e necessidades do pedido desde o primeiro contato.",
  },
  {
    step: "02",
    title: "Envie o orcamento com mais agilidade",
    description:
      "Monte a proposta, acompanhe o retorno e saiba o que precisa de follow-up para nao perder venda por falta de processo.",
  },
  {
    step: "03",
    title: "Transforme aprovacao em execucao",
    description:
      "Depois do aceite, o trabalho segue com mais clareza para producao, estoque e acompanhamento interno.",
  },
  {
    step: "04",
    title: "Feche o ciclo com entrega e cobranca",
    description:
      "Veja o andamento do servico, conclua o pedido e acompanhe recebimentos sem perder prazos nem margem.",
  },
]

const faqs = [
  {
    question: "Serve para metalurgicas pequenas e em crescimento?",
    answer:
      "Sim. A proposta e justamente ajudar empresas que precisam sair do controle no improviso e ganhar organizacao para crescer com mais seguranca.",
  },
  {
    question: "Consigo acompanhar comercial, producao e financeiro no mesmo lugar?",
    answer:
      "Essa e a ideia. O sistema foi pensado para ligar o que foi prometido ao cliente, o que esta sendo produzido e o que ainda falta receber.",
  },
  {
    question: "Ajuda mesmo no acompanhamento dos orcamentos?",
    answer:
      "Ajuda porque voce passa a ter visibilidade do que foi enviado, do que esta pendente e de quais oportunidades precisam de retorno.",
  },
  {
    question: "Preciso mudar toda a rotina da empresa de uma vez?",
    answer:
      "Nao. Voce pode comecar organizando os pontos que mais pesam hoje e evoluir a rotina com mais clareza, sem criar uma mudanca brusca para a equipe.",
  },
]

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-[#1f1a17]">
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(217,119,6,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(120,113,108,0.18),_transparent_24%),linear-gradient(135deg,#201a17_0%,#2b211b_40%,#f6f1e8_40%,#f6f1e8_100%)]">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5b041] text-[#261a0f] shadow-[0_12px_30px_rgba(245,176,65,0.35)]">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-black uppercase tracking-[0.24em] text-white">
                MetalGest
              </div>
              <div className="text-xs uppercase tracking-[0.24em] text-white/60">
                gestao para metalurgicas
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium text-white/75 lg:flex">
            <a href="#beneficios" className="transition hover:text-white">
              Beneficios
            </a>
            <a href="#rotina" className="transition hover:text-white">
              Rotina
            </a>
            <a href="#faq" className="transition hover:text-white">
              Perguntas
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/login")}
              variant="ghost"
              className="hidden rounded-full px-5 text-white hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              Entrar
            </Button>
            <Button
              onClick={() => navigate("/register")}
              className="rounded-full bg-[#f5b041] px-5 text-[#2b1a0e] hover:bg-[#f8bf5b]"
            >
              Comecar agora
            </Button>
          </div>
        </header>

        <section className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 pb-24 pt-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-32 lg:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#f5b041]" />
              Menos planilha, menos correria, mais controle da operacao
            </div>

            <h1 className="mt-8 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Mais clareza para vender, produzir e receber sem tocar a metalurgica no improviso.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
              O MetalGest ajuda sua empresa a organizar orcamentos, pedidos, producao,
              estoque e financeiro em um fluxo mais claro. Voce passa a enxergar o que
              esta parado, o que precisa de prioridade e o que ainda falta cobrar.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button
                onClick={() => navigate("/register")}
                className="h-14 rounded-full bg-[#f5b041] px-8 text-base font-semibold text-[#2b1a0e] hover:bg-[#f8bf5b]"
              >
                Criar conta e organizar a operacao
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="h-14 rounded-full border-white/25 bg-white/5 px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
              >
                Ja tenho acesso
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 text-sm">
              {[
                "Orcamentos organizados",
                "Producao acompanhada",
                "Estoque visivel",
                "Financeiro no radar",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-white/85 backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:justify-self-end"
          >
            <div className="rounded-[2rem] border border-white/12 bg-[#13100e]/88 p-5 shadow-[0_30px_80px_rgba(14,10,7,0.45)] backdrop-blur-xl sm:p-6">
              <div className="rounded-[1.6rem] border border-white/10 bg-[#221a16] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.22em] text-[#f5b041]">
                      Sua rotina com mais visibilidade
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                      O que precisa da sua atencao hoje
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-white/8 p-3 text-[#f5b041]">
                    <Gauge className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {[
                    {
                      title: "Comercial",
                      description: "Veja quais orcamentos estao aguardando retorno e quais clientes precisam de contato.",
                    },
                    {
                      title: "Producao",
                      description: "Enxergue o que esta em andamento, o que travou e o que precisa entrar primeiro.",
                    },
                    {
                      title: "Estoque",
                      description: "Saiba com antecedencia quando algum material comeca a comprometer prazo e entrega.",
                    },
                    {
                      title: "Financeiro",
                      description: "Acompanhe recebimentos, despesas e pendencias sem perder o pulso do caixa.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/8 bg-white/5 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-base font-semibold text-white">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-white/68">
                            {item.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 text-[#f5b041]" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-[#f5b041] px-4 py-4 text-[#2c1c10]">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em]">
                    Resultado esperado
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    Menos retrabalho, menos informacao perdida e muito mais clareza para
                    tocar a metalurgica com seguranca.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      <main className="relative">
        <section
          id="beneficios"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#b96d17]">
              O valor no dia a dia
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-[#1f1a17] sm:text-4xl">
              Nao e sobre ter mais uma tela. E sobre fazer sua metalurgica funcionar melhor todos os dias.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#5a4b43]">
              Quando tudo fica espalhado entre WhatsApp, caderno, memoria e planilha,
              a empresa perde tempo, prazo e margem. O MetalGest junta o que importa
              para voce acompanhar a operacao com muito mais firmeza.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {primaryBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-[1.75rem] border border-[#e3d8ca] bg-white p-7 shadow-[0_20px_40px_rgba(41,28,18,0.08)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3e2cb] text-[#b96d17]">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-[#201915]">
                  {benefit.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-[#5f5047]">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="rotina" className="bg-[#efe4d5]">
          <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#b96d17]">
                O que muda na pratica
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-[#1f1a17] sm:text-4xl">
                Sua equipe trabalha melhor quando cada etapa do servico deixa de depender da memoria de alguem.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#5c4d45]">
                A proposta e tirar peso da rotina. Em vez de procurar informacao,
                apagar incendio e descobrir problema tarde demais, voce ganha uma
                visao mais clara do que foi combinado, do que esta sendo feito e do
                que precisa virar dinheiro no caixa.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Atendimento mais organizado desde o primeiro contato",
                  "Mais clareza para priorizar servicos e entregas",
                  "Visao melhor do que esta parado ou atrasado",
                  "Controle maior sobre cobranca, recebimento e margem",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#b96d17]" />
                    <p className="text-base leading-7 text-[#332923]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {practicalOutcomes.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="rounded-[1.5rem] border border-white/50 bg-white/80 p-5 shadow-[0_12px_30px_rgba(51,37,25,0.08)] backdrop-blur"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2a221d] text-[#f5b041]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#201915]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#5c4d45]">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex max-w-3xl flex-col gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#b96d17]">
              Do pedido ao recebimento
            </p>
            <h2 className="text-3xl font-black leading-tight text-[#1f1a17] sm:text-4xl">
              Um fluxo mais claro para quem vende, para quem produz e para quem precisa cobrar.
            </h2>
            <p className="text-lg leading-8 text-[#5d4f46]">
              O sistema conversa com a rotina real da metalurgica: entra pedido,
              vira orcamento, segue para execucao, passa por entrega e precisa ser
              recebido. Quanto mais claro esse caminho, melhor a empresa responde.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-4">
            {workflowSteps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="rounded-[1.75rem] border border-[#e5d9ca] bg-[#fffdf9] p-6"
              >
                <div className="text-sm font-black uppercase tracking-[0.28em] text-[#b96d17]">
                  {item.step}
                </div>
                <h3 className="mt-5 text-xl font-bold text-[#231c18]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#615249]">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-[#211813]">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f5b041]">
                Feito para decisao
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
                Quando a operacao fica visivel, o dono da metalurgica decide com mais calma e mais base.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/72">
                Em vez de descobrir o problema quando o cliente cobra, quando o material acaba
                ou quando o dinheiro aperta, voce passa a acompanhar a empresa por sinais mais claros.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Para quem vende",
                  text: "Mais facilidade para montar propostas e nao deixar orcamentos esfriarem sem retorno.",
                },
                {
                  title: "Para quem coordena a producao",
                  text: "Mais visibilidade sobre prioridades, andamento dos servicos e pontos de gargalo.",
                },
                {
                  title: "Para o administrativo",
                  text: "Mais organizacao de clientes, pedidos, entregas e cobrancas com menos retrabalho.",
                },
                {
                  title: "Para quem lidera a empresa",
                  text: "Mais seguranca para entender a operacao, proteger margem e crescer sem perder controle.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur"
                >
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/68">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#b96d17]">
              Perguntas frequentes
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-[#1f1a17] sm:text-4xl">
              Uma conversa direta com a realidade de quem precisa organizar a metalurgica.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {faqs.map((item, index) => (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="rounded-[1.5rem] border border-[#e5d8c8] bg-white p-6 shadow-[0_12px_30px_rgba(41,29,18,0.05)]"
              >
                <h3 className="text-lg font-bold text-[#211914]">{item.question}</h3>
                <p className="mt-4 text-sm leading-7 text-[#62534a]">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-[2.25rem] bg-[linear-gradient(135deg,#1f1713_0%,#31241c_60%,#4a2f16_100%)] px-6 py-12 text-white shadow-[0_30px_80px_rgba(33,24,19,0.28)] sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f5b041]">
                Hora de sair do improviso
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
                Se a sua metalurgica ja sente o peso da desorganizacao, este e o momento de ganhar mais controle.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/72">
                Traga para um fluxo mais claro o que hoje esta espalhado entre atendimento,
                producao, estoque e financeiro. Menos perda de informacao. Mais previsibilidade.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 lg:mt-0 lg:min-w-[260px]">
              <Button
                onClick={() => navigate("/register")}
                className="h-14 rounded-full bg-[#f5b041] text-base font-semibold text-[#2b1a0e] hover:bg-[#f8bf5b]"
              >
                Criar minha conta
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="h-14 rounded-full border-white/20 bg-transparent text-base font-semibold text-white hover:bg-white/10 hover:text-white"
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
