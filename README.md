# InsightHub

InsightHub is a business operations workspace for teams that want a quick, practical view of company performance. It brings revenue trends, customer acquisition, orders, and customer records into one place so teams can spot changes, follow up on customer activity, and make better day-to-day decisions from the same workspace.

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

Use the demo account:

```text
Email: alex@insighthub.dev
Password: demo123
```

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

## CI/CD

The project is ready for a GitHub Actions workflow that runs:

1. `npm ci`
2. TypeScript/Vite production build
3. Jest + React Testing Library
4. ESLint and formatting checks
5. Deployment to the selected static hosting provider
