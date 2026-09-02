# MatchFight UI Surface Map — Redesign Reference

## 1. Apps

| App | Caminho | Tipo |
|-----|---------|------|
| **nextjs** | `apps/nextjs` | Web app (Create T3 Turbo, Next.js 14) |
| **expo** | `apps/expo` | Mobile app (React Native + expo-router) |
| **tanstack-start** | `apps/tanstack-start` | SSR app (TanStack Router + Vite) |

---

## 2. Telas/Páginas (UI Routes)

### Next.js (app/router)

| Caminho | Tipo | Descrição |
|---|---|---|
| `apps/nextjs/src/app/page.tsx` | Landing | Hero com headline "Encontre seu próximo oponente", CTA swiper |
| `apps/nextjs/src/app/(auth)/sign-in/page.tsx` | Auth | Página de sign-in |
| `apps/nextjs/src/app/(auth)/sign-up/page.tsx` | Auth | Página de sign-up |
| `apps/nextjs/src/app/(auth)/layout.tsx` | Auth layout | Wrapper para páginas de auth |
| `apps/nextjs/src/app/onboarding/page.tsx` | Onboarding | Wizard de 6 etapas (carousel → role → identity → record → bio → submit) |
| `apps/nextjs/src/app/layout.tsx` | Root layout | ThemeProvider + ThemeToggle + Toaster |
| `apps/nextjs/src/app/fights/page.tsx` | Fights list | Lista de lutas disponíveis |
| `apps/nextjs/src/app/fights/[id]/page.tsx` | Fight detail | Página de detalhe da luta |
| `apps/nextjs/src/app/fights/[id]/chat/page.tsx` | Chat | Chat da luta |
| `apps/nextjs/src/app/profile/page.tsx` | Profile | Perfil do usuário |
| `apps/nextjs/src/app/profile/edit/page.tsx` | Profile edit | Edição de perfil |
| `apps/nextjs/src/app/profile/[id]/page.tsx` | Public profile | Perfil público outorgado |
| `apps/nextjs/src/app/swipe/page.tsx` | Swipe | Tela de swiping de candidatos |

### Expo (expo-router)

| Caminho | Tipo | Descrição |
|---|---|---|
| `apps/expo/src/app/index.tsx` | Home | Tela inicial com auth gate + SwipeCard |
| `apps/expo/src/app/onboarding.tsx` | Onboarding | Wizard similar ao Next.js (passo a passo) |
| `apps/expo/src/app/profile/index.tsx` | Profile | Perfil do usuário (view) |
| `apps/expo/src/app/profile/edit.tsx` | Profile edit | Formulário de edição de perfil |
| `apps/expo/src/app/fights/index.tsx` | Fights list | Lista de lutas (minhas + para julgar) |
| `apps/expo/src/app/fights/[id].tsx` | Fight detail | Detalhe da luta com ações |
| `apps/expo/src/app/fights/[id]/chat.tsx` | Chat | Chat da luta em tempo real |

### TanStack Start (TanStack Router)

| Caminho | Tipo | Descrição |
|---|---|---|
| `apps/tanstack-start/src/routes/index.tsx` | Home | Página inicial com posts + auth showcase + formulário de criação |

---

## 3. Componentes de UI Customizados

### Shared package `@acme/ui` (`packages/ui/`)

| Componente | Caminho | Função |
|---|---|---|
| **Button** | `packages/ui/src/button.tsx` | Botão com variantes: default, destructive, outline, secondary, ghost, link, action; tamanhos: default, sm, lg, icon |
| **Input** | `packages/ui/src/input.tsx` | Input de formulário com estilos de foco, estado invalid, file input |
| **Field** | `packages/ui/src/field.tsx` | Conjunto de componentes: FieldSet, FieldLegend, FieldGroup, FieldContent, FieldLabel, FieldTitle, FieldDescription, FieldSeparator, FieldError — agrupamento de campos de formulário com validação e orientação |
| **Label** | `packages/ui/src/label.tsx` | Label de formulário com estilo de peer disabled |
| **DropdownMenu** | `packages/ui/src/dropdown-menu.tsx` | Dropdown completo com Trigger, Content, Item, CheckboxItem, RadioGroup, RadioItem, Label, Separator, Sub, SubTrigger, SubContent |
| **Separator** | `packages/ui/src/separator.tsx` | Separador visual horizontal/vertical com conteúdo opcional |
| **Toaster/Toast** | `packages/ui/src/toast.tsx` | Toaster com sonner — toast notifications com tema themeMode (light/dark/auto) |

### Próprios por app (não do pacote compartilhado)

#### Next.js components
- `apps/nextjs/src/app/fights/_components/fights-list.tsx` → Lista de lutas
- `apps/nextjs/src/app/fights/[id]/_components/fight-detail.tsx` → Detalhe da luta
- `apps/nextjs/src/app/fights/[id]/chat/_components/chat-view.tsx` → Visualização de chat
- `apps/nextjs/src/app/profile/_components/profile-view.tsx` → Visualização de perfil
- `apps/nextjs/src/app/profile/edit/_components/profile-edit-form.tsx` → Formulário de edição de perfil
- `apps/nextjs/src/app/profile/[id]/_components/public-profile-view.tsx` → Perfil público
- `apps/nextjs/src/app/swipe/_components/swipe-candidates.tsx` → Candidatos para swipar

#### Expo components
- Componentes RN usados diretamente: `SafeAreaView`, `View`, `Text`, `Pressable`, `Image`, `ActivityIndicator`, `FlatList`, `KeyboardAvoidingView`, `Stack`, `Link` — espalhados pelos arquivos de tela

---

## 4. Design System Atual

**Arquivo:** `tooling/tailwind/theme.css` (221 linhas)

- **Cores semânticas `oklch`** — totalmente definidas tanto light quanto dark:
  - `--background`: `oklch(1 0 0)` #FFFFFF (light) / `oklch(0.06 0 0)` #0D0D0D (dark)
  - `--foreground`: `oklch(0.11 0 0)` #1A1A1A (light) / `oklch(1 0 0)` #FFFFFF (dark)
  - `--border`, `--muted`, `--muted-foreground`, `--card`, `--card-foreground`
  - `--primary`: `oklch(0.577 0.245 27.3)` #DC2626 (Blood Red) — inalterado entre modes
  - `--destructive`, `--ring`, `--popover`, `--input`, `--secondary`, `--accent` + foregrounds
- **@theme inline block** define variáveis nomeadas: `--color-background`, `--color-foreground`, `--color-border`, `--color-muted`, `--color-primary`, `--color-card`, `--color-destructive`, `--color-ring`, `--color-popover`, `--color-input`, `--color-secondary`, `--color-accent`, `--color-chart-*`, `--color-sidebar-*`, `--radius-*`, `--font-sans` ("Nunito Sans"), `--font-mono` ("JetBrains Mono"), escala de tipo (`--text-display-lg`, `--text-headline-lg`, `--text-headline-md`, `--text-body-md`, `--text-body-lg`, `--text-label-bold`, `--text-label-sm`), breakpoints (`--breakpoint-sm: 640px`, `--breakpoint-md: 768px`, `--breakpoint-lg: 1024px`, `--breakpoint-xl: 1280px`, `--breakpoint-2xl: 1536px`), container e spacing (`--spacing: 8px`).
- **Radius**: 0px em tudo — estética "sharp/clean".
- **Já tem tokens semânticos completos** — `oklch`, variáveis CSS nomeadas, type scale, breakpoints. Não usa valores hardcoded (exceto o 0px do radius e algumas cores de compatibilidade).

**Stack:** Tailwind CSS v4 (pnpm-workspace.yaml: `tailwindcss: ^4.1.16`). O theme.css é importado via `@import "@acme/tailwind-config/theme"` em `styles.css` de Next.js, TanStack Start e Expo.

---

## 5. Shared UI Package

**Package:** `@acme/ui` em `packages/ui`

**Exportados (via `package.json` exports):**
- `.` → `src/index.ts`
- `./button` → `src/button.tsx`
- `./dropdown-menu` → `src/dropdown-menu.tsx`
- `./field` → `src/field.tsx`
- `./input` → `src/input.tsx`
- `./label` → `src/label.tsx`
- `./separator` → `src/separator.tsx`
- `./theme` → `src/theme.tsx`
- `./toast` → `src/toast.tsx`

**Dependências:** `class-variance-authority`, `radix-ui`, `sonner`, `tailwind-merge`, `@radix-ui/react-icons`

---

## 6. Stack de Estilização

| Ferramenta | Versão | Como é usado |
|---|---|---|
| **Tailwind CSS** | v4 (`^4.1.16`) | Utilities classes (`bg-background`, `text-foreground`, `p-6`, `rounded-none`, `border-border`, etc.) + `@import` do theme.css |
| **NativeWind** | (Expo) | `import "nativewind/theme"` no `styles.css` do Expo; mapeia Tailwind para estilos React Native |
| **CSS Modules** | Não usado | |
| **StyleSheet RN** | (Expo) | Classes `className` em componentes RN (ex: `className="bg-background flex-1"`); não usa `StyleSheet.create` para estilos complexos |
| **shadcn/ui** | Configurado | `ui-add` script no `packages/ui/package.json` usa `shadcn@latest add`; componentes baseados em Radix UI |
| **Theme tokens** | CSS vars + oklch | `tooling/tailwind/theme.css` com `--background`, `--foreground`, `--primary` etc. em `oklch()` — consumidos via `var(--background)`, `var(--foreground)` e classes Tailwind `bg-background`, `text-foreground` |

**Resumo rápido do theme:** Já possui tokens semânticos completos em `oklch` (cores, radius, fontes, breakpoints, type scale). Light/dark modes definidos. Usa `var(--*)` CSS vars consumidos tanto por Tailwind utilities quanto por código CSS custom. Não há valores hardcoded significativos — tudo é variável temática.