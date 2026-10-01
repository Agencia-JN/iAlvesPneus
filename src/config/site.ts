// ─── Dados da iAlves Pneus (um lugar só para trocar) ──────────────────────

export const SITE = {
  name: 'iAlves Pneus',
  url: 'https://ialvespneus.com.br',
  /** WhatsApp de vendas, só números com DDI */
  whatsapp: '5511966397245',
  whatsappDisplay: '(11) 96639-7245',
  instagram: 'https://www.instagram.com/ialvespneus',
  instagramHandle: '@ialvespneus',
  facebook: 'https://www.facebook.com/share/18eHAeMAMZ/',
  city: 'São Paulo',
  region: 'SP',
}

export const AGENCY = {
  name: 'Agência JN',
  whatsappUrl:
    'https://wa.me/5511940825120?text=' +
    encodeURIComponent('Olá! Vi o site da iAlves Pneus e quero um site assim para o meu negócio.'),
}

/** Medidas que a iAlves trabalha, na ordem de procura. */
export const MEDIDAS = [
  {
    medida: '295/80 R22.5',
    uso: 'Cavalo mecânico, carreta e truck pesado',
    destaque: true,
  },
  {
    medida: '275/80 R22.5',
    uso: 'Truck, toco e ônibus',
    destaque: true,
  },
  {
    medida: '235/75 R17.5',
    uso: 'Caminhão leve, 3/4 e micro-ônibus',
    destaque: false,
  },
  {
    medida: '215/75 R17.5',
    uso: 'VUC, 3/4 e utilitário de carga',
    destaque: false,
  },
] as const

export const MARCAS = [
  'XBRI',
  'Durable',
  'Deruibo',
  'Doublestar',
  'Neupar',
  'Kapsen',
  'Westlake',
  'Royal Black',
  'Sunfull',
  'Supercargo',
  'Driveforce',
  'DRC',
  'Advanced',
]

export function whatsappLink(mensagem = 'Olá! Vim pelo site e quero uma cotação de pneu.'): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(mensagem)}`
}
