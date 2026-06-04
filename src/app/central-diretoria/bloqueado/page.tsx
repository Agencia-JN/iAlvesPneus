import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PaginaBloqueado() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center p-4 relative selection:bg-[#DC2626] selection:text-white">
      {/* Background Neon Glow */}
      <div className="absolute w-[300px] h-[300px] bg-[#DC2626]/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="glass-panel max-w-lg w-full p-8 sm:p-12 text-center rounded-none border-t-4 border-t-[#DC2626] relative z-10 space-y-6">
        
        {/* Logo iAlves */}
        <div className="flex justify-center mb-4">
          <div className="relative w-48 h-12 overflow-hidden bg-black">
            <Image
              src="/logoiAlves.png"
              alt="iAlves Pneus Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Ícone de Escudo / Bloqueio */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center rounded-full border border-[#DC2626]/20 animate-pulse">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              ></path>
            </svg>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
          Acesso Restrito
        </h1>

        {/* Mensagem Estrita do PRD */}
        <p className="text-gray-300 text-sm leading-relaxed font-semibold bg-red-950/20 border border-red-900/30 p-4 rounded-none">
          "Você não tem autorização para logar, o Administrativo recebeu alerta sobre sua tentativa, caso você seja autorizado em breve você será notificado pelo setor."
        </p>

        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest pt-2">
          Ip e dados de autenticação registrados para auditoria.
        </p>

        <div className="pt-4 border-t border-gray-900">
          <Link
            href="/"
            className="inline-block px-6 py-3 border border-gray-800 hover:border-gray-600 bg-white/5 text-white hover:text-white font-extrabold uppercase text-xs tracking-widest transition-all duration-300 rounded-none w-full"
          >
            Voltar para a Vitrine
          </Link>
        </div>

      </div>
    </div>
  );
}
