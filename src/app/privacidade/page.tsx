import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE, whatsappLink } from '@/config/site'

export const metadata: Metadata = {
  title: 'Política de privacidade',
  description: 'Como a iAlves Pneus trata os seus dados e o uso de cookies neste site.',
  alternates: { canonical: '/privacidade' },
}

export default function Privacidade() {
  return (
    <main className="min-h-screen bg-[var(--fundo)] px-5 py-14 text-zinc-300">
      <article className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold text-zinc-400 hover:text-white">
          ← Voltar para o site
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-white">Política de privacidade</h1>
        <p className="mt-2 text-sm text-zinc-500">Atualizada em 1º de outubro de 2026</p>

        <h2 className="mt-10 text-lg font-bold text-white">Quais dados este site coleta</h2>
        <p className="mt-3 leading-relaxed">
          Este site não pede cadastro e não guarda formulários. Quando você monta uma cotação, a mensagem é aberta direto no
          seu WhatsApp e só chega até nós se você decidir enviar. A conversa segue as regras de privacidade do próprio
          WhatsApp.
        </p>

        <h2 className="mt-8 text-lg font-bold text-white">Cookies</h2>
        <p className="mt-3 leading-relaxed">
          Guardamos no seu aparelho apenas a sua escolha sobre o aviso de cookies. Se no futuro usarmos ferramentas de
          medição de visitas ou de anúncios, elas só serão ativadas se você tiver clicado em &ldquo;Aceitar&rdquo;. Você pode
          mudar de ideia a qualquer momento apagando os dados de navegação deste site.
        </p>

        <h2 className="mt-8 text-lg font-bold text-white">Seus direitos</h2>
        <p className="mt-3 leading-relaxed">
          Pela Lei Geral de Proteção de Dados (LGPD), você pode pedir para saber quais dados seus temos, corrigi-los ou
          apagá-los. É só chamar no{' '}
          <a href={whatsappLink('Olá! Tenho uma dúvida sobre os meus dados (LGPD).')} className="font-semibold text-white underline underline-offset-2">
            WhatsApp {SITE.whatsappDisplay}
          </a>
          .
        </p>

        <p className="mt-10 text-sm text-zinc-500">
          {SITE.name} · {SITE.city}/{SITE.region}
        </p>
      </article>
    </main>
  )
}
