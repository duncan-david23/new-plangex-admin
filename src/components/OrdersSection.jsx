import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { 
  Search, Filter, Download, Eye, MoreVertical,
  Calendar, Package, Truck, CheckCircle, Clock,
  XCircle, RefreshCw, Printer, MessageSquare,
  User, Mail, Phone, MapPin, ChevronDown, ChevronUp,
  ExternalLink, Edit3, Save, X, AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { format } from 'date-fns';

/* ── design tokens ───────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg-base:       #0d0f0e;
    --bg-surface:    #141714;
    --bg-raised:     #1c201c;
    --bg-hover:      #222722;
    --green:         #84e08a;
    --green-dim:     #3dba46;
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

  .os-root { font-family: 'DM Sans', sans-serif; color: var(--text); }
  .os-root * { box-sizing: border-box; }

  /* ── topbar ── */
  .os-topbar { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1.25rem; }
  .os-title { font-family:'Syne',sans-serif; font-size:1.35rem; font-weight:700; letter-spacing:-0.03em; color:var(--text); margin-bottom:2px; }
  .os-subtitle { font-family:'DM Mono',monospace; font-size:0.65rem; color:var(--text-faint); text-transform:uppercase; letter-spacing:0.06em; }
  .os-action-row { display:flex; gap:8px; flex-wrap:wrap; }

  /* ── buttons ── */
  .os-btn {
    display:flex; align-items:center; gap:6px;
    padding:7px 13px; border-radius:8px; font-size:0.75rem; font-weight:500;
    cursor:pointer; border:1px solid transparent; transition:all .2s;
    font-family:'DM Sans',sans-serif;
  }
  .os-btn-ghost { background:transparent; border-color:var(--border); color:var(--text-muted); }
  .os-btn-ghost:hover { border-color:var(--border-green); color:var(--green); }
  .os-btn-primary { background:var(--green); color:#0d0f0e; border-color:var(--green); font-weight:600; }
  .os-btn-primary:hover { opacity:.85; }
  .os-btn-outline { background:transparent; border-color:var(--border); color:var(--text-muted); }
  .os-btn-outline:hover { border-color:var(--border-green); color:var(--green); background:var(--green-glow2); }

  /* ── filter panel ── */
  .os-filters {
    background:var(--bg-raised); border:1px solid var(--border);
    border-radius:12px; padding:1rem 1.1rem; margin-bottom:1.1rem;
  }
  .os-search-wrap { position:relative; flex:1; }
  .os-search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-faint); pointer-events:none; }
  .os-search {
    width:100%; padding:9px 12px 9px 36px;
    background:var(--bg-surface); border:1px solid var(--border);
    border-radius:9px; font-size:0.8rem; color:var(--text);
    font-family:'DM Sans',sans-serif; outline:none; transition:border-color .2s;
  }
  .os-search::placeholder { color:var(--text-faint); }
  .os-search:focus { border-color:var(--border-green); }

  .os-filter-row { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
  .os-filter-sep { height:1px; background:var(--border); margin:0.75rem 0; }

  .os-status-btn {
    display:flex; align-items:center; gap:5px;
    padding:5px 11px; border-radius:7px; font-size:0.72rem; font-weight:500;
    cursor:pointer; border:1px solid var(--border); background:transparent;
    color:var(--text-muted); transition:all .2s;
    font-family:'DM Sans',sans-serif;
  }
  .os-status-btn:hover { border-color:var(--border-green); color:var(--text); }
  .os-status-btn.active { background:var(--green-glow); border-color:var(--border-green); color:var(--green); }
  .os-status-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }

  .os-select {
    padding:6px 10px; background:var(--bg-surface); border:1px solid var(--border);
    border-radius:8px; font-size:0.75rem; color:var(--text-muted);
    font-family:'DM Mono',monospace; outline:none; cursor:pointer; transition:border-color .2s;
  }
  .os-select:focus { border-color:var(--border-green); }

  /* ── order card ── */
  .os-order-card {
    background:var(--bg-raised); border:1px solid var(--border);
    border-radius:14px; overflow:hidden; margin-bottom:0.75rem;
    transition:border-color .25s;
  }
  .os-order-card:hover { border-color:var(--border-green); }

  .os-card-header { padding:1rem 1.1rem; }
  .os-card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap; }

  .os-order-id { font-family:'DM Mono',monospace; font-size:0.85rem; font-weight:500; color:var(--text); }
  .os-badge-row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:0.6rem; }

  /* status chip */
  .os-chip {
    display:inline-flex; align-items:center; gap:4px;
    padding:3px 9px; border-radius:20px; font-family:'DM Mono',monospace;
    font-size:0.62rem; font-weight:500; border:1px solid transparent;
    text-transform:capitalize;
  }
  .os-chip-pending    { background:rgba(245,158,11,0.1);  color:var(--amber);  border-color:rgba(245,158,11,0.25); }
  .os-chip-processing { background:rgba(96,165,250,0.1);  color:var(--blue);   border-color:rgba(96,165,250,0.25); }
  .os-chip-out-for-delivery { background:rgba(192,132,252,0.1); color:var(--purple); border-color:rgba(192,132,252,0.25); }
  .os-chip-delivered  { background:rgba(132,224,138,0.1); color:var(--green);  border-color:var(--border-green); }
  .os-chip-cancelled  { background:rgba(248,113,113,0.1); color:var(--red);    border-color:rgba(248,113,113,0.25); }
  .os-chip-unknown    { background:rgba(122,138,123,0.1); color:var(--text-muted); border-color:var(--border); }

  .os-meta-row { display:flex; flex-wrap:wrap; gap:14px; font-size:0.74rem; color:var(--text-muted); }
  .os-meta-item { display:flex; align-items:center; gap:5px; }
  .os-meta-item svg { color:var(--text-faint); width:13px; height:13px; }
  .os-total { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:700; color:var(--text); }

  /* icon buttons */
  .os-icon-btn {
    width:32px; height:32px; border-radius:8px;
    background:transparent; border:1px solid var(--border);
    color:var(--text-muted); display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all .2s;
  }
  .os-icon-btn:hover { border-color:var(--border-green); color:var(--green); background:var(--green-glow2); }
  .os-icon-btn svg { width:14px; height:14px; }

  /* edit status inline */
  .os-status-edit-row { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
  .os-status-select {
    padding:5px 9px; background:var(--bg-surface); border:1px solid var(--border);
    border-radius:7px; font-size:0.73rem; color:var(--text);
    font-family:'DM Mono',monospace; outline:none; cursor:pointer;
  }
  .os-status-select:focus { border-color:var(--border-green); }
  .os-save-btn {
    width:28px; height:28px; border-radius:7px;
    background:var(--green-glow); border:1px solid var(--border-green);
    color:var(--green); display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:background .2s;
  }
  .os-save-btn:hover { background:rgba(132,224,138,0.22); }
  .os-save-btn:disabled { opacity:.4; cursor:not-allowed; }
  .os-cancel-btn {
    width:28px; height:28px; border-radius:7px;
    background:transparent; border:1px solid var(--border);
    color:var(--text-muted); display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all .2s;
  }
  .os-cancel-btn:hover { border-color:var(--red); color:var(--red); }

  /* ── expanded ── */
  .os-expanded { border-top:1px solid var(--border); }
  .os-expanded-inner { padding:1.1rem; }

  .os-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:1rem; }
  .os-info-box {
    background:var(--bg-surface); border:1px solid var(--border);
    border-radius:10px; padding:0.9rem 1rem;
  }
  .os-info-box-title {
    font-family:'DM Mono',monospace; font-size:0.62rem; text-transform:uppercase;
    letter-spacing:0.07em; color:var(--text-faint); margin-bottom:0.6rem;
    display:flex; align-items:center; gap:5px;
  }
  .os-info-box-title svg { width:11px; height:11px; }
  .os-info-line { display:flex; align-items:center; gap:7px; font-size:0.75rem; color:var(--text-muted); margin-bottom:5px; }
  .os-info-line svg { color:var(--text-faint); width:12px; height:12px; flex-shrink:0; }
  .os-info-line a { color:var(--text-muted); text-decoration:none; transition:color .15s; }
  .os-info-line a:hover { color:var(--green); }
  .os-info-address { font-size:0.75rem; color:var(--text-muted); white-space:pre-line; line-height:1.5; }

  /* items */
  .os-items-label { font-family:'DM Mono',monospace; font-size:0.62rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-faint); margin-bottom:0.6rem; display:flex; align-items:center; gap:8px; }
  .os-items-label::after { content:''; flex:1; height:1px; background:var(--border); }

  .os-item-row {
    display:flex; gap:10px; align-items:flex-start;
    padding:0.85rem; background:var(--bg-surface); border:1px solid var(--border);
    border-radius:10px; margin-bottom:0.5rem; transition:border-color .2s;
  }
  .os-item-row:hover { border-color:var(--border-green); }

  .os-item-thumb {
    width:56px; height:56px; border-radius:8px; overflow:hidden;
    border:1px solid var(--border); flex-shrink:0;
    background:var(--bg-raised); display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:border-color .2s;
  }
  .os-item-thumb:hover { border-color:var(--border-green); }
  .os-item-thumb img { width:100%; height:100%; object-fit:cover; }
  .os-item-thumb svg { color:var(--text-faint); }

  .os-item-name { font-size:0.82rem; font-weight:600; color:var(--text); margin-bottom:3px; }
  .os-item-meta { display:flex; flex-wrap:wrap; gap:8px; font-family:'DM Mono',monospace; font-size:0.63rem; color:var(--text-muted); margin-bottom:5px; }
  .os-item-instructions {
    margin-top:6px; padding:7px 10px;
    background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.18);
    border-radius:7px; font-size:0.7rem; color:var(--amber); font-style:italic;
  }
  .os-item-price-col { margin-left:auto; text-align:right; padding-left:10px; flex-shrink:0; }
  .os-item-price { font-family:'Syne',sans-serif; font-size:0.95rem; font-weight:700; color:var(--text); }
  .os-item-price-sub { font-family:'DM Mono',monospace; font-size:0.6rem; color:var(--text-faint); }

  /* designs grid */
  .os-designs-label { font-size:0.65rem; color:var(--text-faint); font-family:'DM Mono',monospace; margin-bottom:5px; }
  .os-designs-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:5px; }
  .os-design-thumb {
    aspect-ratio:1; border-radius:6px; overflow:hidden;
    border:1px solid var(--border); cursor:pointer;
    position:relative; background:var(--bg-raised);
    transition:border-color .2s;
  }
  .os-design-thumb:hover { border-color:var(--border-green); }
  .os-design-thumb img { width:100%; height:100%; object-fit:cover; }
  .os-design-overlay {
    position:absolute; inset:0; background:rgba(0,0,0,0.45);
    display:flex; align-items:center; justify-content:center;
    opacity:0; transition:opacity .2s;
    font-size:0.6rem; color:#fff;
  }
  .os-design-thumb:hover .os-design-overlay { opacity:1; }

  /* actions footer */
  .os-actions-footer {
    display:flex; align-items:center; justify-content:space-between;
    padding-top:0.85rem; margin-top:0.85rem; border-top:1px solid var(--border);
    flex-wrap:wrap; gap:0.75rem;
  }
  .os-timestamps { font-family:'DM Mono',monospace; font-size:0.62rem; color:var(--text-faint); line-height:1.6; }
  .os-action-btns { display:flex; flex-wrap:wrap; gap:6px; }

  .os-action-btn {
    padding:6px 13px; border-radius:8px; font-size:0.73rem; font-weight:500;
    cursor:pointer; border:1px solid transparent; transition:all .2s;
    font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:5px;
  }
  .os-action-btn:disabled { opacity:.4; cursor:not-allowed; }
  .os-action-btn-blue   { background:rgba(96,165,250,0.1);  color:var(--blue);   border-color:rgba(96,165,250,0.25); }
  .os-action-btn-blue:hover:not(:disabled)   { background:rgba(96,165,250,0.18); }
  .os-action-btn-purple { background:rgba(192,132,252,0.1); color:var(--purple); border-color:rgba(192,132,252,0.25); }
  .os-action-btn-purple:hover:not(:disabled) { background:rgba(192,132,252,0.18); }
  .os-action-btn-green  { background:var(--green-glow); color:var(--green);   border-color:var(--border-green); }
  .os-action-btn-green:hover:not(:disabled)  { background:rgba(132,224,138,0.2); }
  .os-action-btn-red    { background:rgba(248,113,113,0.1); color:var(--red);   border-color:rgba(248,113,113,0.25); }
  .os-action-btn-red:hover:not(:disabled)    { background:rgba(248,113,113,0.18); }

  /* spinner */
  .os-spin { width:14px; height:14px; border-radius:50%; border:2px solid var(--border); border-top-color:var(--green); animation:os-spin-anim .6s linear infinite; flex-shrink:0; }
  @keyframes os-spin-anim { to { transform:rotate(360deg); } }

  /* loading / error */
  .os-center { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:4rem 1rem; text-align:center; }
  .os-spinner-lg { width:36px; height:36px; border-radius:50%; border:2px solid var(--border); border-top-color:var(--green); animation:os-spin-anim .7s linear infinite; margin-bottom:1rem; }
  .os-err-icon { width:48px; height:48px; border-radius:12px; background:rgba(248,113,113,0.1); border:1px solid rgba(248,113,113,0.25); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; color:var(--red); }
  .os-empty-icon { width:48px; height:48px; border-radius:12px; background:var(--bg-raised); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; color:var(--text-faint); }

  @media (max-width:640px) {
    .os-info-grid { grid-template-columns:1fr; }
    .os-designs-grid { grid-template-columns:repeat(3,1fr); }
    .os-meta-row { gap:8px; }
  }
`;

/* ── status config ── */
const STATUS_CFG = {
  pending:          { label:'Pending',           dotColor:'var(--amber)',  chipClass:'os-chip-pending',    icon:<Clock size={10}/> },
  processing:       { label:'Processing',        dotColor:'var(--blue)',   chipClass:'os-chip-processing', icon:<Package size={10}/> },
  'out-for-delivery':{ label:'Out for Delivery', dotColor:'var(--purple)', chipClass:'os-chip-out-for-delivery', icon:<Truck size={10}/> },
  delivered:        { label:'Delivered',         dotColor:'var(--green)',  chipClass:'os-chip-delivered',  icon:<CheckCircle size={10}/> },
  cancelled:        { label:'Cancelled',         dotColor:'var(--red)',    chipClass:'os-chip-cancelled',  icon:<XCircle size={10}/> },
};
const STATUS_OPTS = Object.entries(STATUS_CFG).map(([v,c]) => ({ value:v, ...c }));

const getCfg = (s) => STATUS_CFG[(s||'').toLowerCase()] || { label:s||'Unknown', dotColor:'var(--text-faint)', chipClass:'os-chip-unknown', icon:<Clock size={10}/> };
const fmtDate = (d) => { try { return format(new Date(d), 'MMM dd, yyyy · hh:mm a'); } catch { return 'N/A'; } };
const fmtShort = (d) => { try { return format(new Date(d), 'MMM dd, HH:mm'); } catch { return 'N/A'; } };

/* ══════════════════════════════════════════════════════════════════════════ */
const OrdersSection = () => {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [newStatus, setNewStatus]   = useState('');
  const [updating, setUpdating]     = useState(false);
  const [filters, setFilters]       = useState({ status:'all', sortBy:'newest' });

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true); setError(null);
      const { data:{ session } } = await supabase.auth.getSession();
      if (!session) { setError('Please log in to view orders'); setLoading(false); return; }
      const token = session.access_token;
      const res = await axios.get(
        `https://plangex-backend.onrender.com/api/users/admin/orders?page=${page}&limit=20`,
        { headers:{ 'Authorization':`Bearer ${token}` } }
      );
      if (res.data.orders) {
        setOrders(res.data.orders.map(order => ({
          id:            order.order_id,
          order_id:      order.order_id,
          created_at:    order.created_at,
          updated_at:    order.updated_at,
          items: (order.items||[]).map(item => ({
            id:                    `${order.order_id}-${item.name}-${item.size}`,
            name:                  item.name,
            quantity:              item.quantity || 1,
            price:                 item.product_price || 0,
            size:                  item.size,
            custom_instructions:   item.custom_instructions,
            preview_image:         item.preview_image,
            uploaded_designs:      item.uploaded_designs || [],
            uploaded_designs_count:item.uploaded_designs_count || 0,
          })),
          total:            order.order_total || 0,
          status:           order.status || 'pending',
          customer_name:    order.customer_name,
          customer_email:   order.customer_email,
          customer_phone:   order.customer_phone,
          customer_address: order.customer_address,
          item_count:       order.item_count || 0,
          payment_method:   order.payment_method || 'Credit Card',
          notes:            order.notes || ''
        })));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdating(true);
      const { data:{ session } } = await supabase.auth.getSession();
      if (!session) return;
      const token = session.access_token;
      const res = await axios.put(
        `https://plangex-backend.onrender.com/api/users/admin/orders/status`,
        { status, orderId },
        { headers:{ 'Authorization':`Bearer ${token}`, 'Content-Type':'application/json' } }
      );
      if (res.status === 200 || res.status === 201) {
        setOrders(prev => prev.map(o =>
          o.order_id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o
        ));
        setEditingStatus(null); setNewStatus('');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = orders.filter(o => {
    const q = searchTerm.toLowerCase();
    const matchSearch = (o.order_id||'').toLowerCase().includes(q)
      || (o.customer_name||'').toLowerCase().includes(q)
      || (o.customer_email||'').toLowerCase().includes(q);
    const matchStatus = filters.status === 'all' || o.status === filters.status;
    return matchSearch && matchStatus;
  }).sort((a,b) => {
    if (filters.sortBy === 'oldest')    return new Date(a.created_at)-new Date(b.created_at);
    if (filters.sortBy === 'total_high')return b.total-a.total;
    if (filters.sortBy === 'total_low') return a.total-b.total;
    return new Date(b.created_at)-new Date(a.created_at);
  });

  /* ── designs grid ── */
  const DesignsGrid = ({ designs }) => {
    if (!designs?.length) return null;
    return (
      <div style={{ marginTop:8 }}>
        <p className="os-designs-label">Uploaded Designs ({designs.length}) · click to open</p>
        <div className="os-designs-grid">
          {designs.map((d,i) => {
            const url = d.image_data;
            if (!url) return null;
            return (
              <button key={i} className="os-design-thumb"
                onClick={e => { e.stopPropagation(); window.open(url,'_blank','noopener,noreferrer'); }}>
                <img src={url} alt={`Design ${i+1}`} loading="lazy"/>
                <div className="os-design-overlay">#{i+1} ↗</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  /* ── order card ── */
  const OrderCard = ({ order }) => {
    const cfg   = getCfg(order.status);
    const isExp = expandedOrder === order.order_id;

    return (
      <motion.div
        initial={{ opacity:0, y:14 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:.22 }}
        className="os-order-card"
      >
        {/* header */}
        <div className="os-card-header">
          <div className="os-card-top">
            <div style={{ flex:1, minWidth:0 }}>
              {/* ID + status row */}
              <div className="os-badge-row">
                <span className="os-order-id">{order.order_id}</span>
                <span className={`os-chip ${cfg.chipClass}`}>
                  {cfg.icon}&nbsp;{cfg.label}
                </span>

                {/* edit status */}
                {editingStatus === order.order_id ? (
                  <div className="os-status-edit-row">
                    <select className="os-status-select" value={newStatus}
                      onChange={e => setNewStatus(e.target.value)} disabled={updating}>
                      <option value="">Select status</option>
                      {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button className="os-save-btn" disabled={!newStatus||updating}
                      onClick={() => updateOrderStatus(order.order_id, newStatus)}>
                      <Save size={12}/>
                    </button>
                    <button className="os-cancel-btn"
                      onClick={() => { setEditingStatus(null); setNewStatus(''); }}>
                      <X size={12}/>
                    </button>
                    {updating && <div className="os-spin"/>}
                  </div>
                ) : (
                  <button className="os-icon-btn" style={{ width:24, height:24, borderRadius:6 }}
                    onClick={() => { setEditingStatus(order.order_id); setNewStatus(order.status); }}>
                    <Edit3 size={11}/>
                  </button>
                )}
              </div>

              {/* meta */}
              <div className="os-meta-row">
                <span className="os-meta-item"><Calendar/>{fmtShort(order.created_at)}</span>
                <span className="os-meta-item"><Package/>{order.item_count} item{order.item_count!==1?'s':''}</span>
                <span className="os-meta-item"><User/>{order.customer_name}</span>
                <span className="os-total">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* icon actions */}
            <div style={{ display:'flex', gap:5, flexShrink:0 }}>
              <button className="os-icon-btn" onClick={() => setExpandedOrder(isExp?null:order.order_id)}>
                {isExp ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
              </button>
              <button className="os-icon-btn" onClick={() => window.open(`/orders/${order.order_id}`,'_blank')}>
                <Eye size={14}/>
              </button>
              <button className="os-icon-btn"><MoreVertical size={14}/></button>
            </div>
          </div>
        </div>

        {/* expanded */}
        <AnimatePresence>
          {isExp && (
            <motion.div
              key="expanded"
              initial={{ height:0, opacity:0 }}
              animate={{ height:'auto', opacity:1 }}
              exit={{ height:0, opacity:0 }}
              transition={{ duration:.2 }}
              className="os-expanded"
            >
              <div className="os-expanded-inner">

                {/* customer + address */}
                <div className="os-info-grid">
                  <div className="os-info-box">
                    <div className="os-info-box-title"><User/>Customer Details</div>
                    <div className="os-info-line"><User/><span style={{ color:'var(--text)' }}>{order.customer_name}</span></div>
                    <div className="os-info-line"><Mail/><a href={`mailto:${order.customer_email}`}>{order.customer_email}</a></div>
                    <div className="os-info-line"><Phone/><a href={`tel:${order.customer_phone}`}>{order.customer_phone}</a></div>
                  </div>
                  <div className="os-info-box">
                    <div className="os-info-box-title"><MapPin/>Shipping Address</div>
                    <p className="os-info-address">{order.customer_address || 'N/A'}</p>
                  </div>
                </div>

                {/* items */}
                <div className="os-items-label">Order Items ({order.item_count})</div>
                {order.items.map((item, idx) => (
                  <div key={idx} className="os-item-row">
                    {/* thumb */}
                    <div className="os-item-thumb"
                      onClick={() => item.preview_image && window.open(item.preview_image,'_blank','noopener,noreferrer')}>
                      {item.preview_image
                        ? <img src={item.preview_image} alt={item.name}/>
                        : <Package size={20}/>
                      }
                    </div>

                    {/* details */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className="os-item-name">{item.name}</div>
                      <div className="os-item-meta">
                        <span>Size: {item.size||'N/A'}</span>
                        <span>Qty: {item.quantity}</span>
                        {item.uploaded_designs_count>0 && (
                          <span style={{ color:'var(--green)' }}>🎨 Custom ({item.uploaded_designs_count})</span>
                        )}
                      </div>
                      {item.uploaded_designs?.length>0 && <DesignsGrid designs={item.uploaded_designs}/>}
                      {item.custom_instructions && (
                        <div className="os-item-instructions">"{item.custom_instructions}"</div>
                      )}
                    </div>

                    {/* price */}
                    <div className="os-item-price-col">
                      <div className="os-item-price">{formatCurrency(item.price)}</div>
                      <div className="os-item-price-sub">each</div>
                      <div className="os-item-price-sub" style={{ marginTop:2 }}>
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* actions footer */}
                <div className="os-actions-footer">
                  <div className="os-timestamps">
                    <div>Created: {fmtDate(order.created_at)}</div>
                    <div>Updated: {fmtDate(order.updated_at)}</div>
                  </div>
                  <div className="os-action-btns">
                    {order.status==='pending' && (
                      <button className="os-action-btn os-action-btn-blue"
                        disabled={updating} onClick={() => updateOrderStatus(order.order_id,'processing')}>
                        {updating?<div className="os-spin"/>:<Package size={12}/>} Mark Processing
                      </button>
                    )}
                    {(order.status==='pending'||order.status==='processing') && (
                      <button className="os-action-btn os-action-btn-purple"
                        disabled={updating} onClick={() => updateOrderStatus(order.order_id,'out-for-delivery')}>
                        {updating?<div className="os-spin"/>:<Truck size={12}/>} Out for Delivery
                      </button>
                    )}
                    {(order.status==='shipped'||order.status==='processing'||order.status==='out-for-delivery') && (
                      <button className="os-action-btn os-action-btn-green"
                        disabled={updating} onClick={() => updateOrderStatus(order.order_id,'delivered')}>
                        {updating?<div className="os-spin"/>:<CheckCircle size={12}/>} Mark Delivered
                      </button>
                    )}
                    {order.status!=='cancelled' && (
                      <button className="os-action-btn os-action-btn-red"
                        disabled={updating}
                        onClick={() => { if(window.confirm('Cancel this order?')) updateOrderStatus(order.order_id,'cancelled'); }}>
                        <XCircle size={12}/> Cancel
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  /* ── loading ── */
  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="os-root">
        <div className="os-center">
          <div className="os-spinner-lg"/>
          <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, color:'var(--text)', marginBottom:4 }}>Loading orders…</p>
          <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Fetching your order data</p>
        </div>
      </div>
    </>
  );

  /* ── error ── */
  if (error) return (
    <>
      <style>{styles}</style>
      <div className="os-root">
        <div className="os-center">
          <div className="os-err-icon"><AlertCircle size={20}/></div>
          <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, color:'var(--text)', marginBottom:4 }}>Error loading orders</p>
          <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'1rem' }}>{error}</p>
          <button className="os-btn os-btn-ghost" onClick={() => fetchOrders()}>
            <RefreshCw size={12}/> Try Again
          </button>
        </div>
      </div>
    </>
  );

  /* ── main ── */
  return (
    <>
      <style>{styles}</style>
      <div className="os-root">

        {/* top bar */}
        <div className="os-topbar">
          <div>
            <h2 className="os-title">Orders</h2>
            <p className="os-subtitle">{filtered.length} order{filtered.length!==1?'s':''} found</p>
          </div>
          <div className="os-action-row">
            <button className="os-btn os-btn-ghost" onClick={() => window.print()}>
              <Printer size={12}/> Print
            </button>
            <button className="os-btn os-btn-primary">
              <Download size={12}/> Export CSV
            </button>
            <button className="os-btn os-btn-ghost" onClick={() => fetchOrders()}>
              <RefreshCw size={12}/> Refresh
            </button>
          </div>
        </div>

        {/* filters */}
        <div className="os-filters">
          <div className="os-filter-row" style={{ marginBottom:'0.65rem' }}>
            <div className="os-search-wrap">
              <Search size={13} className="os-search-icon"/>
              <input className="os-search" type="text"
                placeholder="Search by order ID, customer name or email…"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
            </div>
          </div>

          <div className="os-filter-row">
            <button className={`os-status-btn${filters.status==='all'?' active':''}`}
              onClick={() => setFilters(p=>({...p,status:'all'}))}>
              All
            </button>
            {STATUS_OPTS.map(s => (
              <button key={s.value}
                className={`os-status-btn${filters.status===s.value?' active':''}`}
                onClick={() => setFilters(p=>({...p,status:s.value}))}>
                <span className="os-status-dot" style={{ background:s.dotColor }}/>
                {s.label}
              </button>
            ))}
          </div>

          <div className="os-filter-sep"/>
          <div className="os-filter-row">
            <select className="os-select" value={filters.sortBy}
              onChange={e => setFilters(p=>({...p,sortBy:e.target.value}))}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="total_high">Total ↓</option>
              <option value="total_low">Total ↑</option>
            </select>
          </div>
        </div>

        {/* list */}
        {filtered.length > 0
          ? filtered.map(o => <OrderCard key={o.order_id} order={o}/>)
          : (
            <div className="os-center">
              <div className="os-empty-icon"><Package size={20}/></div>
              <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, color:'var(--text)', marginBottom:4 }}>No orders found</p>
              <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Try adjusting your search or filters</p>
            </div>
          )
        }

      </div>
    </>
  );
};

export default OrdersSection;