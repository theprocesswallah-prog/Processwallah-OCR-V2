import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { getCurrentSession, signOut } from '../../assets/js/services/authService.js';
import { getSupabaseClient, initializeSupabase } from '../../assets/js/services/supabaseClient.js';
import './dashboard.css';
import { dashboardRoutes } from './routes.js';
import CustomerMaster from '../masters/CustomerMaster.jsx';
import VendorMaster from '../masters/VendorMaster.jsx';
import ProductMaster from '../masters/ProductMaster.jsx';
import ItemMaster from '../masters/ItemMaster.jsx';

// The dashboard uses live Supabase queries against the finalized schema only.

function formatTimestamp(value) {
  if (!value) return '—';
  const date = new Date(value);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function StatCard({ title, value, hint, tone = 'default' }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div className="stat-card__header">
        <p>{title}</p>
        <span className="stat-card__dot" />
      </div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__hint">{hint}</div>
    </article>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function DashboardView() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [stats, setStats] = useState({
    customers: 0,
    vendors: 0,
    products: 0,
    items: 0,
    sales: 0,
    purchases: 0
  });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        initializeSupabase();
        const client = getSupabaseClient();
        if (!client) {
          throw new Error('Supabase client is unavailable.');
        }

        const currentSession = await getCurrentSession();
        if (!isMounted) return;
        setSession(currentSession);

        const [customersRes, vendorsRes, productsRes, itemsRes, salesRes, purchasesRes, docsRes] = await Promise.all([
          client.from('customer_master').select('customer_id', { count: 'exact', head: true }),
          client.from('vendor_master').select('vendor_id', { count: 'exact', head: true }),
          client.from('product_master').select('product_id', { count: 'exact', head: true }),
          client.from('item_master').select('item_id', { count: 'exact', head: true }),
          client.from('sales_register').select('sales_record_id', { count: 'exact', head: true }),
          client.from('purchase_register').select('purchase_record_id', { count: 'exact', head: true }),
          client.from('document_master').select('document_id, file_name, document_type, extraction_status, uploaded_at').order('uploaded_at', { ascending: false }).limit(6)
        ]);

        if (!isMounted) return;

        if (customersRes.error || vendorsRes.error || productsRes.error || itemsRes.error || salesRes.error || purchasesRes.error || docsRes.error) {
          throw new Error(
            customersRes.error?.message ||
            vendorsRes.error?.message ||
            productsRes.error?.message ||
            itemsRes.error?.message ||
            salesRes.error?.message ||
            purchasesRes.error?.message ||
            docsRes.error?.message ||
            'Unable to load dashboard data.'
          );
        }

        setStats({
          customers: customersRes.count || 0,
          vendors: vendorsRes.count || 0,
          products: productsRes.count || 0,
          items: itemsRes.count || 0,
          sales: salesRes.count || 0,
          purchases: purchasesRes.count || 0
        });
        setDocuments((docsRes.data || []).map((doc) => ({
          ...doc,
          uploaded_at: doc.uploaded_at || null
        })));
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const userName = useMemo(() => {
    const profileName = session?.user?.user_metadata?.display_name || session?.user?.user_metadata?.username;
    return profileName || session?.user?.email || 'Signed in user';
  }, [session]);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.hash = '';
      window.location.reload();
    } catch (err) {
      console.error('[Dashboard] Logout failed', err);
    }
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mastersOpen, setMastersOpen] = useState(true);

  const groupedRoutes = useMemo(() => {
    const grouped = {};
    dashboardRoutes.forEach((item) => {
      const key = item.section || 'ROOT';
      grouped[key] = grouped[key] || [];
      grouped[key].push(item);
    });
    return grouped;
  }, []);

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${sidebarCollapsed ? 'is-collapsed' : ''}`}>
        <div className="brand-block">
          <div className="brand-mark">P</div>
          <div className="brand-meta">
            <div className="brand-title">Processwallah</div>
            <div className="brand-subtitle">OCR Operations</div>
          </div>
          <button
            className="sidebar-collapse-toggle"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setSidebarCollapsed((s) => !s)}
            type="button"
          >
            <span className="collapse-icon">{sidebarCollapsed ? '›' : '‹'}</span>
          </button>
        </div>

        <nav className={`sidebar-nav ${sidebarCollapsed ? 'collapsed' : ''}`} aria-label="Primary">
          <div className="nav-section">
            {groupedRoutes['ROOT']?.filter(r => r.path === '/').map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `sidebar-nav__item ${isActive ? 'active' : ''}`}>
                <span className="sidebar-nav__icon">{item.icon}</span>
                <span className="sidebar-nav__label">{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="nav-section masters-section">
            <div className="nav-section__title-row">
              <div className="nav-section__title">MASTERS</div>
              <button
                aria-expanded={mastersOpen}
                className={`masters-toggle ${mastersOpen ? 'open' : ''}`}
                type="button"
                onClick={() => setMastersOpen((s) => !s)}
              >
                <span className="arrow">▾</span>
              </button>
            </div>

            <div className={`masters-submenu ${mastersOpen ? 'open' : 'closed'}`}>
              {groupedRoutes['MASTERS']?.map((item) => (
                <NavLink key={item.path} to={item.path} className={({ isActive }) => `sidebar-nav__item ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-nav__icon">{item.icon}</span>
                  <span className="sidebar-nav__label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="nav-section">
            {['SALES','PURCHASE','SYSTEM'].map((sec) => (
              <React.Fragment key={sec}>
                {groupedRoutes[sec]?.map((item) => (
                  <NavLink key={item.path} to={item.path} className={({ isActive }) => `sidebar-nav__item ${isActive ? 'active' : ''}`}>
                    <span className="sidebar-nav__icon">{item.icon}</span>
                    <span className="sidebar-nav__label">{item.label}</span>
                  </NavLink>
                ))}
              </React.Fragment>
            ))}
          </div>
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Enterprise workspace</p>
            <h1>Dashboard</h1>
          </div>
          <div className="topbar__actions">
            <div className="profile-pill">
              <div className="profile-pill__avatar">{userName.charAt(0).toUpperCase()}</div>
              <div>
                <div className="profile-pill__name">{userName}</div>
                <div className="profile-pill__email">{session?.user?.email || 'Signed in'}</div>
              </div>
            </div>
            <button className="logout-button" type="button" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <section className="welcome-card">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2>{userName}</h2>
            <p>Monitor your master data, document intake, and processing workflow from one secure workspace.</p>
          </div>
          <div className="welcome-card__meta">
            <div><strong>Role</strong><span>{session?.user?.user_metadata?.role || 'Operator'}</span></div>
            <div><strong>Last synced</strong><span>{new Date().toLocaleDateString('en-IN')}</span></div>
          </div>
        </section>

        {loading ? (
          <div className="status-panel">Loading live data from Supabase…</div>
        ) : error ? (
          <div className="status-panel status-panel--error">{error}</div>
        ) : (
          <>
            <section className="stats-grid" aria-label="Summary cards">
              <StatCard title="Total Customers" value={stats.customers} hint="Registered customer master records" tone="violet" />
              <StatCard title="Total Vendors" value={stats.vendors} hint="Registered vendor master records" tone="blue" />
              <StatCard title="Total Products" value={stats.products} hint="Electrical product catalog" tone="green" />
              <StatCard title="Total Items" value={stats.items} hint="Inventory material items" tone="amber" />
              <StatCard title="Total Sales Documents" value={stats.sales} hint="OCR sales ledger records" tone="teal" />
              <StatCard title="Total Purchase Documents" value={stats.purchases} hint="OCR purchase ledger records" tone="rose" />
            </section>

            <section className="content-grid">
              <div className="panel-card">
                <div className="panel-card__header">
                  <div>
                    <p className="eyebrow">Quick actions</p>
                    <h3>Common tasks</h3>
                  </div>
                </div>
                <div className="quick-actions">
                  {[
                    { label: 'Sales Register', path: '/sales-register' },
                    { label: 'Purchase Register', path: '/purchase-register' },
                    { label: 'Customer Master', path: '/customer-master' },
                    { label: 'Vendor Master', path: '/vendor-master' },
                    { label: 'Product Master', path: '/product-master' },
                    { label: 'Item Master', path: '/item-master' }
                  ].map((action) => (
                    <button key={action.label} className="action-chip" type="button" onClick={() => navigate(action.path)}>{action.label}</button>
                  ))}
                </div>
              </div>

              <div className="panel-card">
                <div className="panel-card__header">
                  <div>
                    <p className="eyebrow">Recent uploads</p>
                    <h3>Documents</h3>
                  </div>
                </div>
                {documents.length === 0 ? (
                  <EmptyState title="No documents yet" description="Uploaded documents will appear here once available in the document_master table." />
                ) : (
                  <div className="document-list">
                    {documents.map((doc) => (
                      <div key={doc.document_id} className="document-item">
                        <div>
                          <div className="document-item__title">{doc.file_name}</div>
                          <div className="document-item__meta">{doc.document_type} • {doc.extraction_status}</div>
                        </div>
                        <div className="document-item__date">{formatTimestamp(doc.uploaded_at)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function DashboardApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/customer-master" element={<CustomerMaster />} />
        <Route path="/vendor-master" element={<VendorMaster />} />
        <Route path="/product-master" element={<ProductMaster />} />
        <Route path="/item-master" element={<ItemMaster />} />
        <Route path="/*" element={<DashboardView />} />
      </Routes>
    </BrowserRouter>
  );
}

export function renderDashboardApp(container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <DashboardApp />
    </React.StrictMode>
  );
}

export default DashboardApp;
