# Standora — Web

Plataforma de gestão de eventos construída com **Next.js 15**, **Prisma** e **SQLite**.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- npm (incluso com o Node.js)

---

## Setup — Primeira vez (ou novo computador)

Siga os passos abaixo **na ordem**:

### 1. Clone o repositório e entre na pasta

```bash
git clone <url-do-repositorio>
cd Standora/web
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e ajuste os valores se necessário:

```bash
cp .env.example .env
```

> O arquivo `.env.example` já contém os valores padrão para desenvolvimento local.
> Em produção, gere um novo `AUTH_SECRET` com: `openssl rand -base64 32`

### 3. Instale as dependências

```bash
npm install
```

### 4. Gere o Prisma Client

```bash
npx prisma generate
```

### 5. Crie o banco de dados e aplique as migrations

```bash
npx prisma migrate deploy
```

> Isso cria o arquivo `dev.db` localmente com toda a estrutura de tabelas.

### 6. Popule o banco com dados iniciais

```bash
npx prisma db seed
```

> Isso cria a organização demo e o usuário admin para primeiro acesso.

### 7. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## Acesso demo

Após rodar o seed, utilize as credenciais abaixo para entrar na aplicação:

| Campo | Valor |
|---|---|
| **Email** | `admin@standora.com` |
| **Senha** | `standora123` |

---

## Resumo rápido (após o primeiro setup)

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

---

## Comandos Prisma úteis

| Comando | O que faz |
|---|---|
| `npx prisma generate` | Gera o client tipado a partir do `schema.prisma` |
| `npx prisma migrate deploy` | Aplica migrations pendentes no banco |
| `npx prisma migrate dev` | Cria uma nova migration em desenvolvimento |
| `npx prisma studio` | Abre interface visual para explorar o banco |
| `npx prisma db push` | Sincroniza o schema sem criar migration (prototipagem) |

---

## Estrutura do projeto

```
web/
├── prisma/
│   ├── schema.prisma   # Modelos do banco de dados
│   └── dev.db          # Banco SQLite local (não vai ao git)
├── src/
│   ├── app/            # Rotas e páginas (Next.js App Router)
│   ├── components/     # Componentes reutilizáveis
│   └── auth.ts         # Configuração do NextAuth
├── .env                # Variáveis de ambiente (local)
└── .env.example        # Template de variáveis de ambiente
```
