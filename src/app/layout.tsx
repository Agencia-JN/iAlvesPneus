import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, Inter, Montserrat } from 'next/font/google'
import { SITE } from '@/config/site'
import './globals.css'

const titulos = Barlow_Condensed({
  variable: '--font-titulo',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const destaque = Montserrat({
  variable: '--font-destaque',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
})

const texto = Inter({
  variable: '--font-texto',
  subsets: ['latin'],
  display: 'swap',
})

const TITULO = 'Pneus para Caminhão em Guarulhos'
const DESCRICAO =
  'Pneus novos para caminhão aro 17,5 e 22,5: 295/80, 275/80, 235/75 e 215/75. Liso e borrachudo, preço à vista e entrega para Guarulhos, Grande SP e todo o Brasil. Cotação em 2 minutos no WhatsApp.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${TITULO} | iAlves Pneus`, template: '%s | iAlves Pneus' },
  description: DESCRICAO,
  applicationName: SITE.name,
  keywords: [
    'pneu de caminhão',
    'pneus para caminhão',
    'pneu 295/80 R22.5',
    'pneu 275/80 R22.5',
    'pneu 235/75 R17.5',
    'pneu 215/75 R17.5',
    'pneu borrachudo',
    'pneu liso',
    'pneu de carga',
    'pneu de ônibus',
    'pneu caminhão Guarulhos',
    'pneu de caminhão Guarulhos',
    'pneu caminhão São Paulo',
    'pneu aro 22.5',
    'pneu aro 17.5',
    'iAlves Pneus',
  ],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: SITE.name,
    title: 'iAlves Pneus | Pneus para caminhão com cotação em 2 minutos',
    description: DESCRICAO,
    images: [{ url: '/lp/og.jpg', width: 1200, height: 630, alt: 'iAlves Pneus: pneus novos para caminhão' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'iAlves Pneus | Pneus para caminhão com cotação em 2 minutos',
    description: DESCRICAO,
    images: ['/lp/og.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png' }],
  },
  manifest: '/favicon/site.webmanifest',
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${titulos.variable} ${destaque.variable} ${texto.variable} antialiased`}>
      <body>{children}</body>
    </html>
  )
}
