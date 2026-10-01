'use client'

import { useState } from 'react'
import { MEDIDAS, whatsappLink } from '@/config/site'
import { IconeZap } from './icones'

// ─── Monte sua cotação ─────────────────────────────────────────────────────
// Três toques e o WhatsApp abre com a mensagem pronta. Nada é gravado: o
// pedido vai direto para a conversa com a loja.

const TIPOS = ['Liso', 'Borrachudo', 'Não sei'] as const

function Opcao({ ativo, onClick, children, compacto }: { ativo: boolean; onClick: () => void; children: React.ReactNode; compacto?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={[
        'min-h-12 rounded-xl border py-2.5 text-left font-semibold transition-all',
        compacto ? 'px-1.5 text-sm sm:px-4 sm:text-[15px]' : 'px-4 text-[15px]',
        ativo
          ? 'border-[var(--vermelho)] bg-[var(--vermelho)]/15 text-white shadow-[0_0_0_1px_var(--vermelho)]'
          : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/25 hover:text-white',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export function Cotador() {
  const [medida, setMedida] = useState<string>(MEDIDAS[0].medida)
  const [outra, setOutra] = useState('')
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>('Liso')
  const [qtd, setQtd] = useState(2)
  const [cidade, setCidade] = useState('')

  const medidaFinal = medida === 'outra' ? outra.trim() || '(vou mandar a foto da medida)' : medida
  const mensagem = [
    'Olá! Vim pelo site e quero uma cotação:',
    `• Medida: ${medidaFinal}`,
    `• Tipo: ${tipo === 'Não sei' ? 'não sei, quero indicação' : tipo.toLowerCase()}`,
    `• Quantidade: ${qtd} ${qtd === 1 ? 'pneu' : 'pneus'}`,
    cidade.trim() ? `• Cidade: ${cidade.trim()}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111114] p-5 shadow-2xl shadow-black/50 sm:p-7">
      <fieldset>
        <legend className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--vermelho)] text-[11px] text-white">1</span>
          Medida do pneu
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {MEDIDAS.map((m) => (
            <Opcao key={m.medida} ativo={medida === m.medida} onClick={() => setMedida(m.medida)}>
              {m.medida}
            </Opcao>
          ))}
          <Opcao ativo={medida === 'outra'} onClick={() => setMedida('outra')}>
            Outra medida
          </Opcao>
        </div>
        {medida === 'outra' && (
          <input
            type="text"
            value={outra}
            onChange={(e) => setOutra(e.target.value)}
            placeholder="Ex.: 11.00 R22 ou 1000x20"
            aria-label="Qual medida?"
            className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-black/40 px-4 text-[15px] text-white placeholder:text-zinc-500 focus:border-[var(--vermelho)] focus:outline-none"
          />
        )}
      </fieldset>

      <fieldset className="mt-6">
        <legend className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--vermelho)] text-[11px] text-white">2</span>
          Tipo
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {TIPOS.map((t) => (
            <Opcao key={t} ativo={tipo === t} onClick={() => setTipo(t)} compacto>
              <span className="block text-center">{t}</span>
            </Opcao>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--vermelho)] text-[11px] text-white">3</span>
            Quantidade
          </p>
          <div className="flex h-12 items-center justify-between rounded-xl border border-white/10 bg-white/[0.03]">
            <button
              type="button"
              onClick={() => setQtd((q) => Math.max(1, q - 1))}
              aria-label="Menos um pneu"
              className="h-full w-14 text-2xl font-bold text-zinc-300 hover:text-white"
            >
              −
            </button>
            <span className="text-lg font-bold tabular-nums text-white" aria-live="polite">
              {qtd}
            </span>
            <button
              type="button"
              onClick={() => setQtd((q) => Math.min(200, q + 1))}
              aria-label="Mais um pneu"
              className="h-full w-14 text-2xl font-bold text-zinc-300 hover:text-white"
            >
              +
            </button>
          </div>
        </div>
        <label className="block">
          <span className="mb-3 block text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">Sua cidade (opcional)</span>
          <input
            type="text"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Ex.: Guarulhos"
            autoComplete="address-level2"
            className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-[15px] text-white placeholder:text-zinc-500 focus:border-[var(--vermelho)] focus:outline-none"
          />
        </label>
      </div>

      <a
        href={whatsappLink(mensagem)}
        target="_blank"
        rel="noopener noreferrer"
        className="botao-zap mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-2xl text-base font-bold text-white"
      >
        <IconeZap className="h-6 w-6" />
        Receber minha cotação
      </a>
      <p className="mt-3 text-center text-xs text-zinc-500">Abre o WhatsApp com a mensagem pronta. É só enviar.</p>
    </div>
  )
}
