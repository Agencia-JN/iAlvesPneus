'use client'

import { useEffect, useState } from 'react'

// ─── Aviso de cookies (LGPD) ───────────────────────────────────────────────
// A escolha fica guardada no aparelho. Se um dia entrar Pixel da Meta ou
// Google Analytics, eles só devem carregar quando a escolha for "aceito"
// (window.localStorage 'ialves_cookies' === 'aceito').

const CHAVE = 'ialves_cookies'

export function AvisoCookies() {
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(CHAVE)) setVisivel(true)
    } catch {
      // navegação privada sem armazenamento: não incomoda
    }
  }, [])

  const escolher = (valor: 'aceito' | 'recusado') => {
    try {
      localStorage.setItem(CHAVE, valor)
    } catch {
      // ignora
    }
    setVisivel(false)
  }

  if (!visivel) return null
  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl bg-white p-4 text-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.45)] sm:inset-x-6 sm:bottom-6 sm:flex sm:items-center sm:gap-6 sm:p-5"
    >
      <p className="text-sm leading-relaxed">
        Usamos cookies para melhorar a sua experiência e entender como o site é usado.{' '}
        <a href="/privacidade" className="font-semibold text-neutral-900 underline underline-offset-2">
          Saiba mais
        </a>
      </p>
      <div className="mt-3 flex shrink-0 items-center justify-end gap-2 sm:mt-0">
        <button
          type="button"
          onClick={() => escolher('recusado')}
          className="h-10 rounded-lg px-4 text-sm font-semibold text-neutral-600 hover:bg-neutral-100"
        >
          Rejeitar
        </button>
        <button
          type="button"
          onClick={() => escolher('aceito')}
          className="h-10 rounded-lg bg-[var(--vermelho)] px-5 text-sm font-bold text-white hover:brightness-110"
        >
          Aceitar
        </button>
      </div>
    </div>
  )
}
