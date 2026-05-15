# Contexto do Projeto — Dia dos Namorados Quiz Builder

## O que é esse projeto

Aplicativo web mobile-first que funciona como um **quiz interativo de presente**. O usuário (quem compra) preenche etapas de configuração e no final gera um site personalizado para o casal. Tecnologias: **React 19 + Vite + Tailwind v4 + Supabase + YouTube IFrame API**.

Localização: `Z:\projetos pra test\dia dos namorados`

---

## Estrutura de pastas relevante

```
src/
  App.jsx                     — Orquestra os steps, fluxo de navegação
  index.css                   — CSS global (phone-shell, step-root, step-scroll, step-bottom, btn-pulse)
  context/
    QuizContext.jsx            — Estado global de todos os dados do quiz
  components/
    PandaMascot.jsx            — Logo cupido (PNG de /public/cupido.png), size=230
    PreviewFab.jsx             — Botão flutuante roxo "Pré-visualizar" (absolute bottom-32 right-4)
    BackButton.jsx             — Botão ‹ Voltar dos steps de configuração
    TopBanner.jsx              — Banner do topo (texto 15px)
    SitePreview.jsx            — Preview completo do site final do casal
    LiveCounter.jsx            — Contador de tempo do casal em tempo real
    CitySearch.jsx             — Campo de busca de cidade (Nominatim API)
  steps/
    StepIntroNames.jsx         — Etapa 1: nomes do casal
    StepIntroDate.jsx          — Etapa 2: data e horário do início do relacionamento
    Step1Title.jsx             — Título do site
    Step2Music.jsx             — Busca e escolha da música (YouTube API)
    Step3Photos.jsx            — Upload de fotos do casal
    Step4Message.jsx           — Mensagem especial
    Step5CoverPhoto.jsx        — Foto de capa
    Step6CounterTexts.jsx      — Textos do contador (edição inline com lápis)
    StepUpsell.jsx             — Página de upsell (Retrospectiva Wrapped)
    StepWrapped.jsx            — Seleção das seções extras (6 cards visíveis direto)
    StepRoleta.jsx             — Configuração + preview da Roleta Surpresa
    StepMapa.jsx               — Configuração + preview da Jornada no Mapa
    StepGaleria.jsx            — Configuração + preview da Galeria de Imagens
    StepJogoPalavra.jsx        — Configuração + preview do Jogo de Palavras (Wordle)
    StepTimeline.jsx           — Configuração + preview da Linha do Tempo
    StepEstrelas.jsx           — Configuração + preview do Mapa das Estrelas
    StepPagamento.jsx          — Tela de pagamento PIX (API PushinPay)
  lib/
    youtube.js                 — searchMusic(), loadYTAPI(), DEFAULT_SONGS
public/
  cupido.png                   — Logo do app (anjo cupido gerado por IA, fundo removido)
```

---

## Fluxo de navegação (App.jsx)

```
intro-names → intro-date → step1-title → step2-music → step3-photos →
step4-message → step5-cover → step6-counter → upsell → step-wrapped →
[seções escolhidas na ordem: roulette, map, gallery, words, timeline, stars] →
step-pagamento → final-preview
```

---

## Padrões visuais estabelecidos

### Layout dos steps de configuração
- `.step-root` — flex column, `position: relative`, fundo branco
- `.step-scroll` — área rolável (flex: 1, overflow-y: auto)
- `.step-bottom` — barra fixa no rodapé com botões Voltar/Próximo
- Fundo branco em TODOS os steps de configuração

### Logo (Cupido)
- Componente `PandaMascot` renderiza `/public/cupido.png`
- Tamanho padrão: `size={230}` em todos os steps
- Wrapper: `style={{ marginTop: -60, marginBottom: -38 }}` (compensa padding transparente do PNG)
- Na etapa de data: `marginTop: -90`

### Botão Pré-visualizar (PreviewFab)
- Componente: `src/components/PreviewFab.jsx`
- Estilo: botão roxo flutuante, `absolute bottom-32 right-4`, ícone Eye + texto "Pré-visualizar"
- Tamanho: `text-[15px]`, padding `pl-4 pr-5 py-3`, ícone size=17
- Usado em TODOS os steps de configuração que têm preview

### Botão Voltar nos previews (telas escuras de pré-visualização)
- Todos os previews internos (StepRoleta, StepEstrelas, StepTimeline, StepGaleria, StepJogoPalavra) têm:
  ```jsx
  <button onClick={onClose}
    className="absolute bottom-4 right-4 bg-purple-600 text-white rounded-full px-5 py-2.5 font-semibold text-[14px] active:scale-95 transition-all z-10">
    Voltar
  </button>
  ```
- No `SitePreview` (preview geral): botão Voltar num `shrink-0` footer no rodapé (sempre visível), com efeito `btn-pulse`

### Efeito btn-pulse
- Definido em `index.css`: animação de `box-shadow` roxo pulsando a cada 2s
- Usado no botão Voltar do SitePreview e em alguns CTAs

---

## Componentes de formulário

### StepIntroNames
- Fundo branco, sem efeito 3D
- Ícones (presente ♁ e coração ♥) ficam cinza e viram roxo ao digitar
- Borda dos campos: cinza → roxo ao focar/preencher

### StepIntroDate
- Sem quadrado wrapper nos ícones (Calendar, Clock)
- MapPin no CitySearch: cinza → roxo ao digitar
- Cupido com `marginTop: -90`

### Step6CounterTexts (Textos do Contador)
- Edição inline com `InlineEdit` component
- Lápis sempre visível (`opacity-60`), não depende de hover

### StepWrapped (Seleção de seções)
- **Todas as 6 seções aparecem direto** no grid 2×3 (sem botão "Ver mais")
- Seções: Linha do Tempo, Mapa das Estrelas, Galeria, Jogo de Palavras, Jornada no Mapa, Roleta Surpresa

---

## SitePreview — Preview do site final

Arquivo: `src/components/SitePreview.jsx`

### Estrutura da tela
1. **Header preto** — apenas título do site centralizado (sem botão Voltar no topo)
2. **Zona vermelha** — carrossel de fotos + player de música
3. **Zona preta** — "Sobre o casal" com foto de capa + contador
4. **Mensagem especial** — card vermelho com botão "Mostrar Mensagem"
5. **Zona vermelha 2** — conquistas + retrospectiva
6. **Footer fixo** — botão Voltar roxo com `btn-pulse` (sempre visível, fora do scroll)

### Player de música
- Usa YouTube IFrame API (player invisível)
- Thumbnail do álbum **removida** — só mostra nome da música (esquerda, `text-[15px]`) e artista (`text-[13px]`)
- Músicas padrão em `lib/youtube.js`: All of Me, A Thousand Years, Perfect
- Para busca funcionar: precisa de `VITE_YOUTUBE_API_KEY` no `.env`

### MessageFull (tela de mensagem)
- Usa `ChevronLeft` do lucide-react — **não remover do import**
- Fundo vermelho, texto em fonte cursiva
- Botão fechar no topo esquerdo

---

## Pagamento (StepPagamento)

Arquivo: `src/steps/StepPagamento.jsx`

- API: **PushinPay** (apenas PIX)
- Token: `VITE_PUSHINPAY_TOKEN` no `.env`
- Proxy Vite: `/pushinpay` → `https://api.pushinpay.com.br` (evita CORS em dev)
- Valor base: R$ 19,90
- QR personalizado (+R$ 4,90): 3 templates visuais
- 4 telas: `form → loading → awaiting → success`
- Polling a cada 3s para verificar pagamento
- WhatsApp com máscara `(XX) XXXXX-XXXX`

---

## Roleta (StepRoleta) — Preview

Ao girar e parar, exibe o resultado:
```
O resultado foi
[NOME DA OPÇÃO]
```
- Cálculo da fatia vencedora usa ângulo de rotação final
- O card de resultado aparece após 4.2s (tempo da animação)
- Zera o resultado ao girar novamente

---

## CSS global relevante (index.css)

```css
/* Desktop: phone shell com altura fixa para scroll interno funcionar */
@media (min-width: 640px) {
  .phone-shell {
    height: calc(100vh - 96px); /* 32px top + 64px bottom do body padding */
  }
}

/* Animação de botão CTA */
@keyframes btn-glow { ... }
.btn-pulse { animation: btn-glow 2s ease-in-out infinite; }
```

---

## Variáveis de ambiente necessárias (.env)

```env
VITE_YOUTUBE_API_KEY=sua_chave_aqui
VITE_PUSHINPAY_TOKEN=seu_token_aqui
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## Onde paramos

Todas as funcionalidades principais estão implementadas e funcionando:

- ✅ Todos os steps de configuração (nomes, data, título, música, fotos, mensagem, capa, contador)
- ✅ Seleção de seções extras (Wrapped)
- ✅ Configuração de todas as 6 seções: Roleta, Mapa, Galeria, Jogo, Timeline, Estrelas
- ✅ Pagamento PIX com PushinPay
- ✅ Preview geral do site (SitePreview) com player de música YouTube
- ✅ Logo Cupido em todos os steps (size=230)
- ✅ Fundo branco em todos os steps de configuração
- ✅ PreviewFab (botão flutuante Pré-visualizar) em todos os steps
- ✅ Botão Voltar fixo (canto inferior direito) em todos os previews internos
- ✅ Resultado da Roleta exibido ao parar
- ✅ Lápis sempre visível no Step6CounterTexts
- ✅ StepWrapped mostra todas as 6 seções sem "ver mais"
- ✅ SitePreview: header preto, Voltar no footer com pulse, música sem thumbnail

### Possíveis próximos passos
- Integração com Supabase para salvar/publicar o site do casal
- Tela final (`final-preview`) — página que o casal recebe
- Deploy e configuração do proxy PushinPay em produção (precisa de backend)
- Testes em dispositivos reais
