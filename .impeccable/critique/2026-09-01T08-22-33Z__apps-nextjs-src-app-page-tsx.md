---
target: apps/nextjs/src/app/page.tsx
total_score: 23
max_score: 28
na_heuristics: 7,9,10
p0_count: 0
p1_count: 0
p2_count: 2
p3_count: 2
target_identity: "file:/mnt/arquivos/Trabalho/MatchFight/apps/nextjs/src/app/page.tsx"
target_fingerprint: "sha256:9ea0f2b863fe24df4294166c97ef550ab6ee420414dfe681f967c4ae72bedfa8"
target_path: /mnt/arquivos/Trabalho/MatchFight/apps/nextjs/src/app/page.tsx
timestamp: 2026-09-01T08-22-33Z
slug: apps-nextjs-src-app-page-tsx
---
# Critique (Re-run): MatchFight Landing Page

**Target:** `apps/nextjs/src/app/page.tsx`
**Slug:** `apps-nextjs-src-app-page-tsx`

⚠️ **DEGRADED: single-context (ambos os sub-agents falharam em produzir resultado terminal — designer parou, explorer travou; síntese rodada inline no contexto pai)**

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Persiste: sem loading no form de sign-in; clique → espera silenciosa → redirect Discord |
| 2 | Match System / Real World | 4 | Agora 100% pt-BR — "Descobrir/Combinar/Lutar", nav e CTAs consistentes |
| 3 | User Control and Freedom | 3 | Nav e back paths limpos; "Criar perfil" para não-authed aponta pra /profile/edit (auth-gated) |
| 4 | Consistency and Standards | 4 | Melhorou: SignInButton agora usa variants nativos (outline, action); zero override inline |
| 5 | Error Prevention | 3 | Superfície mínima; sign-in é redirect server sem feedback inline |
| 6 | Recognition Rather Than Recall | 4 | Tudo visível e autoexplicativo |
| 7 | Flexibility and Efficiency | n/a | Persuade-mode landing page |
| 8 | Aesthetic and Minimalist Design | 3 | Melhorou: tagline sem border-2/bg; headline domina o hero |
| 9 | Error Recovery | n/a | Sem estados de erro nesta superfície |
| 10 | Help and Documentation | n/a | Persuade-mode landing page |
| **Total** | | **23/28** | **Good (82%)** |

## Design Specificity Verdict

**LLM assessment:** A página agora é inequivocamente autoral do domínio — pt-BR completo, fluxo Descobrir→Combinar→Lutar, vermelho reservado, cantos 0px, labels uppercase. A correção do idioma removeu o ruído que a tornava "meio traduzida". A composição continua convencional (badge→headline→subheading→CTAs), mas a execução da linguagem de combate é coesa.

**Deterministic scan (inline):** detect.mjs → [] (limpo). Check manual das regras: todas passam — One Accent (logo isento + 1 vermelho funcional), No-Hue, Uppercase, Weight Discipline, Flat-By-Default, 8px spacing, 0px corners, tokens semânticos (overrides removidos), dark mode, pt-BR consistente.

**Visual overlays:** Indisponível — Chrome não instalado nesta máquina.

## Overall Impression

As 3 P1/P2 mais importantes foram resolvidas: idioma, hierarquia do hero e bypass de variant. A página está sólida e coesa. O que resta é polimento: feedback de sign-in, distinção visual do badge do hero, footer minimalista demais.

## What's Working

1. **pt-BR consistente ponta a ponta.** Nav "Encontrar/Lutas/Perfil", features "Descobrir/Combinar/Lutar", CTAs contextuais ("Ver perfil"/"Criar perfil"). Nada mais quebra a imersão.
2. **Variants nativos, zero override.** SignInButton action no hero, outline nos secundários. O sistema de design agora é a única fonte de verdade — auditável.
3. **Hero limpo.** O headline text-display-lg reina; a tagline recede em muted. A "luta começa antes do octógono" agora tem o peso que merece.

## Priority Issues

### [P2] Sem feedback de loading no sign-in
- **What:** O form do SignInButton dispara server action sem estado pending/disabled. Riley pode dar double-click e disparar dois requests de OAuth.
- **Why it matters:** Única ação de conversão crítica da página; falta de feedback gera reenvios e confusão.
- **Fix:** Adicionar useTransition/estado pending no SignInButton, com disabled e texto alternativo.
- **Command:** /impeccable harden landing-page

### [P2] Footer vazio para um produto de comunidade
- **What:** Footer tem só logo + copyright. Sem redes sociais, Termos/Privacidade, "Sobre".
- **Why it matters:** Para um produto de luta no Brasil, comunidade vive em Instagram/YouTube; ausência de links sociais reduz confiança e descoberta.
- **Fix:** Adicionar links sociais e legais. Micro-polimento dentro do sistema.
- **Command:** /impeccable harden landing-page ou /impeccable polish landing-page

### [P3] Badge do hero ainda pode confundir com interativo
- **What:** A tagline mantém inline-flex items-center uppercase mas sem cursor/border — visualmente ainda se assemelha a um chip, e chips são interativos em outras telas (filtros).
- **Why it matters:** Riley tenta clicar no badge esperando ação; nada acontece.
- **Fix:** Ou adicionar um affordance de não-clicável (mantê-lo como texto puro, sem inline-flex/items-center), ou torná-lo um link âncora.
- **Command:** /impeccable distill landing-page

### [P3] Hero primário usa size="lg" (h-14), secundário size="default" (h-12)
- **What:** Descompasso de altura entre "Começar a swipar" (h-14) e "Ver/Criar perfil" (h-12) no mesmo grupo.
- **Why it matters:** Leve inconsistência visual num grupo de CTA pareado.
- **Fix:** Alinhar ambos para size="default" (h-12).
- **Command:** /impeccable layout landing-page

## Cognitive Load Assessment

| Check | Pass/Fail | Notes |
|-------|-----------|-------|
| Single focus | ✅ | Tagline agora recede; headline é o foco |
| Chunking | ✅ | 3 features — ideal |
| Grouping | ✅ | CTAs pareados, features agrupadas |
| Visual hierarchy | ✅ | Headline > subheading > tagline, claro |
| One thing at a time | ✅ | Fluxo linear natural |
| Minimal choices | ✅ | ≤3 opções visíveis |
| Working memory | ✅ | Sem carry-over |
| Progressive disclosure | ✅ | Linear e progressivo |

**Failures: 0/8 — Low cognitive load.** (Melhorou de 2 falhas para 0.)

## Persona Red Flags

- **Riley (Stress Tester):** Double-click no "Entrar" dispara múltiplos submits de OAuth sem estado pending. Feature cards continuam estáticos sem affordance.
- **Jordan (First-Timer):** Melhorou muito — linguagem consistente. Mas "Criar perfil" o leva ao fluxo Discord sem explicar por que o gaming platform é necessário para login.
- **Casey (Mobile):** Hero segue alto (~600px antes de conteúdo); badges/features empilham em scroll longo.

## Minor Observations

- © {new Date().getFullYear()} é o único elemento dinâmico — footer sem personalidade.
- O badge do hero e os chips de status compartilham o mesmo vocabulário visual (sharp, uppercase) — semântica de interatividade não está diferenciada.
- A seção "Como funciona" não tem título/âncora — escaneável, mas sem identificador.

## Questions to Consider

1. Se o footer é o fim da jornada de conversão, não merece mais do que logo + copyright? O que um lutador brasileiro espera ver no rodapé de uma plataforma de combate?
2. O fluxo Discord sem explicação é uma barreira real para o público não-gamer. Vale um passo intermediário "Por que Discord?" antes de redirecionar?
3. A composição ainda é o hero convencional. O que uma landing que começa na tensão da luta (VS, octógono, cartel) faria de diferente?
