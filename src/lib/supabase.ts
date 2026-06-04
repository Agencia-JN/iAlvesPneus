import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isPlaceholderUrl = !supabaseUrl || supabaseUrl === 'seu_link_aqui';
const isPlaceholderKey = !supabaseAnonKey || supabaseAnonKey === 'sua_chave_anon_aqui';

// Emite o aviso apenas uma vez por processo para evitar spam no build (múltiplos workers)
let _supabaseWarned = false;
if (!_supabaseWarned && (isPlaceholderUrl || isPlaceholderKey)) {
  _supabaseWarned = true;
  if (isPlaceholderUrl) {
    console.info(
      'ℹ️ iAlves Pneus [Supabase]: NEXT_PUBLIC_SUPABASE_URL não configurada. Operando em modo fallback local.'
    );
  }
  if (isPlaceholderKey) {
    console.info(
      'ℹ️ iAlves Pneus [Supabase]: NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada. Operando em modo fallback local.'
    );
  }
}

// Inicializa o cliente com URLs de fallback seguras para evitar falhas críticas em tempo de build
const finalUrl = isPlaceholderUrl ? 'https://placeholder-project.supabase.co' : supabaseUrl;
const finalKey = isPlaceholderKey ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy' : supabaseAnonKey;

let supabaseInstance: any;

try {
  supabaseInstance = createClient(finalUrl, finalKey, {
    auth: {
      persistSession: typeof window !== 'undefined',
      autoRefreshToken: typeof window !== 'undefined',
      detectSessionInUrl: typeof window !== 'undefined',
    },
  });
} catch (error) {
  console.warn('⚠️ Falha crítica ao inicializar o cliente do Supabase, criando mock de segurança:', error);
  supabaseInstance = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: new Error('Supabase inativo') }),
          order: async () => ({ data: [], error: new Error('Supabase inativo') }),
        }),
        order: async () => ({ data: [], error: new Error('Supabase inativo') }),
      }),
    }),
  };
}

export const supabase = supabaseInstance;

/**
 * Função utilitária para verificar se a conexão com o Supabase está ativa e configurada.
 */
export function isSupabaseConfigured(): boolean {
  return !isPlaceholderUrl && !isPlaceholderKey;
}
