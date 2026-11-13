# Contexto de Sessão — Alterações de UI/Visual

> **Documentação principal do projeto:** leia `PROJETO.md` primeiro.
> Este arquivo cobre apenas as mudanças visuais feitas nas sessões de Claude Code.

---

## Deploy rápido

```bash
cd "Z:\projetos pra test\dia dos namorados"
git add .
git commit -m "descrição"
git push origin main   # dispara deploy automático na Vercel
```

- **Repo:** github.com/obrsinbrs-afk/cupid
- **Branch:** main
- **Vercel:** conectado ao GitHub, deploy automático no push

---

## Mudanças visuais da sessão

### Logo / Mascote
- Panda substituído por **Cupido PNG** (`/public/cupido.png`)
- Componente: `src/components/PandaMascot.jsx` — só renderiza a imagem
- Tamanho padrão: `size={230}` em todos os steps
- Wrapper com margens negativas para compensar padding transparente do PNG:
  - Steps normais: `marginTop: -60, marginBottom: -38`
  - StepIntroDate: `marginTop: -90`

### Fundo dos steps de configuração
- `src/index.css` → `.step-root { background: #ffffff }` — tudo branco
- Desktop: `.phone-shell { height: calc(100vh - 96px) }` — altura fixa para scroll interno funcionar

### Botão flutuante Pré-visualizar (`PreviewFab`)
- Arquivo: `src/components/PreviewFab.jsx`
- Estilo: `absolute bottom-32 right-4`, roxo, `text-[15px]`, ícone Eye size=17
- Presente em **todos** os steps de configuração que têm preview

### Botão Voltar nos previews internos (telas escuras)
Padrão adotado em: StepRoleta, StepEstrelas, StepTimeline, StepGaleria, StepJogoPalavra:
```jsx
<button onClick={onClose}
  className="absolute bottom-4 right-4 bg-purple-600 text-white rounded-full px-5 py-2.5 font-semibold text-[14px] active:scale-95 transition-all z-10">
  Voltar
</button>
```

### SitePreview (`src/components/SitePreview.jsx`)
- Raiz: `flex-1 flex flex-col` (não `h-full`) — necessário para o footer fixo funcionar no desktop
- **Header:** fundo preto (`BG_BLACK`), sem botão Voltar no topo
- **Thumbnail da música removida** — só nome (`text-[15px]`) e artista (`text-[13px]`) à esquerda
- **Botão Voltar:** `shrink-0` footer roxo com `btn-pulse`, sempre visível fora do scroll
- `ChevronLeft` **deve permanecer no import** — usado no `MessageFull` (tela de mensagem)

### StepWrapped (`src/steps/StepWrapped.jsx`)
- Todas as 6 seções aparecem direto no grid (sem botão "Ver mais")
- Cards usam screenshots reais de `/public/screenshots/` como fundo

### Step6CounterTexts — lápis de edição
- Ícone `Pencil` sempre visível: `opacity-60` (não depende de hover)
- Lápis duplicado externo ao "Sobre o casal" foi removido

### StepRoleta — resultado ao parar
Após a roleta parar (4.2s), calcula e exibe:
```
O resultado foi
[NOME DA OPÇÃO]
```
Fórmula do índice vencedor:
```js
const sliceAngle = 360 / n
const normalized = ((finalRotation % 360) + 360) % 360
const pointerOnWheel = (360 - normalized) % 360
const adjusted = (pointerOnWheel + sliceAngle / 2) % 360
const winner = options[Math.floor(adjusted / sliceAngle) % n]
```

### StepIntroNames
- Sem efeito 3D, bordas simples: cinza → roxo ao focar/preencher
- Ícones (presente/coração): cinza → roxo ao digitar

### StepIntroDate
- Sem quadrado wrapper nos ícones (Calendar, Clock direto)
- MapPin (CitySearch): cinza → roxo ao digitar

### TopBanner
- Todos os textos em `text-[15px]`

### Lápis (Pencil)
- Emoji ✏️ substituído por ícone lucide `<Pencil>` em: Step1Title, Step2Music, Step3Photos, Step4Message, Step5CoverPhoto, Step6CounterTexts

---

## Padrões de CSS (index.css)

```css
.step-root   { flex:1; flex-direction:column; background:#fff; overflow:hidden; position:relative }
.step-scroll { flex:1; overflow-y:auto; padding:16px 20px 0 }
.step-bottom { background:white; border-top:...; padding:12px 20px 28px }

@keyframes btn-glow {
  0%,100% { box-shadow: 0 8px 24px rgba(124,58,237,0.45) }
  50%     { box-shadow: 0 8px 40px rgba(124,58,237,0.75), 0 0 0 6px rgba(124,58,237,0.12) }
}
.btn-pulse { animation: btn-glow 2s ease-in-out infinite }

/* Desktop — phone shell altura fixa para scroll interno */
@media (min-width:640px) {
  .phone-shell { height: calc(100vh - 96px) }
}
```

---

## Estrutura de arquivos relevante

```
src/
  App.jsx                  — orquestra steps + tracking de funil
  index.css                — CSS global
  context/QuizContext.jsx  — estado global do quiz
  components/
    PandaMascot.jsx        — logo cupido (img /cupido.png)
    PreviewFab.jsx         — botão flutuante pré-visualizar
    BackButton.jsx         — botão ‹ Voltar dos steps
    TopBanner.jsx          — banner do topo (15px)
    SitePreview.jsx        — preview completo / site final (aceita externalData prop)
    LiveCounter.jsx        — contador tempo juntos
    CitySearch.jsx         — busca de cidades (Nominatim)
    QRCard.jsx             — 4 templates de QR Code
  steps/                   — um arquivo por step do quiz
  pages/                   — SitePage, EditPage, ObrigadoPage, AdminPage, LoginPage
  lib/
    supabase.js            — todas as funções do banco
    youtube.js             — searchMusic, loadYTAPI, DEFAULT_SONGS
api/                       — Vercel Edge Functions
  pushinpay.js             — proxy PIX
  fbcapi.js                — Facebook Conversions API
  tiktok-events.js         — TikTok Events API
  cidades.js               — autocomplete cidades BR
  innertube.js             — proxy busca YouTube
public/
  cupido.png               — logo (PNG sem fundo)
  pix.png                  — logo PIX
  screenshots/             — screenshots das seções para StepWrapped
vercel.json                — config de rotas Vercel
PROJETO.md                 — documentação completa (banco, rotas, APIs, deploy)
```
