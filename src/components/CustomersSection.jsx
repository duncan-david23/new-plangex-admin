import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Crown, Trophy, Star, TrendingUp, TrendingDown,
  DollarSign, ShoppingBag, Calendar, MapPin, Mail, Phone,
  Filter, Download, Search, RefreshCw, ChevronRight,
  ChevronUp, ChevronDown, Sparkles, Award, Target,
  UserCheck, MessageSquare, CreditCard, Package,
  CheckCircle, XCircle, AlertCircle, ArrowUp
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { format, subMonths } from 'date-fns';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

/* ── design tokens ─────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg-base:      #0d0f0e;
    --bg-surface:   #141714;
    --bg-raised:    #1c201c;
    --bg-hover:     #222722;
    --green:        #84e08a;
    --green-glow:   rgba(132,224,138,0.12);
    --green-glow2:  rgba(132,224,138,0.06);
    --border:       #2a2f2a;
    --border-green: rgba(132,224,138,0.22);
    --text:         #e8f0e9;
    --text-muted:   #7a8a7b;
    --text-faint:   #4a554b;
    --red:          #f87171;
    --amber:        #f59e0b;
    --blue:         #60a5fa;
    --purple:       #c084fc;
    --gold:         #fbbf24;
  }

  .cs-root { font-family:'DM Sans',sans-serif; color:var(--text); }
  .cs-root * { box-sizing:border-box; }

  /* ── topbar ── */
  .cs-topbar { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1.25rem; }
  .cs-title  { font-family:'Syne',sans-serif; font-size:1.35rem; font-weight:700; letter-spacing:-0.03em; color:var(--text); margin-bottom:2px; }
  .cs-subtitle { font-family:'DM Mono',monospace; font-size:0.65rem; color:var(--text-faint); text-transform:uppercase; letter-spacing:0.06em; }

  /* ── buttons ── */
  .cs-btn { display:flex; align-items:center; gap:6px; padding:7px 13px; border-radius:8px; font-size:0.75rem; font-weight:500; cursor:pointer; border:1px solid transparent; transition:all .2s; font-family:'DM Sans',sans-serif; }
  .cs-btn-ghost   { background:transparent; border-color:var(--border); color:var(--text-muted); }
  .cs-btn-ghost:hover { border-color:var(--border-green); color:var(--green); background:var(--green-glow2); }
  .cs-btn-primary { background:var(--green); color:#0d0f0e; font-weight:600; }
  .cs-btn-primary:hover { opacity:.85; }
  .cs-btn-icon { width:32px; height:32px; padding:0; justify-content:center; background:transparent; border:1px solid var(--border); color:var(--text-muted); border-radius:8px; }
  .cs-btn-icon:hover { border-color:var(--border-green); color:var(--green); background:var(--green-glow2); }

  /* ── section label ── */
  .cs-section-label { font-family:'DM Mono',monospace; font-size:0.62rem; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-faint); margin-bottom:0.75rem; display:flex; align-items:center; gap:8px; }
  .cs-section-label::after { content:''; flex:1; height:1px; background:var(--border); }

  /* ── stat cards ── */
  .cs-stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0.9rem; margin-bottom:1.25rem; }
  .cs-stat-card { background:var(--bg-raised); border:1px solid var(--border); border-radius:13px; padding:1rem; position:relative; overflow:hidden; transition:border-color .25s, transform .2s; }
  .cs-stat-card:hover { border-color:var(--border-green); transform:translateY(-2px); }
  .cs-stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--border-green),transparent); opacity:0; transition:opacity .25s; }
  .cs-stat-card:hover::before { opacity:1; }
  .cs-stat-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem; }
  .cs-stat-icon { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; }
  .cs-stat-change { font-family:'DM Mono',monospace; font-size:0.63rem; display:flex; align-items:center; gap:2px; color:var(--green); }
  .cs-stat-val  { font-family:'Syne',sans-serif; font-size:1.55rem; font-weight:700; letter-spacing:-0.03em; color:var(--text); line-height:1; margin-bottom:3px; }
  .cs-stat-name { font-size:0.76rem; font-weight:500; color:var(--text-muted); margin-bottom:1px; }
  .cs-stat-desc { font-size:0.65rem; color:var(--text-faint); font-family:'DM Mono',monospace; }

  /* ── panel ── */
  .cs-panel { background:var(--bg-raised); border:1px solid var(--border); border-radius:14px; overflow:hidden; margin-bottom:1.1rem; }
  .cs-panel-header { padding:1rem 1.1rem; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; }
  .cs-panel-title { font-family:'Syne',sans-serif; font-size:0.9rem; font-weight:700; color:var(--text); display:flex; align-items:center; gap:7px; }
  .cs-panel-title svg { color:var(--green); width:15px; height:15px; }
  .cs-panel-count { font-family:'DM Mono',monospace; font-size:0.63rem; color:var(--text-faint); }
  .cs-panel-tools { display:flex; align-items:center; gap:7px; flex-wrap:wrap; }

  /* search / select */
  .cs-search-wrap { position:relative; }
  .cs-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--text-faint); pointer-events:none; }
  .cs-search { padding:7px 10px 7px 30px; background:var(--bg-surface); border:1px solid var(--border); border-radius:8px; font-size:0.75rem; color:var(--text); font-family:'DM Sans',sans-serif; outline:none; transition:border-color .2s; width:200px; }
  .cs-search::placeholder { color:var(--text-faint); }
  .cs-search:focus { border-color:var(--border-green); }
  .cs-select { padding:6px 10px; background:var(--bg-surface); border:1px solid var(--border); border-radius:8px; font-size:0.72rem; color:var(--text-muted); font-family:'DM Mono',monospace; outline:none; cursor:pointer; transition:border-color .2s; }
  .cs-select:focus { border-color:var(--border-green); }

  /* filter pills */
  .cs-filter-row { display:flex; flex-wrap:wrap; gap:6px; padding:0.75rem 1.1rem; border-bottom:1px solid var(--border); }
  .cs-pill { padding:5px 11px; border-radius:20px; border:1px solid var(--border); background:transparent; color:var(--text-muted); font-size:0.7rem; font-weight:500; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif; }
  .cs-pill:hover { border-color:var(--border-green); color:var(--text); }
  .cs-pill.active { background:var(--green-glow); border-color:var(--border-green); color:var(--green); }

  /* ── customer grid ── */
  .cs-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0.85rem; padding:1rem; }

  /* ── customer card ── */
  .cs-card { background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; padding:1rem; cursor:pointer; transition:border-color .25s, transform .2s; position:relative; overflow:hidden; }
  .cs-card:hover { border-color:var(--border-green); transform:translateY(-1px); }
  .cs-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,var(--border-green),transparent); opacity:0; transition:opacity .25s; }
  .cs-card:hover::before { opacity:1; }

  /* card header */
  .cs-card-header { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:0.85rem; }
  .cs-card-avatar { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; position:relative; }
  .cs-card-rank { position:absolute; top:-4px; right:-4px; width:16px; height:16px; border-radius:5px; background:var(--gold); color:#0d0f0e; font-family:'DM Mono',monospace; font-size:0.55rem; font-weight:700; display:flex; align-items:center; justify-content:center; border:1.5px solid var(--bg-surface); }
  .cs-card-name { font-size:0.82rem; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:130px; margin-bottom:1px; }
  .cs-card-email { font-family:'DM Mono',monospace; font-size:0.62rem; color:var(--text-faint); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:130px; }
  .cs-card-chevron { color:var(--text-faint); flex-shrink:0; transition:transform .2s; }
  .cs-card.expanded .cs-card-chevron { transform:rotate(180deg); }

  /* status + tier chips */
  .cs-chip { display:inline-flex; align-items:center; gap:3px; padding:2px 8px; border-radius:20px; font-family:'DM Mono',monospace; font-size:0.6rem; font-weight:500; border:1px solid transparent; }
  .cs-chip-active   { background:var(--green-glow);           color:var(--green);  border-color:var(--border-green); }
  .cs-chip-risk     { background:rgba(245,158,11,0.1);        color:var(--amber);  border-color:rgba(245,158,11,0.25); }
  .cs-chip-inactive { background:rgba(122,138,123,0.1);       color:var(--text-muted); border-color:var(--border); }
  .cs-chip-platinum { background:rgba(192,132,252,0.12);      color:var(--purple); border-color:rgba(192,132,252,0.25); }
  .cs-chip-gold     { background:rgba(251,191,36,0.12);       color:var(--gold);   border-color:rgba(251,191,36,0.25); }
  .cs-chip-silver   { background:rgba(122,138,123,0.12);      color:var(--text-muted); border-color:var(--border); }
  .cs-chip-bronze   { background:rgba(245,158,11,0.1);        color:var(--amber);  border-color:rgba(245,158,11,0.2); }

  /* mini stats grid */
  .cs-mini-grid { display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-bottom:0.75rem; }
  .cs-mini-cell { background:var(--bg-raised); border:1px solid var(--border); border-radius:8px; padding:0.5rem 0.65rem; }
  .cs-mini-label { font-family:'DM Mono',monospace; font-size:0.58rem; color:var(--text-faint); margin-bottom:2px; }
  .cs-mini-val   { font-family:'Syne',sans-serif; font-size:0.92rem; font-weight:700; color:var(--text); }

  /* card footer */
  .cs-card-footer { display:flex; align-items:center; justify-content:space-between; padding-top:0.65rem; border-top:1px solid var(--border); }
  .cs-footer-chips { display:flex; gap:5px; flex-wrap:wrap; }

  /* expanded section */
  .cs-expanded { overflow:hidden; }
  .cs-expanded-inner { padding-top:0.85rem; margin-top:0.75rem; border-top:1px solid var(--border); display:flex; flex-direction:column; gap:8px; }
  .cs-detail-row { display:flex; align-items:flex-start; gap:8px; }
  .cs-detail-icon { color:var(--text-faint); flex-shrink:0; margin-top:2px; }
  .cs-detail-label { font-family:'DM Mono',monospace; font-size:0.58rem; color:var(--text-faint); margin-bottom:2px; }
  .cs-detail-val   { font-size:0.75rem; color:var(--text); word-break:break-word; }
  .cs-detail-link  { font-size:0.75rem; color:var(--blue); background:none; border:none; cursor:pointer; padding:0; text-align:left; transition:color .15s; word-break:break-word; }
  .cs-detail-link:hover { color:var(--green); text-decoration:underline; }
  .cs-action-row { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:4px; }
  .cs-action-btn { display:flex; align-items:center; justify-content:center; gap:5px; padding:7px; border-radius:8px; font-size:0.72rem; font-weight:500; cursor:pointer; border:1px solid transparent; transition:all .2s; font-family:'DM Sans',sans-serif; }
  .cs-action-btn.email { background:rgba(96,165,250,0.1); color:var(--blue); border-color:rgba(96,165,250,0.25); }
  .cs-action-btn.email:hover { background:rgba(96,165,250,0.18); }
  .cs-action-btn.phone { background:var(--bg-raised); color:var(--text-muted); border-color:var(--border); }
  .cs-action-btn.phone:hover { border-color:var(--border-green); color:var(--green); }
  .cs-action-btn:disabled { opacity:.35; cursor:not-allowed; }

  /* ── bottom grid ── */
  .cs-bottom-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .cs-card-plain { background:var(--bg-raised); border:1px solid var(--border); border-radius:14px; padding:1.1rem; }
  .cs-card-title { font-family:'Syne',sans-serif; font-size:0.9rem; font-weight:700; color:var(--text); display:flex; align-items:center; gap:7px; margin-bottom:0.9rem; }
  .cs-card-title svg { color:var(--green); width:15px; height:15px; }

  /* tier distribution rows */
  .cs-tier-row { display:flex; align-items:center; justify-content:space-between; padding:0.75rem 0.9rem; background:var(--bg-surface); border:1px solid var(--border); border-radius:9px; margin-bottom:0.5rem; transition:border-color .2s; }
  .cs-tier-row:hover { border-color:var(--border-green); }
  .cs-tier-row:last-child { margin-bottom:0; }
  .cs-tier-left { display:flex; align-items:center; gap:10px; }
  .cs-tier-icon { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .cs-tier-name { font-size:0.8rem; font-weight:600; color:var(--text); }
  .cs-tier-count { font-family:'DM Mono',monospace; font-size:0.63rem; color:var(--text-faint); }
  .cs-tier-right { text-align:right; }
  .cs-tier-pct { font-family:'Syne',sans-serif; font-size:0.95rem; font-weight:700; color:var(--text); }
  .cs-tier-rev { font-family:'DM Mono',monospace; font-size:0.6rem; color:var(--text-faint); }
  .cs-tier-bar-track { height:2px; background:var(--border); border-radius:2px; margin-top:4px; overflow:hidden; }
  .cs-tier-bar-fill  { height:100%; border-radius:2px; }

  /* engagement rows */
  .cs-engage-row { display:flex; align-items:center; justify-content:space-between; padding:0.75rem 0.9rem; background:var(--bg-surface); border:1px solid var(--border); border-radius:9px; margin-bottom:0.5rem; transition:border-color .2s; }
  .cs-engage-row:hover { border-color:var(--border-green); }
  .cs-engage-left { display:flex; align-items:center; gap:10px; }
  .cs-engage-icon { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .cs-engage-label { font-size:0.75rem; font-weight:500; color:var(--text-muted); margin-bottom:1px; }
  .cs-engage-sub   { font-family:'DM Mono',monospace; font-size:0.6rem; color:var(--text-faint); }
  .cs-engage-val   { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:700; color:var(--text); }

  /* loading / error */
  .cs-center { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:4rem 1rem; text-align:center; }
  .cs-spinner { width:34px; height:34px; border-radius:50%; border:2px solid var(--border); border-top-color:var(--green); animation:cs-spin .7s linear infinite; margin-bottom:1rem; }
  @keyframes cs-spin { to { transform:rotate(360deg); } }
  .cs-center-title { font-family:'Syne',sans-serif; font-size:0.95rem; font-weight:700; color:var(--text); margin-bottom:3px; }
  .cs-center-sub   { font-size:0.75rem; color:var(--text-muted); }
  .cs-err-icon { width:48px; height:48px; border-radius:12px; background:rgba(248,113,113,0.1); border:1px solid rgba(248,113,113,0.25); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; color:var(--red); }

  @media (max-width:900px)  { .cs-grid { grid-template-columns:repeat(2,1fr); } .cs-stat-grid { grid-template-columns:repeat(2,1fr); } .cs-bottom-grid { grid-template-columns:1fr; } }
  @media (max-width:540px)  { .cs-grid { grid-template-columns:1fr; } }
`;

/* ── helpers ─────────────────────────────────────────────────────────────── */
const fmtCur  = (n) => { if(n>=1e9) return 'GHC '+(n/1e9).toFixed(1)+'B'; if(n>=1e6) return 'GHC '+(n/1e6).toFixed(1)+'M'; if(n>=1e3) return 'GHC '+(n/1e3).toFixed(1)+'K'; return 'GHC '+n.toFixed(0); };
const fmtNum  = (n) => { if(n>=1e6) return (n/1e6).toFixed(1)+'M'; if(n>=1e3) return (n/1e3).toFixed(1)+'K'; return n.toString(); };
const truncate = (s,l) => (!s||s.length<=l) ? (s||'') : s.slice(0,l-3)+'…';
const openEmail = (e) => { if(e) window.open(`mailto:${e}`,'_blank'); };
const openPhone = (p) => { if(p) window.open(`tel:${p.replace(/\D/g,'')}`, '_blank'); };

const TIER_CFG = {
  Platinum: { icon:<Crown size={13}/>,  iconBg:'rgba(192,132,252,0.15)', iconColor:'var(--purple)', chipClass:'cs-chip-platinum', barColor:'var(--purple)', threshold:5000 },
  Gold:     { icon:<Trophy size={13}/>, iconBg:'rgba(251,191,36,0.15)',  iconColor:'var(--gold)',   chipClass:'cs-chip-gold',     barColor:'var(--gold)',   threshold:2000 },
  Silver:   { icon:<Award size={13}/>,  iconBg:'rgba(122,138,123,0.12)',iconColor:'var(--text-muted)', chipClass:'cs-chip-silver', barColor:'var(--text-muted)', threshold:500 },
  Bronze:   { icon:<Star size={13}/>,   iconBg:'rgba(245,158,11,0.12)', iconColor:'var(--amber)',  chipClass:'cs-chip-bronze',   barColor:'var(--amber)',  threshold:0 },
};

const getTier = (spent) => {
  if (spent >= 5000) return 'Platinum';
  if (spent >= 2000) return 'Gold';
  if (spent >= 500)  return 'Silver';
  return 'Bronze';
};

const getStatus = (days) => {
  if (days > 180) return { label:'Inactive', cls:'cs-chip-inactive' };
  if (days > 90)  return { label:'At Risk',  cls:'cs-chip-risk' };
  return              { label:'Active',    cls:'cs-chip-active' };
};

/* ══════════════════════════════════════════════════════════════════════════ */
const CustomersSection = () => {
  const [customers, setCustomers]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [filters, setFilters]       = useState({ sortBy:'totalSpent', timeRange:'all', customerType:'all' });
  const [stats, setStats]           = useState({ totalCustomers:0, totalRevenue:0, avgOrderValue:0, repeatRate:0, topCustomerSpend:0, activeCustomers:0 });

  const fetchCustomerData = async () => {
    try {
      setLoading(true); setError(null);
      const { data:{ session } } = await supabase.auth.getSession();
      if (!session) { setError('Please log in to view customers'); setLoading(false); return; }
      const token = session.access_token;
      const res = await axios.get('https://plangex-backend.onrender.com/api/users/admin/orders?page=1&limit=1000', {
        headers:{ 'Authorization':`Bearer ${token}` }
      });

      if (res.data.orders) {
        const map = new Map();
        res.data.orders.forEach(order => {
          const key = (order.customer_email||'unknown').toLowerCase();
          if (!map.has(key)) {
            map.set(key, { id:key, name:order.customer_name||'Unknown', email:order.customer_email||'', phone:order.customer_phone||'', address:order.customer_address||'', totalSpent:0, orderCount:0, totalItems:0, firstOrderDate:order.created_at, lastOrderDate:order.created_at, orders:[] });
          }
          const c = map.get(key);
          c.totalSpent  += order.order_total || 0;
          c.orderCount  += 1;
          c.totalItems  += order.item_count || 0;
          c.lastOrderDate = new Date(order.created_at) > new Date(c.lastOrderDate) ? order.created_at : c.lastOrderDate;
          c.orders.push({ id:order.order_id, date:order.created_at, total:order.order_total||0, status:order.status||'pending', items:order.item_count||0 });
        });

        const arr = Array.from(map.values()).map(c => {
          const days = Math.floor((new Date()-new Date(c.lastOrderDate))/(864e5));
          const tier = getTier(c.totalSpent);
          const status = getStatus(days);
          return { ...c, daysSinceLastOrder:days, tier, tierCfg:TIER_CFG[tier], status, avgOrderValue:c.orderCount>0?c.totalSpent/c.orderCount:0 };
        });

        setCustomers(arr);
        const totalRev  = arr.reduce((s,c)=>s+c.totalSpent,0);
        const totalOrds = arr.reduce((s,c)=>s+c.orderCount,0);
        setStats({
          totalCustomers: arr.length,
          totalRevenue:   totalRev,
          avgOrderValue:  totalOrds>0 ? totalRev/totalOrds : 0,
          repeatRate:     arr.length>0 ? (arr.filter(c=>c.orderCount>1).length/arr.length*100) : 0,
          topCustomerSpend: Math.max(...arr.map(c=>c.totalSpent),0),
          activeCustomers: arr.filter(c=>c.status.label==='Active').length,
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomerData(); }, []);

  const filtered = customers.filter(c => {
    const q = searchTerm.toLowerCase();
    const ms = c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
    const now = new Date();
    let mt = true;
    if (filters.timeRange==='last30') mt = new Date(c.lastOrderDate) >= subMonths(now,1);
    if (filters.timeRange==='last90') mt = new Date(c.lastOrderDate) >= subMonths(now,3);
    let mc = true;
    if (filters.customerType==='repeat')    mc = c.orderCount>1;
    if (filters.customerType==='highvalue') mc = c.tier==='Gold'||c.tier==='Platinum';
    if (filters.customerType==='inactive')  mc = c.status.label==='Inactive';
    return ms && mt && mc;
  }).sort((a,b) => {
    if (filters.sortBy==='orderCount') return b.orderCount-a.orderCount;
    if (filters.sortBy==='recent')     return new Date(b.lastOrderDate)-new Date(a.lastOrderDate);
    if (filters.sortBy==='name')       return a.name.localeCompare(b.name);
    return b.totalSpent-a.totalSpent;
  });

  const topCustomers = filtered.slice(0, 10);

  const statCards = [
    { title:'Total Customers', val:fmtNum(stats.totalCustomers),           desc:'unique customers',      iconBg:'var(--green-glow)',             iconColor:'var(--green)',   icon:<Users size={14}/> },
    { title:'Total Revenue',   val:fmtCur(stats.totalRevenue),             desc:'from all customers',    iconBg:'rgba(96,165,250,0.1)',           iconColor:'var(--blue)',    icon:<DollarSign size={14}/> },
    { title:'Repeat Rate',     val:stats.repeatRate.toFixed(1)+'%',        desc:'returning customers',   iconBg:'rgba(192,132,252,0.1)',          iconColor:'var(--purple)',  icon:<UserCheck size={14}/> },
    { title:'Avg Order Value', val:fmtCur(stats.avgOrderValue),            desc:'per order',             iconBg:'rgba(245,158,11,0.1)',           iconColor:'var(--amber)',   icon:<CreditCard size={14}/> },
  ];

  const handleCardClick = (id, e) => {
    if (e.target.closest('button')) return;
    setExpandedCard(expandedCard===id ? null : id);
  };

  /* ── loading ── */
  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="cs-root">
        <div className="cs-center"><div className="cs-spinner"/><p className="cs-center-title">Loading customers…</p><p className="cs-center-sub">Analysing customer insights</p></div>
      </div>
    </>
  );

  /* ── error ── */
  if (error) return (
    <>
      <style>{styles}</style>
      <div className="cs-root">
        <div className="cs-center">
          <div className="cs-err-icon"><XCircle size={20}/></div>
          <p className="cs-center-title">Error loading customers</p>
          <p className="cs-center-sub" style={{ marginBottom:'1rem' }}>{error}</p>
          <button className="cs-btn cs-btn-ghost" onClick={fetchCustomerData}><RefreshCw size={12}/> Try Again</button>
        </div>
      </div>
    </>
  );

  /* ── main ── */
  return (
    <>
      <style>{styles}</style>
      <div className="cs-root">

        {/* topbar */}
        <div className="cs-topbar">
          <div>
            <h2 className="cs-title">Customer Insights</h2>
            <p className="cs-subtitle">Analyse &amp; manage your best customers</p>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="cs-btn cs-btn-icon" onClick={fetchCustomerData}><RefreshCw size={13}/></button>
          </div>
        </div>

        {/* stat cards */}
        <p className="cs-section-label">Overview</p>
        <div className="cs-stat-grid">
          {statCards.map((c,i) => (
            <motion.div key={i} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.07 }} className="cs-stat-card">
              <div className="cs-stat-header">
                <div className="cs-stat-icon" style={{ background:c.iconBg, color:c.iconColor }}>{c.icon}</div>
                <span className="cs-stat-change"><ArrowUp size={9}/>+–</span>
              </div>
              <div className="cs-stat-val">{c.val}</div>
              <div className="cs-stat-name">{c.title}</div>
              <div className="cs-stat-desc">{c.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* customers panel */}
        <p className="cs-section-label">Top Customers</p>
        <div className="cs-panel">
          {/* header */}
          <div className="cs-panel-header">
            <div className="cs-panel-title">
              <Users/> Customers
              <span className="cs-panel-count">({filtered.length} found)</span>
            </div>
            <div className="cs-panel-tools">
              <div className="cs-search-wrap">
                <Search size={12} className="cs-search-icon"/>
                <input className="cs-search" type="text" placeholder="Search customers…" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
              </div>
              <select className="cs-select" value={filters.sortBy} onChange={e=>setFilters(p=>({...p,sortBy:e.target.value}))}>
                <option value="totalSpent">Total Spent</option>
                <option value="orderCount">Order Count</option>
                <option value="recent">Most Recent</option>
                <option value="name">Name</option>
              </select>
              <select className="cs-select" value={filters.customerType} onChange={e=>setFilters(p=>({...p,customerType:e.target.value}))}>
                <option value="all">All</option>
                <option value="repeat">Repeat</option>
                <option value="highvalue">High-Value</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* filter pills */}
          <div className="cs-filter-row">
            {['all','last30','last90'].map(v => (
              <button key={v} className={`cs-pill${filters.timeRange===v?' active':''}`} onClick={() => setFilters(p=>({...p,timeRange:v}))}>
                {v==='all'?'All Time':v==='last30'?'Last 30 Days':'Last 90 Days'}
              </button>
            ))}
          </div>

          {/* customer cards */}
          {topCustomers.length > 0 ? (
            <div className="cs-grid">
              {topCustomers.map((c, idx) => {
                const isExp = expandedCard === c.id;
                const cfg   = c.tierCfg;
                return (
                  <motion.div key={c.id} initial={{ opacity:0, scale:.96 }} animate={{ opacity:1, scale:1 }} transition={{ delay:idx*.04 }}
                    className={`cs-card${isExp?' expanded':''}`}
                    onClick={e => handleCardClick(c.id, e)}
                  >
                    {/* header */}
                    <div className="cs-card-header">
                      <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0, flex:1 }}>
                        <div className="cs-card-avatar" style={{ background:cfg.iconBg, color:cfg.iconColor }}>
                          {cfg.icon}
                          {idx < 3 && <div className="cs-card-rank">{idx+1}</div>}
                        </div>
                        <div style={{ minWidth:0 }}>
                          <div className="cs-card-name" title={c.name}>{isExp ? c.name : truncate(c.name,20)}</div>
                          <div className="cs-card-email" title={c.email}>{truncate(c.email,26)}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
                        <span className={`cs-chip ${c.status.cls}`}>{c.status.label}</span>
                        <ChevronDown size={13} className="cs-card-chevron"/>
                      </div>
                    </div>

                    {/* mini stats */}
                    <div className="cs-mini-grid">
                      <div className="cs-mini-cell"><div className="cs-mini-label">Total Spent</div><div className="cs-mini-val">{fmtCur(c.totalSpent)}</div></div>
                      <div className="cs-mini-cell"><div className="cs-mini-label">Orders</div><div className="cs-mini-val">{c.orderCount}</div></div>
                      <div className="cs-mini-cell"><div className="cs-mini-label">Avg Order</div><div className="cs-mini-val">{fmtCur(c.avgOrderValue)}</div></div>
                      <div className="cs-mini-cell"><div className="cs-mini-label">Last Order</div><div className="cs-mini-val" style={{ fontSize:'0.78rem' }}>{format(new Date(c.lastOrderDate),'MMM dd')}</div></div>
                    </div>

                    {/* footer */}
                    <div className="cs-card-footer">
                      <div className="cs-footer-chips">
                        <span className={`cs-chip ${cfg.chipClass}`}>{cfg.icon}&nbsp;{c.tier}</span>
                      </div>
                      <span style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6rem', color:'var(--text-faint)' }}>{isExp?'collapse':'expand'}</span>
                    </div>

                    {/* expanded */}
                    <AnimatePresence>
                      {isExp && (
                        <motion.div key="exp" initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:.2 }} className="cs-expanded">
                          <div className="cs-expanded-inner">
                            <div className="cs-detail-row">
                              <UserCheck size={12} className="cs-detail-icon"/>
                              <div><div className="cs-detail-label">Full Name</div><div className="cs-detail-val">{c.name}</div></div>
                            </div>
                            {c.email && (
                              <div className="cs-detail-row">
                                <Mail size={12} className="cs-detail-icon"/>
                                <div><div className="cs-detail-label">Email</div>
                                  <button className="cs-detail-link" onClick={e=>{e.stopPropagation();openEmail(c.email);}}>{c.email}</button>
                                </div>
                              </div>
                            )}
                            {c.phone && (
                              <div className="cs-detail-row">
                                <Phone size={12} className="cs-detail-icon"/>
                                <div><div className="cs-detail-label">Phone</div>
                                  <button className="cs-detail-link" onClick={e=>{e.stopPropagation();openPhone(c.phone);}}>{c.phone}</button>
                                </div>
                              </div>
                            )}
                            {c.address && (
                              <div className="cs-detail-row">
                                <MapPin size={12} className="cs-detail-icon"/>
                                <div><div className="cs-detail-label">Address</div><div className="cs-detail-val">{c.address}</div></div>
                              </div>
                            )}
                            {/* extra stats */}
                            <div className="cs-mini-grid" style={{ marginBottom:0 }}>
                              <div className="cs-mini-cell"><div className="cs-mini-label">Total Items</div><div className="cs-mini-val">{c.totalItems}</div></div>
                              <div className="cs-mini-cell"><div className="cs-mini-label">Days Since</div><div className="cs-mini-val">{c.daysSinceLastOrder}d</div></div>
                            </div>
                            {/* quick actions */}
                            <div className="cs-action-row">
                              <button className="cs-action-btn email" disabled={!c.email} onClick={e=>{e.stopPropagation();openEmail(c.email);}}>
                                <Mail size={11}/> Email
                              </button>
                              <button className="cs-action-btn phone" disabled={!c.phone} onClick={e=>{e.stopPropagation();openPhone(c.phone);}}>
                                <Phone size={11}/> Call
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="cs-center">
              <div style={{ width:44,height:44,borderRadius:11,background:'var(--bg-raised)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem',color:'var(--text-faint)' }}><Users size={18}/></div>
              <p className="cs-center-title">No customers found</p>
              <p className="cs-center-sub">Try adjusting your filters or search</p>
            </div>
          )}
        </div>

        {/* ── bottom grid ── */}
        <p className="cs-section-label">Segments &amp; Engagement</p>
        <div className="cs-bottom-grid">

          {/* tier distribution */}
          <div className="cs-card-plain">
            <div className="cs-card-title"><Target/> Customer Tiers</div>
            {['Platinum','Gold','Silver','Bronze'].map(tier => {
              const cfg  = TIER_CFG[tier];
              const tc   = customers.filter(c=>c.tier===tier);
              const pct  = customers.length>0 ? (tc.length/customers.length*100) : 0;
              const rev  = tc.reduce((s,c)=>s+c.totalSpent,0);
              return (
                <div key={tier} className="cs-tier-row">
                  <div className="cs-tier-left">
                    <div className="cs-tier-icon" style={{ background:cfg.iconBg, color:cfg.iconColor }}>{cfg.icon}</div>
                    <div>
                      <div className="cs-tier-name">{tier}</div>
                      <div className="cs-tier-count">{fmtNum(tc.length)} customers</div>
                      <div className="cs-tier-bar-track" style={{ width:80 }}>
                        <div className="cs-tier-bar-fill" style={{ width:`${pct}%`, background:cfg.barColor }}/>
                      </div>
                    </div>
                  </div>
                  <div className="cs-tier-right">
                    <div className="cs-tier-pct">{pct.toFixed(1)}%</div>
                    <div className="cs-tier-rev">{fmtCur(rev)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* engagement */}
          <div className="cs-card-plain">
            <div className="cs-card-title"><MessageSquare/> Engagement</div>

            <div className="cs-engage-row">
              <div className="cs-engage-left">
                <div className="cs-engage-icon" style={{ background:'var(--green-glow)', color:'var(--green)' }}><UserCheck size={14}/></div>
                <div><div className="cs-engage-label">Active Customers</div><div className="cs-engage-sub">ordered in last 90 days</div></div>
              </div>
              <div className="cs-engage-val">{fmtNum(stats.activeCustomers)}</div>
            </div>

            <div className="cs-engage-row">
              <div className="cs-engage-left">
                <div className="cs-engage-icon" style={{ background:'rgba(251,191,36,0.12)', color:'var(--gold)' }}><Crown size={14}/></div>
                <div><div className="cs-engage-label">Top Customer LTV</div><div className="cs-engage-sub">highest lifetime value</div></div>
              </div>
              <div className="cs-engage-val">{fmtCur(stats.topCustomerSpend)}</div>
            </div>

            <div className="cs-engage-row">
              <div className="cs-engage-left">
                <div className="cs-engage-icon" style={{ background:'rgba(245,158,11,0.1)', color:'var(--amber)' }}><TrendingDown size={14}/></div>
                <div><div className="cs-engage-label">At Risk</div><div className="cs-engage-sub">no orders in 90–180 days</div></div>
              </div>
              <div className="cs-engage-val">{fmtNum(customers.filter(c=>c.status.label==='At Risk').length)}</div>
            </div>

            <div className="cs-engage-row" style={{ marginBottom:0 }}>
              <div className="cs-engage-left">
                <div className="cs-engage-icon" style={{ background:'rgba(248,113,113,0.1)', color:'var(--red)' }}><XCircle size={14}/></div>
                <div><div className="cs-engage-label">Inactive</div><div className="cs-engage-sub">no orders in 180+ days</div></div>
              </div>
              <div className="cs-engage-val">{fmtNum(customers.filter(c=>c.status.label==='Inactive').length)}</div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:'0.9rem' }}>
              <button className="cs-btn cs-btn-primary" style={{ justifyContent:'center' }}><Mail size={12}/> Campaign</button>
              <button className="cs-btn cs-btn-ghost"   style={{ justifyContent:'center' }}><Download size={12}/> Export</button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default CustomersSection;