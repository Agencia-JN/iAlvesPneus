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
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : '';
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Limpa o número de WhatsApp removendo caracteres especiais e garante o código do país
 * Ex: "(11) 99999-9999" -> "5511999999999" (13 dígitos numéricos)
 */
export function sanitizeWhatsapp(value: string): string {
  // Remove tudo que não for dígito
  const digits = value.replace(/\D/g, '');
  
  // Se for digitado apenas o celular local (11 dígitos, ex: 11999999999)
  // injetamos o prefixo "55" (Brasil)
  if (digits.length === 11) {
    return `55${digits}`;
  }
  // Se for digitado com prefixo do país (13 dígitos, ex: 5511999999999)
  if (digits.length === 13) {
    return digits;
  }
  
  // Fallback caso seja parcial ou diferente: retorna os dígitos brutos
  return digits;
}
