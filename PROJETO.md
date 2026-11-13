# Cupid Presentes — Documentação Completa do Projeto

## Visão Geral

Quiz builder SPA que gera sites personalizados de casais para o Dia dos Namorados.
O cliente preenche um quiz passo a passo, paga via PIX (PushinPay), e recebe um link com o site gerado contendo músicas, fotos, jogos, mapa, timeline etc.

**Brand:** Cupid Presentes / LOVECUPID LTDA
**Stack:** React 19 + Vite + Tailwind v4 + React Router DOM v7 + Supabase
**Deploy:** Vercel (Edge Functions na pasta `/api`)
**Localização do projeto:** `Z:\projetos pra test\dia dos namorados`

---

## Estrutura de Rotas

```
/              → Quiz builder (App.jsx)
/login         → Login admin
/admin         → Painel admin (protegido por PrivateRoute)
/edit/:phone   → Edição de site existente (EditPage)
/obrigado/:phone → Página pós-pagamento com links e QR
/:phone        → Site personalizado do casal (SitePage)
/demo          → Demo (SitePage com phone="demo", mostra botão CTA pulsante)
```

---

## Banco de Dados — Supabase

### Tabela `sites`
```sql
create table sites (
  id         uuid primary key default gen_random_uuid(),
  phone      text unique not null,
  paid       boolean default false,
  quiz_data  jsonb,
  created_at timestamptz default now(),
  paid_at    timestamptz
);
```

### Tabela `app_config`
```sql
create table app_config (
  key   text primary key,
  value text
);
```
Chaves usadas:
- `fb_pixel_id` — ID do Pixel do Facebook
- `fb_access_token` — Token CAPI do Facebook
- `tiktok_pixel_id` — ID do Pixel do TikTok
- `tiktok_access_token` — Token Events API do TikTok
- `price` — Preço do produto (ex: "19.90")

### Tabela `funnel_events`
```sql
create table funnel_events (
  id         bigint generated always as identity primary key,
  step       text not null,
  created_at timestamptz default now()
);
```
Rastreia visitas em cada step do quiz para analytics de funil.

### Storage
- **Bucket:** `site-photos` (público)
- Fotos do casal, cover photo e galeria são uploadadas aqui durante o pagamento

---

## Funções Supabase (`src/lib/supabase.js`)

| Função | Descrição |
|--------|-----------|
| `uploadPhoto(file, folder)` | Upload de File para bucket `site-photos` |
| `uploadFromPreview(preview, folder)` | Converte blob:/data: URL → upload |
| `saveSite(phone, quizData)` | Upsert com `paid: false` |
| `updateSiteData(phone, quizData)` | Atualiza `quiz_data` sem mexer em `paid` (para edições) |
| `markPaid(phone)` | Seta `paid: true` e `paid_at: now()` |
| `getSite(phone)` | Busca site por telefone |
| `getAllSites()` | Lista todos (só admin) |
| `getAppConfig(key)` | Lê chave da `app_config` |
| `setAppConfig(key, value)` | Escreve chave na `app_config` |
| `trackStep(step)` | Insere evento de funil |
| `getFunnelEvents(from, to)` | Busca eventos no período |
| `createFreeLink(phone)` | Cria link gratuito (paid: true) sem quiz |

---

## Context — `QuizContext`

`src/context/QuizContext.jsx` — provider global de todos os dados do quiz.

### Campos do `DEFAULT_DATA`
```js
{
  myName, partnerName, relationshipStart, relationshipTime, city,
  title, music, photos[], message, audio,
  wrappedSections: [],        // seções pagas escolhidas
  roletaTheme, roletaQuestion, roletaOptions[],
  mapaTitle, mapaSubtitle, mapaPlaces[],
  galeriaPhotos[], galeriaStyle,
  jogoWord, jogoDica, jogoMensagem,
  timelineTitle, timelineSubtitle, timelineClosing, timelineMoments[],
  estrelaTexto, estrelaCity,
  coverPhoto, coverPhotoUrl,
  counterTexts: { sectionTitle, coupleName, sinceLabel }
}
```

### Flags especiais no data
- `data.__editMode = true` + `data.__editPhone = "11999..."` → modo edição
- `data.__demoMode = true` → modo demo

### SessionStorage bridge
- `sessionStorage.setItem('editData', JSON.stringify({...quizData, __editPhone: phone}))` antes de `window.location.href = '/'`
- `QuizContext.loadInitialData()` lê e limpa `editData` e `demoMode` no startup

> **IMPORTANTE:** Para edição usa `window.location.href = '/'` (não `navigate`), para forçar reinicialização completa do QuizProvider.

---

## Fluxo do Quiz (`App.jsx`)

### Sequência de steps
```
intro-names → intro-date → step1-title → step2-music → step3-photos
→ step4-message → step5-cover → step6-counter
→ upsell → step-wrapped → [seções escolhidas] → step-pagamento → final-preview
```

### Seções opcionais (Wrapped)
Ordem fixa: `['roulette', 'map', 'gallery', 'words', 'timeline', 'stars']`

`nextStep(after)` navega automaticamente para a próxima seção escolhida em `data.wrappedSections`, ou para `step-pagamento` se não houver mais.

### Steps e componentes
| Step | Componente |
|------|-----------|
| `intro-names` | `StepIntroNames` |
| `intro-date` | `StepIntroDate` |
| `step1-title` | `Step1Title` |
| `step2-music` | `Step2Music` |
| `step3-photos` | `Step3Photos` |
| `step4-message` | `Step4Message` |
| `step5-cover` | `Step5CoverPhoto` |
| `step6-counter` | `Step6CounterTexts` |
| `upsell` | `StepUpsell` |
| `step-wrapped` | `StepWrapped` (seleção das seções) |
| `step-roleta` | `StepRoleta` |
| `step-mapa` | `StepMapa` |
| `step-galeria` | `StepGaleria` |
| `step-jogo` | `StepJogoPalavra` |
| `step-timeline` | `StepTimeline` |
| `step-estrelas` | `StepEstrelas` |
| `step-pagamento` | `StepPagamento` |
| `final-preview` | `SitePreview` (modo full) |

---

## StepPagamento — Pagamento PIX

### Fluxo interno (estados da `screen`)
```
'loading' → 'checkout' → 'waiting' → 'confirmed'
```

### Modo edição
- `isEditMode = !!data.__editMode`
- Se `isEditMode`, exibe `<EditSaveScreen>` ANTES de qualquer outro estado
- `EditSaveScreen` faz upload das fotos e chama `updateSiteData(phone, quizData)`

### Ao clicar "Gerar PIX"
1. Upload de todas as fotos (`photos[]`, `coverPhoto`, `galeriaPhotos[]`) para Supabase Storage
2. Monta `quiz_data` com URLs em vez de File objects
3. Chama `saveSite(phone, quiz_data)` → `paid: false`
4. Dispara `fireFBCAPI('InitiateCheckout', ...)` + `fireTTCAPI('InitiateCheckout', ...)`
5. Chama `/api/pushinpay` para gerar QR PIX
6. Polling de `3s` verificando status do pagamento

### Ao confirmar pagamento
1. Chama `markPaid(phone)`
2. Dispara `fireFBCAPI('Purchase', ...)` + `fireTTCAPI('Purchase', ...)`
3. Redireciona para `/obrigado/{phone}`

### QR Templates
4 estilos no `src/components/QRCard.jsx`:
- `0` → Branco/roxo, GRÁTIS (padrão)
- `1` → Vermelho escuro, R$ 2,90
- `2` → Rosa, R$ 2,90
- `3` → Preto/dourado, R$ 2,90

Seletor sempre visível (sem accordion toggle). O template escolhido (`qrTemplate`) é salvo no `quiz_data`.

---

## APIs Vercel Edge (`/api`)

### `/api/pushinpay.js`
- Gera cobrança PIX via PushinPay
- Recebe: `{ amount, phone, name, token }`
- Retorna: `{ id, qr_code, qr_code_base64 }`

### `/api/fbcapi.js`
- Facebook Conversions API (server-side)
- Recebe: `{ pixel_id, access_token, events[] }`
- Mapeia para formato Meta CAPI e envia para `graph.facebook.com`

### `/api/tiktok-events.js`
- TikTok Events API (server-side)
- Recebe: `{ pixel_code, access_token, events[] }`
- Mapeia para formato TikTok e envia para `business-api.tiktok.com/open_api/v1.3/event/track/`
- Eventos: `InitiateCheckout` (ao abrir checkout) e `CompletePayment` (ao confirmar PIX)

### `/api/cidades.js`
- Autocomplete de cidades brasileiras

### `/api/innertube.js`
- Proxy para busca de músicas do YouTube

---

## Site Personalizado (`SitePreview.jsx`)

Aceita `externalData` prop — quando presente, usa esses dados em vez do `QuizContext`. Isso permite que `SitePage` passe dados do Supabase sem instanciar outro contexto.

### Seções renderizadas
- **Hero** — capa com foto, nome do casal, contador de tempo juntos
- **Sobre o casal** — textos personalizados e contador animado
- **Galeria de fotos** — `galeriaPhotos[]` em estilo escolhido
- **Música** — player de YouTube off-screen (`position:fixed, top:-9999px, left:-9999px`)
- **Mapa** — Leaflet com lugares marcados
- **Mensagem** — mensagem personalizada
- **Timeline** — momentos da história do casal
- **Conquistas / Jogos** — hub de jogos interativos
- **Estrelas** — mensagem especial em fundo estrelado

### Hub de Jogos (Conquistas)
`ConquistasSection` lê `data.wrappedSections` e exibe tiles para cada seção ativa:

| id | Jogo |
|----|------|
| `roulette` | Roleta (SVG animado, sorteia opções) |
| `map` | Mapa dos nossos lugares |
| `gallery` | Galeria de memórias |
| `words` | Wordle personalizado (palavra secreta) |
| `timeline` | Nossa Timeline |
| `stars` | Mensagem nas Estrelas |

`GameModal` dispara o componente correto:
- `roulette` → `RoletaGameView` (roda animada com física de desaceleração)
- `words` → `WordleGameView` (tiles 66px, teclado h=54px w=36px por tecla)
- outros → `GenericGameView` (tela informativa)

---

## Admin Panel (`/admin`)

**Autenticação:** credenciais hardcoded — `admin` / `admin159753`
Sessão em `localStorage` chave `adminAuth`.

### Tabs da sidebar
1. **Dashboard** — métricas (vendas, conversão, receita, ticket médio) + funil + gráfico de linha
2. **Clientes** — tabela com todos os sites
3. **Configurações** — sub-tabs: Quiz, Pixels, Preço

### Clientes — filtros
- Busca por telefone/nome
- Filtro de status: **Todos** (roxo) | **Pagos** (verde) | **Pendentes** (âmbar)
- Badge numérico em cada botão mostrando a contagem
- Filtro de período: Hoje / 7 dias / 30 dias / Customizado

### Configurações — Quiz
- Card "Dia dos Namorados 💝" — `/namorados` (ATIVO)
- Card "Temática Bíblica ✝️" — `/biblico` (EM BREVE)

### Configurações — Pixels
Salva na `app_config`:
- Facebook: `fb_pixel_id`, `fb_access_token`
- TikTok: `tiktok_pixel_id`, `tiktok_access_token`

### Ações por cliente
- Ver site (`/{phone}`)
- Editar (`/edit/{phone}`)
- Copiar links
- QR Code (modal com preview)
- Criar link grátis
- Deletar

---

## Páginas Auxiliares

### `/obrigado/:phone` — `ObrigadoPage`
- Mostra após pagamento confirmado
- Exibe QR Code no template escolhido (`quiz_data.qrTemplate`)
- Links: site do presente + link de edição
- Botão "Salvar links no WhatsApp" (wa.me)
- Botão "Baixar QR Code"
- Se `paid: false` → tela de aguardando com botão "Verificar novamente"

### `/edit/:phone` — `EditPage`
- Busca dados do site no Supabase
- Coloca `quiz_data` + `__editPhone` no `sessionStorage` como `editData`
- Faz `window.location.href = '/'` para reinicializar o quiz em modo edição
- Em modo edição, `StepPagamento` exibe `EditSaveScreen` em vez do fluxo PIX

### `/:phone` — `SitePage`
- `loading` → busca `getSite(phone)`
- `not-found` → "Site não encontrado"
- `unpaid` → "Presente não disponível" (pagamento pendente)
- `ready` → renderiza `<SitePreview externalData={quiz_data} />`
- Se `phone === 'demo'` → mostra botão CTA pulsante verde "Cria Meu Site Agora"

---

## Assets públicos (`/public`)
- `cupido.png` — logo Cupid (usado na ObrigadoPage e SitePage)
- `pix.png` — logo PIX (copiado de `Downloads/images-removebg-preview.png`)

---

## Variáveis de Ambiente (`.env`)

Criar arquivo `.env` na raiz com:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

> Os tokens de PIX, Facebook e TikTok **não ficam no `.env`** — são lidos do Supabase (`app_config`) via painel admin.

---

## Deploy — GitHub + Vercel

### Conta e repositório
- **Email:** entregasdrive159@gmail.com
- **GitHub:** [github.com/obrsinbrs-afk/cupid](https://github.com/obrsinbrs-afk/cupid)
- **Branch principal:** `main`

### Como commitar e enviar para o GitHub

```bash
cd "Z:\projetos pra test\dia dos namorados"

git add .
git commit -m "descrição das mudanças"
git push origin main
```

> O git já está configurado com o remote apontando para o repositório acima. Basta rodar os comandos.

### Configuração na Vercel

O arquivo `vercel.json` já está configurado:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

**Ao conectar o repositório na Vercel:**
1. Acesse [vercel.com](https://vercel.com) com a conta `entregasdrive159@gmail.com`
2. Clique em "Add New Project" → importar o repositório `obrsinbrs-afk/cupid`
3. Em **Environment Variables**, adicionar:

| Chave | Valor |
|-------|-------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase (ex: `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Anon key pública do Supabase |

4. Clicar em **Deploy**

> Após o primeiro deploy, todo `git push origin main` faz deploy automático na Vercel.

### Chaves e tokens que ficam no Admin (Supabase `app_config`)

Esses valores **não vão para o `.env` nem para o GitHub** — são configurados direto no painel `/admin` → Configurações:

| Chave no banco | Onde pegar |
|----------------|------------|
| `fb_pixel_id` | Meta Business → Events Manager → Pixel → ID |
| `fb_access_token` | Meta Business → Events Manager → Pixel → Configurações → API de Conversões → Token |
| `tiktok_pixel_id` | TikTok Ads → Assets → Events → Web Events → ID do pixel |
| `tiktok_access_token` | TikTok Ads → Assets → Events → Web Events → Manage → Generate Access Token |
| `price` | Preço em reais, ex: `19.90` |

**Token PushinPay:** enviado pelo frontend direto na chamada da API — o token é lido de `getAppConfig('pushinpay_token')` (adicionar essa chave no admin se ainda não tiver).

### Supabase — checklist inicial

1. Criar projeto em [supabase.com](https://supabase.com)
2. Rodar os SQLs das 3 tabelas (ver seção "Banco de Dados" acima)
3. Criar bucket `site-photos` → marcar como **público**
4. Copiar `Project URL` e `anon public key` → colocar no `.env` e na Vercel

---

## Favicon

O favicon está configurado como `cupido.png` (a logo do Cupid) em `index.html`:
```html
<link rel="icon" type="image/png" href="/cupido.png" />
<link rel="apple-touch-icon" href="/cupido.png" />
```

---

## Comandos

```bash
# Desenvolvimento local
npm run dev

# Build de produção
npm run build

# Commitar e enviar para o GitHub (deploy automático na Vercel)
git add .
git commit -m "mensagem"
git push origin main
```

---

## Comportamentos Importantes / Pegadinhas

1. **Edit mode:** usa `window.location.href = '/'` (não `navigate`) para forçar reinit do QuizProvider que lê o `sessionStorage`.

2. **`isEditMode` check primeiro:** em `StepPagamento`, o guard `if (isEditMode)` deve ser o **primeiro** antes de qualquer cheque de `screen` — caso contrário o estado da máquina de estados interfere e mostra "Gerando PIX".

3. **YouTube off-screen:** o iframe do YouTube fica em `position:fixed, top:-9999px, left:-9999px` para evitar flash de carregamento.

4. **Upload de fotos:** fotos são `File` objects ou `blob:` URLs no quiz local. Na hora do pagamento/edição, são convertidas para URLs públicas do Supabase Storage antes de salvar `quiz_data`.

5. **Supabase null-safe:** todas as funções verificam `if (!supabase) throw/return` pois o client é `null` se as env vars não estiverem configuradas.

6. **QR selector:** sem accordion toggle — sempre visível para não atrapalhar a conversão.

7. **Tracking de funil:** `trackStep(step)` é chamado via `useEffect` em cada mudança de step no `App.jsx`.
