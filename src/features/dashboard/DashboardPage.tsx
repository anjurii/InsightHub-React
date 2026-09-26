import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowDownRight, ArrowUpRight, BarChart3, Bell, Boxes, CalendarDays, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, CreditCard, Download, FileText, LayoutDashboard,
  Menu, Moon, MoreHorizontal, Package, PanelLeftClose, PanelLeftOpen, Plus, Search,
  Settings, SlidersHorizontal, Sparkles, Sun, TrendingUp, Users, X,
} from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { useAuthStore } from '../../store/authStore'
import { useCustomers } from '../../hooks/useCustomers'
import { useDashboard, useWorkspace } from '../../hooks/useDashboard'
import { useOrders } from '../../hooks/useOrders'
import type { Customer, CustomerStatus, DashboardMetric, OrderStatus } from '../../types'

type View = 'Overview' | 'Customers' | 'Orders' | 'Analytics'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard }, { label: 'Customers', icon: Users },
  { label: 'Orders', icon: Package }, { label: 'Analytics', icon: BarChart3 },
]

function DashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const { data: dashboardData } = useDashboard()
  const { data: workspace } = useWorkspace()
  const { data: customerData } = useCustomers('', 'All', 'asc')
  const pathView = location.pathname.split('/')[1]
  const view: View = pathView === 'customers' ? 'Customers' : pathView === 'orders' ? 'Orders' : pathView === 'analytics' ? 'Analytics' : 'Overview'
  const [dark, setDark] = useState(() => window.localStorage.getItem('insighthub-theme') === 'dark')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toast, setToast] = useState('')

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  useEffect(() => {
    window.localStorage.setItem('insighthub-theme', dark ? 'dark' : 'light')
  }, [dark])

  const downloadCsv = (filename: string, rows: string[][]) => {
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
    notify(`${filename} downloaded`)
  }

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Sparkles size={18} /></div><span>insight<span>hub</span></span></div>
        <div className="workspace-switch"><div className="workspace-avatar">{getInitials(workspace?.name ?? 'Workspace')[0]}</div><div className="workspace-copy"><strong>{workspace?.name ?? 'Loading workspace...'}</strong><small>{workspace?.plan ?? ''}</small></div><ChevronDown size={15} /></div>
        <p className="nav-label">Workspace</p>
        <nav>{navItems.map(({ label, icon: Icon }) => <button className={view === label ? 'nav-item active' : 'nav-item'} key={label} onClick={() => { navigate(label === 'Overview' ? '/' : `/${label.toLowerCase()}`); setMobileOpen(false) }}><Icon size={18} /><span>{label}</span>{label === 'Customers' && <em>{customerData?.length ?? 0}</em>}</button>)}</nav>
        <p className="nav-label">Manage</p>
        <nav><button className="nav-item" onClick={() => dashboardData ? downloadCsv('insighthub-report.csv', [['Metric', 'Value'], ...dashboardData.metrics.map(metric => [metric.title, metric.value])]) : notify('Dashboard report is still loading')}><FileText size={18} /><span>Reports</span></button><button className="nav-item" onClick={() => notify('Settings are available from the theme control above')}><Settings size={18} /><span>Settings</span></button></nav>
        <div className="sidebar-bottom"><button className="help-card" onClick={() => notify('Help center: try the search and filters to explore your data')}><CircleHelp size={18} /><div><strong>Need a hand?</strong><small>Check our help center</small></div><ChevronRight size={14} /></button><button className="profile" onClick={logout}><div className="profile-avatar">{getInitials(user?.name ?? 'User')}</div><div className="profile-copy"><strong>{user?.name ?? 'User'}</strong><small>{user?.role ?? ''} · Sign out</small></div><MoreHorizontal size={17} /></button></div>
      </aside>
      {mobileOpen && <button className="mobile-overlay" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
      <main className="main">
        <header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><button className="icon-btn desktop-collapse" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}</button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{view}</strong></div><div className="top-actions"><button className="icon-btn hide-mobile" onClick={() => setDark(!dark)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button><button className="icon-btn notification" onClick={() => notify('You are all caught up')}><Bell size={18} /><i /></button><div className="top-avatar">{getInitials(user?.name ?? 'User')}</div></div></header>
        <section className="content">
          {view === 'Overview' && <Overview notify={notify} downloadCsv={downloadCsv} />}
          {view === 'Customers' && <Customers notify={notify} downloadCsv={downloadCsv} />}
          {view === 'Orders' && <Orders notify={notify} downloadCsv={downloadCsv} />}
          {view === 'Analytics' && <Analytics />}
        </section>
      </main>
      {toast && <div className="toast"><span className="toast-check">✓</span>{toast}<button onClick={() => setToast('')}><X size={14} /></button></div>}
    </div>
  )
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow ?? 'Your workspace'} <span>✦</span></p><h1>{title}</h1><p className="subheading">{description}</p></div>{action}</div>
}

function Overview({ notify, downloadCsv }: { notify: (message: string) => void; downloadCsv: (filename: string, rows: string[][]) => void }) {
  const [range, setRange] = useState('Last 12 months')
  const { data, isLoading, isError, refetch } = useDashboard()
  const chartData = data?.revenue.slice(range === 'Last 6 months' ? -6 : 0) ?? []
  if (isLoading) return <DashboardLoading />
  if (isError || !data) return <DataError onRetry={() => { void refetch() }} />
  const metricIcons = {
    revenue: <CreditCard size={19} />,
    customers: <Users size={19} />,
    orders: <Boxes size={19} />,
    conversion: <TrendingUp size={19} />,
  }
  const rows: DashboardMetric[] = data.metrics
  return <>
    <PageHeading title="Overview" description="A clear view of how your business is performing." action={<div className="heading-actions"><label className="button secondary"><CalendarDays size={16} /><select className="inline-select" value={range} onChange={event => setRange(event.target.value)}><option>Last 12 months</option><option>Last 6 months</option><option>This year</option></select><ChevronDown size={14} /></label><button className="button primary" onClick={() => downloadCsv('insighthub-overview.csv', [['Metric', 'Value'], ...data.metrics.map(metric => [metric.title, metric.value])])}><Download size={16} /> Export report</button></div>} />
    <div className="stat-grid">{rows.map(metric => <Stat key={metric.title} title={metric.title} value={metric.value} change={metric.change} trend={metric.trend} icon={metricIcons[metric.icon]} color={metric.color} />)}</div>
    <div className="dashboard-grid">
      <section className="card revenue-card"><div className="card-header"><div><h2>Revenue overview</h2><p>Track your revenue performance over time.</p></div><div className="legend"><span><i className="dot purple" />Revenue</span><span><i className="dot pale" />Orders</span></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height={280}><AreaChart data={chartData}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c5cff" stopOpacity={0.24} /><stop offset="100%" stopColor="#7c5cff" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#edf0f6" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 12 }} tickFormatter={value => `$${value / 1000}k`} /><Tooltip formatter={value => [`$${Number(value).toLocaleString()}`, 'Revenue']} contentStyle={{ border: '1px solid #edf0f6', borderRadius: 10, boxShadow: '0 8px 30px #212b3d12' }} /><Area type="monotone" dataKey="revenue" stroke="#7759e8" strokeWidth={3} fill="url(#revenueFill)" /></AreaChart></ResponsiveContainer></div></section>
      <section className="card acquisition-card"><div className="card-header"><div><h2>Customer acquisition</h2><p>Where your customers come from.</p></div><button className="more-btn" onClick={() => notify('Acquisition metrics are shown for the selected reporting period')} aria-label="About customer acquisition"><MoreHorizontal size={18} /></button></div><div className="donut-wrap"><ResponsiveContainer width="100%" height={190}><PieChart><Pie data={data.acquisition} innerRadius={58} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">{data.acquisition.map(source => <Cell key={source.name} fill={source.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{data.customerCount}</strong><small>customers</small></div></div><div className="source-list">{data.sources.map(source => <Source key={source.label} {...source} />)}</div></section>
    </div>
    <section className="card activity-card"><div className="card-header"><div><h2>Recent activity</h2><p>Your latest customer and order updates.</p></div><button className="text-button" onClick={() => notify('Recent activity is ready to connect to the activity API')}>View all <ChevronRight size={15} /></button></div><div className="activity-list">{data.activities.map(activity => <Activity key={`${activity.title}-${activity.time}`} {...activity} />)}</div></section>
  </>
}

function Stat({ title, value, change, trend, icon, color }: { title: string; value: string; change: string; trend: 'up' | 'down'; icon: React.ReactNode; color: string }) {
  return <div className="stat-card"><div className={`stat-icon ${color}`}>{icon}</div><p>{title}</p><div className="stat-value">{value}</div><div className={`stat-change ${trend}`} >{trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{change}<span>vs. last month</span></div></div>
}
function Source({ label, value, color }: { label: string; value: string; color: string }) { return <div className="source-row"><i className={`dot ${color}`} />{label}<strong>{value}</strong></div> }
function Activity({ initials, color, title, detail, time }: { initials: string; color: string; title: string; detail: string; time: string }) { return <div className="activity-row"><div className={`avatar ${color}`}>{initials}</div><div><strong>{title}</strong><small>{detail}</small></div><time>{time}</time></div> }

function DashboardLoading() {
  return <div className="table-state" aria-label="Loading dashboard"><div className="skeleton-line" /><div className="skeleton-line" /><div className="skeleton-line" /></div>
}

function DataError({ onRetry }: { onRetry: () => void }) {
  return <div className="table-state"><strong>We couldn't load this data</strong><span>Please check your connection and try again.</span><button className="button secondary" onClick={onRetry}>Try again</button></div>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

function getInitials(name: string) {
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()
}

function customerColor(id: string) {
  const colors = ['lavender', 'blue', 'peach', 'mint', 'rose']
  const parts = id.split('-')
  const index = Number(parts[parts.length - 1]) || 0
  return colors[index % colors.length]
}

function Customers({ notify, downloadCsv }: { notify: (message: string) => void; downloadCsv: (filename: string, rows: string[][]) => void }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'All'>('All')
  const [sortAsc, setSortAsc] = useState(true)
  const [selected, setSelected] = useState<Customer | null>(null)
  const { data: visible = [], isLoading, isError, refetch } = useCustomers(search, statusFilter, sortAsc ? 'asc' : 'desc')
  return <><PageHeading title="Customers" description="Manage relationships and understand your audience." action={<button className="button primary" onClick={() => navigate('/customers/new')}><Plus size={17} /> Add customer</button>} /><section className="card table-card"><div className="table-toolbar"><div className="search"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." /></div><div className="toolbar-actions"><label className="button secondary"><SlidersHorizontal size={16} /><select className="inline-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as CustomerStatus | 'All')}><option>All</option><option>Active</option><option>Pending</option><option>Inactive</option></select><ChevronDown size={14} /></label><button className="button secondary" onClick={() => downloadCsv('insighthub-customers.csv', [['Name', 'Email', 'Company', 'Status', 'Total spend', 'Joined'], ...visible.map(customer => [customer.name, customer.email, customer.company, customer.status, formatCurrency(customer.totalSpend), formatDate(customer.createdAt)])])}><Download size={16} /> Export</button></div></div>{isLoading ? <div className="table-state"><div className="skeleton-line" /><div className="skeleton-line" /><div className="skeleton-line" /></div> : isError ? <div className="table-state"><strong>Unable to load customers</strong><span>Please try again in a moment.</span><button className="button secondary" onClick={() => { void refetch() }}>Try again</button></div> : visible.length === 0 ? <div className="table-state"><strong>No customers found</strong><span>Try a different search or status.</span></div> : <div className="table-scroll"><table><thead><tr><th><button className="table-sort" onClick={() => setSortAsc(!sortAsc)}>Customer <ChevronDown size={13} /></button></th><th>Company</th><th>Total spend</th><th>Status</th><th>Joined</th><th /></tr></thead><tbody>{visible.map(c => <tr key={c.email}><td><button className="person person-button" onClick={() => setSelected(c)}><div className={`avatar ${customerColor(c.id)}`}>{getInitials(c.name)}</div><div><strong>{c.name}</strong><small>{c.email}</small></div></button></td><td>{c.company}</td><td><strong>{formatCurrency(c.totalSpend)}</strong></td><td><span className={`status ${c.status.toLowerCase()}`}><i />{c.status}</span></td><td>{formatDate(c.createdAt)}</td><td><button className="more-btn" onClick={() => setSelected(c)}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div>}<div className="pagination"><span>Showing <strong>1–{visible.length}</strong> of <strong>{visible.length}</strong> customers</span><div><button className="page-btn" disabled><ChevronLeft size={16} /></button><button className="page-btn active">1</button><button className="page-btn" disabled><ChevronRight size={16} /></button></div></div></section>{selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section className="customer-modal" onClick={event => event.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}><X size={18} /></button><div className={`avatar ${customerColor(selected.id)} modal-avatar`}>{getInitials(selected.name)}</div><h2>{selected.name}</h2><p>{selected.email}</p><div className="detail-grid"><span>Company<strong>{selected.company}</strong></span><span>Status<strong>{selected.status}</strong></span><span>Total spend<strong>{formatCurrency(selected.totalSpend)}</strong></span><span>Joined<strong>{formatDate(selected.createdAt)}</strong></span></div><button className="button primary modal-action" onClick={() => { notify('Edit form coming next'); setSelected(null) }}>Edit customer</button></section></div>}</>
}

function Orders({ notify, downloadCsv }: { notify: (message: string) => void; downloadCsv: (filename: string, rows: string[][]) => void }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | 'All'>('All')
  const { data: visibleOrders = [], isLoading, isError, refetch } = useOrders(search, status)
  const { data: allOrders = [] } = useOrders('', 'All')
  const { data: dashboard } = useDashboard()
  const orderIcons = { orders: <Package size={17} />, processing: <TrendingUp size={17} />, completed: <CreditCard size={17} />, refunded: <ArrowDownRight size={17} /> }
  if (isLoading) return <DashboardLoading />
  if (isError) return <DataError onRetry={() => { void refetch() }} />
  return <><PageHeading title="Orders" description="Keep track of every transaction in one place." action={<button className="button primary" onClick={() => notify('Order creation will be connected to the orders API')}><Plus size={17} /> New order</button>} /><div className="mini-stats">{(dashboard?.orderStats ?? []).map(stat => <button key={stat.filter} className="mini-stat mini-stat-button" onClick={() => setStatus(stat.filter as OrderStatus | 'All')}><span className={`mini-icon ${stat.color}`}>{orderIcons[stat.icon as keyof typeof orderIcons]}</span><div><small>{stat.label}</small><strong>{stat.value}</strong></div><span className={`mini-change ${stat.change.startsWith('-') ? 'negative' : ''}`}>{stat.change}</span></button>)}</div><section className="card table-card"><div className="table-toolbar"><div className="search"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search orders..." /></div><div className="toolbar-actions"><label className="button secondary"><SlidersHorizontal size={16} /><select className="inline-select" value={status} onChange={event => setStatus(event.target.value as OrderStatus | 'All')}><option>All</option><option>Processing</option><option>Completed</option><option>Refunded</option></select><ChevronDown size={14} /></label><button className="button secondary" onClick={() => downloadCsv('insighthub-orders.csv', [['Order ID', 'Customer', 'Product', 'Amount', 'Status', 'Date'], ...visibleOrders.map(order => [order.id, order.customerName, order.product, formatCurrency(order.amount), order.status, formatDate(order.createdAt)])])}><Download size={16} /> Export</button></div></div>{visibleOrders.length === 0 ? <div className="table-state"><strong>No orders found</strong><span>Try another search or status.</span></div> : <div className="table-scroll"><table><thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th><th>Date</th><th /></tr></thead><tbody>{visibleOrders.map(o => <tr key={o.id}><td><strong className="order-id">#{o.id}</strong></td><td>{o.customerName}</td><td>{o.product}</td><td><strong>{formatCurrency(o.amount)}</strong></td><td><span className={`status ${o.status.toLowerCase()}`}><i />{o.status}</span></td><td>{formatDate(o.createdAt)}</td><td><button className="more-btn" onClick={() => notify(`${o.id} selected`)}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div>}<div className="pagination"><span>Showing <strong>1–{visibleOrders.length}</strong> of <strong>{allOrders.length}</strong> demo orders</span><div><button className="page-btn" disabled><ChevronLeft size={16} /></button><button className="page-btn active">1</button><button className="page-btn" disabled><ChevronRight size={16} /></button></div></div></section></>
}

function Analytics() {
  const { data, isLoading, isError, refetch } = useDashboard()
  if (isLoading) return <DashboardLoading />
  if (isError || !data) return <DataError onRetry={() => { void refetch() }} />
  const metricIcons = { revenue: <CreditCard size={19} />, customers: <Users size={19} />, orders: <Boxes size={19} />, conversion: <TrendingUp size={19} /> }
  return <><PageHeading title="Analytics" description="Go deeper into the metrics that move your business." action={<button className="button secondary" onClick={() => window.print()}><Download size={16} /> Download report</button>} /><div className="analytics-grid"><section className="card analytics-chart"><div className="card-header"><div><h2>Revenue & orders</h2><p>Compare revenue with order volume.</p></div></div><ResponsiveContainer width="100%" height={310}><BarChart data={data.revenue.slice(5)} barGap={5}><CartesianGrid vertical={false} stroke="#edf0f6" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 12 }} /><YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 12 }} tickFormatter={value => `$${value / 1000}k`} /><YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 12 }} /><Tooltip /><Bar yAxisId="left" dataKey="revenue" fill="#7c5cff" radius={[5, 5, 0, 0]} /><Bar yAxisId="right" dataKey="orders" fill="#c6b9ff" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></section><section className="card insight-card"><div className="insight-icon"><Sparkles size={19} /></div><h2>Performance insight</h2><p>Your revenue is trending <strong>{data.analyticsInsight.revenueGrowth} higher</strong> than last month. The strongest growth is coming from your {data.analyticsInsight.strongestProduct}.</p><div className="insight-metric"><span>{data.analyticsInsight.strongestProduct} contribution</span><strong>{data.analyticsInsight.contribution}</strong></div><div className="progress"><i /></div><button className="text-button" onClick={() => window.print()}>View detailed report <ChevronRight size={15} /></button></section></div><div className="stat-grid analytics-stats">{data.analyticsMetrics.map(metric => <Stat key={metric.title} title={metric.title} value={metric.value} change={metric.change} trend={metric.trend} icon={metricIcons[metric.icon]} color={metric.color} />)}</div></>
}

export default DashboardPage
