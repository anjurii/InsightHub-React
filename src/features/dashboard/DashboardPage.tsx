import { useState } from 'react'
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

type View = 'Overview' | 'Customers' | 'Orders' | 'Analytics'
const revenueData = [
  { name: 'Jan', revenue: 32000, orders: 198 }, { name: 'Feb', revenue: 42000, orders: 245 },
  { name: 'Mar', revenue: 39000, orders: 229 }, { name: 'Apr', revenue: 51000, orders: 310 },
  { name: 'May', revenue: 47000, orders: 283 }, { name: 'Jun', revenue: 59000, orders: 367 },
  { name: 'Jul', revenue: 67000, orders: 402 }, { name: 'Aug', revenue: 62000, orders: 385 },
  { name: 'Sep', revenue: 74000, orders: 460 }, { name: 'Oct', revenue: 71000, orders: 438 },
  { name: 'Nov', revenue: 86000, orders: 512 }, { name: 'Dec', revenue: 94000, orders: 568 },
]

const orders = [
  { id: '#ORD-9842', customer: 'Olivia Martin', product: 'Growth plan', amount: '$2,400.00', status: 'Completed', date: 'Sep 24, 2024' },
  { id: '#ORD-9841', customer: 'Jackson Lee', product: 'Enterprise plan', amount: '$5,800.00', status: 'Processing', date: 'Sep 23, 2024' },
  { id: '#ORD-9840', customer: 'Sofia Davis', product: 'Growth plan', amount: '$2,400.00', status: 'Completed', date: 'Sep 22, 2024' },
  { id: '#ORD-9839', customer: 'Liam Wilson', product: 'Starter plan', amount: '$890.00', status: 'Refunded', date: 'Sep 21, 2024' },
  { id: '#ORD-9838', customer: 'Ava Thompson', product: 'Growth plan', amount: '$2,400.00', status: 'Completed', date: 'Sep 20, 2024' },
]

const navItems = [
  { label: 'Overview', icon: LayoutDashboard }, { label: 'Customers', icon: Users },
  { label: 'Orders', icon: Package }, { label: 'Analytics', icon: BarChart3 },
]

function DashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const pathView = location.pathname.split('/')[1]
  const initialView = pathView === 'customers' ? 'Customers' : pathView === 'orders' ? 'Orders' : pathView === 'analytics' ? 'Analytics' : 'Overview'
  const [view, setView] = useState<View>(initialView)
  const [dark, setDark] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toast, setToast] = useState('')

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="brand"><div className="brand-mark"><Sparkles size={18} /></div><span>insight<span>hub</span></span></div>
        <div className="workspace-switch"><div className="workspace-avatar">A</div><div className="workspace-copy"><strong>Acme workspace</strong><small>Pro plan</small></div><ChevronDown size={15} /></div>
        <p className="nav-label">Workspace</p>
        <nav>{navItems.map(({ label, icon: Icon }) => <button className={view === label ? 'nav-item active' : 'nav-item'} key={label} onClick={() => { setView(label as View); navigate(label === 'Overview' ? '/' : `/${label.toLowerCase()}`); setMobileOpen(false) }}><Icon size={18} /><span>{label}</span>{label === 'Customers' && <em>5</em>}</button>)}</nav>
        <p className="nav-label">Manage</p>
        <nav><button className="nav-item" onClick={() => notify('Reports are ready to download')}><FileText size={18} /><span>Reports</span></button><button className="nav-item" onClick={() => notify('Settings opened')}><Settings size={18} /><span>Settings</span></button></nav>
        <div className="sidebar-bottom"><div className="help-card"><CircleHelp size={18} /><div><strong>Need a hand?</strong><small>Check our help center</small></div><ChevronRight size={14} /></div><button className="profile" onClick={logout}><div className="profile-avatar">AK</div><div className="profile-copy"><strong>Alex Kim</strong><small>Admin · Sign out</small></div><MoreHorizontal size={17} /></button></div>
      </aside>
      {mobileOpen && <button className="mobile-overlay" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
      <main className="main">
        <header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><button className="icon-btn desktop-collapse" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}</button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{view}</strong></div><div className="top-actions"><button className="icon-btn hide-mobile" onClick={() => setDark(!dark)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button><button className="icon-btn notification" onClick={() => notify('You are all caught up')}><Bell size={18} /><i /></button><div className="top-avatar">AK</div></div></header>
        <section className="content">
          {view === 'Overview' && <Overview notify={notify} />}
          {view === 'Customers' && <Customers />}
          {view === 'Orders' && <Orders notify={notify} />}
          {view === 'Analytics' && <Analytics />}
        </section>
      </main>
      {toast && <div className="toast"><span className="toast-check">✓</span>{toast}<button onClick={() => setToast('')}><X size={14} /></button></div>}
    </div>
  )
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow ?? 'Good morning, Alex'} <span>✦</span></p><h1>{title}</h1><p className="subheading">{description}</p></div>{action}</div>
}

function Overview({ notify }: { notify: (message: string) => void }) {
  const [range, setRange] = useState('Last 12 months')
  return <><PageHeading title="Overview" description="A clear view of how your business is performing." action={<div className="heading-actions"><button className="button secondary"><CalendarDays size={16} />{range}<ChevronDown size={14} /></button><button className="button primary" onClick={() => notify('Report exported successfully')}><Download size={16} /> Export report</button></div>} />
    <div className="stat-grid"><Stat title="Total revenue" value="$842,930" change="+18.2%" trend="up" icon={<CreditCard size={19} />} color="purple" /><Stat title="Total customers" value="24,892" change="+12.6%" trend="up" icon={<Users size={19} />} color="blue" /><Stat title="Total orders" value="8,492" change="+8.4%" trend="up" icon={<Boxes size={19} />} color="orange" /><Stat title="Conversion rate" value="3.48%" change="-2.1%" trend="down" icon={<TrendingUp size={19} />} color="green" /></div>
    <div className="dashboard-grid"><section className="card revenue-card"><div className="card-header"><div><h2>Revenue overview</h2><p>Track your revenue performance over time.</p></div><div className="legend"><span><i className="dot purple" />Revenue</span><span><i className="dot pale" />Orders</span><select value={range} onChange={e => setRange(e.target.value)}><option>Last 12 months</option><option>Last 6 months</option><option>This year</option></select></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height={280}><AreaChart data={revenueData}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c5cff" stopOpacity={0.24} /><stop offset="100%" stopColor="#7c5cff" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#edf0f6" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 12 }} tickFormatter={v => `$${v / 1000}k`} /><Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} contentStyle={{ border: '1px solid #edf0f6', borderRadius: 10, boxShadow: '0 8px 30px #212b3d12' }} /><Area type="monotone" dataKey="revenue" stroke="#7759e8" strokeWidth={3} fill="url(#revenueFill)" /></AreaChart></ResponsiveContainer></div></section>
      <section className="card acquisition-card"><div className="card-header"><div><h2>Customer acquisition</h2><p>Where your customers come from.</p></div><button className="more-btn"><MoreHorizontal size={18} /></button></div><div className="donut-wrap"><ResponsiveContainer width="100%" height={190}><PieChart><Pie data={[{name:'Organic', value:42},{name:'Referral', value:28},{name:'Social', value:18},{name:'Paid', value:12}]} innerRadius={58} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">{['#7558e9','#a891f7','#f9ae69','#b9e3d3'].map((color) => <Cell key={color} fill={color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="donut-center"><strong>24.8k</strong><small>customers</small></div></div><div className="source-list"><Source label="Organic search" value="42%" color="purple" /><Source label="Referrals" value="28%" color="lavender" /><Source label="Social media" value="18%" color="orange" /><Source label="Paid ads" value="12%" color="mint" /></div></section>
    </div>
    <section className="card activity-card"><div className="card-header"><div><h2>Recent activity</h2><p>Your latest customer and order updates.</p></div><button className="text-button" onClick={() => notify('Showing all activity')}>View all <ChevronRight size={15} /></button></div><div className="activity-list"><Activity initials="OM" color="lavender" title="Olivia Martin placed a new order" detail="Growth plan · $2,400.00" time="2 min ago" /><Activity initials="JL" color="blue" title="Jackson Lee became a customer" detail="Vertex Systems" time="18 min ago" /><Activity initials="SD" color="peach" title="Sofia Davis updated their profile" detail="Orbit Commerce" time="1 hour ago" /></div></section>
  </>
}

function Stat({ title, value, change, trend, icon, color }: { title: string; value: string; change: string; trend: 'up' | 'down'; icon: React.ReactNode; color: string }) {
  return <div className="stat-card"><div className={`stat-icon ${color}`}>{icon}</div><p>{title}</p><div className="stat-value">{value}</div><div className={`stat-change ${trend}`} >{trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{change}<span>vs. last month</span></div></div>
}
function Source({ label, value, color }: { label: string; value: string; color: string }) { return <div className="source-row"><i className={`dot ${color}`} />{label}<strong>{value}</strong></div> }
function Activity({ initials, color, title, detail, time }: { initials: string; color: string; title: string; detail: string; time: string }) { return <div className="activity-row"><div className={`avatar ${color}`}>{initials}</div><div><strong>{title}</strong><small>{detail}</small></div><time>{time}</time></div> }

function Customers() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data: visible = [], isLoading, isError } = useCustomers(search)
  return <><PageHeading title="Customers" description="Manage relationships and understand your audience." action={<button className="button primary" onClick={() => navigate('/customers/new')}><Plus size={17} /> Add customer</button>} /><section className="card table-card"><div className="table-toolbar"><div className="search"><Search size={17} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." /></div><div className="toolbar-actions"><button className="button secondary"><SlidersHorizontal size={16} /> Filters</button><button className="button secondary"><Download size={16} /> Export</button></div></div>{isLoading ? <div className="table-state"><div className="skeleton-line" /><div className="skeleton-line" /><div className="skeleton-line" /></div> : isError ? <div className="table-state"><strong>Unable to load customers</strong><span>Please try again in a moment.</span></div> : visible.length === 0 ? <div className="table-state"><strong>No customers found</strong><span>Try a different search term.</span></div> : <div className="table-scroll"><table><thead><tr><th>Customer <ChevronDown size={13} /></th><th>Company</th><th>Total spend <ChevronDown size={13} /></th><th>Status</th><th>Joined <ChevronDown size={13} /></th><th /></tr></thead><tbody>{visible.map(c => <tr key={c.email}><td><div className="person"><div className={`avatar ${c.color}`}>{c.initials}</div><div><strong>{c.name}</strong><small>{c.email}</small></div></div></td><td>{c.company}</td><td><strong>{c.spend}</strong></td><td><span className={`status ${c.status.toLowerCase()}`}><i />{c.status}</span></td><td>{c.date}</td><td><button className="more-btn"><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div>}<div className="pagination"><span>Showing <strong>1–{visible.length}</strong> of <strong>2,481</strong> customers</span><div><button className="page-btn"><ChevronLeft size={16} /></button><button className="page-btn active">1</button><button className="page-btn">2</button><button className="page-btn">3</button><span>...</span><button className="page-btn">248</button><button className="page-btn"><ChevronRight size={16} /></button></div></div></section></>
}

function Orders({ notify }: { notify: (message: string) => void }) {
  return <><PageHeading title="Orders" description="Keep track of every transaction in one place." action={<button className="button primary" onClick={() => notify('Order created successfully')}><Plus size={17} /> New order</button>} /><div className="mini-stats"><div className="mini-stat"><span className="mini-icon purple"><Package size={17} /></span><div><small>All orders</small><strong>8,492</strong></div><span className="mini-change">+8.4%</span></div><div className="mini-stat"><span className="mini-icon orange"><TrendingUp size={17} /></span><div><small>Processing</small><strong>284</strong></div><span className="mini-change">+4.2%</span></div><div className="mini-stat"><span className="mini-icon mint"><CreditCard size={17} /></span><div><small>Completed</small><strong>7,912</strong></div><span className="mini-change">+10.1%</span></div><div className="mini-stat"><span className="mini-icon rose"><ArrowDownRight size={17} /></span><div><small>Refunded</small><strong>296</strong></div><span className="mini-change negative">-2.8%</span></div></div><section className="card table-card"><div className="table-toolbar"><div className="search"><Search size={17} /><input placeholder="Search orders..." /></div><div className="toolbar-actions"><button className="button secondary"><SlidersHorizontal size={16} /> Status: All <ChevronDown size={14} /></button><button className="button secondary"><CalendarDays size={16} /> Date range</button></div></div><div className="table-scroll"><table><thead><tr><th>Order ID</th><th>Customer</th><th>Product</th><th>Amount</th><th>Status</th><th>Date</th><th /></tr></thead><tbody>{orders.map(o => <tr key={o.id}><td><strong className="order-id">{o.id}</strong></td><td>{o.customer}</td><td>{o.product}</td><td><strong>{o.amount}</strong></td><td><span className={`status ${o.status.toLowerCase()}`}><i />{o.status}</span></td><td>{o.date}</td><td><button className="more-btn"><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div><div className="pagination"><span>Showing <strong>1–5</strong> of <strong>8,492</strong> orders</span><div><button className="page-btn"><ChevronLeft size={16} /></button><button className="page-btn active">1</button><button className="page-btn">2</button><button className="page-btn">3</button><span>...</span><button className="page-btn">850</button><button className="page-btn"><ChevronRight size={16} /></button></div></div></section></>
}

function Analytics() {
  return <><PageHeading title="Analytics" description="Go deeper into the metrics that move your business." action={<button className="button secondary"><CalendarDays size={16} /> Last 30 days <ChevronDown size={14} /></button>} /><div className="analytics-grid"><section className="card analytics-chart"><div className="card-header"><div><h2>Revenue & orders</h2><p>Compare revenue with order volume.</p></div></div><ResponsiveContainer width="100%" height={310}><BarChart data={revenueData.slice(5)} barGap={5}><CartesianGrid vertical={false} stroke="#edf0f6" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 12 }} /><YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 12 }} tickFormatter={v => `$${v / 1000}k`} /><YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 12 }} /><Tooltip /><Bar yAxisId="left" dataKey="revenue" fill="#7c5cff" radius={[5, 5, 0, 0]} /><Bar yAxisId="right" dataKey="orders" fill="#c6b9ff" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></section><section className="card insight-card"><div className="insight-icon"><Sparkles size={19} /></div><h2>Performance insight</h2><p>Your revenue is trending <strong>18.2% higher</strong> than last month. The strongest growth is coming from your Growth plan.</p><div className="insight-metric"><span>Growth plan contribution</span><strong>64.8%</strong></div><div className="progress"><i /></div><button className="text-button">View detailed report <ChevronRight size={15} /></button></section></div><div className="stat-grid analytics-stats"><Stat title="Avg. order value" value="$99.23" change="+6.4%" trend="up" icon={<CreditCard size={19} />} color="purple" /><Stat title="Customer lifetime value" value="$1,240" change="+14.8%" trend="up" icon={<Users size={19} />} color="blue" /><Stat title="Churn rate" value="1.24%" change="-0.8%" trend="up" icon={<TrendingUp size={19} />} color="green" /><Stat title="Net revenue" value="$794,210" change="+20.1%" trend="up" icon={<BarChart3 size={19} />} color="orange" /></div></>
}

export default DashboardPage

