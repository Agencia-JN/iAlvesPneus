// ─── Dados da iAlves Pneus (um lugar só para trocar) ──────────────────────

export const SITE = {
  name: 'iAlves Pneus',
  url: 'https://www.ialvespneus.com.br',
  /** WhatsApp de vendas, só números com DDI */
  whatsapp: '5511966397245',
  whatsappDisplay: '(11) 96639-7245',
  instagram: 'https://www.instagram.com/ialvespneus',
  instagramHandle: '@ialvespneus',
  facebook: 'https://www.facebook.com/share/18eHAeMAMZ/',
  city: 'Guarulhos',
  region: 'SP',
  instagramSeguidores: '21 mil',
}

export const AGENCY = {
  name: 'Agência JN',
  whatsappUrl:
    'https://wa.me/5511940825120?text=' +
    encodeURIComponent('Olá! Vi o site da iAlves Pneus e quero um site assim para o meu negócio.'),
}

/** Medidas que a iAlves trabalha, na ordem de procura. Cada uma tem página própria (SEO). */
export const MEDIDAS = [
  {
    slug: 'pneu-295-80-r22-5',
    medida: '295/80 R22.5',
    largura: 295,
    perfil: 80,
    aro: '22.5',
    uso: 'Cavalo mecânico, carreta e truck pesado',
    destaque: true,
    resumo:
      'A medida mais rodada do transporte pesado: cavalo mecânico, carreta, bitrem, truck pesado e ônibus rodoviário.',
    veiculos: ['Cavalo mecânico (tração e direcional)', 'Carretas, bitrens e rodotrens', 'Caminhão truck pesado', 'Ônibus rodoviário'],
    dica: 'Na carreta e no eixo direcional do cavalo, o liso costuma render mais quilômetros. No eixo de tração, o borrachudo segura melhor em subida e pista molhada.',
  },
  {
    slug: 'pneu-275-80-r22-5',
    medida: '275/80 R22.5',
    largura: 275,
    perfil: 80,
    aro: '22.5',
    uso: 'Truck, toco e ônibus',
    destaque: true,
    resumo: 'Muito usada em caminhão toco e truck de médio porte, ônibus urbano e alguns cavalos mecânicos mais leves.',
    veiculos: ['Caminhão toco', 'Caminhão truck de médio porte', 'Ônibus urbano', 'Implementos de carga'],
    dica: 'Para quem roda mais na cidade e para muito, o borrachudo na tração ajuda na arrancada. Para estrada, o liso economiza.',
  },
  {
    slug: 'pneu-235-75-r17-5',
    medida: '235/75 R17.5',
    largura: 235,
    perfil: 75,
    aro: '17.5',
    uso: 'Caminhão leve, 3/4 e micro-ônibus',
    destaque: false,
    resumo: 'Medida de caminhão leve e 3/4, micro-ônibus e veículos de distribuição que rodam bastante na cidade.',
    veiculos: ['Caminhão 3/4', 'Caminhão leve de distribuição', 'Micro-ônibus', 'Implementos leves'],
    dica: 'No 3/4 que faz entrega urbana, o liso nos dois eixos costuma ser o mais econômico. Se roda em terra ou ladeira, vale o borrachudo na tração.',
  },
  {
    slug: 'pneu-215-75-r17-5',
    medida: '215/75 R17.5',
    largura: 215,
    perfil: 75,
    aro: '17.5',
    uso: 'VUC, 3/4 e utilitário de carga',
    destaque: false,
    resumo: 'Medida comum em VUC e caminhões leves de entrega urbana, que precisam de pneu resistente para o anda e para do dia a dia.',
    veiculos: ['VUC (veículo urbano de carga)', 'Caminhão leve', 'Caminhão 3/4', 'Utilitário de carga'],
    dica: 'Para VUC na cidade, o liso dura mais e roda mais macio. O borrachudo vale para quem entra em obra ou estrada de terra.',
  },
] as const

export type Medida = (typeof MEDIDAS)[number]

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
