import Image from 'next/image'
import { AGENCY, SITE, whatsappLink } from '@/config/site'
import { AvisoCookies } from './AvisoCookies'
import { IconeFacebook, IconeInstagram, IconeZap } from './icones'

// Rodapé, balão do WhatsApp e aviso de cookies: iguais em todas as páginas.
export function Rodape() {
  return (
    <>
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
