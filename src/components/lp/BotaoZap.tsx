import { whatsappLink } from '@/config/site'
import { IconeZap } from './icones'

export function BotaoZap({ children, mensagem, className = '' }: { children: React.ReactNode; mensagem?: string; className?: string }) {
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
