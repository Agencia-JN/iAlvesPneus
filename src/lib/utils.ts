/**
 * Formata um número float em formato de moeda brasileira (R$ 1.530,00)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Remove qualquer caractere que não seja número de uma string de moeda
 * e retorna o valor decimal correspondente (ex: "R$ 1.530,00" -> 1530.00)
 */
export function parseCurrencyInput(value: string): number {
  // Remove tudo exceto dígitos numéricos
  const cleanDigits = value.replace(/\D/g, '');
  if (!cleanDigits) return 0;
  
  // Converte para centavos (ex: "153000" -> 1530.00)
  return parseFloat(cleanDigits) / 100;
}

/**
 * Aplica máscara de moeda em tempo real ao digitar em um input de texto
 * Ex: "1530" -> "R$ 15,30"
 */
export function maskCurrency(value: string): string {
  const cleanDigits = value.replace(/\D/g, '');
  if (!cleanDigits) return 'R$ 0,00';
  
  const numValue = parseFloat(cleanDigits) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

/**
 * Aplica máscara de telefone WhatsApp em tempo real: (XX) XXXXX-XXXX
 */
export function maskWhatsapp(value: string): string {
  // Remove tudo que não for dígito
  let digits = value.replace(/\D/g, '');
  
  // Se começar com 55 e tiver mais de 11 dígitos, remove o 55 para formatar na regra do Brasil
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }
  
  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : '';
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Limpa o número de WhatsApp retornando apenas o DDD + número (10 ou 11 dígitos)
 * Ex: "(11) 99999-9999" -> "11999999999"
 */
export function sanitizeWhatsapp(value: string): string {
  let digits = value.replace(/\D/g, '');
  
  // Se começar com 55 e for um número brasileiro completo (12 ou 13 dígitos), remove o 55
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }
  
  return digits;
}

/**
 * Constrói a URL para contato do WhatsApp garantindo o código do país 55 e a mensagem opcional codificada
 */
export function getWhatsappLink(phone: string, text?: string): string {
  const digits = phone.replace(/\D/g, '');
  // Garante obter apenas DDD + número (removendo 55 se o usuário salvou antes)
  const cleanDigits = digits.startsWith('55') && (digits.length === 12 || digits.length === 13)
    ? digits.slice(2)
    : digits;
  
  const formattedNumber = `55${cleanDigits}`;
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${formattedNumber}${query}`;
}

/**
 * Aplica máscara de CNPJ em tempo real ao digitar em um input de texto
 * Ex: "00000000000100" -> "00.000.000/0001-00"
 */
export function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

/**
 * Valida se um link pertence especificamente a uma determinada rede social.
 * Retorna true se vazio ou se for um link válido da rede informada.
 */
export function validateSocialLink(url: string, platform: 'instagram' | 'facebook' | 'youtube' | 'tiktok'): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true; // Vazio é permitido
  
  try {
    // Permite que o usuário insira apenas o nome de usuário (ex: "ialvespneus" ou "@ialvespneus")
    if (!trimmed.includes('.') && !trimmed.includes('/')) {
      return true;
    }
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const hostname = parsed.hostname.toLowerCase();
    
    if (platform === 'instagram') {
      return hostname.includes('instagram.com');
    }
    if (platform === 'facebook') {
      return hostname.includes('facebook.com') || hostname.includes('fb.com');
    }
    if (platform === 'youtube') {
      return hostname.includes('youtube.com') || hostname.includes('youtu.be');
    }
    if (platform === 'tiktok') {
      return hostname.includes('tiktok.com');
    }
    return false;
  } catch (e) {
    const clean = trimmed.toLowerCase();
    if (platform === 'instagram') return clean.includes('instagram.com');
    if (platform === 'facebook') return clean.includes('facebook.com') || clean.includes('fb.com');
    if (platform === 'youtube') return clean.includes('youtube.com') || clean.includes('youtu.be');
    if (platform === 'tiktok') return clean.includes('tiktok.com');
    return false;
  }
}
