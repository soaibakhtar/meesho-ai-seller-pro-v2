import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const nav = ['Dashboard', 'AI Listing', 'Pricing & Profit', 'Products', 'Orders', 'Analytics', 'AI Assistant', 'Settings'];

const seedProducts = [
  { id: 1, name: 'Crystal Clear TPU Back Cover', category: 'Mobile Accessories', price: 299, cost: 110, stock: 84, score: 94 },
  { id: 2, name: '2-in-1 Eyebrow Trimmer', category: 'Beauty', price: 249, cost: 96, stock: 41, score: 91 },
  { id: 3, name: 'Solar Devil Eye Car Light', category: 'Car Accessories', price: 399, cost: 140, stock: 22, score: 88 }
];

const seedOrders = [
  { id: 'ORD-1042', product: '2-in-1 Eyebrow Trimmer', amount: 498, status: 'Delivered', date: '18 Aug 2026' },
  { id: 'ORD-1041', product: 'Crystal Clear TPU Back Cover', amount: 299, status: 'Shipped', date: '18 Aug 2026' },
  { id: 'ORD-1040', product: 'Solar Devil Eye Car Light', amount: 399, status: 'Processing', date: '17 Aug 2026' }
];

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function App() {
  const [page, setPage] = useState('Dashboard');
  const [products, setProducts] = useState(seedProducts);
  const [orders, setOrders] = useState(seedOrders);
  const [menuOpen, setMenuOpen] = useState(false);

  const revenue = useMemo(() => orders.reduce((sum, order) => sum + order.amount, 0), [orders]);
  const modeledProfit = useMemo(() => products.reduce((sum, product) => sum + (product.price - product.cost), 0), [products]);
  const avgScore = Math.round(products.reduce((sum, product) => sum + product.score, 0) / Math.max(products.length, 1));

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">M</div>
          <div><strong>Meesho AI</strong><span>Seller Pro</span></div>
        </div>
        <div className="nav-list">
          {nav.map((item) => (
            <button key={item} className={page === item ? 'nav-item active' : 'nav-item'} onClick={() => { setPage(item); setMenuOpen(false); }}>
              <span className="nav-dot" />{item}
            </button>
          ))}
        </div>
        <div className="sidebar-note">
          <strong>Foundation mode</strong>
          <p>Clean Vite app. Cloud database and AI providers can be added without changing the UI shell.</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen((v) => !v)} aria-label="Open menu">☰</button>
          <div>
            <h1>{page}</h1>
            <p>AI-powered tools for faster marketplace selling</p>
          </div>
          <div className="top-actions"><span className="pill">Demo workspace</span><span className="avatar">SA</span></div>
        </header>

        {page === 'Dashboard' && <Dashboard revenue={revenue} modeledProfit={modeledProfit} avgScore={avgScore} products={products} setPage={setPage} />}
        {page === 'AI Listing' && <AIListing products={products} setProducts={setProducts} />}
        {page === 'Pricing & Profit' && <Pricing />}
        {page === 'Products' && <Products products={products} setProducts={setProducts} />}
        {page === 'Orders' && <Orders orders={orders} setOrders={setOrders} />}
        {page === 'Analytics' && <Analytics revenue={revenue} modeledProfit={modeledProfit} products={products} orders={orders} />}
        {page === 'AI Assistant' && <Assistant />}
        {page === 'Settings' && <Settings />}
      </main>
    </div>
  );
}

function Dashboard({ revenue, modeledProfit, avgScore, products, setPage }) {
  return <section className="page-body">
    <div className="hero">
      <div><span className="eyebrow">SELLER COMMAND CENTER</span><h2>Build, price and manage products faster.</h2><p>One clean workspace for your daily marketplace workflow.</p></div>
      <button className="primary" onClick={() => setPage('AI Listing')}>Create AI Listing →</button>
    </div>
    <div className="stats-grid">
      <Stat label="Revenue tracked" value={money(revenue)} meta="From demo orders" />
      <Stat label="Contribution / unit" value={money(modeledProfit)} meta="Catalog model" />
      <Stat label="Products" value={products.length} meta="Catalog size" />
      <Stat label="Avg listing score" value={`${avgScore}/100`} meta="Content quality" />
    </div>
    <div className="two-col">
      <Panel title="Top products" subtitle="Best contribution per unit">
        {products.map((p) => <div className="row" key={p.id}><div><strong>{p.name}</strong><span>{p.category} · {p.stock} units</span></div><strong>{money(p.price - p.cost)}</strong></div>)}
      </Panel>
      <Panel title="AI recommendations" subtitle="Quick actions based on workspace data">
        {['Refresh listings below 90 score', 'Review stock below 25 units', 'Keep target margin above 30%'].map((x) => <div className="recommend" key={x}>✓ {x}</div>)}
      </Panel>
    </div>
  </section>;
}

function Stat({ label, value, meta }) { return <div className="stat-card"><span>{label}</span><strong>{value}</strong><small>{meta}</small></div>; }
function Panel({ title, subtitle, children }) { return <section className="panel"><div className="panel-head"><div><h3>{title}</h3><p>{subtitle}</p></div></div>{children}</section>; }

function AIListing() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Beauty');
  const [price, setPrice] = useState(249);
  const [result, setResult] = useState(null);
  const generate = () => {
    if (!name.trim()) return;
    setResult({ title: `${name.trim()} | Premium Quality, Easy to Use & Travel Friendly`, description: `${name.trim()} designed for convenient everyday use with a practical finish, easy handling and a travel-friendly form factor.`, score: 92, features: ['Premium quality', 'Compact & portable', 'Easy everyday use', 'Durable design', 'Home & travel friendly'], keywords: [name.toLowerCase(), category.toLowerCase(), 'best seller', 'online shopping', 'india'] });
  };
  return <section className="page-body two-col">
    <Panel title="AI Listing Generator" subtitle="Structured local fallback. Add a server-side AI provider later.">
      <label>Product name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Women's Makeup Pouch" /></label>
      <label>Category<select value={category} onChange={(e) => setCategory(e.target.value)}><option>Beauty</option><option>Fashion</option><option>Mobile Accessories</option><option>Home & Kitchen</option><option>Car Accessories</option></select></label>
      <label>Target price<input type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} /></label>
      <button className="primary full" onClick={generate}>Generate Listing</button>
    </Panel>
    <Panel title="Generated result" subtitle="Edit-ready marketplace copy">
      {!result ? <div className="empty">Your generated title, description and keywords will appear here.</div> : <div>
        <div className="score-box"><span>Listing score</span><strong>{result.score}/100</strong></div>
        <h3>{result.title}</h3><p>{result.description}</p>
        <h4>Features</h4>{result.features.map((x) => <div className="check" key={x}>✓ {x}</div>)}
        <h4>Keywords</h4><div className="chips">{result.keywords.map((x) => <span key={x}>{x}</span>)}</div>
        <button className="secondary" onClick={() => navigator.clipboard?.writeText(`${result.title}\n\n${result.description}`)}>Copy listing</button>
      </div>}
    </Panel>
  </section>;
}

function Pricing() {
  const [cost, setCost] = useState(120), [pack, setPack] = useState(10), [ship, setShip] = useState(40), [fee, setFee] = useState(12), [price, setPrice] = useState(249);
  const platform = price * fee / 100; const total = cost + pack + ship + platform; const profit = price - total; const margin = price ? (profit / price) * 100 : 0; const breakEven = (cost + pack + ship) / Math.max(0.01, (1 - fee / 100));
  return <section className="page-body two-col"><Panel title="Pricing & Profit" subtitle="Model economics before publishing.">{[['Product cost', cost, setCost], ['Packaging', pack, setPack], ['Shipping', ship, setShip], ['Platform fee %', fee, setFee], ['Selling price', price, setPrice]].map(([l,v,s]) => <label key={l}>{l}<input type="number" min="0" value={v} onChange={(e) => s(Number(e.target.value))} /></label>)}<button className="primary full" onClick={() => {}}>Save calculation</button></Panel><Panel title="Result" subtitle="Live calculation"><div className="result-grid"><Metric label="Net profit" value={money(profit)} /><Metric label="Margin" value={`${margin.toFixed(1)}%`} /><Metric label="Total costs" value={money(total)} /><Metric label="Break-even" value={money(breakEven)} /></div><div className="tip">Keep a return/discount buffer before publishing your final price.</div></Panel></section>;
}
function Metric({ label, value }) { return <div className="metric"><span>{label}</span><strong>{value}</strong></div>; }

function Products({ products, setProducts }) {
  const [query, setQuery] = useState(''); const [form, setForm] = useState(null);
  const filtered = products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()));
  const save = () => { if (!form?.name?.trim()) return; const exists = products.some((p) => p.id === form.id); setProducts(exists ? products.map((p) => p.id === form.id ? form : p) : [form, ...products]); setForm(null); };
  return <section className="page-body"><Panel title="Products" subtitle="Manage your catalog locally while the cloud layer is added."><div className="toolbar"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..."/><button className="primary" onClick={() => setForm({ id: Date.now(), name: '', category: 'Beauty', price: 0, cost: 0, stock: 0, score: 80 })}>+ Add product</button></div><div className="table"><div className="table-row head"><span>Product</span><span>Price</span><span>Stock</span><span>Margin</span><span>Action</span></div>{filtered.map((p) => <div className="table-row" key={p.id}><span><strong>{p.name}</strong><small>{p.category}</small></span><span>{money(p.price)}</span><span>{p.stock}</span><span>{p.price ? `${(((p.price - p.cost) / p.price) * 100).toFixed(0)}%` : '0%'}</span><button className="ghost" onClick={() => setForm(p)}>Edit</button></div>)}</div></Panel>{form && <div className="modal"><div className="modal-card"><div className="panel-head"><h3>{products.some((p) => p.id === form.id) ? 'Edit product' : 'Add product'}</h3><button className="ghost" onClick={() => setForm(null)}>Close</button></div>{[['name','Product name','text'],['category','Category','text'],['price','Price','number'],['cost','Cost','number'],['stock','Stock','number'],['score','Score','number']].map(([k,l,t]) => <label key={k}>{l}<input type={t} value={form[k]} onChange={(e) => setForm({ ...form, [k]: t === 'number' ? Number(e.target.value) : e.target.value })} /></label>)}<button className="primary full" onClick={save}>Save product</button></div></div>}</section>;
}

function Orders({ orders, setOrders }) { const statuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled']; return <section className="page-body"><Panel title="Orders" subtitle="Simple lifecycle management."><div className="table"><div className="table-row head"><span>Order</span><span>Product</span><span>Amount</span><span>Status</span><span>Date</span></div>{orders.map((o) => <div className="table-row" key={o.id}><span><strong>{o.id}</strong></span><span>{o.product}</span><span>{money(o.amount)}</span><span><select value={o.status} onChange={(e) => setOrders(orders.map((x) => x.id === o.id ? { ...x, status: e.target.value } : x))}>{statuses.map((s) => <option key={s}>{s}</option>)}</select></span><span>{o.date}</span></div>)}</div></Panel></section>; }
function Analytics({ revenue, modeledProfit, products, orders }) { return <section className="page-body"><div className="stats-grid"><Stat label="Revenue" value={money(revenue)} meta="Order data"/><Stat label="Profit model" value={money(modeledProfit)} meta="Catalog"/><Stat label="Orders" value={orders.length} meta="Tracked"/><Stat label="Products" value={products.length} meta="Catalog"/></div><div className="two-col"><Panel title="Order status" subtitle="Current mix">{['Processing','Shipped','Delivered','Cancelled'].map((s) => <div className="metric" key={s}><span>{s}</span><strong>{orders.filter((o) => o.status === s).length}</strong></div>)}</Panel><Panel title="Catalog opportunities" subtitle="Contribution per unit">{products.map((p) => <div className="row" key={p.id}><div><strong>{p.name}</strong><span>Score {p.score}/100</span></div><strong>{money(p.price-p.cost)}</strong></div>)}</Panel></div></section>; }
function Assistant() { const [q,setQ]=useState(''); const [messages,setMessages]=useState(['Hi! Ask me about pricing, listings, stock or products.']); const ask=()=>{if(!q.trim())return;const t=q.toLowerCase();let a='I am in local demo mode. Connect a server-side AI provider for live answers.';if(t.includes('margin'))a='Aim for a healthy margin after shipping, platform fees, tax and return risk.';if(t.includes('stock'))a='Review products below your stock threshold and plan replenishment before they hit zero.';setMessages([...messages,`You: ${q}`,`AI: ${a}`]);setQ('')};return <section className="page-body"><Panel title="AI Assistant" subtitle="Provider-ready chat shell."><div className="chat">{messages.map((m,i)=><div key={i} className="chat-line">{m}</div>)}</div><div className="composer"><input value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&ask()} placeholder="Ask about your seller workflow..."/><button className="primary" onClick={ask}>Send</button></div></Panel></section>; }
function Settings() { return <section className="page-body two-col"><Panel title="Workspace" subtitle="Basic app settings"><label>Workspace name<input defaultValue="Meesho AI Seller Pro"/></label><label>Currency<select defaultValue="INR"><option>INR (₹)</option></select></label></Panel><Panel title="Production roadmap" subtitle="Next layer after build verification">{['Supabase Auth', 'Postgres + Row Level Security', 'Server-side AI endpoint', 'Object storage for product images', 'Authorized marketplace integrations'].map((x)=><div className="recommend" key={x}>○ {x}</div>)}</Panel></section>; }

createRoot(document.getElementById('root')).render(<App />);
