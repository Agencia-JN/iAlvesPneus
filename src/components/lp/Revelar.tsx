'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

// ─── Surge ao rolar ────────────────────────────────────────────────────────
// O bloco sobe e aparece quando entra na tela (uma vez só). Quem pediu menos
// movimento no aparelho vê tudo parado (regra no globals.css).

export function Revelar({
  children,
  atraso = 0,
  className = '',
}: {
  children: ReactNode
  /** em milissegundos, para fazer cascata entre cartões */
  atraso?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setVisivel(true)
      return
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisivel(true)
          obs.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className={`revelar ${visivel ? 'visivel' : ''} ${className}`} style={{ transitionDelay: `${atraso}ms` }}>
      {children}
    </div>
  )
}
