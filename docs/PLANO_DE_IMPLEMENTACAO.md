# Standora — Plano de Implementação

> Versão 1.0 | Data: maio de 2026
> Metodologia: Desenvolvimento iterativo em 3 fases principais com entrega incremental de valor.

---

## Visão Geral das Fases

| Fase | Nome | Duração | Objetivo |
|---|---|---|---|
| **Fase 1 (MVP)** | Fundação e Validação | Meses 1–4 | Produto mínimo viável para primeiros clientes pagantes |
| **Fase 2 (V1.0)** | Crescimento | Meses 5–10 | Produto completo para escala de mercado |
| **Fase 3 (V2.0)** | Escala e Ecossistema | Meses 11–18 | White-label, marketplace, mobile nativo, Open API |

---

## Stack Tecnológico

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Frontend Web** | Next.js 14 (App Router) + TypeScript | SSR/SSG para SEO, ecosystem maduro |
| **UI Components** | shadcn/ui + Tailwind CSS | Design system consistente e acessível |
| **Mapa Interativo** | Konva.js (canvas-based) | Performance para drag & drop com muitos objetos |
| **Estado Global** | Zustand + React Query | Simples, performático, sem boilerplate |
| **Backend/API** | Node.js + NestJS | Arquitetura modular, TypeScript nativo, DI |
| **Banco de Dados** | PostgreSQL (principal) + Redis (cache/sessões) | Relacional robusto, Redis para tempo real |
| **ORM** | Prisma | Type-safe, migrações declarativas |
| **Autenticação** | NextAuth.js v5 + JWT | OAuth (Google), email/senha, 2FA |
| **Pagamentos** | Mercado Pago API (PIX/cartão/boleto) | Mais popular no BR, webhook nativo para PIX |
| **Emissão Fiscal** | Focus NF-e API | API brasileira mais completa e documentada |
| **Assinatura Digital** | D4Sign API | Certificação ICP-Brasil, validação jurídica |
| **Email** | SendGrid | Confiabilidade, templates, métricas |
| **SMS** | Twilio | Cobertura global, API simples |
| **Realtime** | Socket.io | Atualização do mapa de estandes em tempo real |
| **Storage** | AWS S3 (ou Cloudflare R2) | Upload de documentos, plantas baixas, imagens |
| **Infra** | Railway ou Render (MVP) → AWS ECS (V1+) | Barato para validar, escalável depois |
| **CI/CD** | GitHub Actions | Automação de testes e deploy |
| **Monitoramento** | Sentry + Datadog | Erros e métricas de performance |
| **Mobile (V2)** | React Native + Expo | Code sharing com web, ecossistema unificado |

---

## Arquitetura de Sistema

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENTES (USUÁRIOS)                    │
│  Organizador  │  Expositor  │  Participante  │  Equipe   │
└───────┬───────┴──────┬──────┴───────┬────────┴─────┬─────┘
        │              │              │               │
┌───────▼──────────────▼──────────────▼───────────────▼─────┐
│              FRONTEND — Next.js 14 (App Router)             │
│  /dashboard  /eventos  /mapa  /financeiro  /pessoal        │
│  /[expositor]  /[evento]/page (pública)  /checkin          │
└──────────────────────┬─────────────────────────────────────┘
                       │ HTTPS / WebSocket
┌──────────────────────▼─────────────────────────────────────┐
│             API — NestJS (REST + WebSocket)                  │
│  AuthModule  EventModule  MapModule  ExhibitorModule        │
│  PaymentModule  ContractModule  FiscalModule  StaffModule   │
│  FinanceModule  NotificationModule  ReportModule            │
└────┬──────────┬──────────┬───────────┬───────────┬─────────┘
     │          │          │           │           │
┌────▼──┐  ┌───▼───┐  ┌───▼──┐  ┌────▼──┐  ┌────▼────────┐
│Postgre│  │ Redis │  │  S3  │  │Socket │  │  Filas      │
│  SQL  │  │ Cache │  │ Files│  │  .io  │  │ (Bull/Redis)│
└───────┘  └───────┘  └──────┘  └───────┘  └─────────────┘
                                                    │
┌───────────────────────────────────────────────────▼────────┐
│               INTEGRAÇÕES EXTERNAS                          │
│  Mercado Pago │ Focus NF-e │ D4Sign │ SendGrid │ Twilio    │
└────────────────────────────────────────────────────────────┘
```

---

## FASE 1 — MVP (Meses 1–4): Fundação e Validação

### Objetivo
Ter um produto funcional que permita o primeiro organizador criar um evento, configurar o mapa, receber um expositor e processar um pagamento real.

### Critérios de Sucesso do MVP
- 5 organizadores reais usando o sistema em produção.
- 1 evento completo processado (do cadastro ao pagamento do expositor).
- Feedback qualitativo coletado para guiar a V1.

---

### Sprint 1 (Semanas 1–2): Setup de Infraestrutura e Fundação

**Tarefas:**
- [ ] Criação do repositório monorepo (apps/web, apps/api, packages/shared).
- [ ] Configuração do projeto Next.js 14 com TypeScript, ESLint, Prettier e shadcn/ui.
- [ ] Configuração do projeto NestJS com Prisma e PostgreSQL.
- [ ] Configuração do banco de dados (schema inicial: User, Organization, Plan, Event).
- [ ] Deploy da infraestrutura básica no Railway (PostgreSQL + API + Frontend).
- [ ] Configuração do GitHub Actions (lint + testes em cada PR, deploy automático em main).
- [ ] Configuração do domínio e certificado SSL.

**Entregáveis:**
- Repositório configurado e CI/CD funcional.
- Ambiente de produção (staging) acessível via URL.

---

### Sprint 2 (Semanas 3–4): Autenticação e Gestão de Conta

**Tarefas:**
- [ ] Implementar cadastro de organização (nome, CNPJ, email, senha).
- [ ] Implementar login via email/senha com JWT.
- [ ] Implementar login OAuth via Google (NextAuth.js v5).
- [ ] Implementar recuperação de senha via email (SendGrid).
- [ ] Implementar convite de membros com papéis: Admin, Financeiro, Operacional, Visualizador.
- [ ] Criar middleware de autorização por papel (RBAC).
- [ ] Criar tela de configurações da conta (dados da organização, logotipo, plano atual).

**Schema do Banco (Sprint 2):**
```sql
User (id, email, password_hash, name, role, organization_id, created_at)
Organization (id, name, cnpj, logo_url, plan_id, created_at)
Plan (id, name, max_events, max_stands, max_participants, monthly_price)
Invitation (id, email, role, token, organization_id, expires_at, accepted_at)
```

**Entregáveis:**
- Fluxo completo de cadastro → login → convite de membros funcionando.
- Painel de configurações da conta.

---

### Sprint 3 (Semanas 5–6): Gestão de Eventos

**Tarefas:**
- [ ] Criar tela de listagem de eventos com cards (nome, data, status, % ocupação).
- [ ] Criar formulário de criação/edição de evento (nome, tipo, datas, descrição, imagem de capa, slug).
- [ ] Implementar validação de slug único e geração automática a partir do nome.
- [ ] Criar dashboard do evento (indicadores: estandes, participantes, receita, contratos).
- [ ] Implementar lógica de limites de eventos por plano (Freemium: 1, Starter: 3, Professional: ilimitado).
- [ ] Criar cronograma mestre do evento (marcos e alertas configuráveis).
- [ ] Implementar notificações in-app para prazos.

**Schema do Banco (Sprint 3):**
```sql
Event (id, organization_id, name, slug, type, status, start_date, end_date, cover_url, description, estimated_participants, estimated_exhibitors, created_at)
EventMilestone (id, event_id, title, due_date, completed_at)
```

**Entregáveis:**
- CRUD completo de eventos com dashboard.
- Cronograma mestre com alertas.

---

### Sprint 4 (Semanas 7–9): Mapa Interativo de Estandes

> Esta é a sprint mais complexa do MVP. Requer 3 semanas.

**Tarefas:**
- [ ] Integrar Konva.js como engine do editor de mapa.
- [ ] Implementar canvas com zoom, pan e grid.
- [ ] Implementar upload de imagem de planta baixa como layer de fundo.
- [ ] Implementar ferramenta para criar blocos de estande (click + drag para definir tamanho).
- [ ] Implementar propriedades do estande: nome, dimensões, categoria, preço base.
- [ ] Implementar categorias com cores configuráveis pelo organizador.
- [ ] Implementar áreas especiais: corredor, palco, banheiro, zona restrita.
- [ ] Implementar drag & drop para reposicionar estandes.
- [ ] Implementar painel lateral de propriedades do estande selecionado.
- [ ] Implementar serialização do mapa (salvar/carregar estado do canvas em JSON no banco).
- [ ] Implementar status visual dos estandes: Disponível (verde), Reservado (amarelo), Ocupado (cinza).
- [ ] Implementar WebSocket para sincronização em tempo real do status dos estandes.
- [ ] Implementar bloqueio temporário de estande ao ser clicado por expositor (timeout de 15 min).
- [ ] Implementar vista pública do mapa (somente leitura, via link compartilhável).
- [ ] Implementar módulo de serviços extras: lista de serviços configurável com valor unitário.

**Schema do Banco (Sprint 4):**
```sql
EventMap (id, event_id, floor_plan_url, canvas_json, created_at, updated_at)
Stand (id, event_id, name, width_m, depth_m, position_x, position_y, category_id, base_price, status, exhibitor_id)
StandCategory (id, event_id, name, color_hex)
StandArea (id, event_id, type, position_x, position_y, width, height, label)
ExtraService (id, event_id, name, unit_price, unit)
StandExtraService (id, stand_id, extra_service_id, quantity, total_price)
StandLock (id, stand_id, locked_by_session, locked_at, expires_at)
```

**Entregáveis:**
- Editor de mapa completo para o organizador.
- Vista pública ao vivo com seleção de estande pelo expositor.
- Sincronização em tempo real via WebSocket.

---

### Sprint 5 (Semanas 10–11): Portal do Expositor e Contratos

**Tarefas:**
- [ ] Criar fluxo de cadastro do expositor vinculado a um evento.
- [ ] Criar portal do expositor: seleção de estande → resumo → contrato → pagamento.
- [ ] Implementar geração automática de contrato em PDF com dados preenchidos.
- [ ] Integrar D4Sign API para assinatura digital do contrato.
- [ ] Implementar notificações por email (expositor e organizador) após assinatura.
- [ ] Criar upload de documentos do expositor (CNPJ, alvarás) com status por documento.
- [ ] Criar painel do organizador: gestão de documentos por expositor com aprovação/reprovação.

**Schema do Banco (Sprint 5):**
```sql
Exhibitor (id, event_id, company_name, cnpj, contact_name, email, phone, status)
Contract (id, stand_id, exhibitor_id, total_value, status, pdf_url, dsign_document_id, signed_at)
ExhibitorDocument (id, exhibitor_id, document_type, file_url, status, reviewed_at, review_note)
```

**Entregáveis:**
- Expositor consegue selecionar estande, receber contrato e assinar digitalmente.
- Organizador consegue ver e aprovar documentos dos expositores.

---

### Sprint 6 (Semanas 12–14): Pagamentos e Ingressos

**Tarefas:**
- [ ] Integrar Mercado Pago API (PIX, cartão de crédito/débito, boleto).
- [ ] Implementar pagamento de contratos de estande pelo portal do expositor.
- [ ] Implementar webhook do Mercado Pago para confirmação automática de PIX.
- [ ] Criar página pública do evento com formulário de inscrição customizável.
- [ ] Implementar sistema de tipos de ingresso (gratuito, pago, VIP, por lote).
- [ ] Implementar checkout de ingressos com PIX, cartão e boleto.
- [ ] Gerar QR Code único por inscrição após confirmação de pagamento.
- [ ] Enviar ingresso por email automaticamente (SendGrid).
- [ ] Implementar dashboard básico de check-in (leitura de QR Code via câmera web).

**Schema do Banco (Sprint 6):**
```sql
Payment (id, reference_id, reference_type, amount, method, status, gateway_id, paid_at)
TicketType (id, event_id, name, price, quantity, available_quantity, sales_start, sales_end)
Registration (id, event_id, ticket_type_id, participant_name, email, cpf, custom_fields_json, qr_code, checked_in_at)
```

**Entregáveis:**
- Fluxo completo: inscrição → pagamento → QR Code → email.
- Check-in via câmera web funcional.

---

### Sprint 7 (Semanas 15–16): Financeiro Básico e Finalização MVP

**Tarefas:**
- [ ] Criar dashboard financeiro: receita total, despesas, margem do evento.
- [ ] Implementar contas a receber (contratos de estande + ingressos) com status.
- [ ] Implementar contas a pagar com cadastro de despesas e categorias.
- [ ] Implementar gestão de colaboradores (cadastro básico de equipe).
- [ ] Implementar escalas de trabalho por setor com notificação por email.
- [ ] Testes de integração de ponta a ponta (E2E) com Playwright.
- [ ] Testes de carga básicos (simular 100 usuários simultâneos).
- [ ] Revisão de segurança (OWASP Top 10).
- [ ] Documentação da API (OpenAPI/Swagger).

**Entregáveis:**
- MVP completo funcional em produção.
- Primeiros 5 clientes onboarding.

---

## FASE 2 — V1.0 (Meses 5–10): Produto Completo

### Objetivo
Produto maduro com emissão fiscal, módulo de pessoal completo, relatórios avançados e comunicação em massa. Pronto para escala comercial.

---

### Sprint 8 (Meses 5–6): Emissão Fiscal

- [ ] Integrar Focus NF-e API para emissão de NFS-e.
- [ ] Configurar dados fiscais por organização (CNPJ, endereço, regime tributário, código de serviço).
- [ ] Implementar emissão automática de NFS-e após confirmação de pagamento de contrato.
- [ ] Implementar emissão de NF-e para ingressos (configurável por organizador).
- [ ] Envio automático da NF por email ao expositor/participante.
- [ ] Implementar cancelamento e substituição de NF.
- [ ] Criar histórico de documentos fiscais com status (emitida, cancelada, rejeitada).

---

### Sprint 9 (Meses 5–6): Contratos Avançados e Gestão de Documentos

- [ ] Implementar editor de template de contrato (WYSIWYG com variáveis dinâmicas).
- [ ] Implementar fluxo de aprovação de contratos com múltiplas assinaturas.
- [ ] Implementar notificação automática ao expositor para pendências de documentos.
- [ ] Criar relatório de status de documentos por evento (percentual de aprovação).

---

### Sprint 10 (Meses 6–7): Gestão de Pessoal Completa

- [ ] Implementar cadastro completo de colaboradores com dados bancários.
- [ ] Implementar escalas com visualização em calendário e tabela.
- [ ] Implementar confirmação/recusa de escala pelo colaborador via link de email.
- [ ] Implementar controle de ponto via QR Code (gerado para cada colaborador por turno).
- [ ] Implementar relatório de horas trabalhadas por colaborador.
- [ ] Implementar cálculo automático de pagamento de diárias/horas.
- [ ] Implementar geração de recibo de pagamento em PDF.
- [ ] Implementar banco de talentos (histórico de colaboradores para reutilização).

---

### Sprint 11 (Meses 7–8): Financeiro Avançado e Relatórios

- [ ] Implementar DRE simplificado por evento (Receitas – Despesas = Resultado).
- [ ] Implementar visão multi-evento (caixas separadas com relatório consolidado).
- [ ] Implementar cobrança automática por email para pagamentos atrasados.
- [ ] Implementar gráficos financeiros: evolução de receita/despesas por período.
- [ ] Implementar exportação de relatórios em Excel (.xlsx) e PDF.
- [ ] Implementar filtros avançados (por período, categoria, status de pagamento).

---

### Sprint 12 (Meses 8–9): Comunicação e Campanhas

- [ ] Implementar envio de email em massa para expositores e participantes.
- [ ] Criar biblioteca de templates de email (convite, lembrete, agradecimento).
- [ ] Implementar envio de SMS via Twilio (opt-in obrigatório).
- [ ] Implementar cupons de desconto (percentual e valor fixo) para ingressos.
- [ ] Implementar contador de disponibilidade de ingressos na página pública.
- [ ] Implementar página de programação do evento (agenda com palestrantes/atividades).

---

### Sprint 13 (Meses 9–10): Logística, Inventário e Banco de Locais

- [ ] Implementar calculadora de inventário automática por porte do evento.
- [ ] Implementar cadastro e gerenciamento de fornecedores de montagem.
- [ ] Implementar agenda de montagem/desmontagem por fornecedor.
- [ ] Criar catálogo inicial de espaços parceiros (dados inseridos manualmente pela equipe Standora).
- [ ] Implementar filtros e comparador de espaços.
- [ ] Implementar calculadora de espaço necessário (m²) por número de expositores.

---

### Sprint 14 (Mês 10): Pós-Evento, Leads e NPS

- [ ] Implementar Lead Capture: scan de QR Code do participante pelo expositor.
- [ ] Criar painel de leads por expositor com notas e exportação CSV.
- [ ] Implementar envio automático de pesquisa NPS pós-evento (email).
- [ ] Criar dashboard de NPS por evento (promotores, neutros, detratores, score).
- [ ] Implementar relatório de performance completo pós-evento.
- [ ] Implementar comparativo entre eventos (gráficos de evolução).

---

## FASE 3 — V2.0 (Meses 11–18): Escala e Ecossistema

### Objetivo
Plataforma de ecossistema com marketplace, app mobile, white-label e Open API para integração com terceiros.

---

### Sprint 15–16 (Meses 11–12): App Mobile (React Native)

- [ ] Configurar projeto React Native com Expo.
- [ ] Implementar tela de check-in com câmera (leitura de QR Code).
- [ ] Implementar tela de lead capture para expositores (scan + adição de nota).
- [ ] Implementar ponto digital do colaborador (check-in/check-out via QR Code ou GPS).
- [ ] Implementar notificações push (escalas, alertas de evento).
- [ ] Publicar na App Store (iOS) e Google Play (Android).

---

### Sprint 17–18 (Meses 12–13): White-Label Enterprise

- [ ] Implementar configuração de white-label por organização: logotipo, cores, nome do produto.
- [ ] Implementar suporte a domínio customizado (CNAME do cliente apontando para Standora).
- [ ] Implementar supressão da marca "Standora" em páginas públicas e emails (plano Enterprise).
- [ ] Criar painel de configuração white-label no dashboard Enterprise.

---

### Sprint 19–20 (Meses 13–15): Marketplace de Fornecedores

- [ ] Implementar cadastro e perfil de fornecedores (portfólio, preços, disponibilidade, localização).
- [ ] Implementar busca de fornecedores por tipo de serviço, cidade e avaliação.
- [ ] Implementar solicitação de orçamento integrada (organizador → fornecedor).
- [ ] Implementar sistema de avaliação de fornecedores pós-evento.
- [ ] Implementar cobrança de comissão (5–10%) sobre transações intermediadas.
- [ ] Implementar destaque pago para fornecedores (R$ 150/mês).

---

### Sprint 21–22 (Meses 15–16): Open API e Integrações

- [ ] Publicar Open API com documentação completa (OpenAPI 3.0 / Swagger UI).
- [ ] Implementar sistema de API Keys com escopos de permissão.
- [ ] Implementar webhooks configuráveis (novo pagamento, check-in realizado, contrato assinado, etc.).
- [ ] Implementar integração nativa com HubSpot (exportação de leads).
- [ ] Implementar integração nativa com RD Station (exportação de leads).
- [ ] Implementar integração com TOTVS / Sankhya (exportação financeira para ERP).

---

### Sprint 23–24 (Meses 16–18): Conciliação Bancária e BI Avançado

- [ ] Implementar importação de extrato bancário (OFX/CSV) para conciliação manual.
- [ ] Implementar integração Open Banking para conciliação automática.
- [ ] Implementar dashboards de BI customizáveis por organização.
- [ ] Implementar relatórios de tendências e forecasting (projeções financeiras por evento).
- [ ] Implementar suporte a internacionalização (en-US e es-AR além de pt-BR).

---

## Modelo de Dados — Diagrama de Entidades Principais

```
Organization ──1:N── Event ──1:1── EventMap
                              │
                              ├──1:N── Stand ──N:1── StandCategory
                              │          │
                              │          ├──N:M── ExtraService
                              │          └──1:1── Contract ──1:N── Payment
                              │
                              ├──1:N── Exhibitor ──1:N── ExhibitorDocument
                              │
                              ├──1:N── TicketType ──1:N── Registration
                              │
                              ├──1:N── EventMilestone
                              │
                              └──1:N── StaffShift ──N:1── StaffMember

Organization ──1:N── StaffMember
Organization ──1:N── FinancialEntry (A/P)
Organization ──N:1── Plan
```

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Integração com Focus NF-e mais complexa que esperado | Média | Alto | Reservar 1 sprint buffer; usar sandbox extensamente antes de produção |
| Performance do mapa com muitos estandes (>500) | Média | Alto | Virtualização de objetos Konva.js; carregar estandes sob demanda |
| D4Sign rejeitar uso sem CNPJ válido em homologação | Baixa | Médio | Preparar CNPJ de empresa de testes; contato precoce com suporte D4Sign |
| Ciclo de venda B2B mais longo que o planejado | Alta | Médio | Plano Freemium como canal de aquisição autoservido |
| Webhooks do Mercado Pago com falha em PIX noturno | Baixa | Alto | Implementar job de reconciliação que verifica pagamentos a cada 5 min |
| Custo de infraestrutura escala antes da receita | Média | Médio | Iniciar com Railway (custo mínimo), migrar para AWS/GCP somente ao atingir 100 clientes pagos |

---

## Métricas de Sucesso por Fase

### Fase 1 (MVP — Mês 4)
- 5+ organizadores usando a plataforma em produção.
- 1+ evento completo processado (cadastro → mapa → expositor → pagamento).
- NPS da equipe beta > 7.

### Fase 2 (V1.0 — Mês 10)
- 50+ clientes ativos (Starter ou Professional).
- MRR > R$ 15.000.
- Taxa de churn mensal < 5%.
- NPS de clientes > 40.

### Fase 3 (V2.0 — Mês 18)
- 200+ clientes ativos.
- 5+ clientes Enterprise.
- MRR > R$ 60.000.
- App mobile com 1.000+ downloads.
- Marketplace com 20+ fornecedores cadastrados.
