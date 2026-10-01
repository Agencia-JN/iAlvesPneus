// Ícones desenhados à mão (SVG puro, sem biblioteca)

export function IconeZap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className} fill="currentColor">
      <path d="M16.04 3C9 3 3.3 8.68 3.3 15.7c0 2.24.59 4.43 1.7 6.36L3.2 28.8l6.92-1.8a12.7 12.7 0 0 0 5.92 1.5h.01c7.03 0 12.75-5.69 12.75-12.7C28.8 8.68 23.07 3 16.04 3Zm0 23.27h-.01a10.6 10.6 0 0 1-5.4-1.47l-.39-.23-4.1 1.07 1.1-3.98-.26-.41a10.5 10.5 0 0 1-1.62-5.55c0-5.83 4.76-10.57 10.6-10.57 5.84 0 10.6 4.74 10.6 10.57 0 5.83-4.76 10.57-10.52 10.57Zm5.8-7.92c-.32-.16-1.88-.92-2.17-1.03-.29-.1-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.87-1.76-2.19-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.71-1.71-.98-2.34-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.64 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.41 5.42 4.78.76.33 1.35.52 1.81.67.76.24 1.45.2 2 .12.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  )
}

export function IconeInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconeFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.87.25-1.46 1.5-1.46h1.6V4.35A21 21 0 0 0 14.27 4.2c-2.3 0-3.87 1.4-3.87 3.97v2.23H7.8v3h2.6V21h3.1Z" />
    </svg>
  )
}

export function IconeSeta({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function IconeCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

/** Banda de rodagem LISA (sulcos contínuos): eixo direcional e carreta. */
export function BandaLisa({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 220" aria-hidden className={className}>
      <defs>
        <linearGradient id="borracha-l" x1="0" x2="1">
          <stop offset="0" stopColor="#141417" />
          <stop offset=".5" stopColor="#2a2a30" />
          <stop offset="1" stopColor="#141417" />
        </linearGradient>
      </defs>
      <rect x="10" y="4" width="140" height="212" rx="26" fill="url(#borracha-l)" stroke="#3a3a42" />
      {[38, 62, 98, 122].map((x) => (
        <path key={x} d={`M${x} 8 q4 13 0 26 t0 26 t0 26 t0 26 t0 26 t0 26 t0 26 t0 26`} fill="none" stroke="#050506" strokeWidth="7" strokeLinecap="round" />
      ))}
      <rect x="77" y="8" width="6" height="204" rx="3" fill="#050506" />
    </svg>
  )
}

/** Banda de rodagem BORRACHUDA (blocos): eixo de tração. */
export function BandaBorrachuda({ className }: { className?: string }) {
  const linhas = Array.from({ length: 8 }, (_, i) => i)
  return (
    <svg viewBox="0 0 160 220" aria-hidden className={className}>
      <defs>
        <linearGradient id="borracha-b" x1="0" x2="1">
          <stop offset="0" stopColor="#141417" />
          <stop offset=".5" stopColor="#2a2a30" />
          <stop offset="1" stopColor="#141417" />
        </linearGradient>
      </defs>
      <rect x="10" y="4" width="140" height="212" rx="26" fill="url(#borracha-b)" stroke="#3a3a42" />
      {linhas.map((i) => {
        const y = 10 + i * 26
        const par = i % 2 === 0
        return (
          <g key={i} fill="#050506">
            <path d={`M14 ${y} h${par ? 44 : 30} l8 10 h-${par ? 44 : 30} z`} />
            <path d={`M146 ${y + 13} h-${par ? 30 : 44} l-8 10 h${par ? 30 : 44} z`} />
            <rect x="74" y={y + 4} width="12" height="9" rx="2" />
          </g>
        )
      })}
    </svg>
  )
}
