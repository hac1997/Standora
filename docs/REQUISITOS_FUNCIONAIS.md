# Standora — Requisitos Funcionais

> Versão 1.0 | Data: maio de 2026

---

## Convenções

- **RF** = Requisito Funcional
- **RNF** = Requisito Não-Funcional
- **MVP** = Obrigatório no produto mínimo viável (Fase 1)
- **V1** = Entregue na versão 1.0 (Fase 2)
- **V2** = Entregue na versão 2.0 (Fase 3)
- **Prioridade:** Alta / Média / Baixa

---

## Módulo 1 — Autenticação e Gestão de Conta

| ID | Requisito | Fase | Prioridade |
|---|---|---|---|
| RF-001 | O sistema deve permitir cadastro de usuário com nome, email e senha. | MVP | Alta |
| RF-002 | O sistema deve suportar login via email/senha e via Google OAuth. | MVP | Alta |
| RF-003 | O sistema deve suportar recuperação de senha via email. | MVP | Alta |
| RF-004 | O sistema deve suportar múltiplos usuários por conta (organização), com papéis: Admin, Financeiro, Operacional, Visualizador. | MVP | Alta |
| RF-005 | O sistema deve permitir convite de membros da equipe por email com papel pré-definido. | MVP | Alta |
| RF-006 | O sistema deve registrar log de auditoria de ações críticas (criação/exclusão de eventos, alterações financeiras). | V1 | Média |
| RF-007 | O sistema deve suportar autenticação de dois fatores (2FA) via TOTP. | V1 | Média |
| RF-008 | O sistema deve suportar white-label: logo, cores e domínio customizados para plano Enterprise. | V2 | Baixa |

---

## Módulo 2 — Gestão de Eventos

| ID | Requisito | Fase | Prioridade |
|---|---|---|---|
| RF-010 | O organizador deve poder criar um evento informando: nome, tipo, data de início/fim, horário, descrição, imagem de capa e status (rascunho/publicado). | MVP | Alta |
| RF-011 | O sistema deve suportar os tipos de evento: Feira, Exposição, Congresso, Festival, Evento Corporativo, Outro. | MVP | Alta |
| RF-012 | O organizador deve poder definir o público estimado (número de participantes esperados) e o número de expositores planejados. | MVP | Alta |
| RF-013 | O sistema deve exibir um dashboard do evento com indicadores: ocupação de estandes (%), participantes inscritos, receita total, status de contratos. | MVP | Alta |
| RF-014 | O organizador deve poder duplicar um evento existente como template para novos eventos. | V1 | Média |
| RF-015 | O sistema deve suportar múltiplos eventos simultâneos por conta, com limites conforme plano. | MVP | Alta |
| RF-016 | O organizador deve poder arquivar e restaurar eventos encerrados. | V1 | Média |
| RF-017 | O sistema deve gerar uma URL pública única para cada evento (`standora.com.br/eventos/slug`). | MVP | Alta |
| RF-018 | O organizador deve poder configurar a programação do evento (agenda com horários, palestrantes, atividades). | V1 | Média |

---

## Módulo 3 — Banco de Locais e Seleção de Espaço

| ID | Requisito | Fase | Prioridade |
|---|---|---|---|
| RF-020 | O sistema deve manter um catálogo de espaços para eventos com: nome, endereço, capacidade, m², fotos, vídeos, infraestrutura disponível e orçamento estimado de locação. | V1 | Média |
| RF-021 | O organizador deve poder filtrar espaços por capacidade, cidade, tipo de infraestrutura e disponibilidade de datas. | V1 | Média |
| RF-022 | O sistema deve calcular automaticamente o espaço mínimo necessário com base no número de expositores e layout padrão de estande. | V1 | Média |
| RF-023 | O sistema deve oferecer comparador side-by-side entre dois ou mais espaços (custo, m², capacidade, infraestrutura). | V1 | Baixa |
| RF-024 | O sistema deve permitir que gestores de espaços parceiros se cadastrem e cadastrem seus espaços. | V2 | Baixa |

---

## Módulo 4 — Mapa Interativo de Estandes

| ID | Requisito | Fase | Prioridade |
|---|---|---|---|
| RF-030 | O organizador deve poder criar ou importar a planta baixa do espaço (upload de imagem PNG/SVG). | MVP | Alta |
| RF-031 | O sistema deve oferecer um editor visual drag & drop para posicionar blocos de estandes no mapa. | MVP | Alta |
| RF-032 | O organizador deve poder definir o tamanho de cada estande (largura x profundidade em metros). | MVP | Alta |
| RF-033 | O organizador deve poder categorizar estandes (categoria, tipo de patrocínio) e atribuir cores por categoria. | MVP | Alta |
| RF-034 | O organizador deve poder marcar áreas como corredor, palco, banheiro, estacionamento ou zona restrita. | MVP | Alta |
| RF-035 | O sistema deve exibir o mapa ao vivo para expositores via link compartilhável, mostrando estandes disponíveis, reservados e ocupados. | MVP | Alta |
| RF-036 | O sistema deve bloquear automaticamente um estande ao ser selecionado por um expositor, em tempo real. | MVP | Alta |
| RF-037 | O organizador deve poder reservar manualmente um estande para um expositor específico. | MVP | Alta |
| RF-038 | O sistema deve exibir legendas interativas no mapa (cor por categoria, ícone por status). | MVP | Alta |
| RF-039 | O organizador deve poder adicionar serviços extras a um estande (tomadas, iluminação, mobiliário, Wi-Fi, banner) com valores unitários pré-configurados. | MVP | Alta |
| RF-040 | O sistema deve calcular o valor total do estande (tamanho + serviços extras) e exibi-lo em tempo real. | MVP | Alta |
| RF-041 | O mapa deve ser exportável como imagem (PNG) ou PDF para uso em materiais impressos. | V1 | Média |
| RF-042 | O organizador deve poder definir a nomenclatura dos estandes (A1, A2, B1, Lote Especial, etc.). | MVP | Alta |

---

## Módulo 5 — Portal do Expositor

| ID | Requisito | Fase | Prioridade |
|---|---|---|---|
| RF-050 | O expositor deve poder se cadastrar no sistema para participar de um evento específico. | MVP | Alta |
| RF-051 | O expositor deve poder visualizar o mapa interativo, selecionar um estande disponível e iniciar a contratação. | MVP | Alta |
| RF-052 | O expositor deve poder solicitar serviços extras para o seu estande durante ou após a seleção. | MVP | Alta |
| RF-053 | O expositor deve receber um resumo do contrato com todos os itens e valores antes de assinar. | MVP | Alta |
| RF-054 | O expositor deve poder assinar o contrato digitalmente pelo portal. | MVP | Alta |
| RF-055 | O expositor deve poder realizar o pagamento do contrato pelo portal (PIX, cartão, boleto). | MVP | Alta |
| RF-056 | O expositor deve poder fazer upload dos documentos exigidos (CNPJ, alvarás, etc.) pelo portal. | MVP | Alta |
| RF-057 | O expositor deve ter acesso a um painel com o status dos seus documentos, pagamentos e contrato. | MVP | Alta |
| RF-058 | O expositor deve poder acessar os leads capturados no seu estande após o evento. | V1 | Média |
| RF-059 | O expositor deve poder exportar os seus leads em CSV ou integrá-los com CRM externo (HubSpot, RD Station). | V1 | Média |

---

## Módulo 6 — Página Pública do Evento e Ingressos

| ID | Requisito | Fase | Prioridade |
|---|---|---|---|
| RF-060 | O sistema deve gerar automaticamente uma página pública do evento com: nome, data, local, descrição, programação, galeria de fotos e lista de expositores. | MVP | Alta |
| RF-061 | O organizador deve poder personalizar o layout da página pública (cores, banner, seções). | V1 | Média |
| RF-062 | A página pública deve ter um formulário de inscrição com campos customizáveis (nome, empresa, CPF, cargo, área de interesse). | MVP | Alta |
| RF-063 | O sistema deve suportar múltiplos tipos de ingresso por evento: gratuito, pago, VIP, por lote com preço e quantidade limitados. | MVP | Alta |
| RF-064 | O sistema deve processar pagamentos de ingressos via PIX (confirmação automática por webhook), cartão de crédito/débito e boleto. | MVP | Alta |
| RF-065 | O sistema deve suportar parcelamento no cartão configurável pelo organizador (máx. parcelas, juros). | MVP | Alta |
| RF-066 | O sistema deve gerar um QR Code único por inscrição após confirmação de pagamento. | MVP | Alta |
| RF-067 | O sistema deve enviar o ingresso/QR Code ao participante por email automaticamente. | MVP | Alta |
| RF-068 | O organizador deve poder configurar cupons de desconto com percentual ou valor fixo. | V1 | Média |
| RF-069 | O sistema deve exibir contador regressivo de disponibilidade de ingressos por tipo (ex.: "Restam 12 ingressos VIP"). | V1 | Média |

---

## Módulo 7 — Check-in e Credenciamento

| ID | Requisito | Fase | Prioridade |
|---|---|---|---|
| RF-070 | O organizador deve poder realizar check-in de participantes lendo o QR Code pelo app mobile ou câmera web. | MVP | Alta |
| RF-071 | O sistema deve exibir o status do participante (aguardando, confirmado, presente) em tempo real no dashboard. | MVP | Alta |
| RF-072 | O sistema deve suportar impressão de crachá com nome, empresa e categoria do participante. | V1 | Média |
| RF-073 | O sistema deve bloquear tentativas de check-in duplicado (segundo scan do mesmo QR Code). | MVP | Alta |
| RF-074 | O sistema deve registrar hora e operador de cada check-in para fins de auditoria. | V1 | Média |

---

## Módulo 8 — Contratos e Documentação Legal

| ID | Requisito | Fase | Prioridade |
|---|---|---|---|
| RF-080 | O sistema deve gerar automaticamente um contrato de locação de estande preenchido com dados do expositor, estande, serviços e valores. | MVP | Alta |
| RF-081 | O organizador deve poder customizar o template de contrato (texto, cláusulas, logotipo). | V1 | Média |
| RF-082 | O sistema deve suportar assinatura digital integrada com D4Sign com validade jurídica (ICP-Brasil). | MVP | Alta |
| RF-083 | O sistema deve notificar ambas as partes (organizador e expositor) após assinatura do contrato. | MVP | Alta |
| RF-084 | O sistema deve armazenar e disponibilizar para download todos os contratos assinados. | MVP | Alta |
| RF-085 | O organizador deve poder definir status de documentos por expositor: Pendente, Em Análise, Aprovado, Reprovado. | MVP | Alta |
| RF-086 | O sistema deve notificar o expositor sobre documentos reprovados com a justificativa. | V1 | Média |

---

## Módulo 9 — Emissão Fiscal (NF-e / NFS-e)

| ID | Requisito | Fase | Prioridade |
|---|---|---|---|
| RF-090 | O sistema deve emitir NFS-e (Nota Fiscal de Serviços Eletrônica) para cada contrato de estande pago. | V1 | Alta |
| RF-091 | O sistema deve emitir NF-e para ingressos pagos, quando configurado pelo organizador. | V1 | Média |
| RF-092 | A emissão fiscal deve ocorrer automaticamente após confirmação de pagamento, sem intervenção manual. | V1 | Alta |
| RF-093 | O sistema deve enviar a nota fiscal ao expositor/participante por email automaticamente. | V1 | Alta |
| RF-094 | O organizador deve poder cancelar e substituir uma nota fiscal emitida. | V1 | Média |
| RF-095 | O sistema deve armazenar e exibir o histórico de documentos fiscais emitidos com status (emitida, cancelada). | V1 | Alta |
| RF-096 | O sistema deve suportar configuração dos dados fiscais do organizador (CNPJ, endereço, regime tributário, código de serviço municipal). | V1 | Alta |

---

## Módulo 10 — Gestão Financeira

| ID | Requisito | Fase | Prioridade |
|---|---|---|---|
| RF-100 | O sistema deve exibir um dashboard financeiro em tempo real: receita total, despesas, margem, status de pagamentos. | MVP | Alta |
| RF-101 | O sistema deve registrar e controlar contas a receber (contratos de estande e ingressos) com status: pendente, pago, atrasado, cancelado. | MVP | Alta |
| RF-102 | O sistema deve enviar cobrança automática por email para contratos com pagamentos atrasados. | V1 | Alta |
| RF-103 | O sistema deve registrar contas a pagar (aluguel do espaço, fornecedores, pessoal, marketing) com vencimento e status. | MVP | Alta |
| RF-104 | O sistema deve emitir alertas de vencimento de contas a pagar com X dias de antecedência (configurável). | V1 | Média |
| RF-105 | O sistema deve gerar um DRE simplificado por evento (receitas, despesas, resultado). | V1 | Alta |
| RF-106 | O sistema deve suportar múltiplos eventos com caixas separadas e uma visão consolidada de todos os eventos. | V1 | Alta |
| RF-107 | O sistema deve exportar relatórios financeiros em Excel e PDF. | V1 | Alta |
| RF-108 | O sistema deve oferecer gráficos de evolução financeira (receita, despesas) por período. | V1 | Média |
| RF-109 | O sistema deve suportar conciliação bancária via Open Banking (importação de extrato). | V2 | Baixa |
| RF-110 | O organizador deve poder registrar categorias de despesas customizadas. | MVP | Média |
| RF-111 | O sistema deve registrar o histórico de todas as transações financeiras com data, valor e descrição. | MVP | Alta |

---

## Módulo 11 — Logística e Inventário

| ID | Requisito | Fase | Prioridade |
|---|---|---|---|
| RF-120 | O sistema deve gerar uma lista de materiais sugeridos (cadeiras, mesas, tomadas, geradores) com base no número de estandes e participantes. | V1 | Média |
| RF-121 | O organizador deve poder editar, adicionar e remover itens da lista de materiais. | V1 | Média |
| RF-122 | O sistema deve permitir exportação da lista de materiais como PDF ou Excel. | V1 | Média |
| RF-123 | O sistema deve suportar cadastro de fornecedores de montagem com dados de contato e portfólio. | V1 | Média |
| RF-124 | O organizador deve poder criar uma agenda de montagem/desmontagem com horários por fornecedor. | V1 | Média |
| RF-125 | O sistema deve enviar confirmação de agenda para os fornecedores por email. | V1 | Baixa |

---

## Módulo 12 — Gestão de Pessoal

| ID | Requisito | Fase | Prioridade |
|---|---|---|---|
| RF-130 | O organizador deve poder cadastrar colaboradores: nome, função, tipo (próprio/temporário/terceiro), contato e dados bancários. | MVP | Alta |
| RF-131 | O sistema deve permitir criar escalas de trabalho por setor (credenciamento, segurança, limpeza, recepção) e turno (data/hora início–fim). | MVP | Alta |
| RF-132 | O sistema deve notificar cada colaborador com sua escala via email e opcionalmente via SMS. | V1 | Alta |
| RF-133 | O colaborador deve poder confirmar ou declinar a escala pelo link recebido no email. | V1 | Média |
| RF-134 | O sistema deve registrar ponto (check-in/check-out) via QR Code gerado para cada colaborador. | V1 | Alta |
| RF-135 | O sistema deve calcular automaticamente as horas trabalhadas por colaborador com base no ponto. | V1 | Alta |
| RF-136 | O sistema deve calcular o pagamento de diárias/horas com base na escala e no ponto registrado. | V1 | Alta |
| RF-137 | O sistema deve gerar recibo de pagamento para cada colaborador. | V1 | Alta |
| RF-138 | O organizador deve poder registrar colaboradores como avaliados após o evento, com nota e observações. | V2 | Baixa |
| RF-139 | O sistema deve manter um banco de talentos com histórico de colaboradores por evento. | V2 | Baixa |

---

## Módulo 13 — Relatórios e Análise Pós-Evento

| ID | Requisito | Fase | Prioridade |
|---|---|---|---|
| RF-140 | O sistema deve gerar um relatório de performance pós-evento: participantes (previstos vs. realizados), estandes (ocupados/vagos), receita, despesas e resultado. | V1 | Alta |
| RF-141 | O sistema deve enviar automaticamente uma pesquisa de NPS para participantes após o encerramento do evento. | V1 | Média |
| RF-142 | O sistema deve compilar e exibir o NPS médio do evento com distribuição (promotores, neutros, detratores). | V1 | Média |
| RF-143 | O sistema deve permitir comparativo de performance entre eventos do mesmo organizador. | V2 | Baixa |

---

## Módulo 14 — Lead Capture e CRM de Expositores

| ID | Requisito | Fase | Prioridade |
|---|---|---|---|
| RF-150 | O expositor deve poder escanear o QR Code do crachá de um participante para capturar seus dados de contato. | V1 | Alta |
| RF-151 | O sistema deve armazenar os leads capturados vinculados ao evento e ao expositor. | V1 | Alta |
| RF-152 | O expositor deve poder adicionar notas a um lead capturado (interesse, produto discutido, etc.). | V1 | Média |
| RF-153 | O expositor deve poder exportar seus leads em CSV. | V1 | Alta |
| RF-154 | O sistema deve suportar integração com HubSpot e RD Station via webhook. | V2 | Baixa |

---

## Módulo 15 — Cronograma e Comunicação

| ID | Requisito | Fase | Prioridade |
|---|---|---|---|
| RF-160 | O organizador deve poder criar um cronograma mestre do evento com marcos e prazos. | MVP | Alta |
| RF-161 | O sistema deve exibir alertas e notificações in-app para prazos próximos do vencimento. | MVP | Alta |
| RF-162 | O organizador deve poder enviar comunicados por email em massa para todos os expositores ou participantes inscritos. | V1 | Alta |
| RF-163 | O sistema deve suportar templates de email customizáveis para comunicações do evento. | V1 | Média |

---

## Módulo 16 — Marketplace de Fornecedores (Fase V2)

| ID | Requisito | Fase | Prioridade |
|---|---|---|---|
| RF-170 | O sistema deve permitir que fornecedores (montadoras, gráficas, buffets) se cadastrem e criem um perfil com portfólio, preços e disponibilidade. | V2 | Baixa |
| RF-171 | O organizador deve poder buscar fornecedores no marketplace por tipo de serviço, cidade e avaliação. | V2 | Baixa |
| RF-172 | O organizador deve poder solicitar orçamento diretamente a um fornecedor pelo marketplace. | V2 | Baixa |
| RF-173 | O sistema deve cobrar comissão de 5–10% sobre transações intermediadas pelo marketplace. | V2 | Baixa |

---

## Requisitos Não-Funcionais

| ID | Requisito | Categoria |
|---|---|---|
| RNF-001 | O sistema deve suportar 99,5% de uptime mensal (SLA). | Disponibilidade |
| RNF-002 | Tempo de resposta das páginas principais deve ser < 2 segundos (P95). | Performance |
| RNF-003 | O sistema deve ser responsivo para desktop, tablet e mobile. | Usabilidade |
| RNF-004 | Todos os dados em trânsito devem usar TLS 1.3. Senhas armazenadas com bcrypt (salt rounds ≥ 12). | Segurança |
| RNF-005 | O sistema deve estar em conformidade com a LGPD (Lei Geral de Proteção de Dados). | Conformidade |
| RNF-006 | O sistema deve suportar escalabilidade horizontal para suportar picos de tráfego durante abertura de ingressos. | Escalabilidade |
| RNF-007 | O sistema deve realizar backups automáticos diários do banco de dados com retenção de 30 dias. | Confiabilidade |
| RNF-008 | A API deve seguir padrão REST com documentação OpenAPI 3.0. | Manutenibilidade |
| RNF-009 | O sistema deve suportar internacionalização (pt-BR inicial, en-US e es na V2). | Internacionalização |
| RNF-010 | Logs de erros e eventos de sistema devem ser centralizados e monitorados. | Observabilidade |
