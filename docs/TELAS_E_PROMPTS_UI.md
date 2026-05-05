# Standora — Telas da Aplicação e Prompts de UI

> **Design System de Referência:** Dark mode com fundo `#0a0a0f`, glassmorphism (`bg-white/5 backdrop-blur`), gradientes violeta→azul (`from-violet-600 to-blue-600`), tipografia Inter, badges coloridos por status, cards com `border border-white/10 rounded-2xl`.

---

## 🎨 Filosofia de UI

- **Dark-first:** fundo escuro profundo, elementos em branco/5 com blur
- **Cor de marca:** violeta (#7c3aed) → azul (#2563eb) em botões primários e destaques
- **Hierarquia:** títulos grandes + subtítulo slate-400, labels uppercase tracking-widest em slate-600
- **Microinterações:** hover states suaves, badges com dot colorido, spinners em botões de ação
- **Layout base:** sidebar fixa à esquerda (64px), conteúdo principal com padding 8, max-w-5xl

---

## GRUPO 1 — Dashboard Principal

---

### Tela 2.1 — Visão Geral (Home do Dashboard)

**Rota:** `/dashboard`  
**Status:** ✅ Implementado (com Prisma quebrado)

**Prompt de geração:**
```
Dark SaaS dashboard main screen. Left sidebar (dark, 256px wide) with logo, nav links (Home, Events) with icon + label, user avatar with initials at bottom and logout button. Main content: header "Visão Geral" + welcome message + "Novo Evento" button in violet gradient. Below: 3 stat cards in a grid — "Eventos Ativos" (violet tint), "Estandes Vendidos" (blue tint), "Receita Total" (emerald tint) — each with icon, metric value, gradient overlay. Below: "Eventos Recentes" card with a list of events showing name, date, stand count, and a colored status badge (Rascunho/Publicado/Em andamento/Encerrado). Empty state shows icon + CTA button.
```

---

### Tela 2.2 — Lista de Eventos

**Rota:** `/dashboard/events`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Dark SaaS events list page. Header with "Meus Eventos" title and "+ Novo Evento" gradient button. Search bar + filter dropdowns (Status, Tipo, Data). Grid of event cards — each card: cover image at top (16:9), colored status badge overlay, event name in bold white, date range in slate-400, "X estandes / Y expositores" info row, quick action links (Ver, Editar). Empty state: large icon, headline, CTA. Pagination at bottom. Dark glassmorphism style.
```

---

### Tela 2.3 — Criar / Editar Evento

**Rota:** `/dashboard/events/new` e `/dashboard/events/[id]/edit`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Dark SaaS multi-step event creation form. Step indicator at top (4 steps: Informações, Espaço, Estandes, Publicação) with active step in violet. Step 1 form: event name, type selector (Feira/Exposição/Congresso/Festival/Corporativo/Outro) as pill buttons, start date + end date pickers, description textarea, cover image upload dropzone (dashed border, camera icon), estimated participants and exhibitors number inputs. Floating "Próximo" button in gradient. Side panel shows live preview card. Dark background with glass panels.
```

---

### Tela 2.4 — Painel do Evento

**Rota:** `/dashboard/events/[id]`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Dark SaaS event detail dashboard. Top: cover image banner (full width, 200px tall, with gradient overlay) showing event name, dates, status badge. Below: 4 KPI cards — Ocupação % (circular progress), Receita Total, Contratos Assinados, Participantes Inscritos. Tabs navigation: Visão Geral / Mapa / Expositores / Financeiro / Pessoal. Active tab content shows recent activity feed and quick actions. Sidebar links for sub-sections. Premium dark aesthetic.
```

---

## GRUPO 3 — Mapa Interativo de Estandes

---

### Tela 3.1 — Editor de Mapa

**Rota:** `/dashboard/events/[id]/map`  
**Status:** 🔴 A implementar (core feature)

**Prompt de geração:**
```
Dark SaaS interactive floor plan editor. Full-screen layout. Left panel (280px): toolbox with drag handles for stand blocks (3x3m, 6x3m, 6x6m, Personalizado), area tools (Corredor, Palco, Banheiro, Estacionamento, Zona Restrita), color palette for stand categories, stand count and occupancy stats. Center: canvas area with grid background (subtle dark dots), shows a floor plan with colored rectangular stands positioned on it — green (available), orange (reserved), red (occupied), gray (blocked). Each stand has a label (A1, A2, B1). Top toolbar: undo/redo, zoom in/out, export PNG/PDF, save button in gradient. Right panel (240px): selected stand properties — name, size, category, price, services extras checklist. Premium UI, looks like Figma but for event mapping.
```

---

### Tela 3.2 — Mapa Público (para Expositores)

**Rota:** `/portal/[eventSlug]/map`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Public interactive event floor plan viewer. Light or dark theme option. Top header with event logo, name and "Selecionar Estande" CTA. Main canvas: interactive floor map with color-coded stands — emerald green (disponível), amber (reservado), red (ocupado). Clicking a stand opens a side panel: stand name, dimensions, category, base price, available extras (checkboxes with prices), total calculation. "Iniciar Contratação" button in brand color. Legend at bottom showing status colors. Responsive, mobile-friendly.
```

---

## GRUPO 4 — Gestão de Expositores

---

### Tela 4.1 — Lista de Expositores

**Rota:** `/dashboard/events/[id]/exhibitors`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Dark SaaS exhibitors management page. Header "Expositores" + "Convidar Expositor" button. Search + filter by status (Pendente/Aprovado/Reprovado). Table layout: company name + contact avatar, contact email, assigned stand(s), contract status badge, document status badge, payment status badge, action buttons (Ver, Editar, Enviar lembrete). Row hover highlight. Bulk action toolbar when rows selected. Dark glassmorphism style with alternating row subtle tints.
```

---

### Tela 4.2 — Perfil do Expositor

**Rota:** `/dashboard/events/[id]/exhibitors/[exhibitorId]`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Dark SaaS exhibitor profile page. Top card: company name, CNPJ, contact person, email, phone, assigned stand badge. 3 status indicators in a row: Contrato (Assinado/Pendente), Documentos (Aprovados/Pendentes), Pagamento (Pago/Atrasado). Tabs: Documentos / Contrato / Pagamentos / Histórico. Documents tab: list of required documents with upload status icons (checked/warning/X), upload button, reviewer notes. Contract tab: contract preview + signing status timeline. Dark UI with colored status indicators.
```

---

## GRUPO 5 — Portal do Expositor (Acesso Externo)

---

### Tela 5.1 — Login do Expositor

**Rota:** `/portal/[eventSlug]`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Expositor portal login page. Event branding at top (event cover image background with gradient overlay, event name, dates). Centered card for exhibitor login/registration. Two tabs: "Já tenho cadastro" / "Primeiro acesso". Login: email + password + "Entrar" button. First access: company name, CNPJ, contact name, email, password. Brand colors from the event (customizable). Professional, trust-building design.
```

---

### Tela 5.2 — Dashboard do Expositor

**Rota:** `/portal/[eventSlug]/dashboard`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Exhibitor self-service portal dashboard. Top: event header with countdown to event date. Progress checklist card: step 1 Selecionar Estande (done), step 2 Enviar Documentos (pending), step 3 Assinar Contrato (pending), step 4 Realizar Pagamento (pending). My Stand card: stand number/name, dimensions, location on mini-map preview, extras selected, total value. Quick action buttons: "Ver Mapa", "Upload Documentos", "Assinar Contrato", "Pagar". Notification panel. Clean SaaS portal design.
```

---

### Tela 5.3 — Upload de Documentos

**Rota:** `/portal/[eventSlug]/documents`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Document upload portal page. Clean, light or dark themed. List of required documents: Cartão CNPJ, Alvará de Funcionamento, Certificado de Regularidade, Seguro de Responsabilidade Civil, etc. Each row: document name + description, upload dropzone (dashed border) or file preview if uploaded, status badge (Pendente/Em análise/Aprovado/Reprovado), reviewer comment if reprovado. Progress bar at top showing overall completion %. Submit all button. Trust signals: padlock icon, data security note.
```

---

## GRUPO 6 — Gestão Financeira

---

### Tela 6.1 — Dashboard Financeiro do Evento

**Rota:** `/dashboard/events/[id]/financial`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Dark SaaS financial dashboard. Top KPIs in a row: Receita Total (emerald), Despesas (red), Margem Líquida (blue), Taxa de Ocupação % (violet). Revenue chart (area chart, emerald fill) showing accumulation over time. Two columns below: Contas a Receber table (expositor name, value, due date, status badge Pago/Pendente/Atrasado, action buttons) and Contas a Pagar table (description, category, due date, status). Filter by period. Export Excel/PDF button. Professional financial SaaS dark UI.
```

---

### Tela 6.2 — Registro de Despesa

**Rota:** `/dashboard/events/[id]/financial/expenses/new`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Dark SaaS expense registration modal or page. Form: description text field, category selector (pills: Aluguel, Montagem, Marketing, Pessoal, Alimentação, Outros), amount field with R$ prefix, due date picker, payment status toggle (Pendente/Pago), paid date (shows only if Pago), notes textarea, file attachment for receipt. Submit button in gradient. Compact, focused form design.
```

---

## GRUPO 7 — Gestão de Pessoal

---

### Tela 7.1 — Lista de Colaboradores

**Rota:** `/dashboard/events/[id]/staff`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Dark SaaS staff management page. Header "Equipe do Evento" + "Adicionar Colaborador" button. Grid of staff cards: avatar initials circle, name, role (Segurança/Recepção/Credenciamento/Limpeza), type badge (Próprio/Temporário/Terceiro), scheduled shifts count, confirmation status dot. List view toggle. Below: shift schedule view — timeline calendar showing each staff member's shifts as colored bars across the event dates. Dark professional UI.
```

---

### Tela 7.2 — Escala de Turnos

**Rota:** `/dashboard/events/[id]/staff/schedule`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Dark SaaS staff scheduling interface. Gantt-style calendar grid. Rows: staff members. Columns: event days. Each cell: shift blocks as colored bars with drag handles to resize/move. Color by sector (green=credenciamento, blue=recepção, orange=segurança, purple=limpeza). Sidebar with unassigned staff pool. Top: date range selector, sector filter. Right panel: selected shift details (time, sector, location, status). Looks like a professional scheduling tool (Calendly meets Jira).
```

---

## GRUPO 8 — Contratos

---

### Tela 8.1 — Visualização de Contrato

**Rota:** `/dashboard/events/[id]/contracts/[contractId]`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Dark SaaS contract detail page. Left side: contract preview panel (light background document style, company letterhead, filled contract text with highlighted values — stand name, price, dates, extras, payment terms). Right side: signing timeline (vertical stepper) — Gerado, Enviado para Expositor, Assinado pelo Expositor, Assinado pelo Organizador. Status badges. Action buttons: "Enviar para Assinatura", "Download PDF", "Cancelar Contrato". Signature status cards showing who signed when.
```

---

## GRUPO 9 — Relatórios e Pós-Evento

---

### Tela 9.1 — Relatório de Performance

**Rota:** `/dashboard/events/[id]/report`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Dark SaaS event performance report page. Top summary banner: event name, dates, final status. KPI grid: Participantes (previsto vs. realizado), Estandes (ocupados/total), Receita Total, Resultado Líquido, NPS Médio. Charts section: occupancy donut chart, revenue vs expenses bar chart, participant registration curve (line chart). Exhibitor satisfaction table. Export PDF button prominent. Executive summary text block. Premium data visualization dark UI.
```

---

## GRUPO 10 — Configurações

---

### Tela 10.1 — Configurações da Organização

**Rota:** `/dashboard/settings`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Dark SaaS settings page. Left sub-nav: Organização, Equipe, Plano e Cobrança, Integrações, Notificações. Organization tab: company name, CNPJ, logo upload, primary color picker (for portal branding). Team tab: members table with role badges (Admin/Financeiro/Operacional/Visualizador), invite by email form, pending invites list. Plan tab: current plan card with limits bar chart, upgrade CTA. Integrations: D4Sign, PIX gateway, NF-e provider toggles with connect buttons. Professional settings SaaS UI.
```

---

## GRUPO 11 — Página Pública do Evento

---

### Tela 11.1 — Landing Page Pública

**Rota:** `standora.com.br/eventos/[slug]`  
**Status:** 🔴 A implementar

**Prompt de geração:**
```
Public event landing page. Hero section: full-width event cover image with gradient overlay, event name in large white bold text, date/location/type badges, "Inscrever-se" and "Ver Estandes" CTA buttons. About section: description, organizer logo. Schedule section: accordion timeline with activities/speakers. Exhibitors section: logo grid of confirmed exhibitors. Ticket section: price cards for each ticket type (Gratuito/Pago/VIP) with availability bar and "Garantir Ingresso" button. Registration form: name, email, company, role, interests checkboxes. Footer with event social links. Clean, modern event marketing page.
```

---

## Resumo — Quantidade de Telas por Status

| Status | Quantidade |
|---|---|
| ✅ Implementado | 1 |
| 🚧 Parcialmente implementado | 0 |
| 🔴 A implementar | 18 |
| **Total** | **19** |

---

## Ordem de Implementação Recomendada (MVP)

1. **Lista de Eventos** (`/dashboard/events`) — base de tudo
2. **Criar/Editar Evento** (`/dashboard/events/new`) — fluxo principal
3. **Painel do Evento** (`/dashboard/events/[id]`) — hub central
4. **Editor de Mapa** (`/dashboard/events/[id]/map`) — diferencial competitivo
5. **Lista de Expositores** (`/dashboard/events/[id]/exhibitors`) — gestão operacional
6. **Dashboard Financeiro** (`/dashboard/events/[id]/financial`) — valor percebido
7. **Portal do Expositor** (`/portal/[slug]`) — experiência B2B2B
8. **Contratos** (`/dashboard/events/[id]/contracts`) — valor jurídico
9. **Pessoal** (`/dashboard/events/[id]/staff`) — operacional
10. **Relatórios** (`/dashboard/events/[id]/report`) — pós-evento
