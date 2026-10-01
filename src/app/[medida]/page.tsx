import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MEDIDAS, SITE, type Medida } from '@/config/site'
import { BotaoZap } from '@/components/lp/BotaoZap'
import { Cotador } from '@/components/lp/Cotador'
import { Rodape } from '@/components/lp/Rodape'
import { BandaBorrachuda, BandaLisa, IconeCheck, IconeSeta } from '@/components/lp/icones'

// ─── Uma página para cada medida ───────────────────────────────────────────
// Quem pesquisa "pneu 295/80 R22.5" já sabe o que quer: cai direto na página
// da medida, com a cotação já marcada nela. Só existem as medidas da lista
// (qualquer outro endereço dá "página não encontrada").

export const dynamicParams = false

export function generateStaticParams() {
  return MEDIDAS.map((m) => ({ medida: m.slug }))
}

function achar(slug: string): Medida | undefined {
  return MEDIDAS.find((m) => m.slug === slug)
}

export async function generateMetadata({ params }: { params: Promise<{ medida: string }> }): Promise<Metadata> {
  const m = achar((await params).medida)
  if (!m) return {}
  const titulo = `Pneu ${m.medida} para caminhão: liso e borrachudo`
  const descricao = `Pneu ${m.medida} novo, liso e borrachudo, com preço à vista e pronta entrega em ${SITE.city}/${SITE.region}. Envio para todo o Brasil. Cotação em 2 minutos no WhatsApp.`
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `/${m.slug}` },
    openGraph: { title: `${titulo} | iAlves Pneus`, description: descricao, url: `/${m.slug}`, images: [{ url: '/lp/og.jpg', width: 1200, height: 630 }] },
  }
}

function perguntas(m: Medida) {
  const flanco = Math.round((m.largura * m.perfil) / 100)
  return [
    {
      p: `O que significa ${m.medida}?`,
      r: `${m.largura} é a largura do pneu em milímetros. ${m.perfil} é a altura do flanco em porcentagem da largura (cerca de ${flanco} mm). R indica construção radial e ${m.aro.replace('.', ',')} é o diâmetro do aro em polegadas.`,
    },
    {
      p: `Em quais veículos o pneu ${m.medida} é usado?`,
      r: `${m.resumo} Para ter certeza, confira a medida escrita na lateral do pneu que está no seu caminhão.`,
    },
    {
      p: `Liso ou borrachudo na medida ${m.medida}?`,
      r: m.dica,
    },
    {
      p: `Quanto custa o pneu ${m.medida}?`,
      r: `O preço muda com a marca, o modelo e o estoque do dia. Manda a quantidade pelo WhatsApp e você recebe o valor à vista atualizado em poucos minutos.`,
    },
  ]
}

export default async function PaginaMedida({ params }: { params: Promise<{ medida: string }> }) {
  const m = achar((await params).medida)
  if (!m) notFound()
  const faq = perguntas(m)
  const mensagem = `Olá! Vim pelo site e quero cotar o pneu ${m.medida}.`

  const jsonLd = JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'iAlves Pneus', item: SITE.url },
        { '@type': 'ListItem', position: 2, name: `Pneu ${m.medida}`, item: `${SITE.url}/${m.slug}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: f.r } })),
    },
  ]).replace(/</g, '\\u003c')

  const outras = MEDIDAS.filter((x) => x.slug !== m.slug)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <main className="overflow-x-clip bg-[var(--fundo)] text-white">
        {/* ── Abertura ──────────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#2a0609] via-[#120405] to-black pb-16 pt-8 sm:pb-24">
          <div aria-hidden className="absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-[var(--vermelho)]/25 blur-3xl" />
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Link href="/" aria-label="iAlves Pneus, página inicial">
              <Image src="/lp/logo-branco.webp" alt="iAlves Pneus" width={647} height={309} priority className="h-12 w-auto sm:h-14" />
            </Link>
            <nav aria-label="Você está em" className="mt-6 text-sm text-zinc-500">
              <Link href="/" className="hover:text-white">Início</Link>
              <span className="mx-2">/</span>
              <span className="text-zinc-300">Pneu {m.medida}</span>
            </nav>
            <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vermelho)]">Aro {m.aro.replace('.', ',')} · Liso e borrachudo</p>
                <h1 className="fonte-destaque mt-3 text-[2.2rem] font-extrabold leading-[1.08] sm:text-5xl">
                  Pneu <span className="text-[var(--vermelho)]">{m.medida}</span> para caminhão
                </h1>
                <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-zinc-300">
                  {m.resumo} Pneu novo, preço à vista e pronta entrega em {SITE.city}, com envio para todo o Brasil.
                </p>
                <BotaoZap mensagem={mensagem} className="mt-8 w-full sm:w-auto">
                  Cotar o {m.medida} agora
                  <span className="block text-[13px] font-semibold text-white/85">resposta em menos de 2 minutos</span>
                </BotaoZap>
              </div>
              {/* A medida explicada */}
              <figure className="rounded-2xl border border-white/10 bg-black/50 p-6 sm:p-8">
                <p className="fonte-destaque text-center text-4xl font-extrabold sm:text-5xl" aria-hidden>
                  <span>{m.largura}</span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-[var(--vermelho)]">{m.perfil}</span>
                  <span className="text-zinc-400"> R</span>
                  <span>{m.aro}</span>
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    [String(m.largura), 'largura em milímetros'],
                    [String(m.perfil), `altura do flanco: ${m.perfil}% da largura`],
                    ['R', 'construção radial'],
                    [m.aro, 'aro em polegadas'],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <dt className="fonte-destaque text-2xl font-extrabold text-[var(--vermelho)]">{k}</dt>
                      <dd className="mt-0.5 text-xs leading-snug text-zinc-400">{v}</dd>
                    </div>
                  ))}
                </dl>
              </figure>
            </div>
          </div>
        </section>

        {/* ── Onde usa + liso ou borrachudo ─────────────────────────── */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 sm:px-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
              <h2 className="fonte-destaque text-xl font-bold">Onde o {m.medida} é usado</h2>
              <ul className="mt-4 space-y-2.5">
                {m.veiculos.map((v) => (
                  <li key={v} className="flex gap-2.5 text-[15px] text-zinc-300">
                    <IconeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--vermelho)]" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
              <BandaLisa className="h-28 w-auto shrink-0" />
              <div>
                <h2 className="fonte-destaque text-xl font-bold">{m.medida} liso</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">Sulcos contínuos, roda macio e economiza no asfalto. Vai no eixo direcional e nas carretas.</p>
              </div>
            </div>
            <div className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">
              <BandaBorrachuda className="h-28 w-auto shrink-0" />
              <div>
                <h2 className="fonte-destaque text-xl font-bold">{m.medida} borrachudo</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">Blocos que seguram firme em subida, chuva e terra. Vai no eixo de tração.</p>
              </div>
            </div>
          </div>
          <p className="mx-auto mt-6 max-w-6xl px-5 text-[15px] leading-relaxed text-zinc-300 sm:px-8">
            <strong className="text-white">Dica da iAlves:</strong> {m.dica}
          </p>
        </section>

        {/* ── Cotação já marcada nesta medida ───────────────────────── */}
        <section className="border-y border-white/5 bg-[#0E0E10] py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--vermelho)]">Cotação rápida</p>
              <h2 className="fonte-destaque mt-3 text-3xl font-extrabold leading-tight sm:text-[2.4rem]">Quantos pneus {m.medida} você precisa?</h2>
              <p className="mt-4 max-w-md text-[17px] leading-relaxed text-zinc-300">
                A medida já está marcada. Escolha o tipo e a quantidade e mande pelo WhatsApp: a resposta vem com preço à vista e disponibilidade.
              </p>
            </div>
            <Cotador medidaInicial={m.medida} />
          </div>
        </section>

        {/* ── Perguntas ─────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <h2 className="fonte-destaque text-3xl font-extrabold leading-tight">Dúvidas sobre o pneu {m.medida}</h2>
            <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {faq.map((f) => (
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

        {/* ── Outras medidas ────────────────────────────────────────── */}
        <section className="pb-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 className="fonte-destaque text-xl font-bold">Outras medidas</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {outras.map((o) => (
                <Link
                  key={o.slug}
                  href={`/${o.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-colors hover:border-[var(--vermelho)]/60"
                >
                  <span>
                    <span className="fonte-destaque block text-lg font-bold">Pneu {o.medida}</span>
                    <span className="block text-sm text-zinc-500">{o.uso}</span>
                  </span>
                  <IconeSeta className="h-5 w-5 text-zinc-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Rodape />
    </>
  )
}
