import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const STORAGE_KEY = 'meesho-ai-seller-pro-v2';
const NAV = ['Dashboard', 'AI Listing', 'Image Studio', 'Pricing & Profit', 'Competitor Research', 'Products', 'Orders', 'Analytics', 'AI Assistant', 'Settings'];
const CATEGORIES = ['Beauty', 'Fashion', 'Mobile Accessories', 'Home & Kitchen', 'Car Accessories'];
const ORDER_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

const initialState = {
  products: [
    { id: 'p-1', name: 'Crystal Clear TPU Back Cover', category: 'Mobile Accessories', price: 299, cost: 110, stock: 84, score: 94, status: 'Published' },
    { id: 'p-2', name: '2-in-1 Eyebrow Trimmer', category: 'Beauty', price: 249, cost: 96, stock: 41, score: 91, status: 'Published' },
    { id: 'p-3', name: 'Solar Devil Eye Car Light', category: 'Car Accessories', price: 399, cost: 140, stock: 22, score: 88, status: 'Draft' }
  ],
  orders: [
    { id: 'ORD-1042', product: '2-in-1 Eyebrow Trimmer', amount: 498, status: 'Delivered', date: '2026-08-18' },
    { id: 'ORD-1041', product: 'Crystal Clear TPU Back Cover', amount: 299, status: 'Shipped', date: '2026-08-18' },
    { id: 'ORD-1040', product: 'Solar Devil Eye Car Light', amount: 399, status: 'Processing', date: '2026-08-17' }
  ],
  listings: [],
  calculations: [],
  images: []
};

function safeLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
  } catch {
    return initialState;
  }
}

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className="fatal"><h1>Something went wrong</h1><p>Reload the app to restore the seller workspace.</p><button className="primary" onClick={() => window.location.reload()}>Reload</button></div>;
    return this.props.children;
  }
}

function App() {
  const [page, setPage] = useState('Dashboard');
  const [data, setData] = useState(safeLoad);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)), [data]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const revenue = useMemo(() => data.orders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + Number(o.amount || 0), 0), [data.orders]);
  const avgScore = useMemo(() => Math.round(data.products.reduce((sum, p) => sum + Number(p.score || 0), 0) / Math.max(1, data.products.length)), [data.products]);
  const stockAlerts = useMemo(() => data.products.filter((p) => p.stock < 25).length, [data.products]);
  const estimatedProfit = useMemo(() => data.orders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => {
    const product = data.products.find((p) => p.name === o.product);
    return sum + (product ? (Number(o.amount) - Number(product.cost)) : 0);
  }, 0), [data.orders, data.products]);

  const updateData = (patch) => setData((current) => ({ ...current, ...patch }));
  const notify = (message) => setToast(message);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">M</div>
          <div><strong>Meesho AI</strong><span>Seller Pro</span></div>
        </div>
        <nav className="nav-list" aria-label="Main navigation">
          {NAV.map((item) => <button key={item} className={`nav-item ${page === item ? 'active' : ''}`} onClick={() => { setPage(item); setMobileOpen(false); }}><span className="nav-icon">{iconFor(item)}</span>{item}</button>)}
        </nav>
        <div className="sidebar-note"><strong>Workspace</strong><p>Your changes persist in this browser. Cloud sync and AI APIs can be connected next.</p></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="title-wrap">
            <button className="menu-button" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle navigation">☰</button>
            <div><div className="breadcrumb">SELLER WORKSPACE</div><h1>{page}</h1><p>AI-powered tools for faster marketplace selling</p></div>
          </div>
          <div className="top-actions"><span className="status-pill"><span className="status-dot" />Local workspace</span><span className="avatar">SA</span></div>
        </header>

        <Page page={page} data={data} setData={updateData} setPage={setPage} notify={notify} revenue={revenue} estimatedProfit={estimatedProfit} avgScore={avgScore} stockAlerts={stockAlerts} />
      </main>
      {toast && <div className="toast" role="status">✓ {toast}</div>}
    </div>
  );
}

function iconFor(item) {
  const icons = { Dashboard: '⌂', 'AI Listing': '✦', 'Image Studio': '▧', 'Pricing & Profit': '₹', 'Competitor Research': '⌕', Products: '□', Orders: '◫', Analytics: '↗', 'AI Assistant': '◉', Settings: '⚙' };
  return icons[item] || '•';
}

function Page({ page, data, setData, setPage, notify, revenue, estimatedProfit, avgScore, stockAlerts }) {
  const props = { data, setData, notify };
  if (page === 'Dashboard') return <Dashboard data={data} revenue={revenue} estimatedProfit={estimatedProfit} avgScore={avgScore} stockAlerts={stockAlerts} setPage={setPage} />;
  if (page === 'AI Listing') return <AIListing {...props} />;
  if (page === 'Image Studio') return <ImageStudio {...props} />;
  if (page === 'Pricing & Profit') return <Pricing {...props} />;
  if (page === 'Competitor Research') return <Competitors />;
  if (page === 'Products') return <Products {...props} />;
  if (page === 'Orders') return <Orders {...props} />;
  if (page === 'Analytics') return <Analytics {...props} revenue={revenue} estimatedProfit={estimatedProfit} avgScore={avgScore} />;
  if (page === 'AI Assistant') return <Assistant {...props} />;
  return <Settings />;
}

function Dashboard({ data, revenue, estimatedProfit, avgScore, stockAlerts, setPage }) {
  const weakListings = data.products.filter((p) => p.score < 90).length;
  return <section className="page-body">
    <div className="hero">
      <div><span className="eyebrow">SELLER COMMAND CENTER</span><h2>Build, price and manage products faster.</h2><p>One clean workspace for listings, profit decisions, inventory and orders.</p></div>
      <button className="primary" onClick={() => setPage('AI Listing')}>Create AI Listing <span>→</span></button>
    </div>
    <div className="stats-grid">
      <Stat label="Revenue tracked" value={money(revenue)} meta="Excluding cancelled orders" />
      <Stat label="Estimated contribution" value={money(estimatedProfit)} meta="Based on product cost" />
      <Stat label="Listing quality" value={`${avgScore}/100`} meta={`${weakListings} need attention`} />
      <Stat label="Low-stock alerts" value={stockAlerts} meta="Threshold: 25 units" alert={stockAlerts > 0} />
    </div>
    <div className="two-col">
      <Panel title="Top catalog" subtitle="Highest contribution per unit">
        {data.products.map((p) => <div className="row" key={p.id}><div><strong>{p.name}</strong><span>{p.category} · {p.stock} units</span></div><strong>{money(p.price - p.cost)}</strong></div>)}
      </Panel>
      <Panel title="AI recommendations" subtitle="Quick wins from the current workspace">
        <Recommendation text={weakListings ? `Refresh ${weakListings} listing${weakListings > 1 ? 's' : ''} below 90 score.` : 'Your listing scores are healthy.'} />
        <Recommendation text={stockAlerts ? `${stockAlerts} product${stockAlerts > 1 ? 's' : ''} are below the 25-unit stock threshold.` : 'Inventory levels look healthy.'} />
        <Recommendation text="Compare full landed cost before publishing any new price." />
      </Panel>
    </div>
  </section>;
}

function Recommendation({ text }) { return <div className="recommend"><span className="checkmark">✓</span>{text}</div>; }
function Stat({ label, value, meta, alert }) { return <div className={`stat-card ${alert ? 'alert-card' : ''}`}><span>{label}</span><strong>{value}</strong><small>{meta}</small></div>; }
function Panel({ title, subtitle, children, action }) { return <section className="panel"><div className="panel-head"><div><h3>{title}</h3><p>{subtitle}</p></div>{action}</div>{children}</section>; }

function AIListing({ data, setData, notify }) {
  const [form, setForm] = useState({ name: '', category: 'Beauty', language: 'English', price: 249, material: '', useCase: '' });
  const [result, setResult] = useState(null);
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const generate = () => {
    if (!form.name.trim()) return notify('Enter a product name first.');
    const base = form.name.trim();
    const features = ['Premium quality finish', 'Compact and easy to carry', 'Simple everyday usage', 'Durable practical design', 'Suitable for home and travel', form.material ? `${form.material} construction` : 'Lightweight design'];
    const resultData = {
      id: uid('listing'), title: `${base} | Premium Quality, Easy to Use & Travel Friendly`,
      description: `${base} is designed for convenient everyday use with a practical finish, easy handling and a travel-friendly form factor${form.useCase ? `, ideal for ${form.useCase}` : ''}.`,
      features, keywords: [base.toLowerCase(), form.category.toLowerCase(), 'best seller', 'online shopping', 'india'],
      attributes: { category: form.category, language: form.language, material: form.material || 'Not specified', useCase: form.useCase || 'Everyday use', targetPrice: form.price }, score: form.material && form.useCase ? 95 : 91
    };
    setResult(resultData);
  };
  const save = () => { if (!result) return; setData({ listings: [result, ...data.listings] }); notify('Listing saved to workspace.'); };
  const copy = async () => { if (!result) return; try { await navigator.clipboard.writeText(`${result.title}\n\n${result.description}\n\nFeatures:\n${result.features.map((f) => `• ${f}`).join('\n')}`); notify('Listing copied.'); } catch { notify('Copy failed.'); } };
  return <section className="page-body two-col">
    <Panel title="AI Listing Generator" subtitle="Create structured marketplace copy from product details.">
      <label>Product name<input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Women's Makeup Pouch" /></label>
      <label>Category<select value={form.category} onChange={(e) => update('category', e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
      <div className="form-grid"><label>Language<select value={form.language} onChange={(e) => update('language', e.target.value)}><option>English</option><option>Hindi</option><option>Hinglish</option></select></label><label>Target price<input type="number" min="0" value={form.price} onChange={(e) => update('price', Number(e.target.value))} /></label></div>
      <div className="form-grid"><label>Material<input value={form.material} onChange={(e) => update('material', e.target.value)} placeholder="e.g. TPU" /></label><label>Use case<input value={form.useCase} onChange={(e) => update('useCase', e.target.value)} placeholder="e.g. travel" /></label></div>
      <button className="primary full" onClick={generate}>✦ Generate Listing</button>
      <div className="provider-note"><span>AI provider</span><strong>Demo fallback</strong><small>Connect a server-side AI endpoint later; no browser API key is required.</small></div>
    </Panel>
    <Panel title="Generated listing" subtitle="Edit-ready content with quality scoring">
      {!result ? <Empty title="Your listing appears here" text="Add product details and generate a complete draft." /> : <div>
        <div className="score-box"><span>Listing score</span><strong>{result.score}/100</strong></div><h3 className="result-title">{result.title}</h3><p>{result.description}</p>
        <h4>Key features</h4>{result.features.map((x) => <div className="check" key={x}>✓ {x}</div>)}
        <h4>Keywords</h4><div className="chips">{result.keywords.map((x) => <span key={x}>{x}</span>)}</div>
        <div className="actions"><button className="secondary" onClick={copy}>Copy</button><button className="primary" onClick={save}>Save</button><button className="secondary" onClick={generate}>Regenerate</button></div>
      </div>}
    </Panel>
  </section>;
}

function ImageStudio({ data, setData, notify }) {
  const [file, setFile] = useState(null);
  const choose = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith('image/')) return notify('Please choose an image file.');
    if (selected.size > 5 * 1024 * 1024) return notify('Image must be under 5 MB.');
    const url = URL.createObjectURL(selected); setFile({ name: selected.name, size: selected.size, url });
  };
  const saveAsset = () => { if (!file) return notify('Choose an image first.'); setData({ images: [{ id: uid('img'), name: file.name, status: 'Ready', createdAt: new Date().toISOString() }, ...data.images] }); notify('Image asset saved.'); };
  return <section className="page-body two-col">
    <Panel title="Image Studio" subtitle="Prepare product creatives without pretending generation is complete.">
      <label className="upload-box"><input type="file" accept="image/*" onChange={choose} /><span className="upload-icon">↑</span><strong>Choose product image</strong><small>PNG, JPG, WEBP · up to 5 MB</small></label>
      {file && <div className="image-preview"><img src={file.url} alt="Selected product" /><div><strong>{file.name}</strong><span>{Math.round(file.size / 1024)} KB · Ready</span></div></div>}
      <button className="primary full" disabled={!file} onClick={saveAsset}>Save Image Asset</button>
    </Panel>
    <Panel title="Creative pipeline" subtitle="Clear provider-ready states">
      {['Background cleanup', 'Marketplace enhancement', 'Lifestyle scene', 'Feature graphic'].map((name, index) => <div className="pipeline-row" key={name}><span className="step-number">{index + 1}</span><div><strong>{name}</strong><small>{file ? 'Ready for generation provider' : 'Waiting for source image'}</small></div><span className={`mini-status ${file ? 'ready' : ''}`}>{file ? 'Ready' : 'Waiting'}</span></div>)}
    </Panel>
  </section>;
}

function Pricing({ data, setData, notify }) {
  const [values, setValues] = useState({ cost: 120, packaging: 10, shipping: 40, fee: 12, tax: 3, returnRate: 5, price: 249 });
  const set = (key, value) => setValues((v) => ({ ...v, [key]: Number(value) }));
  const feeAmount = values.price * values.fee / 100; const taxAmount = values.price * values.tax / 100; const returnReserve = values.price * values.returnRate / 100; const total = values.cost + values.packaging + values.shipping + feeAmount + taxAmount + returnReserve; const profit = values.price - total; const margin = values.price ? profit / values.price * 100 : 0; const breakEven = (values.cost + values.packaging + values.shipping) / Math.max(0.01, 1 - (values.fee + values.tax + values.returnRate) / 100);
  const save = () => { setData({ calculations: [{ id: uid('calc'), ...values, profit, margin, createdAt: new Date().toISOString() }, ...data.calculations] }); notify('Pricing calculation saved.'); };
  return <section className="page-body two-col">
    <Panel title="Pricing & Profit" subtitle="Model landed costs, fees and return risk before publishing.">
      <div className="form-grid">{[['cost','Product cost'],['packaging','Packaging'],['shipping','Shipping'],['price','Selling price']].map(([k,l]) => <label key={k}>{l}<input type="number" min="0" value={values[k]} onChange={(e) => set(k, e.target.value)} /></label>)}</div>
      <div className="form-grid">{[['fee','Platform fee %'],['tax','Tax / other %'],['returnRate','Return reserve %']].map(([k,l]) => <label key={k}>{l}<input type="number" min="0" max="100" value={values[k]} onChange={(e) => set(k, e.target.value)} /></label>)}<div className="field-spacer" /></div>
      <button className="primary full" onClick={save}>Save Calculation</button>
    </Panel>
    <Panel title="Live result" subtitle="Calculated from the values on the left">
      <div className="result-grid"><Metric label="Net profit" value={money(profit)} positive={profit >= 0} /><Metric label="Net margin" value={`${margin.toFixed(1)}%`} positive={margin >= 30} /><Metric label="Total cost" value={money(total)} /><Metric label="Break-even" value={money(breakEven)} /></div>
      <div className={`tip ${profit < 0 ? 'danger-tip' : ''}`}>{profit >= 0 ? 'Target a comfortable margin above 30% after all known costs and return reserve.' : 'This selling price loses money after the modeled costs. Increase price or reduce costs.'}</div>
    </Panel>
  </section>;
}
function Metric({ label, value, positive }) { return <div className="metric"><span>{label}</span><strong className={positive === undefined ? '' : positive ? 'positive' : 'negative'}>{value}</strong></div>; }

function Products({ data, setData, notify }) {
  const [query, setQuery] = useState(''); const [editing, setEditing] = useState(null);
  const filtered = data.products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()));
  const save = () => { if (!editing?.name?.trim()) return notify('Product name is required.'); const exists = data.products.some((p) => p.id === editing.id); const products = exists ? data.products.map((p) => p.id === editing.id ? editing : p) : [editing, ...data.products]; setData({ products }); setEditing(null); notify(exists ? 'Product updated.' : 'Product added.'); };
  const remove = (id) => { if (!window.confirm('Delete this product?')) return; setData({ products: data.products.filter((p) => p.id !== id) }); notify('Product deleted.'); };
  const empty = { id: uid('product'), name: '', category: 'Beauty', price: 249, cost: 100, stock: 10, score: 80, status: 'Draft' };
  return <section className="page-body"><Panel title="Products" subtitle="Catalog CRUD with search, stock and listing quality." action={<button className="primary" onClick={() => setEditing(empty)}>+ Add product</button>}>
    <div className="toolbar"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products or categories..." /><span className="count-pill">{filtered.length} products</span></div>
    <div className="table"><div className="table-row head"><span>Product</span><span>Price</span><span>Stock</span><span>Margin</span><span>Score</span><span>Actions</span></div>
      {filtered.map((p) => <div className="table-row" key={p.id}><span><strong>{p.name}</strong><small>{p.category} · {p.status}</small></span><span>{money(p.price)}</span><span className={p.stock < 25 ? 'low-stock' : ''}>{p.stock}</span><span>{p.price ? `${(((p.price - p.cost) / p.price) * 100).toFixed(0)}%` : '0%'}</span><span><b className="score-chip">{p.score}</b></span><span className="row-actions"><button className="ghost" onClick={() => setEditing({ ...p })}>Edit</button><button className="ghost danger" onClick={() => remove(p.id)}>Delete</button></span></div>)}
      {!filtered.length && <Empty title="No products found" text="Try another search or add a new product." />}
    </div>
    {editing && <div className="modal-backdrop"><div className="modal-card"><div className="modal-title"><div><h3>{data.products.some((p) => p.id === editing.id) ? 'Edit product' : 'Add product'}</h3><p>Keep catalog fields accurate for pricing and analytics.</p></div><button className="ghost" onClick={() => setEditing(null)}>Close</button></div>
      <label>Product name<input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></label><label>Category<select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
      <div className="form-grid"><label>Selling price<input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></label><label>Product cost<input type="number" value={editing.cost} onChange={(e) => setEditing({ ...editing, cost: Number(e.target.value) })} /></label><label>Stock<input type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} /></label><label>Listing score<input type="number" min="0" max="100" value={editing.score} onChange={(e) => setEditing({ ...editing, score: Number(e.target.value) })} /></label></div>
      <div className="actions"><button className="secondary" onClick={() => setEditing(null)}>Cancel</button><button className="primary" onClick={save}>Save Product</button></div>
    </div></div>}
  </Panel></section>;
}

function Orders({ data, setData, notify }) {
  const [query, setQuery] = useState('');
  const filtered = data.orders.filter((o) => `${o.id} ${o.product} ${o.status}`.toLowerCase().includes(query.toLowerCase()));
  const updateStatus = (id, status) => { setData({ orders: data.orders.map((o) => o.id === id ? { ...o, status } : o) }); notify('Order status updated.'); };
  return <section className="page-body"><Panel title="Orders" subtitle="Track order lifecycle and revenue status." action={<span className="count-pill">{data.orders.length} orders</span>}>
    <div className="toolbar"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search orders..." /></div>
    <div className="table"><div className="table-row head"><span>Order</span><span>Product</span><span>Amount</span><span>Status</span><span>Date</span></div>{filtered.map((o) => <div className="table-row" key={o.id}><span><strong>{o.id}</strong></span><span>{o.product}</span><span>{money(o.amount)}</span><span><select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></span><span>{o.date}</span></div>)}</div>
  </Panel></section>;
}

function Analytics({ data, revenue, estimatedProfit, avgScore }) {
  const delivered = data.orders.filter((o) => o.status === 'Delivered').length; const avgOrder = data.orders.length ? revenue / data.orders.length : 0;
  return <section className="page-body"><div className="stats-grid"><Stat label="Revenue" value={money(revenue)} meta="Excluding cancelled" /><Stat label="Estimated contribution" value={money(estimatedProfit)} meta="Order cost model" /><Stat label="Avg order value" value={money(avgOrder)} meta={`${data.orders.length} tracked orders`} /><Stat label="Delivered" value={delivered} meta={`${avgScore}/100 listing score`} /></div>
    <div className="two-col"><Panel title="Order mix" subtitle="Current status distribution">{ORDER_STATUSES.map((s) => <div className="metric" key={s}><span>{s}</span><strong>{data.orders.filter((o) => o.status === s).length}</strong></div>)}</Panel><Panel title="Catalog opportunities" subtitle="Products with strong upside">{[...data.products].sort((a,b) => (b.price-b.cost)-(a.price-a.cost)).map((p) => <div className="row" key={p.id}><div><strong>{p.name}</strong><span>Score {p.score}/100 · {p.stock} units</span></div><strong>{money(p.price-p.cost)}</strong></div>)}</Panel></div>
  </section>;
}

function Competitors() {
  const rows = [['Portable Makeup Pouch', '₹349', '4.6', '1,240', 'Strong'], ['Compact Eyebrow Trimmer', '₹279', '4.5', '980', 'Medium'], ['TPU Crystal Phone Cover', '₹299', '4.4', '2,430', 'Strong']];
  return <section className="page-body"><Panel title="Competitor Research" subtitle="A safe research shell ready for an authorized provider."><div className="warning">⚠ Demo research values. Do not treat these examples as live market data. Live collection should use an authorized provider/API.</div><div className="table"><div className="table-row head"><span>Product</span><span>Price</span><span>Rating</span><span>Reviews</span><span>Signal</span></div>{rows.map((r) => <div className="table-row" key={r[0]}>{r.map((cell, i) => <span key={i}>{cell}</span>)}</div>)}</div></Panel></section>;
}

function Assistant({ data }) {
  const [query, setQuery] = useState(''); const [messages, setMessages] = useState([{ role: 'ai', text: 'Hi! I can help with listings, pricing, stock and seller decisions.' }]);
  const ask = () => { if (!query.trim()) return; const text = query.toLowerCase(); let answer = 'I am currently running in safe demo mode. A server-side AI provider can replace these rule-based replies later.'; if (text.includes('stock')) { const low = data.products.filter((p) => p.stock < 25); answer = low.length ? `Low-stock products: ${low.map((p) => p.name).join(', ')}.` : 'No products are below the 25-unit stock threshold.'; } else if (text.includes('margin') || text.includes('profit')) { const avg = data.products.reduce((sum,p) => sum + (p.price-p.cost),0) / Math.max(1,data.products.length); answer = `Average modeled contribution per unit is ${money(avg)}. Check shipping, platform fees and returns before publishing.`; } else if (text.includes('listing')) answer = 'Open AI Listing, add the product details and save the generated draft to your workspace.'; setMessages((m) => [...m, { role: 'user', text: query }, { role: 'ai', text: answer }]); setQuery(''); };
  return <section className="page-body"><Panel title="AI Assistant" subtitle="Provider-ready seller chat. No secrets are stored in the browser."><div className="chat-box">{messages.map((m, i) => <div className={`chat-message ${m.role}`} key={i}><span>{m.role === 'ai' ? 'AI' : 'You'}</span><p>{m.text}</p></div>)}</div><div className="composer"><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask()} placeholder="Ask: Which products have low stock?" /><button className="primary" onClick={ask}>Send</button></div></Panel></section>;
}

function Settings() {
  return <section className="page-body two-col"><Panel title="Workspace settings" subtitle="Basic seller preferences"><label>Workspace name<input defaultValue="Meesho AI Seller Pro" /></label><label>Currency<select defaultValue="INR"><option>INR (₹)</option></select></label><label>Default language<select defaultValue="English"><option>English</option><option>Hindi</option><option>Hinglish</option></select></label></Panel><Panel title="Production roadmap" subtitle="Next integrations after the stable frontend"><div className="roadmap"><div className="roadmap-done">✓ Stable Vite foundation</div><div>○ Supabase Auth + Postgres + RLS</div><div>○ Server-side AI listing endpoint</div><div>○ Supabase Storage for images</div><div>○ Authorized marketplace data/API integration</div></div><div className="provider-note"><strong>Security rule</strong><small>Never place AI provider secrets in browser-exposed VITE_* variables.</small></div></Panel></section>;
}

function Empty({ title, text }) { return <div className="empty"><div className="empty-icon">✦</div><h3>{title}</h3><p>{text}</p></div>; }

createRoot(document.getElementById('root')).render(<AppErrorBoundary><App /></AppErrorBoundary>);
