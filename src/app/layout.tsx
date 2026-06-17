import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ialvespneus.com.br"),
  title: {
    default: "iAlves Pneus | Pneus de Carga e Caminhão Novos",
    template: "%s | iAlves Pneus"
  },
  description: "iAlves Pneus - Distribuidora especializada em pneus de carga, pneus para caminhão, recapagem e rodas. Alta performance, robustez extrema e máxima tração para frotas de caminhões, ônibus e implementos rodoviários.",
  keywords: ["Pneus de carga", "pneus para caminhão", "recapagem", "iAlves Pneus", "distribuidora de pneus", "pneu borrachudo", "pneu liso", "pneu de ônibus", "recapadora", "pneus novos"],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "iAlves Pneus | Pneus de Carga e Caminhão Novos",
    description: "Distribuidora de pneus de carga novos e recapagem para caminhão e ônibus. Máxima tração e durabilidade para frotas com entrega expressa.",
    url: "https://ialvespneus.com.br",
    siteName: "iAlves Pneus",
    images: [
      {
        url: "/logoiAlves.png",
        width: 1200,
        height: 630,
        alt: "iAlves Pneus Logotipo Oficial",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "iAlves Pneus | Pneus de Carga e Caminhão Novos",
    description: "Distribuidora de pneus de carga novos e recapagem para caminhão e ônibus. Alta performance e durabilidade para sua frota.",
    images: ["/logoiAlves.png"],
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png' }
    ],
  },
  manifest: '/favicon/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased w-full max-w-full overflow-x-hidden`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#0B0B0C] w-full max-w-full overflow-x-hidden" suppressHydrationWarning>{children}</body>
    </html>
  );
}
