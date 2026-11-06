# InsightHub

InsightHub is a business operations workspace for teams that want a quick, practical view of company performance. It brings revenue trends, customer acquisition, orders, and customer records into one place so teams can spot changes, follow up on customer activity, and make better day-to-day decisions from the same workspace.

## Live demo

Try the deployed application: [insighthub-delta.vercel.app](https://insighthub-delta.vercel.app/)

Demo credentials:

```text
Email: alex@insighthub.dev
Password: demo123
```

## Highlights

- Executive overview with revenue, customer, order, and conversion KPIs
- Interactive revenue chart and customer acquisition breakdown
- Searchable customer management table with status badges, pagination UI, and export/filter actions
- Order management view with status summaries and transaction table
- Analytics view with revenue/order comparison and performance insight card
- Responsive navigation with mobile drawer behavior
- Light/dark mode toggle
- Toast feedback for common actions
- Typed React + TypeScript implementation with a feature-oriented UI structure
- Protected routing with persisted demo authentication
- TanStack Query server-state boundary and Zustand session state
- JSON-backed mock API fixtures with typed, validated service boundaries
- React Hook Form + Zod validated customer creation flow
- Jest/React Testing Library-ready service tests
- ESLint, Prettier, and GitHub Actions CI

## Tech stack

- React 19 + TypeScript
- Vite
- Recharts
- Lucide React
- CSS with responsive breakpoints and design tokens

## Architecture

The application keeps presentation and data concerns easy to separate as the product grows:

```text
UI
 ↓
Feature views (Overview, Customers, Orders, Analytics)
 ↓
Reusable UI primitives (cards, tables, charts, statuses)
 ↓
Query/store integration point
 ↓
API service
```

The current demo uses local typed data so it runs without credentials or a backend. The view boundaries are ready for TanStack Query server state and Zustand client state when connected to a REST API.

## Folder structure

```text
src/
├── app/             # Protected route and application wiring
├── features/        # Dashboard, auth, and customer workflows
├── hooks/           # TanStack Query hooks
├── mocks/data/      # JSON fixtures for auth, workspace, dashboard, customers, and orders
├── services/        # Mock API functions; replace implementations with HTTP calls
├── store/           # Zustand client/session state
├── types/           # Shared domain types
├── App.tsx          # Query provider and route configuration
├── main.tsx         # React entry point
└── styles.css       # Responsive design system and component styles
```

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

Create a production build with:

```bash
npm run build
npm run preview
```

Run all quality checks:

```bash
npm run check
```

## Testing strategy

The application is structured for component-level testing with React Testing Library. Recommended coverage includes:

- Navigation changes the active feature view
- Customer search filters rows without mutating source data
- KPI and table states render correctly for empty/loading/error responses
- Theme and mobile navigation controls remain accessible
- Charts receive the expected data shape

## API integration plan

The local data is stored in JSON fixtures under `src/mocks/data`. UI features do not import these fixtures directly; they call functions in `src/services`, and TanStack Query calls those functions through hooks. The mock services validate fixture data, simulate network latency, and expose API-style parameters for search and filtering. Customer create/update operations are simulated in memory for the current browser session.

When a backend is available, keep the hook and UI interfaces and replace the implementation of the service functions with HTTP requests. For example:

```text
GET  /api/dashboard/summary
GET  /api/customers?search=...&status=...&sortOrder=...
POST /api/customers
GET  /api/customers/:id
PATCH /api/customers/:id
GET  /api/orders?status=...
GET  /api/analytics/revenue
```

Set `VITE_API_BASE_URL` in the environment for the backend URL when wiring the HTTP service implementations. The mock login credentials and JSON data are demo-only and are not suitable for production authentication or storage.

TanStack Query would own cache, loading, and refetch behavior, while Zustand would hold session, theme, and workspace UI state.

## MCP and document search (local starter)

The `backend/` directory contains a Node.js/TypeScript MCP server using PostgreSQL with pgvector. It exposes read-only customer/order tools and a knowledge-base search tool to a connected MCP client. Documents are chunked, embedded, and retrieved as context for the client. The server uses MCP over standard input/output; it does not expose a public HTTP endpoint or provide an in-app chat UI. The frontend is not connected to this MCP server and continues to use mock data.

Prerequisites:

- Node.js 20 or newer
- PostgreSQL with the pgvector extension available
- An embedding provider for document ingestion/search: Ollama running locally (no API usage charges; uses local compute), or an OpenAI-compatible API key

From PowerShell at the repository root, create a local environment file:

```powershell
Copy-Item .env.example .env
```

Set `DATABASE_URL` to your PostgreSQL connection string and set `INSIGHTHUB_WORKSPACE_ID` to the workspace the server should query. Keep `.env` private; it is ignored by Git. Never put server credentials in `VITE_` variables.

### Use local Ollama embeddings (no API key)

Install [Ollama for Windows](https://ollama.com/download/windows), then download the default embedding model:

```powershell
ollama pull nomic-embed-text
```

In `.env`, select the local provider:

```dotenv
EMBEDDING_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

Ollama runs embeddings on your machine, so no `OPENAI_API_KEY` is needed. Alternatively, set `EMBEDDING_PROVIDER=openai` and configure `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `OPENAI_EMBEDDING_MODEL`.

### Migrate, seed, and run

Install dependencies and initialize the database:

```powershell
npm.cmd ci
npm.cmd run db:migrate
npm.cmd run db:seed
```

Start the MCP server with `npm.cmd run mcp`, or configure your MCP host to launch that command from the repository root. The MCP client starts the stdio server process; it does not open a browser page. In VS Code, configure the server in `.vscode/mcp.json` and use Copilot Chat in Agent mode with its tools enabled.

To index Markdown or text files, first ensure the selected embedding provider is running, then run:

```powershell
npm.cmd run rag:ingest -- .\knowledge-docs
```

The repository includes a fictional sample policy in `knowledge-docs/` for testing. Use only documents you are authorized to send to your configured embedding provider; ingestion sends document text to that provider.

The vector column accepts the dimensions returned by the selected embedding model. Keep the same provider and model for ingestion and search; embeddings from different models cannot be compared meaningfully. If switching models, re-ingest the documents. The dimension-flexible column does not use a fixed-dimension HNSW index, so similarity searches scan the stored chunks in the workspace.

The first version is intended for local development with demo data. Before using real business data or deploying it, replace the demo login with backend-verified authentication and enforce the authenticated user's workspace authorization; a workspace ID in environment configuration is not a substitute for multi-user authorization. Treat database credentials and MCP client access as privileged.

## CI

GitHub Actions runs the following checks on pushes and pull requests targeting `main`:

- `npm ci`
- `npm run check` (ESLint, Jest tests, TypeScript checks, and production build)

The workflow validates changes; it does not deploy the application.
