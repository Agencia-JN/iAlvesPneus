# Registro de Progresso - iAlves Pneus

## 🚀 Status Atual: Painel Protegido — Acesso Restrito por Tabela `administradores`

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

