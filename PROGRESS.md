# Registro de Progresso - iAlves Pneus

## 🚀 Status Atual: Painel Protegido — Acesso Restrito por Tabela `administradores`

### ✅ Controle de Exibição do Hero na Vitrine (16/06/2026)

- [x] **Campo `hero_ativo` no Supabase:**
  - Adicionado campo booleano `hero_ativo` com default `FALSE` na tabela `configuracoes` para controlar a exibição da seção principal.
  - Criada a migration isolada `migration_add_hero_toggle.sql` no diretório raiz do projeto.
- [x] **Interface Condicional no Painel Administrativo:**
  - Adicionado interruptor Switch/Toggle "Ativar Hero Banner na Vitrine" na seção "HERO CONFIG".
  - Entradas de texto "Título Principal do Hero" e "Subtítulo do Hero" agora são renderizadas condicionalmente e só aparecem se o interruptor estiver ligado (true).
  - Validação de título no salvamento agora só é exigida caso o Hero esteja ativo.
- [x] **Renderização Dinâmica na Vitrine Pública:**
  - Página principal do e-commerce consome o estado `hero_ativo` e exibe condicionalmente o banner/seção de Hero com tipografia industrial premium.

### ✅ Ferramentas em Massa para Catálogo de Pneus (16/06/2026)

- [x] **Zerar Estoque Completo (Danger Zone com 3 Travas):**
  - Botão vermelho "Zerar Todo o Estoque" na barra de ferramentas com 3 confirmações sequenciais obrigatórias (1/3, 2/3, 3/3) usando a função `askConfirmation` encadeada.
  - Executa busca de todas as imagens no Storage, remoção em lote dos arquivos, e depois `DELETE` de todas as linhas da tabela `pneus` no Supabase. O estado React é zerado imediatamente após o sucesso.
- [x] **Download de Template CSV:**
  - Botão "Baixar Planilha Padrão" gera e baixa automaticamente o arquivo `template_estoque.csv` com os cabeçalhos exatos do banco (`nome, marca, categoria, largura, perfil, aro, preco_a_vista, quantidade_estoque`) e uma linha de exemplo preenchida.
- [x] **Importação em Massa via CSV:**
  - Botão "Importar Planilha (CSV)" permite upload de arquivo `.csv`, parseado com `FileReader` nativo. Linhas são convertidas em objetos e inseridas em lote via `supabase.from('pneus').insert(array)`.
  - Imagem padrão atribuída automaticamente conforme a categoria (Borrachudo/Liso). Status do produto definido como `ativo` se estoque > 0 ou `inativo` se estoque = 0.

### ✅ Sistema de Gestão de Estoque Profissional e Deduplicação (16/06/2026)

- [x] **Deduplicação de Registros (Database Audit):**
  - Identificadas e eliminadas as linhas duplicadas na tabela `pneus` no Supabase (que continham até 6 cópias do mesmo item devido a cliques múltiplos de rede no passado).
  - Criado o script SQL determinístico [cleanup_duplicates.sql](file:///g:/Desenvolvimento%20Clientes/iAlvesPneus/cleanup_duplicates.sql) que remove os duplicados mantendo o registro original (mais antigo) de forma segura.
- [x] **Evolução do Banco de Dados (Schema de Estoque):**
  - Adicionadas as colunas `quantidade_estoque` (INTEGER, padrão 10) e `status_produto` (TEXT, padrão 'ativo') na tabela `pneus`.
  - Criado o script SQL [upgrade_pneus_inventory.sql](file:///g:/Desenvolvimento%20Clientes/iAlvesPneus/upgrade_pneus_inventory.sql) e atualizado o arquivo mestre `supabase_schema.sql` para garantir a compatibilidade do banco.
  - Definido estoque inicial de 10 unidades para os pneus existentes para evitar que desapareçam da vitrine após a implantação.
- [x] **Refatoração Completa do Painel Administrativo:**
  - **Índice Numérico:** Adicionada a coluna `#` exibindo o índice das linhas (1, 2, 3...) no Catálogo de Pneus para fácil conferência.
  - **Novos Atributos Visuais:** Adicionadas as colunas "Estoque" (número de pneus) e "Status" (badges coloridos: verde para *Ativo*, vermelho para *Inativo* ou *Esgotado*).
  - **Modal de Cadastro/Edição:** Incluídos os campos de entrada para "Quantidade em Estoque" (com validação numérica) e seleção de "Status do Produto".
  - **Regra de Negócio Automatizada:** Ao salvar um pneu com estoque menor ou igual a zero, seu status é alterado automaticamente para `inativo`.
  - **Ação Principal de Desativação:** Criada a função `toggleStatusPneu` que permite ativar e desativar produtos com um clique rápido de botão na tabela.
  - **Proteção Rigorosa de Exclusão (Hard Delete Gated):** O botão "Excluir" foi convertido para "Excluir Físico" com estilização discreta. Ele exige dupla confirmação sequencial e rigorosa (Aviso de Exclusão Física 1/2 e Alerta Crítico 2/2) para blindar contra deleções acidentais e arquivos órfãos de mídia.
- [x] **Atualização do Monitor de Recursos:**
  - O monitor lateral da diretoria foi atualizado para exibir as métricas de estoque em tempo real: pneus Cadastrados, Ativos, Esgotados e total de Banners promocionais.
- [x] **Filtragem do Catálogo na Vitrine Pública (E-Commerce):**
  - Modificada a query de pneus em `src/app/page.tsx` para carregar exclusivamente os itens que tenham `status_produto = 'ativo'` e `quantidade_estoque > 0`. Produtos inativos ou sem estoque são ocultados automaticamente da vitrine de e-commerce.
- [x] **Estabilização da Exclusão Física e UX de Afiliados (16/06/2026):**
  - **Correção no Fluxo de Confirmação:** Corrigida a concorrência de agendamentos no `askConfirmation` onde fechar o primeiro modal anulava a exibição do segundo. Modificada a ordem para garantir a abertura em cascata das confirmações de `deletePneu`.
  - **Deduplicação da Lista de Afiliados:** Criada a função `fetchAfiliados` e adicionado o filtro por `Map` (Deduplication) na ingestão de dados em `loadDatabaseData` e `fetchAfiliados` para blindar o estado contra duplicações visuais.
  - **Copiar para Área de Transferência (Clipboard):** Removido o corte agressivo do layout na célula do link de indicação, e implementado um botão com ícone de clipboard e feedback visual temporário ("Copiado!") associado ao afiliado correspondente.
- [x] **Organização e Configuração de Favicons (16/06/2026):**
  - Criada a pasta `public/favicon/` e movidos todos os 7 arquivos de ícones soltos na raiz para dentro dela.
  - Atualizado o objeto `metadata` no arquivo `src/app/layout.tsx` para mapear os caminhos corretos de `icon`, `apple-touch-icon` e o manifesto (`site.webmanifest`), limpando a raiz do repositório.
- [x] **Blindagem do Gerenciamento de Banners contra Duplicações e Falhas de Exclusão (16/06/2026):**
  - **Prevenção de Double-Submit:** O botão "Confirmar Banner" recebeu a propriedade `disabled={isLoading}` (e `isUploading`) para travar cliques duplos durante o processamento da imagem ou gravação no banco de dados.
  - **Substituição de Estado Sólida:** Confirmada a atribuição exclusiva de arrays limpos via `setBanners(data)` em todo o ciclo de vida do painel admin e home page, eliminando concatenações redundantes.
  - **Exclusão Segura Reordenada:** Refatorada a função `deleteBanner` para executar rigorosamente o `DELETE` no banco de dados Supabase antes de remover o arquivo do Storage, impedindo órfãos em caso de falha e restaurando o estado da interface via `try/catch`.

### ✅ Estabilização da Central da Diretoria e Fluxo de Sessão (16/06/2026)

- [x] **Resolução do Loop Infinito no F5:**
  - Implementado carregamento dual de sessão via `getSession()` (síncrono/local) e `onAuthStateChange` (eventos futuros).
  - Eliminado deadlock: a função de verificação `checkAuth` agora recebe a sessão diretamente como argumento, evitando concorrência de rede e loops infinitos de recarregamento.
  - Implementado timer de fallback absoluto de 10 segundos para forçar o encerramento do estado `authLoading` em redes instáveis.
- [x] **Otimização de Estados de Carregamento (Loading UX):**
  - Removido overlay bloqueante de carregamento da tela cheia durante ações de salvamento.
  - Adicionado carregamento inline nos botões de ação (ex: "Confirmar", "Salvar"), garantindo que a tela permaneça interativa.
  - Padronização de blocos `try / catch / finally` em todos os submits (Pneus, Banners, Configurações, Afiliados e Admins) para assegurar o reset correto do estado `loading(false)`.
- [x] **Refatoração Completa do Componente de Banners (Carrossel):**
  - **Limpeza do Frontend:** Removida a sobreposição de textos, botões e camadas de gradiente escuro (`bg-black/40`, `bg-gradient-to-t`, etc.). As imagens agora são renderizadas com 100% de brilho e clareza.
  - **Exibição Completa (Sem Cortes):** Alterado o dimensionamento da imagem do banner para utilizar `object-contain`, eliminando cortes nas laterais em telas grandes e exibindo a arte de forma integral.
  - **Banner 100% Clicável:** Envolvida a tag `<Image>` em uma tag `<a>` de redirecionamento, tornando o banner inteiro clicável.
  - **Carrossel Dinâmico e Tempo de Transição:** Adicionada a coluna `banner_tempo_transicao` (padrão: 6 segundos) na tabela `configuracoes` e criado um input numérico nas Configurações Globais do painel administrativo. O carrossel lê dinamicamente esse intervalo para controlar o autoplay.
  - **Limpeza do Banco e Esquemas:** Criado script de migração SQL `add_banner_transition.sql` e atualizado `supabase_schema.sql`. Os campos de título, subtítulo e botão de banner agora são totalmente ignorados, deixando o formulário de banners apenas com Upload de Imagem, URL de Redirecionamento e Status Ativo.
- [x] **Arquitetura de Limpeza de Armazenamento e Monitor de Recursos:**
  - **Política de Hard Delete:** As remoções de Banners, Pneus e Logotipo realizam operações SQL `DELETE` diretas, garantindo que nenhum item apagado permaneça como soft delete.
  - **Exclusão em Cascata no Storage:** Criado o helper `getStoragePathFromUrl` para extrair com precisão a subpasta e nome do arquivo de buckets públicos (expurgando query strings `?v=...` que causavam falha silenciosa). Ao excluir um pneu, banner ou logo customizado, o arquivo correspondente é excluído do Storage da Supabase em tempo real.
  - **Remover Logotipo Customizado:** Adicionado o botão "Remover Logo" na área de Configurações do painel para restaurar o logo padrão (`/logoiAlves.png`) e limpar fisicamente o arquivo do bucket `banners`.
  - **Monitor de Uso (Free Tier Limits):** Criada a RPC `get_db_size()` no Supabase que retorna o tamanho real do banco de dados. Implementamos no Painel Admin (na barra lateral) um monitor em tempo real exibindo o tamanho do banco com uma barra de progresso (limite gratuito de 500MB), a quantidade de pneus e de banners, e avisos sobre limites do plano free.
  - **Migration script:** Fornecido o script [create_get_db_size_rpc.sql](file:///g:/Desenvolvimento%20Clientes/iAlvesPneus/create_get_db_size_rpc.sql) para inicializar a RPC `get_db_size` no Supabase.
- [x] **Idempotência no Script SQL:** Revisado `supabase_schema.sql` para incluir instruções `DROP POLICY IF EXISTS` e remover acentos das políticas de banco de dados, prevenindo interrupções em execuções subsequentes.
- [x] **Correção Crítica no Fluxo de Login (checkAuth):**
  - **Eliminação de Exceção por Chaining Incorreto:** Corrigido o erro que causava a quebra do fluxo de login (`TypeError: supabase.from(...).insert(...).catch is not a function`).
  - **Uso Correto de Async/Await:** Refatoradas todas as inserções de logs de auditoria (`login_audits`) e autocadastro de administradores (`administradores`) para usar `async/await` com blocos `try/catch` estruturados.
  - **Garantia de Entrega dos Logs:** A inclusão do `await` assegura que os registros de auditoria sejam gravados no banco de dados antes que a sessão seja encerrada ou ocorra redirecionamento, evitando requisições canceladas pelo navegador.
- [x] **Prevenção de Duplicações e Bloqueio de Double-Submit:**
  - **Busca de Dados Segura:** Confirmado que a renderização inicial e recarregamentos no painel admin e home utilizam substituição total (`setBanners(data)` e `setPneus(data)`) ao invés de concatenação, eliminando duplicações de renderização de registros antigos. Adicionados fallbacks de limpeza (`[]`) em caso de retorno vazio ou nulo da API.
  - **Bloqueio de Cliques Duplos:** Adicionada a propriedade `disabled={loading}` em todos os formulários e modais de criação do painel admin (Pneus, Banners, Configurações Gerais, Acessos e Afiliados), prevenindo cliques múltiplos e inserção de dados em duplicidade no banco por lag de rede.


### ✅ Otimizações de Performance, Rolagem e Validação (10/06/2026)

- [x] **Carregamento Paralelo & Fim das Queries Duplicadas:**
  - Implementado `Promise.all` em `page.tsx` para carregar em paralelo as tabelas `configuracoes`, `banners` e `pneus`, reduzindo latência em rede.
  - Removidas queries redundantes e duplicadas em `Vitrine.tsx`, que agora consome os dados direto via props pré-carregadas pelo parent.
- [x] **Correção do Posicionamento no F5:**
  - Desativada a restauração automática de scroll do navegador (`scrollRestoration = 'manual'`) e configurado o reposicionamento instantâneo no topo no mount para evitar que a página seja aberta no meio ao atualizar com F5.
- [x] **Máscara e Validação de CNPJ & Redes Sociais:**
  - Adicionada formatação automática com máscara de CNPJ (`XX.XXX.XXX/XXXX-XX`) em tempo real no input de formulário.
  - Implementada validação restrita para URLs de redes sociais específicas (Instagram, Facebook, YouTube, TikTok) no painel administrativo, exibindo alertas visuais em vermelho e impedindo o salvamento de domínios incorretos.
  - Adicionada conversão automática de nomes de usuário/handles (ex: `@ialvespneus` ou `ialvespneus`) em URLs completas no evento `onBlur`.
  - Removido o bloqueio rígido do campo opcional de texto do rodapé (`texto_rodape`), permitindo que fique vazio e acione o fallback automático.
- [x] **Remoção de Afiliado (Excluir):**
  - Adicionado o botão "Excluir" na tabela da Rede de Afiliados.
  - Integração com o modal visual de confirmação do sistema (`askConfirmation`).
  - Lógica para deletar fisicamente o registro do banco de dados e registrar a alteração no histórico de segurança (Auditoria).
### ✅ Histórico de Alterações e Auditoria (08/06/2026)

- [x] **Tabela `activity_logs` criada no schema SQL e Supabase:**
  - Registra quem fez a alteração, data/hora, ação e descrição amigável do que foi alterado.
  - Estrutura adicionada ao arquivo `supabase_schema.sql`.
- [x] **Rastreamento de Escrita no Painel (Frontend):**
  - Integração da função `logActivity` em todas as ações de escrita (Pneus, Banners, Configurações, Afiliados, Permissões/Acessos).
  - Atualização automática dos registros exibidos na tela.
- [x] **Visualização de Auditoria Dupla:**
  - Aba "Auditoria de Segurança" remodelada com duas seções independentes: "Histórico de Alterações" (logs de escrita) e "Registro de Acessos (Login)" (logs de autenticação).
- [x] **Prevenção de Logs de Sucesso Duplicados no F5:**
  - O sistema só registra a entrada com status `sucesso` na tabela `login_audits` se o evento de autenticação for de fato um novo login (`SIGNED_IN`), e não em meras atualizações de página (F5).
- [x] **Interface Premium com Modais, Toasts Customizados e Sem Flash de Tela Preta:**
  - Substituição de diálogos nativos do navegador (`confirm()` e `alert()`) por modais customizados que seguem a identidade visual do site (vermelho industrial e glassmorphism).
  - Implementação de um sistema de notificações em Toast auto-descartáveis no canto inferior direito.
  - Divisão dos estados de loading: criada a variável `authLoading` para validações de sessão iniciais e mantido o estado `loading` apenas para operações de banco de dados (exclusões, cadastros). Isso impede que a página inteira suma e fique preta, mostrando em vez disso o spinner de carregamento elegante por cima do conteúdo ativo.

### ✅ Controle de Acesso à Central da Diretoria (08/06/2026)

- [x] **Tabela `administradores` criada no schema SQL:**
  - Coluna única `email TEXT PRIMARY KEY` — sem UUID desnecessário.
  - Seed exclusivo: `nilson.brites@gmail.com` (removido e-mail demo).
  - Substitui a antiga tabela `allowed_users`.

- [x] **Fluxo de Proteção Server-Side (`checkAuth()`):**
  - Após login via Google OAuth, o sistema faz `SELECT email FROM administradores WHERE email = ?`.
  - Se o e-mail **não existir** na tabela:
    - Registra `tentativa_bloqueada` na auditoria (`login_audits`).
    - Executa `supabase.auth.signOut()` (logout automático).
    - Redireciona para `/central-diretoria/bloqueado` (página de Acesso Negado).
  - Se o e-mail **existir**: registra auditoria de sucesso e libera o painel.

- [x] **RLS (Row Level Security) aplicada:**
  - `ALTER TABLE administradores ENABLE ROW LEVEL SECURITY`
  - Policy: apenas `authenticated` pode ler — chave `anon` pública não tem acesso.

- [x] **Interface de Gestão de Usuários (Aba `Gestão de Acesso`):**
  - Nova aba adicionada ao painel de controle administrativo, visível exclusivamente para o super-admin (`nilson.brites@gmail.com`).
  - Lista em tempo real os administradores autorizados.
  - Formulário para inclusão de novos administradores (`INSERT` na tabela `administradores`).
  - Botão de revogação de acessos (`DELETE` na tabela `administradores`), impedindo a remoção do super-admin.

- [x] **Proteção RLS Avançada:**
  - Atualização do banco para permitir operações de `INSERT` e `DELETE` na tabela `administradores` exclusivamente para o e-mail do super-admin (`nilson.brites@gmail.com`).
  - Prevenção activa de elevação de privilégios de outros administradores inseridos.

- [x] **Página de Acesso Negado (`/central-diretoria/bloqueado`):**
  - Visual premium com ícone de escudo, mensagem de bloqueio e link de retorno à vitrine.
  - Logo com fundo transparente (consistente com o restante do site).

### ✅ Refatoração de Produção (06/06/2026)

- [x] **Extermínio Completo do Modo Demo:**
  - Removida a variável de estado `isDemo` e toda a lógica condicional associada.
  - Removidas as funções `handleDemoMode()` e `loadMockData()` (~120 linhas de código morto).
  - Removidos os 3 `useEffect` que sincronizavam `pneus`, `banners` e `afiliados` no `localStorage` para simulação.
  - Removido o botão "Ativar Modo Demonstrativo" da tela de login da diretoria.
  - Removida a badge `[MODO DEMO]` do topbar administrativo.
  - O painel agora opera **exclusivamente contra o Supabase real** — se a conexão falhar, o erro real é exibido.

- [x] **CRUD de Pneus Sincronizado com Supabase Real:**
  - `savePneu()`: Upload de imagem via `supabase.storage.from('pneus')` + insert/update na tabela `pneus`.
  - `deletePneu()`: Remoção física do arquivo no Storage + delete na tabela `pneus`.
  - A tabela do painel agora lista os mesmos pneus que a vitrine pública (via `loadDatabaseData()`).

- [x] **Persistência de Banners (Bucket Dedicado):**
  - Corrigido o bucket de upload: de `.from('pneus')` (errado) para `.from('banners')` (correto).
  - Upload real com `supabase.storage.from('banners').upload()` antes de salvar a URL na tabela.
  - Delete real com `supabase.storage.from('banners').remove()` ao excluir o banner.
  - SQL de criação do bucket `banners` adicionado ao `supabase_schema.sql`.

- [x] **Tratamento de Erros Reais:**
  - Todas as funções CRUD agora exibem `err.message` do Supabase na mensagem de status ao invés de texto genérico.
  - Logs de console prefixados com `[savePneu]`, `[deletePneu]`, `[saveBanner]`, `[deleteBanner]` para rastreabilidade.

- [x] **Logo Transparente no Painel:**
  - Removido `bg-black` do container do logo na tela de login e do topbar da diretoria.
  - O logo agora usa fundo transparente, consistente com a vitrine pública.

- [x] **Limpeza do localStorage Demo na Home e BannerCarrossel:**
  - `page.tsx` (Home): Removida toda leitura/escrita de `configs_demo` e `banners_demo` no `localStorage`.
  - `BannerCarrossel.tsx`: Substituída leitura de `localStorage` por sincronização direta via props do Supabase.

---

### 📋 Registro Histórico

- [x] **Motor de Busca Ativo (Filtro Técnico por Medidas):**
  - Estados temporários `tempLargura`, `tempPerfil` e `tempAro` para armazenar seleções sem reatividade imediata.
  - Ação por clique em "Buscar" promovendo filtros temporários para filtros principais.
  - Fallback com WhatsApp Comercial caso nenhum pneu atenda os critérios.
- [x] **Inicialização Segura e Fallbacks do Supabase (`src/lib/supabase.ts`):**
  - Cliente blindado com `try-catch` na criação.
  - Mock de contingência para compilação local sem chaves válidas.
- [x] **Script SQL de Criação de Tabelas e Seed (`supabase_schema.sql`):**
  - DDL completo para `pneus`, `banners`, `configuracoes`, `allowed_users`, `login_audits` e `afiliados`.
  - Seeds iniciais para imediata inicialização.
  - Buckets de Storage (`pneus` e `banners`) com policies de RLS.
- [x] **Versionamento e Deploy (GitHub Push):**
  - Repositório oficial: `https://github.com/Agencia-JN/iAlvesPneus.git` (branch `master`).
- [x] **Hierarquia Estrutural Mobile Nativa (TireShop Style)**
- [x] **Logo Horizontal Altamente Imponente (`logoiAlves.png`)**
- [x] **Segurança de Layout Mobile (Zero Overflow)**
- [x] **Consistência de Marca (Vermelho Industrial Puro #DC2626)**
- [x] **Upload Inteligente com Compressão WebP**
- [x] **Auditoria de Acesso (Logs de acessos e tentativas bloqueadas)**
- [x] **Whitelist de Imagens Remotas (`next.config.ts`):** `*.supabase.co` e `placehold.co`.

---

## 🚀 Configurações de Deploy (Ambiente de Produção)
Para ativar a integração completa com o banco de dados e armazenamento do Supabase na hospedagem de produção (Vercel, Netlify, VPS, etc.), configure as seguintes variáveis de ambiente no painel do seu provedor:

```env
# URL de conexão com a API Rest do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave secreta de acesso público anônimo
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica-do-supabase
```

> [!IMPORTANT]
> O Modo Demo foi permanentemente removido. O painel administrativo agora **exige** uma conexão válida com o Supabase para funcionar. Configure as variáveis `.env.local` antes de acessar `/central-diretoria`.

## 🛠️ Entregas & Detalhes Técnicos Recentes
- **Buscador Técnico Avançado:** Filtros de medidas sincronizados com campos normalizados da tabela `pneus`.
- **Formulário de Cadastro Robusto:** Largura (mm), Perfil (%) e Aro (polegadas) com concatenação automática.
- **Upload Inteligente com Compressão WebP:** Compressão via Canvas no navegador para otimizar espaço e banda.
- **Auditoria de Acesso:** Logs em tempo real de acessos e tentativas bloqueadas.
- **Bucket de Storage Dedicado para Banners:** Upload, leitura pública e exclusão com policies de RLS.
- **Simplificação da Gestão de Acessos e Hierarquia de Roles:**
  - Remoção do uso da tabela `permissoes_feature`: todos os administradores cadastrados possuem agora acesso total irrestrito a todas as áreas administrativas (Estoque, Banners, Afiliados).
  - Remoção do botão de "Permissões" e do modal de controle granular de features na interface.
  - Aplicação de verificação estrita baseada na role `SUPER_ADMIN` vinda do banco: apenas usuários com este nível conseguem alterar a role de outros administradores ou ver e executar a ação de revogação de acesso (botão "Remover Acesso").
  - Limpeza total da lógica de persistência e estados obsoletos associados às permissões granulares.
- **Estabilidade de Sessão e Upload de Imagens:**
  - Correção na inicialização do cliente do Supabase (`src/lib/supabase.ts`) ativando `persistSession: true` diretamente, garantindo que o estado não seja limpo ou ignorado ao importar o módulo sob Server-Side Rendering (SSR) do Next.js.
  - Implementação de um listener `onAuthStateChange` na Central da Diretoria para re-verificar e carregar dinamicamente a sessão assim que ela for restaurada via local storage ou via URL hash (evitando perdas no F5/redirect do Google OAuth).
  - Otimização do tempo de upload no client-side: arquivos pequenos (< 300KB) e em formatos padrão pulam o processo de compressão do canvas para upload instantâneo, enquanto arquivos maiores continuam sendo compactados.
  - Reforço de logs e try-catches em `savePneu` e `saveBanner` para expor o nome do bucket alvo (`pneus` e `banners`) em caso de erros como `Bucket not found`.
- **Fim do Loop de Autenticação & Regras de SUPER_ADMIN (08/06/2026):**
  - Correção do loop de redirecionamento no `useEffect` de autenticação: o sistema agora exibe um spinner em tela cheia enquanto `loading` for `true`, liberando a interface de login apenas quando a sessão for confirmada como nula pelo listener `onAuthStateChange`.
  - Bloqueio de auto-exclusão: O botão "Remover Acesso" não é mais exibido para a própria linha do `SUPER_ADMIN` conectado.
  - Bloqueio de auto-rebaixamento: O dropdown de alteração de nível de acesso fica desabilitado para a linha do próprio `SUPER_ADMIN` conectado.
  - Sincronização do esquema do banco com a política unificada: A política de RLS para a tabela `administradores` no arquivo `supabase_schema.sql` foi unificada sob a política `"Super admins gerenciam a tabela"`.
- **Depuração e Tolerância a Falhas de Rede (08/06/2026):**
  - Adicionado log de validação sob a tag `[checkAuth Debug]` e bypass para redirecionamentos automáticos da rota `/bloqueado`.
  - Integrado um temporizador de contingência (`setTimeout`) de 2 segundos no `useEffect` de autenticação para forçar `loading` para `false` e renderizar a tela administrativa, contornando esperas eternas caso a conexão com a API do Supabase trave ou atinja timeout.
  - Modificada a função `checkAuth` para ignorar erros de banco de dados (ex: erro HTTP 500) e garantir acesso ao e-mail principal `'nilson.brites@gmail.com'` com o papel de `SUPER_ADMIN` e acesso geral aos demais usuários como `ADMIN` provisório.
- **Gestão de Status e Auto-Registro de Administradores (08/06/2026):**
  - Adicionada coluna `status` (`ATIVO`, `BLOQUEADO`, `PENDENTE`) à tabela de administradores.
  - Atualizada a política de RLS no Supabase para permitir o auto-registro (`INSERT`) de novos e-mails autenticados exclusivamente com perfil `ADMIN` e status `PENDENTE`.
  - Configurado auto-cadastro em `checkAuth` para novos e-mails Google, exibindo a mensagem "Por favor, fale com a diretoria para liberar seu acesso via painel administrativo" diretamente na caixa de login.
  - Adicionadas ações no painel de acessos para o `SUPER_ADMIN` poder **Liberar Acesso** (status `ATIVO`) ou **Bloquear** (status `BLOQUEADO`) qualquer administrador da lista, com status visualizados por meio de crachás coloridos na interface.
- **Correção de Vulnerabilidade em Caso de Falha de Consulta RLS (08/06/2026):**
  - Corrigida brecha de segurança onde qualquer usuário obtinha papel `ADMIN` temporário se a tabela do banco de dados retornasse erro de esquema (ex: coluna `status` ainda inexistente).
  - Agora, na ocorrência de qualquer erro de banco de dados (`adminError`), apenas o administrador principal `'nilson.brites@gmail.com'` recebe a trava de liberação. Qualquer outro e-mail tem o acesso sumariamente negado e é desconectado instantaneamente da sessão ativa.
- **Correções Adicionais de Gestão de Status e Mobile (08/06/2026):**
  - Corrigido bug em `loadDatabaseData` onde a coluna `status` retornada do Supabase era omitida ao mapear a lista de administradores para o estado do React, o que fazia com que todos os usuários aparecessem incorretamente com o status `PENDENTE` na listagem e exibissem o botão "Liberar Acesso".
  - Corrigido o layout mobile da Gestão de Acessos: adicionada a classe `overflow-x-auto` ao container da tabela e uma largura mínima de `700px` para evitar o esmagamento das colunas "STATUS" e "AÇÕES" em smartphones.
  - Ajustado o formulário de concessão de acessos para empilhar verticalmente em telas mobile (`flex-col sm:flex-row`).
  - Removido o bypass manual para o e-mail principal (`nilson.brites@gmail.com`) em consultas bem-sucedidas no banco de dados. Agora, se for removido ou bloqueado no Supabase, seu acesso é sumariamente bloqueado como o de qualquer outro usuário.
- **Remoção da Tela de Carregamento Visual (08/06/2026):**
  - Removido o componente visual de loading com spinner no painel administrativo. A tela de loading agora retorna `null` para evitar qualquer tipo de flash visual incômodo ou travamento em tela preta enquanto a sessão é resolvida no carregamento.
- **Persistência da Aba Ativa no F5 (08/06/2026):**
  - Adicionado suporte para salvar e recuperar a aba ativa (`activeTab`) no `localStorage` do navegador. Isso garante que, quando o usuário atualizar a página (F5) estando em qualquer seção (como "Gestão de Acesso"), ele retorne exatamente para a mesma aba de forma automática e transparente.

### ✅ Rastreamento de Conversão de Afiliados (08/06/2026)
- [x] **Persistência e Captura Automática:**
  - O parâmetro `?ref=codigo` da URL é interceptado pela Vitrine e guardado com expiração de 30 dias usando Cookies (`max-age=2592000`) e `localStorage`.
- [x] **Imutabilidade e Registro de Eventos:**
  - Criação da tabela `afiliado_logs` no banco de dados e no [supabase_schema.sql](file:///g:/Desenvolvimento%20Clientes/iAlvesPneus/supabase_schema.sql) com RLS ativado.
  - Registro automático e assíncrono dos eventos `clique_link` (registrado uma única vez por sessão de navegação para evitar spams) e `clique_whatsapp` (disparado ao clicar no botão de atendimento).
- [x] **Relatório Administrativo de Conversão:**
  - Tabela responsiva com scroll lateral (`overflow-x-auto`) exibindo cliques, contatos e a taxa de conversão calculada como `(whatsapp_clicks / link_clicks) * 100`.

### ✅ Gestão de Conteúdo & Logotipo Dinâmico (08/06/2026)
- [x] **Controle de Logotipo no Painel:**
  - Adicionada coluna `logo_url` à tabela `configuracoes` no banco de dados.
  - Campo de entrada no painel de configurações para trocar o logotipo da empresa com **visualização em tempo real (Preview Box)**.
  - Headers e footers tanto da Vitrine quanto do Painel Administrativo agora carregam o logo dinamicamente a partir das configurações.
- [x] **Validação e Integridade (RN.CONT.01 & RN.CONT.02):**
  - Implementado check prévio que garante a existência do ID único `1` antes de permitir qualquer atualização (evitando linhas duplicadas).
  - Adicionado validador de integridade para links informados (devem começar com `http`, `https` ou `/`) e campos de textos essenciais.
  - Formatação e máscara automática para WhatsApp de vendas no padrão brasileiro `(XX) XXXXX-XXXX` no input.

### ✅ Estabilização do Fluxo de Banners e Resolução de Loops (10/06/2026)
- [x] **Redimensionamento Adequado de Banners:**
  - Atualizada a função utilitária `compressImageToWebp` em [image-compressor.ts](file:///g:/Desenvolvimento%20Clientes/iAlvesPneus/src/lib/image-compressor.ts) para aceitar um parâmetro opcional de largura máxima (`maxWidth`).
  - O limitador de largura foi configurado para `1920` em [page.tsx](file:///g:/Desenvolvimento%20Clientes/iAlvesPneus/src/app/central-diretoria/page.tsx) para carregar imagens de banner, assegurando que os banners rotativos retenham sua alta resolução em telas de desktop (evitando o estiramento borrado de 800px).
- [x] **Paralelização de Consultas no Painel (Fim dos Loops de Carregamento):**
  - Refatorada a função `loadDatabaseData` para disparar as 8 consultas sequenciais em paralelo usando `Promise.allSettled`.
  - Isso reduz a latência acumulada no painel administrativo, elimina gargalos de processamento concorrente e garante que falhas em consultas acessórias (como logs) não travem as telas de listagem de estoque ou banners.
- [x] **Interação UI Instantânea (Snappy UX):**
  - Modificadas as funções `saveBanner`, `savePneu`, `deletePneu`, `deleteBanner`, `toggleBannerStatus`, `addAfiliado`, `toggleAfiliado`, `deleteAfiliado` e `saveConfigs` para fechar os modais, limpar os estados de formulário e disparar os toasts de sucesso de forma imediata (sem aguardar a resposta das consultas de sincronização em segundo plano).
  - O re-carregamento dos dados do painel agora ocorre de forma assíncrona, eliminando a percepção de loops de travamento durante atualizações.
- [x] **Otimização de Carregamento de Mídia Externa (Supabase Bucket):**
  - Adicionado o atributo `unoptimized` a todos os componentes `<Image>` do Next.js que carregam mídias dinâmicas hospedadas no Supabase (em `BannerCarrossel`, `Vitrine` e no painel administrativo).
  - Isso faz com que as imagens (que já chegam otimizadas e comprimidas pelo compressor nativo no client-side) sejam entregues diretamente da CDN do Supabase, eliminando gargalos, erros de proxy e indisponibilidade do serviço de otimização de imagens do Next.js.

### ✅ Correção do Upload de Logotipo — Bucket Inexistente (12/06/2026)
- [x] **Bug:** A função `handleLogoUpload` tentava gravar no bucket `configuracoes` do Supabase Storage, que nunca foi criado (apenas `pneus` e `banners` existem). Isso gerava o erro `StorageApiError: Bucket not found` no console ao tentar trocar o logotipo.
- [x] **Fix:** Redirecionado o upload do logotipo para o bucket `banners` (que já existe com policies públicas corretas), usando a subpasta `logo/` para organização. A lógica de exclusão do logo antigo e obtenção da URL pública também foram atualizadas para refletir o novo caminho.

### ✅ Correção da Formatação, Validação e Links do WhatsApp (13/06/2026)
- [x] **Tratamento de Prefixo Internacional (55) no Brasil:**
  - Corrigido o feedback loop de concatenação onde o prefixo `55` era reinserido recursivamente a cada salvamento das configurações gerais (acumulando valores corrompidos como `555555...`).
  - As funções `maskWhatsapp` e `sanitizeWhatsapp` agora identificam e removem o prefixo `55` se o número de entrada contiver 12 ou 13 dígitos. O banco armazena o número nacional limpo (DDD + número com 10 ou 11 dígitos, ex: `11999999999`).
- [x] **Validação no Painel:**
  - Ajustada a validação de tamanho de número em `saveConfigs` para aceitar números de 10 ou 11 dígitos (DDD e celular ou fixo nacional).
- [x] **Garantia de Links Corretos no Site Público:**
  - Adicionado o utilitário `getWhatsappLink` que higieniza qualquer telefone e constrói a URL `https://wa.me/55...` garantindo o prefixo `55` apenas uma vez no redirecionamento final.
  - Sincronização e reatividade de dados corrigidas na `Vitrine` (remoção da inicialização estática em `useState(whatsappProp)` que impedia atualizações nos botões "Comprar" ao carregar do banco). Now, the buttons reactively target the actual configured phone number from the database.

