import Image from 'next/image'
import { AGENCY, MARCAS, MEDIDAS, SITE, whatsappLink } from '@/config/site'
import { Cotador } from '@/components/lp/Cotador'
import {
  BandaBorrachuda,
  BandaLisa,
  IconeCheck,
  IconeFacebook,
  IconeInstagram,
  IconeSeta,
  IconeZap,
} from '@/components/lp/icones'

// ─── Landing page da iAlves Pneus ──────────────────────────────────────────
// Página estática (sem banco de dados): carrega rápido em 4G na estrada e
// tudo leva para o WhatsApp da loja.

const FAQ = [
  {
    p: 'Os pneus são novos?',
    r: 'Sim. Trabalhamos com pneus novos para caminhão e ônibus, vendidos direto para o cliente final e para frotas.',
  },
  {
    p: 'Como faço a cotação?',
    r: 'Manda a medida do pneu no WhatsApp (ou uma foto da lateral do pneu) e a quantidade. Em poucos minutos você recebe o preço à vista e o que tem em estoque.',
  },
  {
    p: 'Não sei a medida do meu pneu. E agora?',
    r: 'Sem problema: tira uma foto da lateral do pneu, onde aparecem os números (ex.: 295/80 R22.5), e manda pra gente. A gente identifica e já te passa as opções.',
  },
  {
    p: 'Qual a diferença entre pneu liso e borrachudo?',
    r: 'O liso tem sulcos contínuos, roda mais macio e economiza no asfalto: vai no eixo direcional e nas carretas. O borrachudo tem blocos e mais aderência: vai no eixo de tração, onde o caminhão precisa de força pra sair e subir.',
  },
  {
    p: 'Vocês têm pronta entrega?',
    r: 'Sim, trabalhamos com pronta entrega, sujeita à disponibilidade do estoque. Na cotação você já fica sabendo o que tem disponível e combina a retirada ou a entrega.',
  },
  {
    p: 'Atendem frota?',
    r: 'Atendemos. Para compras em quantidade, chama no WhatsApp e fala quantos pneus e quais medidas: a gente monta uma proposta pra sua frota.',
  },
]

function jsonLd() {
  const negocio = {
    '@context': 'https://schema.org',
    '@type': 'TireShop',
    '@id': `${SITE.url}/#loja`,
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/lp/logo.webp`,
    image: `${SITE.url}/lp/og.jpg`,
    description:
      'Pneus novos para caminhão e ônibus, liso e borrachudo, com pronta entrega, preço à vista e cotação pelo WhatsApp.',
    telephone: `+${SITE.whatsapp}`,
    priceRange: '$$',
    currenciesAccepted: 'BRL',
    address: { '@type': 'PostalAddress', addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: 'BR' },
    areaServed: { '@type': 'State', name: 'São Paulo' },
    sameAs: [SITE.instagram, SITE.facebook],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: `+${SITE.whatsapp}`,
      contactType: 'sales',
      availableLanguage: 'Portuguese',
    },
    makesOffer: MEDIDAS.map((m) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Product', name: `Pneu ${m.medida}`, category: 'Pneus para caminhão' },
    })),
  }
  const perguntas = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: f.r } })),
  }
  const site = { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.url, inLanguage: 'pt-BR' }
  return JSON.stringify([negocio, perguntas, site]).replace(/</g, '\\u003c')
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[var(--vermelho)]">
      <span aria-hidden className="h-[2px] w-8 bg-[var(--vermelho)]" />
      {children}
    </p>
  )
}

function BotaoZap({ children, mensagem, className = '' }: { children: React.ReactNode; mensagem?: string; className?: string }) {
  return (
    <a
      href={whatsappLink(mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      className={`botao-zap inline-flex h-14 items-center justify-center gap-3 rounded-2xl px-7 text-base font-bold text-white ${className}`}
    >
      <IconeZap className="h-6 w-6" />
      {children}
    </a>
  )
}

export default function Home() {
  const fita = [...MEDIDAS.map((m) => m.medida), 'Liso', 'Borrachudo', 'Pronta entrega', 'Preço à vista']

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />

      {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-[#0A0A0B]/85 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#inicio" aria-label="iAlves Pneus, início" className="shrink-0">
            <Image src="/lp/logo.webp" alt="iAlves Pneus" width={560} height={239} priority className="h-10 w-auto sm:h-11" />
          </a>
          <nav aria-label="Seções" className="hidden items-center gap-7 text-sm font-semibold text-zinc-300 md:flex">
            <a href="#medidas" className="hover:text-white">Medidas</a>
            <a href="#liso-ou-borrachudo" className="hover:text-white">Liso ou borrachudo</a>
            <a href="#indicacao" className="hover:text-white">Indique e ganhe</a>
            <a href="#duvidas" className="hover:text-white">Dúvidas</a>
          </nav>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="botao-zap inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white"
          >
            <IconeZap className="h-5 w-5" />
            <span className="hidden sm:inline">Cotar no WhatsApp</span>
            <span className="sm:hidden">Cotar</span>
          </a>
        </div>
      </header>

      <main id="inicio" className="overflow-x-clip bg-[var(--fundo)] text-white">
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="relative isolate min-h-[100svh] pt-[68px]">
          <picture className="absolute inset-0 -z-10">
            <source media="(max-width: 767px)" srcSet="/lp/galpao-mobile.webp" />
            <img src="/lp/galpao.webp" alt="" fetchPriority="high" className="h-full w-full object-cover object-[65%_center] opacity-60 md:opacity-70" />
          </picture>
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/80 to-black/10" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[var(--fundo)] to-transparent" />

          <div className="mx-auto flex min-h-[calc(100svh-68px)] max-w-6xl flex-col justify-center px-4 py-14 sm:px-6">
            <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[var(--zap)] shadow-[0_0_10px_var(--zap)]" aria-hidden />
              Atendendo agora no WhatsApp
            </p>
            <h1 className="titulo max-w-3xl text-[3.1rem] sm:text-7xl lg:text-[5.6rem]">
              <span className="texto-cromado">Pneus para caminhão</span>
              <br />
              <span className="text-[var(--vermelho)]">com preço na mão</span>
              <br />
              <span className="texto-cromado">em 2 minutos.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300">
              Manda a medida no WhatsApp e recebe na hora o <strong className="text-white">preço à vista</strong> e o que tem em
              estoque. Pneus novos, liso e borrachudo, sem cadastro e sem enrolação.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <BotaoZap>Quero minha cotação</BotaoZap>
              <a
                href="#cotacao"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 text-base font-bold text-white backdrop-blur hover:bg-white/10"
              >
                Montar a cotação aqui <IconeSeta className="h-5 w-5" />
              </a>
            </div>
            <ul className="mt-10 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-3 text-sm font-semibold text-zinc-200 sm:grid-cols-4">
              {['Pneus novos', 'Pronta entrega', 'Preço à vista', 'Sem cadastro'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--vermelho)]">
                    <IconeCheck className="h-3.5 w-3.5 text-white" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Fita de medidas ─────────────────────────────────────────── */}
        <div aria-hidden className="relative z-10 -my-4 py-4">
          <div className="faixa-diagonal overflow-hidden py-3.5">
            <div className="fita flex w-max gap-10 whitespace-nowrap">
              {[...fita, ...fita, ...fita, ...fita].map((t, i) => (
                <span key={i} className="titulo flex items-center gap-10 text-2xl text-white">
                  {t}
                  <span className="h-2 w-2 rotate-45 bg-black/60" />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Monte sua cotação ───────────────────────────────────────── */}
        <section id="cotacao" className="textura-grade relative py-20 sm:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <Rotulo>Cotação rápida</Rotulo>
              <h2 className="titulo text-5xl sm:text-6xl">
                Três toques e <span className="text-[var(--vermelho)]">pronto.</span>
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-zinc-300">
                Escolhe a medida, o tipo e a quantidade. A mensagem já vai pronta para o nosso WhatsApp, e a gente responde com o
                preço à vista e a disponibilidade.
              </p>
              <ol className="mt-8 space-y-4">
                {[
                  ['Você manda', 'a medida (ou a foto do pneu) e a quantidade.'],
                  ['A gente responde', 'com preço à vista e o que tem em estoque.'],
                  ['Fechou?', 'Combina pagamento e retirada ou entrega, e seu caminhão volta pra estrada.'],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-4">
                    <span className="titulo flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-2xl text-[var(--vermelho)]">
                      {i + 1}
                    </span>
                    <p className="pt-1.5 text-zinc-300">
                      <strong className="text-white">{t}</strong> {d}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            <Cotador />
          </div>
        </section>

        {/* ── Medidas ─────────────────────────────────────────────────── */}
        <section id="medidas" className="relative py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <Rotulo>Medidas</Rotulo>
              <h2 className="titulo text-5xl sm:text-6xl">
                As medidas que <span className="text-[var(--vermelho)]">mais rodam</span> no Brasil
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-zinc-300">
                Do VUC ao cavalo mecânico. Toca na medida do seu caminhão e a cotação já sai com ela.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MEDIDAS.map((m) => (
                <a
                  key={m.medida}
                  href={whatsappLink(`Olá! Vim pelo site e quero cotar o pneu ${m.medida}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-6 transition-all hover:-translate-y-1 hover:border-[var(--vermelho)]/60"
                >
                  {m.destaque && (
                    <span className="absolute right-4 top-4 rounded-full bg-[var(--vermelho)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                      Mais pedido
                    </span>
                  )}
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Pneu</span>
                  <h3 className="titulo mt-2 text-[2.6rem] text-white">{m.medida}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">{m.uso}</p>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">Liso e borrachudo</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--zap)]">
                    Cotar esta medida <IconeSeta className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
              ))}
            </div>
            <p className="mt-6 text-sm text-zinc-500">
              Procura outra medida?{' '}
              <a href={whatsappLink('Olá! Vim pelo site e procuro outra medida de pneu: ')} target="_blank" rel="noopener noreferrer" className="font-semibold text-zinc-300 underline underline-offset-4 hover:text-white">
                Pergunta no WhatsApp
              </a>
              .
            </p>
          </div>
        </section>

        {/* ── Liso ou borrachudo ──────────────────────────────────────── */}
        <section id="liso-ou-borrachudo" className="relative overflow-hidden border-y border-white/5 bg-[#0E0E10] py-20 sm:py-28">
          <Image
            src="/lp/pneu-295.webp"
            alt=""
            width={1800}
            height={552}
            sizes="100vw"
            className="pointer-events-none absolute inset-y-0 right-0 h-full w-auto max-w-none opacity-25"
          />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <Rotulo>Guia rápido</Rotulo>
              <h2 className="titulo text-5xl sm:text-6xl">
                Liso ou <span className="text-[var(--vermelho)]">borrachudo?</span>
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-zinc-300">
                Cada eixo pede um desenho de banda. Escolher certo é rodar mais e gastar menos.
              </p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {[
                {
                  nome: 'Liso',
                  sub: 'Direcional e carreta',
                  Banda: BandaLisa,
                  pontos: ['Sulcos contínuos: roda macio e estável', 'Menos atrito, mais economia no asfalto', 'Ideal para eixo dianteiro e carretas'],
                },
                {
                  nome: 'Borrachudo',
                  sub: 'Tração',
                  Banda: BandaBorrachuda,
                  pontos: ['Blocos que mordem o chão', 'Mais aderência em subida, chuva e terra', 'Ideal para o eixo de tração'],
                },
              ].map(({ nome, sub, Banda, pontos }) => (
                <article key={nome} className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur sm:flex-row sm:gap-6 sm:p-8">
                  <Banda className="h-32 w-auto shrink-0 self-start drop-shadow-[0_10px_20px_rgba(0,0,0,.6)] sm:h-52" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--vermelho)]">{sub}</p>
                    <h3 className="titulo mt-1 text-[2.8rem] sm:text-5xl">{nome}</h3>
                    <ul className="mt-4 space-y-2.5">
                      {pontos.map((p) => (
                        <li key={p} className="flex gap-2.5 text-[15px] leading-snug text-zinc-300">
                          <IconeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--vermelho)]" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-6 text-sm text-zinc-400">
              Na dúvida, escolhe &ldquo;Não sei&rdquo; na cotação: a gente indica o certo para o seu eixo.
            </p>
          </div>
        </section>

        {/* ── Como ler a medida ───────────────────────────────────────── */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            <div>
              <Rotulo>Sem erro na compra</Rotulo>
              <h2 className="titulo text-5xl sm:text-6xl">
                Como ler a <span className="text-[var(--vermelho)]">medida</span> do pneu
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-zinc-300">
                A medida está escrita na lateral do pneu. Ela diz a largura, a altura e o aro. Se ficar na dúvida, manda uma
                foto que a gente confere pra você.
              </p>
              <BotaoZap mensagem="Olá! Vim pelo site. Vou mandar a foto da lateral do meu pneu para vocês verem a medida." className="mt-8">
                Mandar foto do pneu
              </BotaoZap>
            </div>
            <figure className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6 sm:p-10">
              <p className="titulo text-center text-[3.4rem] leading-none sm:text-7xl" aria-label="Exemplo de medida: 295 barra 80 R 22.5">
                <span className="text-white">295</span>
                <span className="text-zinc-600">/</span>
                <span className="text-[var(--vermelho)]">80</span>
                <span className="text-zinc-400"> R</span>
                <span className="text-white">22.5</span>
              </p>
              <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  ['295', 'Largura do pneu, em milímetros.'],
                  ['80', 'Altura do flanco: 80% da largura.'],
                  ['R', 'Construção radial, a dos pneus de caminhão de hoje.'],
                  ['22.5', 'Diâmetro do aro (da roda), em polegadas.'],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <dt className="titulo text-3xl text-[var(--vermelho)]">{k}</dt>
                    <dd className="mt-1 text-sm leading-snug text-zinc-300">{v}</dd>
                  </div>
                ))}
              </dl>
            </figure>
          </div>
        </section>

        {/* ── Por que a iAlves ────────────────────────────────────────── */}
        <section className="relative border-y border-white/5 bg-[#0E0E10] py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <Rotulo>Por que a iAlves</Rotulo>
              <h2 className="titulo text-5xl sm:text-6xl">
                Feita pra quem <span className="text-[var(--vermelho)]">vive na estrada</span>
              </h2>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['2 min', 'Cotação no WhatsApp', 'Você manda a medida e recebe a resposta rapidinho, de onde estiver.'],
                ['À vista', 'Preço que cabe', 'Preço para pagamento à vista, direto para o cliente final e para frotas.'],
                ['Estoque', 'Pronta entrega', 'Pneus novos prontos para sair. Caminhão parado é dinheiro perdido.'],
                ['Gente', 'Atendimento de verdade', 'Quem te responde entende de pneu e indica o certo para o seu eixo.'],
              ].map(([n, t, d]) => (
                <div key={t} className="rounded-3xl border border-white/10 bg-black/40 p-6">
                  <p className="titulo text-4xl text-[var(--vermelho)]">{n}</p>
                  <h3 className="mt-3 text-lg font-bold text-white">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{d}</p>
                </div>
              ))}
            </div>
            <div className="mt-14">
              <p className="text-center text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">Marcas que trabalhamos</p>
              <ul className="mt-5 flex flex-wrap justify-center gap-2.5">
                {MARCAS.map((m) => (
                  <li key={m} className="titulo rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xl not-italic tracking-wide text-zinc-300">
                    {m}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-center text-xs text-zinc-600">Disponibilidade de marca e modelo varia conforme o estoque.</p>
            </div>
          </div>
        </section>

        {/* ── Indicação premiada ──────────────────────────────────────── */}
        <section id="indicacao" className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-[2rem] border border-[var(--vermelho)]/40 bg-gradient-to-br from-[#2a0507] via-[#120304] to-black p-7 sm:p-12">
              <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--vermelho)]/25 blur-3xl" />
              <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
                <div>
                  <Rotulo>Indicação premiada</Rotulo>
                  <h2 className="titulo text-5xl sm:text-6xl">
                    Indicou, comprou, <span className="text-[var(--vermelho)]">ganhou.</span>
                  </h2>
                  <p className="mt-5 max-w-lg text-lg leading-relaxed text-zinc-300">
                    Conhece alguém precisando de pneu? Indica a iAlves. Quando a pessoa comprar, você ganha{' '}
                    <strong className="text-white">R$ 20 por pneu</strong>.
                  </p>
                  <BotaoZap mensagem="Olá! Vim pelo site e quero indicar uma pessoa para a Indicação Premiada." className="mt-8">
                    Quero indicar alguém
                  </BotaoZap>
                  <p className="mt-4 text-xs text-zinc-500">Não acumula com descontos de queima de estoque. Parte das vendas ajuda o Projeto Semear.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/50 p-7 text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Exemplo</p>
                  <p className="mt-3 text-zinc-300">Seu indicado comprou 10 pneus</p>
                  <p className="titulo mt-2 text-7xl text-white">
                    R$ <span className="text-[var(--vermelho)]">200</span>
                  </p>
                  <p className="mt-1 text-zinc-300">de prêmio pra você</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Dúvidas ─────────────────────────────────────────────────── */}
        <section id="duvidas" className="pb-20 sm:pb-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Rotulo>Dúvidas</Rotulo>
            <h2 className="titulo text-5xl sm:text-6xl">Perguntas frequentes</h2>
            <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
              {FAQ.map((f) => (
                <details key={f.p} className="group py-5">
                  <summary className="flex cursor-pointer items-center justify-between gap-6 text-left text-lg font-semibold text-white">
                    {f.p}
                    <span aria-hidden className="giro flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-xl text-[var(--vermelho)] transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 pr-12 leading-relaxed text-zinc-400">{f.r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Chamada final ───────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden py-24 sm:py-32">
          <Image src="/lp/estrada.webp" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-60" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/60 to-black/80" />
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="titulo text-5xl sm:text-7xl">
              <span className="texto-cromado">Caminhão parado</span>
              <br />
              <span className="text-[var(--vermelho)]">é dinheiro perdido.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-200">Manda a medida agora e volta pra estrada com pneu novo.</p>
            <BotaoZap className="mt-9 h-16 px-9 text-lg">Fazer minha cotação agora</BotaoZap>
            <p className="mt-4 text-sm text-zinc-400">Sem cadastro · Sem burocracia · Resposta rápida</p>
          </div>
        </section>
      </main>

      {/* ── Rodapé ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-black pb-28 pt-14 text-zinc-400 sm:pb-12">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Image src="/lp/logo.webp" alt="iAlves Pneus" width={560} height={239} className="h-12 w-auto" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              Pneus novos para caminhão e ônibus em {SITE.city}/{SITE.region}. Liso e borrachudo, pronta entrega e preço à vista.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Fale com a gente</p>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center gap-2.5 font-semibold text-white hover:text-[var(--zap)]">
              <IconeZap className="h-5 w-5 text-[var(--zap)]" />
              {SITE.whatsappDisplay}
            </a>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Redes sociais</p>
            <div className="mt-4 flex flex-col gap-3">
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 font-semibold text-white hover:text-[var(--vermelho)]">
                <IconeInstagram className="h-5 w-5" /> {SITE.instagramHandle}
              </a>
              <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 font-semibold text-white hover:text-[var(--vermelho)]">
                <IconeFacebook className="h-5 w-5" /> Facebook
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-4 border-t border-white/5 px-4 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} iAlves Pneus. Valores e disponibilidade sujeitos a alteração sem aviso prévio. Imagens
            ilustrativas.
          </p>
          <a
            href={AGENCY.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-2 opacity-60 transition-opacity hover:opacity-100"
            title="Quer um site assim? Fale com a Agência JN"
          >
            <span>Site por</span>
            <Image src="/lp/agencia-jn.png" alt={AGENCY.name} width={900} height={202} className="h-[18px] w-auto" />
          </a>
        </div>
      </footer>

      {/* ── Balão do WhatsApp ───────────────────────────────────────────── */}
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar no WhatsApp"
        className="balao-zap fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--zap)] text-white shadow-2xl"
      >
        <IconeZap className="h-9 w-9" />
      </a>
    </>
  )
}
