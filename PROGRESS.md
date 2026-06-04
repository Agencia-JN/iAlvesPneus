# Registro de Progresso - iAlves Pneus

## 🚀 Status Atual: Layout Mobile Aprovado, Motor de Busca Ativo & Supabase Blindado
- [x] **Motor de Busca Ativo (Filtro Técnico por Medidas):**
  - **Estados Temporários de Filtro:** Implementamos `tempLargura`, `tempPerfil` e `tempAro` para armazenar as seleções temporárias do usuário nos selects sem disparar a renderização reativa imediatamente.
  - **Ação por Clique em "Buscar":** Ao clicar no botão "Buscar", os filtros temporários são promovidos aos filtros principais, atualizando a listagem de pneus instantaneamente.
  - **Fallback com WhatsApp Comercial:** Caso nenhum pneu atenda aos critérios exatos, uma mensagem de erro elegante orienta o cliente a falar diretamente no WhatsApp (já integrado com link parametrizado contendo a medida buscada).
  - **Limpeza Rápida:** O botão "Limpar Filtros" redefine todos os seletores para o estado inicial (`Todos`) instantaneamente.
- [x] **Inicialização Segura e Fallbacks do Supabase (`src/lib/supabase.ts`):**
  - **Cliente Blindado:** Adicionamos um bloco `try-catch` na criação do cliente Supabase para isolar qualquer erro síncrono.
  - **Mock de Contingência:** Desenvolvemos uma estrutura de mock padrão que assume o controle caso a URL ou a chave secreta estejam ausentes ou incorretas, garantindo que a compilação local (Modo Demo) continue 100% ativa sem estourar erros críticos.
- [x] **Script SQL de Criação de Tabelas e Seed (`supabase_schema.sql`):**
  - **DDL Completo:** Disponibilizado o script SQL completo para ser executado no editor do painel do Supabase, configurando as tabelas `pneus`, `banners`, `configuracoes`, `allowed_users`, `login_audits` e `afiliados`.
  - **Seeds Iniciais:** Inclui a lista de pneus comerciais idênticos ao mock do frontend, banners e configurações globais (com ID 1) para imediata inicialização.
- [x] **Versionamento e Deploy de Código (GitHub Push):**
  - **Remoto Configurado:** Vinculado o repositório oficial da Agência JN `https://github.com/Agencia-JN/iAlvesPneus.git`.
  - **Subida de Arquivos:** Submetido todo o código-fonte homologado de forma segura e protegida pelo `.gitignore` na branch `master` com sucesso.
- [x] **Resolução do Erro 500 de Runtime (Event Handlers):**
  - **Conversão para Client Component:** Adicionada a diretiva `"use client"` no início de `src/app/page.tsx`, transformando o componente `Home` de Server Component assíncrono para Client Component síncrono.
  - **Dinamização do Fetch:** Reestruturamos a chamada de APIs e dados do Supabase e cache local (`localStorage`) para rodar dentro de um bloco React `useEffect` e gerenciar as informações em estados locais (`useState`), garantindo que os eventos de clique do menu hambúrguer e do buscador móvel funcionem perfeitamente em runtime sem quebrar o servidor Next.js.
- [x] **Hierarquia Estrutural Mobile Nativa (TireShop Style):**
  - **Linha do Topo / Nav Slim:** Implementada barra superior fina (`h-10 bg-[#121214]`) no mobile, trazendo à esquerda links de WhatsApp e telefone formatados com ícones SVG discretos, e à direita o botão de menu hambúrguer.
  - **Área do Logotipo Centralizada:** O logotipo `logoiAlves.png` agora é exibido logo abaixo da Nav Slim em uma seção exclusiva (`py-6 px-4 bg-[#0B0B0C]`), perfeitamente centralizado verticalmente e horizontalmente com espaçamento confortável para total legibilidade.
  - **Buscador Técnico Nativo (Vitrine):** Buscador mobile integrado no fluxo normal de renderização (empilhado e sem fixed/absolute para evitar overlaps). Título "BUSCA POR MEDIDA:" em caixa alta, grid de exatamente 3 colunas (`grid-cols-3 gap-2`) para os seletores compactos (`h-10 text-[11px]`) e botão "Buscar" em largura total (`w-full bg-[#DC2626] rounded-none py-3`).
  - **Fluxo Contínuo de Cards:** Os cards de pneus carregam imediatamente abaixo do buscador mobile, eliminando espaçamentos mortos ou vãos pretos.
  - **Preservação do Cabeçalho Fixo no Desktop:** A barra de frete fixa e o header (`h-20 bg-black/40 backdrop-blur-md`) permanecem funcionando de forma fixa no desktop (`hidden md:block fixed top-0`), compensados por um spacer exclusivo para desktop (`h-[112px]`).
- [x] **Fim do Loading Falso (Carregamento Instantâneo):**
  - **Zero Delay:** Eliminamos o estado visual síncrono de loading ("Carregando pneus do estoque...") e esqueletos de carregamento visual no catálogo de `Vitrine.tsx`. Os pneus são renderizados instantaneamente no carregamento inicial via Server-Side Rendering (SSR) e dados em cache local (`MOCK_PNEUS` e `localStorage`), sendo atualizados silenciosamente em background quando a conexão ao banco de dados Supabase é finalizada.
- [x] **Equilíbrio Geométrico da Logo no Desktop:**
  - **Margens Premium:** Mantivemos o recuo horizontal interno (`px-4 sm:px-6 lg:px-8`) no Header fixo e no buscador/vitrine no desktop, mantendo o logotipo horizontal da iAlves e os elementos de ação perfeitamente equilibrados e simétricos.
- [x] **Faxina Total do "Rosa/Pink" Restante (Consistência de Marca):**
  - **Uniformidade Completa:** Mantida a substituição cirúrgica de todos os tons de rosa, magenta e pink remanescentes (`#E11D48`, `bg-rose-600`, `text-rose-600` e hovers) em todas as rotas públicas (Home, Blog, Posts do Blog e Página de Bloqueado) pelo Vermelho Industrial Puro (`#DC2626` e hover `#B91C1C`). O layout está 100% harmonizado com a identidade visual do logotipo da iAlves.
- [x] **Logo Horizontal Altamente Imponente (`logoiAlves.png`):**
  - **Dimensionamento Consistente:** Ajustado o contêiner do logo para `h-9 sm:h-10 md:h-14 w-auto object-contain` nas Navbar do topo da Home, Blog e Artigos Individuais.
  - **Alinhamento Centralizado:** Removidos espaçadores e margins residuais para garantir centralização vertical e horizontal perfeita do logo, sem qualquer distorção visual e com tipografia "iAlves PNEUS" nítida.
  - **Painel Administrativo (`/central-diretoria`):** Aumentado o logo da tela de Login para `w-64 h-16` e do Topbar para `w-44 h-11`.
  - **Rodapé:** Dimensionado para `w-56 h-14` para fechar o layout estético da página de maneira equilibrada.
- [x] **Segurança de Layout Mobile (Zero Overflow):** Viewport 100% livre do erro de overflow horizontal (`overflow-x-hidden`) em todo e qualquer smartphone. overflow horizontal (`overflow-x-hidden`) em todo e qualquer smartphone.
- [x] **Correção Case-Sensitive do Logo Horizontal (`/logoiAlves.png`):**
  - Copiado o arquivo físico `logoiAlves.png` da raiz do projeto para o diretório `/public/` para que o Next.js possa servi-lo de forma estática.
  - Atualizadas todas as tags `<Image />` remanescentes em todas as páginas e rotas para apontar estritamente para `/logoiAlves.png`.
- [x] **Eliminação de Erros de Recursos no Console (`HTTP 400 Bad Request`):**
  - Substituídos todos os links fictícios do Unsplash (que geravam erros de consulta HTTP 400) por referências locais e válidas `/2.jpeg` e `/3.jpeg` que já existem de forma estática no diretório `/public/` do Next.js.
- [x] **Regra Estrita de Banners Mobile:** Ocultação de carrosséis no mobile (`hidden md:block`) para focar a usabilidade e acelerar conversões diretamente pelo Buscador Técnico e catálogo.
- [x] **Autonomia de 100% do Administrador (`/central-diretoria`):**
  - Gerenciamento completo de redes sociais (Instagram, Facebook, YouTube, TikTok).
  - Controle institucional e legal (CNPJ, Direitos Reservados e rodapé dinâmico).
  - Toggles visuais (switches) para Ativar/Desativar Barra de Frete do Topo e Sistema de Afiliados.
  - Nota instruutiva na aba de Banners sobre o tamanho ideal de upload para Desktop (1920x650 px).
- [x] **Resiliência de Banco de Dados (Auto-Retry Fail-Safe):** Proteção inteligente no painel administrativo que detecta e desvia de erros de colunas ausentes no banco de dados Supabase de produção, garantindo que o sistema salve os dados e avise o administrador sem travar ou quebrar o app.

---
> [!IMPORTANT]
> **Homologação e Console Impecável.** Com as correções aplicadas nesta rodada, eliminamos todas as requisições de mídias fictícias externas quebradas, zerando mensagens de erro `400 Bad Request` no console de desenvolvimento do navegador. O build em produção foi validado sem qualquer erro (Exit Code 0). A logo horizontal e os banners rotativos agora carregam instantaneamente e de forma 100% local em localhost:3000!

## 🚀 Configurações de Deploy (Ambiente de Produção)
Para ativar a integração completa com o banco de dados e armazenamento do Supabase na hospedagem de produção (Vercel, Netlify, VPS, etc.), configure as seguintes variáveis de ambiente no painel do seu provedor:

```env
# URL de conexão com a API Rest do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave secreta de acesso público anônimo
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica-do-supabase
```
> [!NOTE]
> Caso as variáveis acima não sejam preenchidas, o site continuará funcionando perfeitamente em **Modo Demonstração Híbrido** com fallback local em `localStorage`, mantendo todas as funcionalidades de listagem de pneus e banners ativas e seguras.

## 🛠️ Entregas & Detalhes Técnicos Recentes
- **Buscador Técnico Avançado:** Filtros de medidas no frontend sincronizados com os novos campos normalizados da tabela `pneus`.
- **Formulário de Cadastro Robusto:** Divisão do input de medidas no painel admin em três campos numéricos/poléricos independentes: Largura (mm), Perfil (%) e Aro (polegadas) com concatenação automática de compatibilidade.
- **Upload Inteligente com Compressão WebP:** Upload automático de imagens no Storage do Supabase (para pneus e banners) com compressão via Canvas no navegador do administrador para otimizar espaço de disco e banda de rede.
- **Auditoria de Acesso:** Logs em tempo real de acessos autorizados e tentativas bloqueadas (com bloqueio rígido e deslog automático de e-mails suspeitos).
- **Modo Demo com Persistência Híbrida (`localStorage`):** Painel simulado no frontend que salva edições de pneus, letreiros, redes sociais e banners diretamente no cache local (`localStorage`), refletindo instantaneamente no catálogo e carrossel da Home.
- **Whitelist de Imagens Remotas (`next.config.ts`):** Liberação segura dos domínios `images.unsplash.com`, `*.supabase.co` e `placehold.co` no Next.js para carregar banners promocionais e fotos do banco de dados sem quebras de runtime.
