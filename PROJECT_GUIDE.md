# InsightHub Project Guide

This guide explains the current repository structure, application behavior, and the technologies used. It distinguishes the working frontend demo from the backend starter so it is clear which parts are connected today.

## 1. What InsightHub is

InsightHub is a business-operations dashboard for reviewing customer records, orders, revenue trends, and analytics. The repository has two main parts:

- **Frontend:** a React web application that currently uses local JSON fixtures and in-memory mock services.
- **Backend:** a Node.js/TypeScript MCP server with PostgreSQL storage and a document-search (RAG) foundation.

**The backend is not currently connected to the frontend.** The React app does not call a backend HTTP API, and there is no in-app AI chat interface. The MCP server is a separate process intended to be launched by an MCP-compatible client.

## 2. Architecture at a glance

### Current frontend data flow

```text
Browser
  └─ React pages and components
      └─ TanStack Query hooks
          └─ Frontend service functions
              └─ JSON fixtures / in-memory mock data
```

### Current backend data flow

```text
MCP-compatible client
  └─ launches the Node.js MCP server over stdio
      ├─ customer/order tools ── PostgreSQL
      └─ knowledge-base tool
          └─ embedding API + PostgreSQL/pgvector
```

The intended future web integration would add an authenticated HTTP API and an assistant UI. That integration is not implemented yet.

## 3. Repository layout

```text
.
├── backend/
│   ├── sql/
│   │   └── schema.sql             PostgreSQL tables, constraints, and indexes
│   └── src/
│       ├── db.ts                  PostgreSQL connection and workspace configuration
│       ├── embedding.ts           OpenAI-compatible embeddings API client
│       ├── ingest.ts              Markdown/text document indexing command
│       ├── mcp.ts                 stdio MCP server and tool definitions
│       ├── migrate.ts             Applies the database schema
│       ├── seed.ts                Copies demo customers/orders into PostgreSQL
│       └── rag/
│           ├── chunk.ts           Splits documents into overlapping text chunks
│           ├── chunk.test.ts      Chunking unit tests
│           └── retrieve.ts        Vector similarity search
├── src/
│   ├── app/                       Route protection
│   ├── features/
│   │   ├── auth/                  Demo login screen
│   │   ├── customers/             Customer form
│   │   └── dashboard/             Overview, customers, orders, analytics UI
│   ├── hooks/                     TanStack Query hooks
│   ├── mocks/data/                Local JSON fixtures
│   ├── services/                  Mock API functions and service tests
│   ├── store/                     Zustand authentication/session state
│   ├── types/                     Shared frontend TypeScript domain types
│   ├── App.tsx                    Routes and query provider
│   ├── main.tsx                   Browser application entry point
│   └── styles.css                 Application styles and responsive design
├── .env.example                   Environment variable template
├── package.json                   Dependencies and project commands
├── tsconfig.backend.json          Backend TypeScript build settings
└── README.md                      Project overview and quick-start instructions
```

## 4. Frontend

### User-facing features

- Overview dashboard with KPI cards, revenue charts, and acquisition breakdown.
- Customer and order views with search/filter controls and CSV export.
- Analytics view with revenue/order comparisons and a summary insight card.
- Customer creation form with client-side validation.
- Protected application routes, demo login, responsive navigation, theme toggle, and toast messages.

### Frontend technologies

| Technology | What it does in this project |
|---|---|
| **React 19** | Builds the application from reusable components and pages. |
| **TypeScript** | Adds static types to UI, service contracts, and domain objects. |
| **Vite** | Runs the local frontend development server and produces the optimized `dist/` site build. |
| **React Router** | Handles browser navigation and protected routes. |
| **TanStack Query** | Manages asynchronous query state, caching, loading, errors, and invalidation. Current queries call mock service functions. |
| **Zustand** | Holds small client-side session state. The demo session is stored in browser local storage. |
| **React Hook Form** | Manages customer-form values and submission. |
| **Zod** | Validates form input and the shapes of fixture data. |
| **Recharts** | Renders charts in the dashboard and analytics views. |
| **Lucide React** | Supplies interface icons. |
| **CSS** | Provides component styling, design tokens, dark mode, and responsive layouts. |

### Frontend data and authentication limitations

The service functions under `src/services/` read local fixtures or update in-memory arrays; they do not make HTTP requests. The login service checks demo credentials from a JSON fixture, and the session is persisted in local storage. This is suitable only for a demo—not production authentication, authorization, or durable data storage.

The `.env.example` value `VITE_API_BASE_URL` is a placeholder for future frontend API calls. Any environment variable with the `VITE_` prefix is bundled for browser use and must not contain secrets.

## 5. Backend, MCP, and RAG

### Backend technologies

| Technology | What it does in this project |
|---|---|
| **Node.js** | Runs backend command-line processes and the MCP server. |
| **TypeScript** | Provides strict type checking for backend code. `tsx` runs TypeScript directly for local commands. |
| **MCP SDK** | Implements the Model Context Protocol server and exposes callable tools. |
| **stdio transport** | Exchanges MCP messages over the server process's standard input/output. It is not an HTTP endpoint. |
| **PostgreSQL** | Stores structured demo customers/orders and indexed knowledge chunks. |
| **pgvector** | Adds vector data types and cosine-distance search to PostgreSQL. |
| **OpenAI-compatible embeddings API** | Converts document chunks and user queries into numeric vectors for semantic retrieval. The default is `text-embedding-3-small`. |
| **dotenv** | Loads local `.env` settings into the backend process. |
| **Zod** | Validates MCP tool inputs and the embedding response shape. |

### Implemented MCP tools

`backend/src/mcp.ts` registers three read-only tools:

1. **`search_customers`** — searches customer name, email, or company; can filter by status and limit the result count.
2. **`list_orders`** — lists recent orders; can filter by status and limit the result count.
3. **`search_knowledge_base`** — embeds a query, retrieves matching chunks from pgvector, and returns the passages and source metadata.

The server is scoped to the workspace ID in `INSIGHTHUB_WORKSPACE_ID`. This is a local single-workspace boundary, not full user authentication or multi-tenant authorization. Do not expose the current server or database to untrusted users without adding identity verification and per-user authorization.

### RAG flow

RAG means **retrieval-augmented generation**. In this repository, document ingestion and retrieval are implemented, while answer generation is supplied by the MCP-compatible AI client:

1. `npm run rag:ingest -- <directory>` discovers `.md` and `.txt` files.
2. `backend/src/rag/chunk.ts` splits each file into overlapping text chunks.
3. `backend/src/embedding.ts` requests one embedding vector per chunk.
4. The chunks, source names, metadata, and vectors are stored in `knowledge_chunks`.
5. `search_knowledge_base` embeds a question and retrieves nearby vectors from the configured workspace.
6. The MCP client can use those passages as context to generate an answer and cite the source.

**RAG does not itself generate an answer.** Also, current customer/order facts should come from structured database tools, not semantic document search.

The PostgreSQL schema fixes vector size at 1536 to match the default embedding model. If a different embedding model returns another vector size, the schema and dimension check must be changed to match it.

## 6. Local setup

### Frontend only

Requirements: Node.js 20 or newer and npm.

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. No database or model credentials are needed for the frontend demo.

### Backend, MCP, and document search

Additional requirements:

- PostgreSQL with the `vector` (pgvector) extension available.
- A database and credentials supplied through `DATABASE_URL`.
- `INSIGHTHUB_WORKSPACE_ID` set to the workspace to seed/query.
- `OPENAI_API_KEY` and an embeddings endpoint/model to ingest documents and run knowledge search.

Copy `.env.example` to `.env` and fill in local values. Keep secrets in server-only variables; never put them in `VITE_` variables or commit `.env`.

```powershell
npm run db:migrate
npm run db:seed
npm run mcp
```

Ingest documents:

```powershell
npm run rag:ingest -- .\path\to\documents
```

Configure an MCP host/client to launch the project’s `npm run mcp` command with this repository as its working directory and the required environment variables. The MCP server waits for an MCP client over stdio; running it is not the same as starting a web API.

## 7. Project commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite frontend development server. |
| `npm run dev:backend` | Restart the stdio MCP process on backend source changes. This is for development; an MCP client still needs to connect to its stdio. |
| `npm run mcp` | Start the MCP server process. |
| `npm run db:migrate` | Create the PostgreSQL schema and indexes. |
| `npm run db:seed` | Insert/update demo customers and orders in PostgreSQL. |
| `npm run rag:ingest -- <directory>` | Embed and index Markdown/text documents. |
| `npm run test` | Run Jest tests. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Type-check/build the backend and build the frontend. |
| `npm run check` | Run lint, tests, and build. |
| `npm run preview` | Serve the built frontend locally for a production-build preview. |

## 8. Build output and ignored folders

- **`node_modules/`** contains npm-installed dependencies.
- **`dist/`** contains the compiled frontend site created by Vite.
- **`dist-backend/`** contains compiled backend JavaScript created by the backend TypeScript configuration.

These are generated/local files and are ignored by Git. Current backend commands run TypeScript source through `tsx`, so the MCP process does not require `dist-backend/` during local development.

## 9. Testing and quality checks

The project uses Jest and Testing Library for frontend service tests and backend chunking tests. ESLint checks source/configuration, and TypeScript checks both frontend and backend during the build. Run the combined validation with:

```powershell
npm run check
```

Backend integration still needs a configured PostgreSQL instance and embedding endpoint to verify migrations, database queries, and document retrieval end to end.

## 10. What is not implemented yet

- The React frontend does not call this backend.
- There is no HTTP REST API or deployed HTTP MCP transport.
- There is no in-app assistant/chat or answer-generation endpoint.
- Demo login is not production authentication.
- The configured workspace ID is not a substitute for per-user authorization.
- No real customer/order sync or production data migration is configured.

These are the next integration tasks if InsightHub should provide AI/RAG features to users through the web application.
