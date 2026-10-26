import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AddPlainProduct from '../components/AddPlainProduct';
import { 
  ShoppingBag, Plus, Edit, Trash2, Search, Filter,
  RefreshCw, Eye, Package, Tag, DollarSign,
  TrendingUp, TrendingDown, CheckCircle, XCircle,
  AlertCircle, Star, ChevronRight, Image, MoreVertical,
  Grid, List, ArrowUp, ArrowDown
} from 'lucide-react';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

/* ── design tokens ────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg-base:       #0d0f0e;
    --bg-surface:    #141714;
    --bg-raised:     #1c201c;
    --bg-hover:      #222722;
    --green:         #84e08a;
    --green-glow:    rgba(132,224,138,0.12);
    --green-glow2:   rgba(132,224,138,0.06);
    --border:        #2a2f2a;
    --border-green:  rgba(132,224,138,0.22);
    --text:          #e8f0e9;
    --text-muted:    #7a8a7b;
    --text-faint:    #4a554b;
    --red:           #f87171;
    --amber:         #f59e0b;
    --blue:          #60a5fa;
    --purple:        #c084fc;
  }

  .pp-root { font-family:'DM Sans',sans-serif; color:var(--text); }
  .pp-root * { box-sizing:border-box; }

  /* ── topbar ── */
  .pp-topbar { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1.25rem; }
  .pp-title { font-family:'Syne',sans-serif; font-size:1.35rem; font-weight:700; letter-spacing:-0.03em; color:var(--text); margin-bottom:2px; }
  .pp-subtitle { font-family:'DM Mono',monospace; font-size:0.65rem; color:var(--text-faint); text-transform:uppercase; letter-spacing:0.06em; }
  .pp-action-row { display:flex; gap:8px; flex-wrap:wrap; }

  /* ── buttons ── */
  .pp-btn { display:flex; align-items:center; gap:6px; padding:7px 13px; border-radius:8px; font-size:0.75rem; font-weight:500; cursor:pointer; border:1px solid transparent; transition:all .2s; font-family:'DM Sans',sans-serif; }
  .pp-btn-primary { background:var(--green); color:#0d0f0e; font-weight:600; }
  .pp-btn-primary:hover { opacity:.85; }
  .pp-btn-ghost { background:transparent; border-color:var(--border); color:var(--text-muted); }
  .pp-btn-ghost:hover { border-color:var(--border-green); color:var(--green); background:var(--green-glow2); }
  .pp-btn-icon { width:32px; height:32px; padding:0; justify-content:center; background:transparent; border:1px solid var(--border); color:var(--text-muted); border-radius:8px; }
  .pp-btn-icon:hover { border-color:var(--border-green); color:var(--green); background:var(--green-glow2); }
  .pp-btn-danger { background:rgba(248,113,113,0.1); border-color:rgba(248,113,113,0.25); color:var(--red); }
  .pp-btn-danger:hover { background:rgba(248,113,113,0.18); }

  /* ── section label ── */
  .pp-section-label { font-family:'DM Mono',monospace; font-size:0.62rem; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-faint); margin-bottom:0.75rem; display:flex; align-items:center; gap:8px; }
  .pp-section-label::after { content:''; flex:1; height:1px; background:var(--border); }

  /* ── stat cards ── */
  .pp-stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0.9rem; margin-bottom:1.25rem; }
  .pp-stat-card { background:var(--bg-raised); border:1px solid var(--border); border-radius:13px; padding:1rem; position:relative; overflow:hidden; transition:border-color .25s, transform .2s; }
  .pp-stat-card:hover { border-color:var(--border-green); transform:translateY(-2px); }
  .pp-stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--border-green),transparent); opacity:0; transition:opacity .25s; }
  .pp-stat-card:hover::before { opacity:1; }
  .pp-stat-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem; }
  .pp-stat-icon { width:32px; height:32px; border-radius:8px; background:var(--green-glow); border:1px solid var(--border-green); display:flex; align-items:center; justify-content:center; color:var(--green); }
  .pp-stat-icon.red    { background:rgba(248,113,113,0.1); border-color:rgba(248,113,113,0.2); color:var(--red); }
  .pp-stat-icon.amber  { background:rgba(245,158,11,0.1);  border-color:rgba(245,158,11,0.2);  color:var(--amber); }
  .pp-stat-icon.blue   { background:rgba(96,165,250,0.1);  border-color:rgba(96,165,250,0.2);  color:var(--blue); }
  .pp-stat-change { font-family:'DM Mono',monospace; font-size:0.63rem; display:flex; align-items:center; gap:2px; }
  .pp-stat-change.up { color:var(--green); }
  .pp-stat-change.down { color:var(--red); }
  .pp-stat-val { font-family:'Syne',sans-serif; font-size:1.55rem; font-weight:700; letter-spacing:-0.03em; color:var(--text); line-height:1; margin-bottom:3px; }
  .pp-stat-name { font-size:0.76rem; font-weight:500; color:var(--text-muted); margin-bottom:1px; }
  .pp-stat-desc { font-size:0.65rem; color:var(--text-faint); font-family:'DM Mono',monospace; }

  /* ── bulk bar ── */
  .pp-bulk-bar { background:var(--green-glow); border:1px solid var(--border-green); border-radius:11px; padding:0.9rem 1rem; display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1rem; }
  .pp-bulk-info { display:flex; align-items:center; gap:10px; }
  .pp-bulk-icon { width:32px; height:32px; border-radius:8px; background:rgba(132,224,138,0.2); border:1px solid var(--border-green); display:flex; align-items:center; justify-content:center; color:var(--green); }
  .pp-bulk-title { font-size:0.82rem; font-weight:600; color:var(--text); }
  .pp-bulk-sub { font-family:'DM Mono',monospace; font-size:0.63rem; color:var(--text-muted); }

  /* ── products panel ── */
  .pp-panel { background:var(--bg-raised); border:1px solid var(--border); border-radius:14px; overflow:hidden; }
  .pp-panel-header { padding:1rem 1.1rem; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
  .pp-panel-title { font-family:'Syne',sans-serif; font-size:0.9rem; font-weight:700; color:var(--text); display:flex; align-items:center; gap:7px; }
  .pp-panel-title svg { color:var(--green); width:15px; height:15px; }
  .pp-panel-count { font-family:'DM Mono',monospace; font-size:0.63rem; color:var(--text-faint); margin-left:4px; }
  .pp-panel-tools { display:flex; align-items:center; gap:7px; flex-wrap:wrap; }

  /* search */
  .pp-search-wrap { position:relative; }
  .pp-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--text-faint); pointer-events:none; }
  .pp-search { padding:7px 10px 7px 30px; background:var(--bg-surface); border:1px solid var(--border); border-radius:8px; font-size:0.75rem; color:var(--text); font-family:'DM Sans',sans-serif; outline:none; transition:border-color .2s; width:200px; }
  .pp-search::placeholder { color:var(--text-faint); }
  .pp-search:focus { border-color:var(--border-green); }

  /* select */
  .pp-select { padding:6px 10px; background:var(--bg-surface); border:1px solid var(--border); border-radius:8px; font-size:0.72rem; color:var(--text-muted); font-family:'DM Mono',monospace; outline:none; cursor:pointer; transition:border-color .2s; }
  .pp-select:focus { border-color:var(--border-green); }

  /* view toggle */
  .pp-view-toggle { display:flex; border:1px solid var(--border); border-radius:8px; overflow:hidden; }
  .pp-view-btn { width:30px; height:30px; display:flex; align-items:center; justify-content:center; background:transparent; border:none; color:var(--text-faint); cursor:pointer; transition:all .2s; }
  .pp-view-btn.active { background:var(--green-glow); color:var(--green); }
  .pp-view-btn:hover:not(.active) { background:var(--bg-hover); color:var(--text-muted); }

  /* filter row */
  .pp-filter-row { padding:0.75rem 1.1rem; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px; flex-wrap:wrap; }

  /* ── grid cards ── */
  .pp-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0.85rem; padding:1rem; }
  .pp-card { background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; overflow:hidden; transition:border-color .25s, transform .2s; position:relative; }
  .pp-card:hover { border-color:var(--border-green); transform:translateY(-2px); }

  .pp-card-checkbox { position:absolute; top:10px; left:10px; z-index:10; width:16px; height:16px; accent-color:var(--green); cursor:pointer; }
  .pp-card-img { height:160px; background:var(--bg-raised); position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; color:var(--text-faint); }
  .pp-card-img img { width:100%; height:100%; object-fit:cover; transition:transform .3s; }
  .pp-card:hover .pp-card-img img { transform:scale(1.05); }
  .pp-card-status { position:absolute; top:8px; right:8px; }
  .pp-card-discount { position:absolute; top:8px; left:28px; background:var(--amber); color:#0d0f0e; padding:2px 7px; border-radius:20px; font-family:'DM Mono',monospace; font-size:0.6rem; font-weight:600; }

  .pp-card-body { padding:0.85rem; }
  .pp-card-name { font-size:0.82rem; font-weight:600; color:var(--text); margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pp-card-sku { font-family:'DM Mono',monospace; font-size:0.62rem; color:var(--text-faint); margin-bottom:0.6rem; }
  .pp-card-price-row { display:flex; align-items:baseline; gap:7px; margin-bottom:0.5rem; }
  .pp-card-price { font-family:'Syne',sans-serif; font-size:1rem; font-weight:700; color:var(--text); }
  .pp-card-price-orig { font-family:'DM Mono',monospace; font-size:0.65rem; color:var(--text-faint); text-decoration:line-through; }
  .pp-card-stock { font-family:'DM Mono',monospace; font-size:0.63rem; color:var(--text-muted); }
  .pp-card-stock.low { color:var(--amber); }

  .pp-cat-row { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:0.65rem; }
  .pp-cat-chip { padding:2px 7px; background:rgba(96,165,250,0.1); border:1px solid rgba(96,165,250,0.2); color:var(--blue); border-radius:20px; font-family:'DM Mono',monospace; font-size:0.58rem; }
  .pp-cat-chip-more { padding:2px 7px; background:var(--bg-raised); border:1px solid var(--border); color:var(--text-faint); border-radius:20px; font-family:'DM Mono',monospace; font-size:0.58rem; }

  .pp-card-footer { display:flex; align-items:center; justify-content:space-between; padding-top:0.6rem; border-top:1px solid var(--border); }
  .pp-card-actions { display:flex; gap:4px; }
  .pp-card-act-btn { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; background:transparent; border:1px solid transparent; cursor:pointer; transition:all .2s; }
  .pp-card-act-btn.edit { color:var(--blue); }
  .pp-card-act-btn.edit:hover { background:rgba(96,165,250,0.12); border-color:rgba(96,165,250,0.25); }
  .pp-card-act-btn.del  { color:var(--red); }
  .pp-card-act-btn.del:hover  { background:rgba(248,113,113,0.12); border-color:rgba(248,113,113,0.25); }
  .pp-card-date { font-family:'DM Mono',monospace; font-size:0.6rem; color:var(--text-faint); }

  /* ── status chip ── */
  .pp-chip { display:inline-flex; align-items:center; padding:2px 8px; border-radius:20px; font-family:'DM Mono',monospace; font-size:0.6rem; font-weight:500; border:1px solid transparent; }
  .pp-chip-stock   { background:rgba(132,224,138,0.1); color:var(--green); border-color:var(--border-green); }
  .pp-chip-nostock { background:rgba(248,113,113,0.1); color:var(--red);   border-color:rgba(248,113,113,0.25); }

  /* ── list table ── */
  .pp-table { width:100%; border-collapse:collapse; }
  .pp-table th { padding:9px 12px; text-align:left; font-family:'DM Mono',monospace; font-size:0.6rem; text-transform:uppercase; letter-spacing:0.07em; color:var(--text-faint); border-bottom:1px solid var(--border); font-weight:500; }
  .pp-table td { padding:10px 12px; border-bottom:1px solid var(--border); font-size:0.78rem; color:var(--text-muted); }
  .pp-table tr:last-child td { border-bottom:none; }
  .pp-table tbody tr { transition:background .15s; }
  .pp-table tbody tr:hover { background:var(--bg-hover); }
  .pp-table-thumb { width:38px; height:38px; border-radius:7px; overflow:hidden; background:var(--bg-raised); border:1px solid var(--border); flex-shrink:0; display:flex; align-items:center; justify-content:center; color:var(--text-faint); }
  .pp-table-thumb img { width:100%; height:100%; object-fit:cover; }
  .pp-table-name { font-weight:600; color:var(--text); font-size:0.78rem; }
  .pp-table-sku  { font-family:'DM Mono',monospace; font-size:0.62rem; color:var(--text-faint); }
  .pp-table-price { font-family:'Syne',sans-serif; font-size:0.85rem; font-weight:700; color:var(--text); }

  /* ── loading / error / empty ── */
  .pp-center { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:4rem 1rem; text-align:center; }
  .pp-spinner { width:34px; height:34px; border-radius:50%; border:2px solid var(--border); border-top-color:var(--green); animation:pp-spin .7s linear infinite; margin-bottom:1rem; }
  @keyframes pp-spin { to { transform:rotate(360deg); } }
  .pp-center-title { font-family:'Syne',sans-serif; font-size:0.95rem; font-weight:700; color:var(--text); margin-bottom:3px; }
  .pp-center-sub { font-size:0.75rem; color:var(--text-muted); }

  .pp-err-banner { display:flex; align-items:center; gap:10px; background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.2); border-radius:10px; padding:0.85rem 1rem; margin-bottom:1rem; }
  .pp-err-icon { color:var(--red); flex-shrink:0; }
  .pp-err-title { font-size:0.78rem; font-weight:600; color:var(--red); }
  .pp-err-msg   { font-size:0.72rem; color:var(--text-muted); }
  .pp-err-retry { margin-left:auto; padding:5px 11px; background:rgba(248,113,113,0.1); border:1px solid rgba(248,113,113,0.25); color:var(--red); border-radius:7px; font-size:0.72rem; cursor:pointer; font-family:'DM Sans',sans-serif; transition:background .2s; flex-shrink:0; }
  .pp-err-retry:hover { background:rgba(248,113,113,0.18); }

  @media (max-width:1100px) { .pp-grid { grid-template-columns:repeat(3,1fr); } }
  @media (max-width:800px)  { .pp-grid { grid-template-columns:repeat(2,1fr); } .pp-stat-grid { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:520px)  { .pp-grid { grid-template-columns:1fr; } }
`;

/* ══════════════════════════════════════════════════════════════════════════ */
const PlainProductsSection = () => {
  const [products, setProducts]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [searchTerm, setSearchTerm]         = useState('');
  const [filters, setFilters]               = useState({ category:'all', status:'all', sortBy:'recent' });
  const [showAddPlainProduct, setShowAddPlainProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stats, setStats]                   = useState({ totalProducts:0, inStock:0, outOfStock:0, lowStock:0 });
  const [categories, setCategories]         = useState([]);
  const [viewMode, setViewMode]             = useState('grid');
  const [selectedProducts, setSelectedProducts] = useState([]);

  /* ── fetch ── */
  const fetchProducts = async () => {
    try {
      setLoading(true); setError(null);
      const { data:{ session } } = await supabase.auth.getSession();
      if (!session) { setError('Please log in to view products'); setLoading(false); return; }
      const token = session.access_token;
      const res = await axios.get('https://plangex-backend.onrender.com/api/users/admin-plain-products', {
        headers:{ 'Authorization':`Bearer ${token}`, 'Content-Type':'application/json' }
      });

      let raw = [];
      if (Array.isArray(res.data)) raw = res.data;
      else if (res.data?.products) raw = res.data.products;
      else if (res.data?.data)     raw = res.data.data;
      else if (typeof res.data === 'object') raw = Object.values(res.data);

      const tx = raw.map(p => ({
        id:           p.product_id || p.id || Math.random().toString(36).substr(2,9),
        sku:          p.skuid || p.sku || `SKU-${Date.now()}`,
        name:         p.product_name || p.name || 'Unnamed Product',
        description:  p.product_description || p.description || '',
        price:        parseFloat(p.product_price || p.price || 0),
        sales_price:  parseFloat(p.sales_price || p.sale_price || p.price || 0),
        discount:     parseFloat(p.product_discount || p.discount || 0),
        stock:        parseInt(p.product_stock || p.stock || 0),
        status:       p.status || (p.product_stock > 0 ? 'In Stock' : 'Out of Stock'),
        categories:   p.product_categories || p.categories || [],
        images:       p.product_images || p.images || [],
        created_at:   p.created_at || new Date().toISOString(),
        views:        p.views || 0,
        sales:        p.sales || 0,
      }));

      setProducts(tx);
      const cats = new Set();
      tx.forEach(p => (p.categories||[]).forEach(c => { if(c) cats.add(c.toLowerCase()); }));
      setCategories(Array.from(cats));
      setStats({
        totalProducts: tx.length,
        inStock:       tx.filter(p => p.status==='In Stock').length,
        outOfStock:    tx.filter(p => p.status==='Out of Stock').length,
        lowStock:      tx.filter(p => p.stock>0 && p.stock<=10).length,
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      const { data:{ session } } = await supabase.auth.getSession();
      if (!session) { toast.error('Please log in'); return; }
      const token = session.access_token;
      const res = await axios.delete('https://plangex-backend.onrender.com/api/users/products/plain-product', {
        headers:{ 'Authorization':`Bearer ${token}`, 'Content-Type':'application/json' },
        data:{ ids:[productId] }
      });
      if (res.data.message || res.status===200) {
        setProducts(prev => prev.filter(p => p.id!==productId));
        toast.success('Product deleted');
        fetchProducts();
      }
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to delete'); }
  };

  const deleteMultiple = async (ids) => {
    if (!ids?.length) { toast.error('Select products first'); return; }
    if (!window.confirm(`Delete ${ids.length} product(s)?`)) return;
    try {
      const { data:{ session } } = await supabase.auth.getSession();
      if (!session) return;
      const token = session.access_token;
      const res = await axios.delete('https://plangex-backend.onrender.com/api/users/products/plain-product', {
        headers:{ 'Authorization':`Bearer ${token}`, 'Content-Type':'application/json' },
        data:{ ids }
      });
      if (res.data.message || res.status===200) {
        setProducts(prev => prev.filter(p => !ids.includes(p.id)));
        setSelectedProducts([]);
        toast.success(`${ids.length} product(s) deleted`);
        fetchProducts();
      }
    } catch (err) { toast.error('Failed to delete products'); }
  };

  const toggleSel = (id) => setSelectedProducts(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);
  const toggleAll = () => setSelectedProducts(prev => prev.length===filteredProducts.length ? [] : filteredProducts.map(p=>p.id));

  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = products.filter(p => {
    if (!p) return false;
    const q = searchTerm.toLowerCase();
    const ms = (p.name||'').toLowerCase().includes(q) || (p.sku||'').toLowerCase().includes(q);
    const mc = filters.category==='all' || (Array.isArray(p.categories) && p.categories.includes(filters.category));
    const mst = filters.status==='all' || p.status===filters.status;
    return ms && mc && mst;
  }).sort((a,b) => {
    if (filters.sortBy==='price_high') return (b.price||0)-(a.price||0);
    if (filters.sortBy==='price_low')  return (a.price||0)-(b.price||0);
    if (filters.sortBy==='stock')      return (b.stock||0)-(a.stock||0);
    if (filters.sortBy==='name')       return (a.name||'').localeCompare(b.name||'');
    if (filters.sortBy==='sales')      return (b.sales||0)-(a.sales||0);
    return new Date(b.created_at||0)-new Date(a.created_at||0);
  });

  /* ── derived stat cards ── */
  const statCards = [
    { title:'Total Products', val:stats.totalProducts, desc:'all in catalogue',   icon:<Package size={14}/>,      variant:'',      change:'+5.2%', trend:'up' },
    { title:'In Stock',       val:stats.inStock,       desc:'available for sale', icon:<CheckCircle size={14}/>,  variant:'',      change:'+3.1%', trend:'up' },
    { title:'Out of Stock',   val:stats.outOfStock,    desc:'needs restocking',   icon:<XCircle size={14}/>,      variant:'red',   change:'-1.5%', trend:'down' },
    { title:'Low Stock',      val:stats.lowStock,      desc:'less than 10 items', icon:<AlertCircle size={14}/>,  variant:'amber', change:'+2.3%', trend:'up' },
  ];

  /* ── sub-components ── */
  const ProductCard = ({ product }) => (
    <motion.div initial={{ opacity:0, scale:.96 }} animate={{ opacity:1, scale:1 }} transition={{ duration:.2 }} className="pp-card">
      <input type="checkbox" className="pp-card-checkbox" checked={selectedProducts.includes(product.id)} onChange={() => toggleSel(product.id)}/>

      <div className="pp-card-img">
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} onError={e=>{ e.target.onerror=null; e.target.src='https://via.placeholder.com/300x200?text=No+Image'; }}/>
          : <Image size={28}/>
        }
        <div className="pp-card-status">
          <span className={`pp-chip ${product.status==='In Stock'?'pp-chip-stock':'pp-chip-nostock'}`}>{product.status||'In Stock'}</span>
        </div>
        {product.discount>0 && <div className="pp-card-discount">-{product.discount}%</div>}
      </div>

      <div className="pp-card-body">
        <div className="pp-card-name">{product.name||'Unnamed'}</div>
        <div className="pp-card-sku">{product.sku}</div>

        <div className="pp-card-price-row">
          <span className="pp-card-price">GHC {(product.sales_price||product.price||0).toFixed(2)}</span>
          {product.discount>0 && product.price>product.sales_price &&
            <span className="pp-card-price-orig">GHC {(product.price||0).toFixed(2)}</span>}
        </div>

        <div className={`pp-card-stock${(product.stock||0)<=10?' low':''}`}>{product.stock||0} in stock</div>

        <div className="pp-cat-row" style={{ marginTop:6 }}>
          {(product.categories||[]).slice(0,2).map((c,i) => <span key={i} className="pp-cat-chip">{c}</span>)}
          {(product.categories||[]).length>2 && <span className="pp-cat-chip-more">+{product.categories.length-2}</span>}
        </div>

        <div className="pp-card-footer">
          <div className="pp-card-actions">
            <button className="pp-card-act-btn edit" onClick={e=>{ e.stopPropagation(); setSelectedProduct(product); setShowAddPlainProduct(true); }}><Edit size={12}/></button>
            <button className="pp-card-act-btn del"  onClick={e=>{ e.stopPropagation(); deleteProduct(product.id); }}><Trash2 size={12}/></button>
          </div>
          <span className="pp-card-date">{product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}</span>
        </div>
      </div>
    </motion.div>
  );

  const ProductRow = ({ product }) => (
    <tr>
      <td><input type="checkbox" style={{ accentColor:'var(--green)', width:14, height:14, cursor:'pointer' }} checked={selectedProducts.includes(product.id)} onChange={() => toggleSel(product.id)}/></td>
      <td>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div className="pp-table-thumb">
            {product.images?.[0] ? <img src={product.images[0]} alt={product.name}/> : <Image size={14}/>}
          </div>
          <div>
            <div className="pp-table-name">{product.name}</div>
            <div className="pp-table-sku">{product.sku}</div>
          </div>
        </div>
      </td>
      <td>
        <div className="pp-table-price">GHC {(product.sales_price||product.price||0).toFixed(2)}</div>
        {product.discount>0 && <div style={{ fontFamily:'DM Mono,monospace', fontSize:'0.62rem', color:'var(--text-faint)', textDecoration:'line-through' }}>GHC {(product.price||0).toFixed(2)}</div>}
      </td>
      <td><span className={`pp-chip ${product.status==='In Stock'?'pp-chip-stock':'pp-chip-nostock'}`}>{product.status}</span></td>
      <td style={{ fontFamily:'DM Mono,monospace', fontSize:'0.72rem', color:(product.stock||0)<=10?'var(--amber)':'var(--text-muted)' }}>{product.stock||0}</td>
      <td>
        <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
          {(product.categories||[]).slice(0,2).map((c,i)=><span key={i} className="pp-cat-chip">{c}</span>)}
        </div>
      </td>
      <td style={{ fontFamily:'DM Mono,monospace', fontSize:'0.65rem' }}>{product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}</td>
      <td>
        <div style={{ display:'flex', gap:5 }}>
          <button className="pp-card-act-btn edit" onClick={() => { setSelectedProduct(product); setShowAddPlainProduct(true); }}><Edit size={12}/></button>
          <button className="pp-card-act-btn del"  onClick={() => deleteProduct(product.id)}><Trash2 size={12}/></button>
        </div>
      </td>
    </tr>
  );

  /* ── show add form ── */
  if (showAddPlainProduct) return (
    <>
      <style>{styles}</style>
      <AddPlainProduct
        selectedProduct={selectedProduct}
        onClose={() => { setShowAddPlainProduct(false); setSelectedProduct(null); }}
        onSuccess={() => { setShowAddPlainProduct(false); setSelectedProduct(null); fetchProducts(); }}
      />
    </>
  );

  /* ── loading ── */
  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="pp-root">
        {/* keep topbar visible */}
        <div className="pp-topbar">
          <div><h2 className="pp-title">Plain Products</h2><p className="pp-subtitle">Plain product catalogue</p></div>
          <div className="pp-action-row">
            <button className="pp-btn pp-btn-icon" onClick={fetchProducts}><RefreshCw size={13}/></button>
            <button className="pp-btn pp-btn-primary" onClick={() => { setSelectedProduct(null); setShowAddPlainProduct(true); }}><Plus size={13}/>Add Product</button>
          </div>
        </div>
        <div className="pp-center"><div className="pp-spinner"/><p className="pp-center-title">Loading products…</p><p className="pp-center-sub">Fetching catalogue</p></div>
      </div>
    </>
  );

  /* ── main ── */
  return (
    <>
      <style>{styles}</style>
      <div className="pp-root">

        {/* topbar */}
        <div className="pp-topbar">
          <div>
            <h2 className="pp-title">Plain Products</h2>
            <p className="pp-subtitle">Plain product catalogue · {products.length} items</p>
          </div>
          <div className="pp-action-row">
            <button className="pp-btn pp-btn-icon" onClick={fetchProducts} title="Refresh"><RefreshCw size={13}/></button>
            <button className="pp-btn pp-btn-primary" onClick={() => { setSelectedProduct(null); setShowAddPlainProduct(true); }}>
              <Plus size={13}/> Add Product
            </button>
          </div>
        </div>

        {/* error banner */}
        {error && (
          <div className="pp-err-banner">
            <AlertCircle size={15} className="pp-err-icon"/>
            <div><div className="pp-err-title">Error loading products</div><div className="pp-err-msg">{error}</div></div>
            <button className="pp-err-retry" onClick={fetchProducts}>Retry</button>
          </div>
        )}

        {/* stat cards */}
        <p className="pp-section-label">Catalogue Stats</p>
        <div className="pp-stat-grid">
          {statCards.map((c,i) => (
            <motion.div key={i} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.07 }} className="pp-stat-card">
              <div className="pp-stat-header">
                <div className={`pp-stat-icon ${c.variant}`}>{c.icon}</div>
                <span className={`pp-stat-change ${c.trend}`}>
                  {c.trend==='up'?<ArrowUp size={9}/>:<ArrowDown size={9}/>}{c.change}
                </span>
              </div>
              <div className="pp-stat-val">{c.val}</div>
              <div className="pp-stat-name">{c.title}</div>
              <div className="pp-stat-desc">{c.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* bulk bar */}
        {selectedProducts.length > 0 && (
          <div className="pp-bulk-bar">
            <div className="pp-bulk-info">
              <div className="pp-bulk-icon"><Package size={14}/></div>
              <div>
                <div className="pp-bulk-title">{selectedProducts.length} product{selectedProducts.length>1?'s':''} selected</div>
                <div className="pp-bulk-sub">perform bulk actions</div>
              </div>
            </div>
            <div className="pp-action-row">
              <button className="pp-btn pp-btn-danger" onClick={() => deleteMultiple(selectedProducts)}><Trash2 size={12}/> Delete Selected</button>
              <button className="pp-btn pp-btn-ghost" onClick={() => setSelectedProducts([])}>Clear</button>
            </div>
          </div>
        )}

        {/* products panel */}
        <div className="pp-panel">
          {/* panel header */}
          <div className="pp-panel-header">
            <div className="pp-panel-title">
              <ShoppingBag/> All Products
              <span className="pp-panel-count">({filteredProducts.length})</span>
            </div>
            <div className="pp-panel-tools">
              {/* view toggle */}
              <div className="pp-view-toggle">
                <button className={`pp-view-btn${viewMode==='grid'?' active':''}`} onClick={() => setViewMode('grid')}><Grid size={13}/></button>
                <button className={`pp-view-btn${viewMode==='list'?' active':''}`} onClick={() => setViewMode('list')}><List size={13}/></button>
              </div>
              {/* search */}
              <div className="pp-search-wrap">
                <Search size={12} className="pp-search-icon"/>
                <input className="pp-search" type="text" placeholder="Search products…" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
              </div>
              {/* sort */}
              <select className="pp-select" value={filters.sortBy} onChange={e=>setFilters(p=>({...p,sortBy:e.target.value}))}>
                <option value="recent">Most Recent</option>
                <option value="name">Name</option>
                <option value="price_high">Price ↓</option>
                <option value="price_low">Price ↑</option>
                <option value="stock">Stock</option>
                <option value="sales">Sales</option>
              </select>
            </div>
          </div>

          {/* filter row */}
          <div className="pp-filter-row">
            <select className="pp-select" value={filters.category} onChange={e=>setFilters(p=>({...p,category:e.target.value}))}>
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
            <select className="pp-select" value={filters.status} onChange={e=>setFilters(p=>({...p,status:e.target.value}))}>
              <option value="all">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            {filteredProducts.length > 0 && (
              <button className="pp-btn pp-btn-ghost" style={{ padding:'5px 10px', fontSize:'0.7rem' }} onClick={toggleAll}>
                {selectedProducts.length===filteredProducts.length?'Deselect All':'Select All'}
              </button>
            )}
          </div>

          {/* products display */}
          {filteredProducts.length > 0 ? (
            viewMode==='grid' ? (
              <div className="pp-grid">
                {filteredProducts.map((p,i) => <ProductCard key={p.id||i} product={p}/>)}
              </div>
            ) : (
              <div style={{ overflowX:'auto', padding:'0.5rem 0' }}>
                <table className="pp-table">
                  <thead>
                    <tr>
                      <th style={{ width:36 }}>
                        <input type="checkbox" style={{ accentColor:'var(--green)', cursor:'pointer' }}
                          checked={selectedProducts.length===filteredProducts.length&&filteredProducts.length>0}
                          onChange={toggleAll}/>
                      </th>
                      <th>Product</th><th>Price</th><th>Status</th>
                      <th>Stock</th><th>Categories</th><th>Added</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p,i) => <ProductRow key={p.id||i} product={p}/>)}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="pp-center">
              <div style={{ width:48, height:48, borderRadius:12, background:'var(--bg-raised)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', color:'var(--text-faint)' }}>
                <ShoppingBag size={20}/>
              </div>
              <p className="pp-center-title">No products found</p>
              <p className="pp-center-sub" style={{ marginBottom:'1rem' }}>
                {products.length===0 ? "Add your first product to get started" : "Try adjusting filters or search"}
              </p>
              {products.length===0 && (
                <button className="pp-btn pp-btn-primary" onClick={() => { setSelectedProduct(null); setShowAddPlainProduct(true); }}>
                  <Plus size={13}/> Add First Product
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default PlainProductsSection;