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
  title: "iAlves Pneus | Pneus Borrachudos e Lisos para Carga Pesada",
  description: "Compre pneus novos de alta durabilidade, máxima tração e performance para frotas de caminhões e implementos rodoviários. Preço à vista imbatível no PIX e Frete Grátis para compras acima de 4 pneus!",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "iAlves Pneus | Pneus Borrachudos e Lisos para Carga Pesada",
    description: "Tudo em pneus novos de alta durabilidade e tração para caminhões e frotas. Aproveite frete grátis acima de 4 pneus e descontos incríveis no PIX!",
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
