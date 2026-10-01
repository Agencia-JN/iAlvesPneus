import Image from 'next/image'
import { AGENCY, MARCAS, MEDIDAS, SITE, whatsappLink } from '@/config/site'
import { Cotador } from '@/components/lp/Cotador'
import { Revelar } from '@/components/lp/Revelar'
import { AvisoCookies } from '@/components/lp/AvisoCookies'
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
    r: 'Sim. Trabalhamos com pneus novos para caminhão e ônibus, aro 17,5 e 22,5, vendidos direto para o cliente final e para frotas.',
  },
  {
    p: 'Vocês entregam fora de Guarulhos?',
    r: 'Sim. Estamos em Guarulhos (SP), atendemos toda a Grande São Paulo e enviamos para todo o Brasil. O prazo e o frete para a sua cidade vêm junto com a cotação.',
  },
  {
    p: 'Como faço a cotação?',
    r: 'Manda a medida do pneu e a quantidade no WhatsApp. Em poucos minutos você recebe o preço à vista e o que tem em estoque. Sem cadastro.',
  },
  {
    p: 'Não sei a medida do meu pneu. E agora?',
    r: 'Tira uma foto da lateral do pneu, onde aparecem os números (por exemplo, 295/80 R22.5), e manda pra gente. Nessa medida, 295 é a largura em milímetros, 80 é a altura do flanco em porcentagem da largura e 22.5 é o aro em polegadas.',
  },
  {
    p: 'Qual a diferença entre pneu liso e borrachudo?',
    r: 'O liso tem sulcos contínuos, roda mais macio e economiza no asfalto: vai no eixo direcional e nas carretas. O borrachudo tem blocos e mais aderência: vai no eixo de tração.',
  },
  {
    p: 'Atendem frota?',
    r: 'Atendemos. Para compras em quantidade, chama no WhatsApp com as medidas e a quantidade que a gente monta uma proposta para a sua frota.',
  },
]

function jsonLd() {
  const negocio = {
    '@context': 'https://schema.org',
    '@type': 'TireShop',
    '@id': `${SITE.url}/#loja`,
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/lp/logo-branco.webp`,
    image: `${SITE.url}/lp/og.jpg`,
    description:
      'Pneus novos para caminhão aro 17,5 e 22,5, liso e borrachudo, com preço à vista, pronta entrega e envio para todo o Brasil.',
    telephone: `+${SITE.whatsapp}`,
    priceRange: '$$',
    currenciesAccepted: 'BRL',
    address: { '@type': 'PostalAddress', addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: 'BR' },
    areaServed: [
      { '@type': 'City', name: 'Guarulhos' },
      { '@type': 'AdministrativeArea', name: 'Grande São Paulo' },
      { '@type': 'Country', name: 'Brasil' },
    ],
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

function BotaoZap({ children, mensagem, className = '' }: { children: React.ReactNode; mensagem?: string; className?: string }) {
  return (
    <a
      href={whatsappLink(mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      className={`botao-zap inline-flex min-h-14 items-center justify-center gap-3 rounded-xl px-6 py-3 text-left font-bold leading-tight text-white ${className}`}
    >
      <IconeZap className="h-7 w-7 shrink-0" />
      <span>{children}</span>
    </a>
  )
}

function Sobretitulo({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vermelho)]">{children}</p>
}

/* Ícones simples dos diferenciais */
function IconeAperto({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-2" />
      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
      <path d="M3 4h8" />
    </svg>
  )
}
function IconeCaminhao({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  )
}
function IconeEtiqueta({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  )
}
function IconeCoracao({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
}
function IconeLocal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

const DIFERENCIAIS = [
  { Icone: IconeAperto, titulo: 'Parceria direta', sub: 'Sem intermediário', texto: 'Você fala com quem resolve. Sem atravessador, sem enrolação e sem processo complicado.' },
  { Icone: IconeCaminhao, titulo: 'Entrega rápida', sub: 'Pronta entrega', texto: 'Pneu em estoque para Guarulhos e Grande São Paulo, e envio para todo o Brasil.' },
  { Icone: IconeEtiqueta, titulo: 'Preço à vista', sub: 'Direto do estoque', texto: 'Preço pensado para quem roda: cliente final, autônomo e frota.' },
  { Icone: IconeCoracao, titulo: 'Compra do bem', sub: 'Projeto Semear', texto: 'Parte de cada venda ajuda o Projeto Semear. Seu pneu novo também faz diferença lá.' },
]

export default function Home() {
  const fita = [...MEDIDAS.map((m) => m.medida), 'Liso', 'Borrachudo', 'Pronta entrega', 'Preço à vista']

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />

      <main className="overflow-x-clip bg-[var(--fundo)] text-white">
        {/* ── Abertura ────────────────────────────────────────────────── */}
        <section className="relative isolate flex min-h-[88svh] items-center">
          <picture className="absolute inset-0 -z-10">
            <source media="(max-width: 767px)" srcSet="/lp/galpao-mobile.webp" />
            <img src="/lp/galpao.webp" alt="" fetchPriority="high" className="h-full w-full object-cover object-[70%_center]" />
          </picture>
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/95 via-black/70 to-black/5 max-md:bg-black/65" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-[var(--fundo)] to-transparent" />

          <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 md:py-20">
            <Image src="/lp/logo-branco.webp" alt="iAlves Pneus" width={647} height={309} priority className="h-16 w-auto sm:h-20" />
            <h1 className="fonte-destaque mt-8 max-w-[40rem] text-[2.15rem] font-extrabold leading-[1.08] sm:text-5xl lg:text-[3.5rem]">
              Pneu de caminhão novo, com <span className="text-[var(--vermelho)]">preço à vista</span> e entrega rápida.
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-zinc-200">
              Aro 17,5 e 22,5, liso e borrachudo. Manda a medida no WhatsApp e recebe a cotação em menos de 2 minutos.
            </p>
            <BotaoZap className="mt-8 w-full sm:w-auto">
              Quero minha cotação
              <span className="block text-[13px] font-semibold text-white/85">resposta em menos de 2 minutos</span>
            </BotaoZap>
            <dl className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-white/15 rounded-xl border border-white/10 bg-black/45 py-4 backdrop-blur-sm">
              {[
                [`+${SITE.instagramSeguidores}`, 'seguidores no Instagram'],
                ['2 min', 'para receber a cotação'],
                ['Brasil', `envio a partir de ${SITE.city}`],
              ].map(([valor, rotulo]) => (
                <div key={rotulo} className="px-3 text-center sm:px-5">
                  <dt className="sr-only">{rotulo}</dt>
                  <dd className="fonte-destaque text-xl font-extrabold leading-none text-white sm:text-2xl">{valor}</dd>
                  <dd className="mt-1.5 text-[11px] leading-tight text-zinc-400 sm:text-xs">{rotulo}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Fita de medidas ─────────────────────────────────────────── */}
        <div aria-hidden className="relative z-10 -my-4 py-4">
          <div className="faixa-diagonal overflow-hidden py-3">
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

        {/* ── Por que escolher ────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden py-20 sm:py-28">
          <Image src="/lp/pneu-sombra.webp" alt="" fill sizes="100vw" className="-z-10 object-cover object-center opacity-45" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--fundo)] via-black/60 to-[var(--fundo)]" />
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Revelar className="mx-auto max-w-2xl text-center">
              <h2 className="fonte-destaque text-[2rem] font-extrabold leading-[1.1] sm:text-5xl">
                Por que escolher
                <br />
                <span className="text-[var(--vermelho)]">a iAlves Pneus?</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-zinc-300">
                A iAlves trabalha para quem vive na estrada, onde quer que você esteja. Atendimento honesto, pneu de
                qualidade e a segurança que o seu caminhão precisa.
              </p>
            </Revelar>
            <div className="carrossel -mx-5 mt-12 flex gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
              {DIFERENCIAIS.map(({ Icone, titulo, sub, texto }, i) => (
                <Revelar key={titulo} atraso={i * 110} className="w-[78%] shrink-0 sm:w-auto">
                  <article className="cartao-diferencial relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f11]/90 p-6 backdrop-blur-sm sm:p-7">
                    <span aria-hidden className="numero-diferencial fonte-destaque absolute right-5 top-3 text-6xl font-extrabold text-white/[0.06]">
                      0{i + 1}
                    </span>
                    <span className="icone-diferencial flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--vermelho)]/12 text-[var(--vermelho)]">
                      <Icone className="h-7 w-7" />
                    </span>
                    <h3 className="fonte-destaque mt-6 text-xl font-bold">{titulo}</h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">{sub}</p>
                    <span aria-hidden className="linha-diferencial mt-4 block h-[3px] w-8 rounded-full bg-[var(--vermelho)]" />
                    <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">{texto}</p>
                  </article>
                </Revelar>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-zinc-500 sm:hidden">Arraste para o lado para ver mais</p>
          </div>
        </section>

        {/* ── Especialidade: medidas ──────────────────────────────────── */}
        <section id="medidas" className="relative overflow-hidden bg-gradient-to-br from-[#2a0609] via-[#120405] to-black py-20 sm:py-28">
          <div aria-hidden className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-[var(--vermelho)]/20 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
            <Revelar>
              <Sobretitulo>Especialidade</Sobretitulo>
              <h2 className="fonte-destaque mt-3 text-[2rem] font-extrabold leading-[1.1] sm:text-[2.6rem]">
                Trabalhamos com as principais medidas aro 17,5 e 22,5
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-zinc-300">
                Pneus de alta quilometragem, com excelente custo-benefício. Toque na medida e a cotação já sai com ela.
              </p>
              <ul className="mt-8 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-black/50">
                {MEDIDAS.map((m) => (
                  <li key={m.medida}>
                    <a
                      href={whatsappLink(`Olá! Vim pelo site e quero cotar o pneu ${m.medida}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--vermelho)]/10"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="fonte-destaque block text-xl font-bold text-white">{m.medida}</span>
                        <span className="block text-sm text-zinc-400">{m.uso}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[var(--zap)]">
                        Cotar <IconeSeta className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-zinc-500">
                Marcas como {MARCAS.slice(0, 8).join(', ')} e outras, conforme o estoque.
              </p>
            </Revelar>
            <Revelar atraso={150} className="relative">
              <div aria-hidden className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[var(--vermelho)] to-transparent opacity-60 blur-xl" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/15 sm:aspect-[4/3] lg:aspect-[4/5]">
                <Image
                  src="/lp/pneus-empilhados.webp"
                  alt="Pneus novos de caminhão empilhados no estoque"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1.2s] hover:scale-105"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <p className="fonte-destaque absolute bottom-5 left-5 right-5 text-lg font-bold leading-snug text-white">
                  Liso e borrachudo, pronta entrega
                  <span className="block text-sm font-medium text-zinc-300">direto de {SITE.city} para o Brasil</span>
                </p>
              </div>
            </Revelar>
          </div>
        </section>

        {/* ── Monte sua cotação ───────────────────────────────────────── */}
        <section id="cotacao" className="relative isolate overflow-hidden py-20 sm:py-28">
          <Image src="/lp/banda-rodagem.webp" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-30" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/85 to-black/60" />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
            <div>
              <Sobretitulo>Cotação rápida</Sobretitulo>
              <h2 className="fonte-destaque mt-3 text-3xl font-extrabold leading-tight sm:text-[2.6rem]">
                Três toques e a sua cotação está pronta
              </h2>
              <p className="mt-4 max-w-md text-[17px] leading-relaxed text-zinc-300">
                Escolha a medida, o tipo e a quantidade. A mensagem já vai pronta para o nosso WhatsApp, e a gente responde com
                o preço à vista e a disponibilidade.
              </p>
            </div>
            <Cotador />
          </div>
        </section>

        {/* ── Liso ou borrachudo ──────────────────────────────────────── */}
        <section id="liso-ou-borrachudo" className="relative overflow-hidden bg-gradient-to-b from-[#160406] via-[#0d0d0f] to-[#0d0d0f] py-20 sm:py-28">
          <div aria-hidden className="absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[var(--vermelho)]/15 blur-3xl" />
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <Sobretitulo>Guia rápido</Sobretitulo>
              <h2 className="fonte-destaque mt-3 text-3xl font-extrabold leading-tight sm:text-[2.6rem]">Liso ou borrachudo?</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-zinc-300">
                Cada eixo pede um desenho de banda. Escolher certo é rodar mais e gastar menos.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
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
                <article key={nome} className="relative flex flex-col gap-5 rounded-2xl border border-white/10 bg-black/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--vermelho)]/60 sm:flex-row sm:gap-6 sm:p-8">
                  <Banda className="h-32 w-auto shrink-0 self-start drop-shadow-[0_10px_20px_rgba(0,0,0,.6)] sm:h-48" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--vermelho)]">{sub}</p>
                    <h3 className="fonte-destaque mt-1 text-3xl font-extrabold">{nome}</h3>
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
            <p className="mt-6 text-sm text-zinc-400">Na dúvida, escolha &ldquo;Não sei&rdquo; na cotação: a gente indica o certo para o seu eixo.</p>
          </div>
        </section>

        {/* ── Dúvidas ─────────────────────────────────────────────────── */}
        <section id="duvidas" className="py-20 sm:py-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <h2 className="fonte-destaque text-3xl font-extrabold leading-tight sm:text-[2.4rem]">Perguntas frequentes</h2>
            <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {FAQ.map((f) => (
                <details key={f.p} className="group py-5">
                  <summary className="flex cursor-pointer items-center justify-between gap-6 text-left text-[17px] font-semibold text-white">
                    {f.p}
                    <span aria-hidden className="giro flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-xl text-[var(--vermelho)] transition-transform">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 pr-10 leading-relaxed text-zinc-400">{f.r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Atendimento imediato ────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden py-20 sm:py-28">
          <Image src="/lp/caminhao-estrada.webp" alt="Caminhão na estrada" fill sizes="100vw" className="-z-10 object-cover object-[70%_center]" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-br from-[#b3080e]/85 via-[#5a0306]/80 to-black/85" />
          <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/80">Atendimento imediato</p>
            <h2 className="fonte-destaque mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">
              Mande a medida e receba sua cotação em minutos
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[17px] text-white/90">
              Pelo WhatsApp, de onde você estiver: na estrada, na garagem ou no pátio.
            </p>
            <p className="mt-6 text-sm font-semibold tracking-wide text-white">SEM CADASTRO • SEM BUROCRACIA • SEM PERDER TEMPO</p>
            <BotaoZap className="mt-7 w-full sm:w-auto">Quero minha cotação com a iAlves agora</BotaoZap>
          </div>
        </section>
      </main>

      {/* ── Rodapé ──────────────────────────────────────────────────────── */}
      <footer className="bg-black pb-28 pt-12 text-zinc-400 sm:pb-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:px-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Image src="/lp/logo-branco.webp" alt="iAlves Pneus" width={647} height={309} className="h-12 w-auto" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              Pneus novos para caminhão aro 17,5 e 22,5. {SITE.city}/{SITE.region}, com envio para todo o Brasil.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 font-semibold text-white hover:text-[var(--zap)]">
              <IconeZap className="h-5 w-5 text-[var(--zap)]" />
              {SITE.whatsappDisplay}
            </a>
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 font-semibold text-white hover:text-[var(--vermelho)]">
              <IconeInstagram className="h-5 w-5" /> {SITE.instagramHandle}
            </a>
            <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 font-semibold text-white hover:text-[var(--vermelho)]">
              <IconeFacebook className="h-5 w-5" /> Facebook
            </a>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 border-t border-white/5 px-5 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} iAlves Pneus · Valores e disponibilidade sujeitos a alteração ·{' '}
            <a href="/privacidade" className="underline underline-offset-2 hover:text-white">
              Privacidade
            </a>
          </p>
          <a
            href={AGENCY.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-2 opacity-50 transition-opacity hover:opacity-100"
            title="Quer um site assim? Fale com a Agência JN"
          >
            <span>Site por</span>
            <Image src="/lp/agencia-jn.png" alt={AGENCY.name} width={900} height={202} className="h-4 w-auto" />
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

      <AvisoCookies />
    </>
  )
}
