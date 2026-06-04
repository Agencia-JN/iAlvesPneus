import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Helper simples para gerar o slug a partir do título do post
function generateSlug(marca: string, nome: string): string {
  const cleanMarca = marca.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const cleanNome = nome.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // Garante unicidade
  return `pneu-${cleanMarca}-${cleanNome}-promocao-especial-${randomSuffix}`;
}

// Artigo de fallback de alta qualidade gerado nativamente se chaves estiverem ausentes
function generateFallbackArticle(pneu: any) {
  const precoFormatado = pneu.preco_vista.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  
  const titulo = `Vale a pena comprar o Pneu ${pneu.marca} ${pneu.nome} ${pneu.medida}? Análise Completa`;
  
  const conteudo = `
    <h2>O Pneu ${pneu.marca} ${pneu.nome} é bom mesmo para o trabalho pesado?</h2>
    <p>Quem vive na estrada sabe: o pneu é o coração do caminhão. Se você é caminhoneiro autônomo ou frotista, sabe que cada centavo economizado em pneu representa mais lucro no frete. Hoje, vamos analisar de forma honesta o <strong>Pneu ${pneu.marca} ${pneu.nome}</strong> de medida <strong>${pneu.medida}</strong>, um modelo projetado especificamente para aguentar as condições desafiadoras das rodovias brasileiras.</p>
    
    <h2>Resistência de Sulco e Durabilidade de Carcaça</h2>
    <p>Com um sulco técnico de <strong>${pneu.sulco_mm} mm</strong> de profundidade, o Pneu ${pneu.marca} oferece excelente tração e alta resistência contra cortes e pancadas nas estradas. Essa profundidade reforçada reduz a taxa de desgaste regular e prolonga a vida útil da primeira vida do pneu, permitindo também excelentes índices de recapabilidade futura.</p>
    <p>Seja no modelo ${pneu.categoria} de alta aderência ou nas rotas de longa distância, a distribuição uniforme de pressão nas bandas de rodagem reduz o superaquecimento, um dos maiores inimigos da vida útil do pneu em rodagens pesadas com carga máxima.</p>
    
    <h2>Custo-Benefício Imbatível: Oportunidade À Vista</h2>
    <p>No quesito economia, o Pneu ${pneu.marca} ${pneu.nome} se destaca no mercado atual de carga pesada. Por apenas <strong>${precoFormatado} à vista</strong> por unidade, você adquire um pneu com alta tecnologia de carcaça e excelente resposta em frenagens em pistas secas e molhadas.</p>
    
    <h2>Conclusão e Como Comprar via WhatsApp</h2>
    <p>Para quem busca segurança para a família e para a carga, economia real por quilômetro rodado e alta durabilidade de banda, o Pneu ${pneu.marca} ${pneu.nome} na medida ${pneu.medida} é uma escolha de confiança. Não perca tempo e aproveite as condições de estoque local a pronta entrega. Clique no botão de compra para falar agora mesmo com o Iago no WhatsApp e garantir o seu lote especial pelo valor de <strong>${precoFormatado}</strong> à vista!</p>
  `;

  return { titulo, conteudo };
}

export async function GET() {
  try {
    // 1. Verifica se o Supabase está ativo
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conexão com o Supabase ausente ou não configurada no .env.local.',
        },
        { status: 500 }
      );
    }

    // 2. Busca chaves de API nas configurações do banco (ID = 1)
    const { data: configs, error: configError } = await supabase
      .from('configuracoes')
      .select('*')
      .eq('id', 1)
      .single();

    if (configError || !configs) {
      return NextResponse.json(
        { success: false, error: 'Configurações gerais (tabela configuracoes) não localizadas no banco.' },
        { status: 500 }
      );
    }

    // 3. Busca um pneu ativo no catálogo de forma aleatória
    const { data: pneus, error: pneusError } = await supabase
      .from('pneus')
      .select('*')
      .eq('visibilidade', 'publico');

    if (pneusError || !pneus || pneus.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum pneu público/ativo localizado para gerar artigos.' },
        { status: 404 }
      );
    }

    // Sorteia um pneu para o tema do artigo
    const pneuSelecionado = pneus[Math.floor(Math.random() * pneus.length)];
    const pneuId = pneuSelecionado.id;
    const marca = pneuSelecionado.marca;
    const nome = pneuSelecionado.nome;
    const medida = pneuSelecionado.medida;
    const sulco = pneuSelecionado.sulco_mm;
    const preco = Number(pneuSelecionado.preco_vista).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    // Se NÃO existirem chaves de API reais cadastradas, usa o gerador de fallback estático
    const geminiKey = configs.gemini_api_key;
    const groqKey = configs.groq_api_key;

    if (!geminiKey || geminiKey.startsWith('AIzaSy_placeholder') || geminiKey === '') {
      console.log('🤖 iAlves Blog [Modo Demo]: Gerando artigo persuasivo simulado de alta conversão...');
      const mockArticle = generateFallbackArticle(pneuSelecionado);
      const slug = generateSlug(marca, nome);

      // Insere o post simulado no banco de dados
      const { error: insertError } = await supabase.from('posts').insert({
        pneu_vinculado_id: pneuId,
        titulo: mockArticle.titulo,
        slug: slug,
        conteudo: mockArticle.conteudo,
        imagem_url: pneuSelecionado.imagem_url,
      });

      if (insertError) throw insertError;

      return NextResponse.json({
        success: true,
        mode: 'simulado',
        pneu: `${marca} - ${nome}`,
        titulo: mockArticle.titulo,
        slug: slug,
      });
    }

    // Prompt estrito de engenharia comercial travando especificações reais do produto
    const prompt = `Escreva um artigo de blog altamente persuasivo focado em SEO Comercial e no Google Discover para o pneu de carga pesada:
    Fabricante/Marca: ${marca}
    Modelo do Pneu: ${nome}
    Medida Técnica: ${medida}
    Profundidade de Sulco: ${sulco} mm
    Preço à Vista: ${preco}
    Tipo de Sulco: ${pneuSelecionado.categoria}
    
    INSTRUÇÕES RÍGIDAS DE CONTEÚDO:
    1. Crie um Título curto, direto e irresistível focado em caminhoneiros, autônomos ou frotistas de transporte pesado.
    2. Escreva o artigo no formato literário de blog com uma introdução engajante, intertítulos (usando apenas tags <h2> e <h3>) abordando resistência física, custo-benefício de rodagem e economia por quilômetro rodado.
    3. Trave os dados técnicos: Você NÃO PODE alucinar, inventar ou alterar a medida "${medida}" ou o preço "${preco}". Os dados técnicos fornecidos devem estar 100% corretos ao longo do texto.
    4. Crie uma conclusão forte direcionando o leitor para o botão de compras no WhatsApp para garantir o pneu com desconto especial à vista pelo valor de ${preco}.
    5. Retorne a resposta em HTML limpo, contendo APENAS as tags <h2>, <h3>, <p>, <ul>, <li>, <strong>. Não use CSS inline, não use tags <html>, <head> ou <body>. Retorne apenas o conteúdo puro.
    
    A primeira linha deve ser EXATAMENTE o Título do post no formato "TITULO: [Escreva o título aqui]". As linhas seguintes devem ser o corpo do artigo em HTML.`;

    let generatedTitle = '';
    let generatedContent = '';
    let apiUsed = '';

    // =========================================================================
    // PLANO A: Chamada Nativa API do Gemini (Google)
    // =========================================================================
    try {
      console.log('💎 iAlves Blog: Tentando conexão com API do Gemini...');
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API do Gemini: Status ${response.status}`);
      }

      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!rawText) throw new Error('Retorno vazio do Gemini.');

      // Processa o texto gerado separando o título do conteúdo
      const lines = rawText.split('\n');
      const titleLine = lines.find((l: string) => l.startsWith('TITULO:'));
      if (titleLine) {
        generatedTitle = titleLine.replace('TITULO:', '').trim();
        generatedContent = lines.filter((l: string) => !l.startsWith('TITULO:')).join('\n').trim();
      } else {
        generatedTitle = `Promoção Imperdível: Pneu ${marca} ${nome} na medida ${medida}`;
        generatedContent = rawText;
      }
      
      apiUsed = 'Gemini 1.5 Flash';
    } catch (geminiError) {
      console.warn('⚠️ Falha no Gemini. Iniciando Fallback automático para a Groq (Llama 3)...', geminiError);

      // =========================================================================
      // PLANO B (FALLBACK): Chamada Nativa API da Groq (Llama 3)
      // =========================================================================
      if (!groqKey || groqKey === '') {
        throw new Error('Fallback acionado, mas chave da API da Groq está ausente.');
      }

      const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
      
      const response = await fetch(groqUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'user',
              content: prompt,
            }
          ],
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API da Groq/Llama3: Status ${response.status}`);
      }

      const json = await response.json();
      const rawText = json?.choices?.[0]?.message?.content;
      
      if (!rawText) throw new Error('Retorno vazio da Groq/Llama3.');

      const lines = rawText.split('\n');
      const titleLine = lines.find((l: string) => l.startsWith('TITULO:'));
      if (titleLine) {
        generatedTitle = titleLine.replace('TITULO:', '').trim();
        generatedContent = lines.filter((l: string) => !l.startsWith('TITULO:')).join('\n').trim();
      } else {
        generatedTitle = `Oportunidade de Estrada: Pneu ${marca} ${nome} de Medida ${medida}`;
        generatedContent = rawText;
      }

      apiUsed = 'Groq Llama 3';
    }

    // Limpa possíveis formatações markdown residuais da IA (```html ... ```)
    generatedContent = generatedContent.replace(/```html/g, '').replace(/```/g, '').trim();

    // 4. Criação do slug e salvamento final na tabela 'posts'
    const slug = generateSlug(marca, nome);

    const { error: insertError } = await supabase.from('posts').insert({
      pneu_vinculado_id: pneuId,
      titulo: generatedTitle,
      slug: slug,
      conteudo: generatedContent,
      imagem_url: pneuSelecionado.imagem_url,
    });

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      apiUsed: apiUsed,
      pneu: `${marca} - ${nome}`,
      titulo: generatedTitle,
      slug: slug,
    });

  } catch (err: any) {
    console.error('Falha geral no motor de blog:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Erro interno ao processar o artigo da IA.',
      },
      { status: 500 }
    );
  }
}
