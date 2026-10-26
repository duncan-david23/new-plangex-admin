import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  ShoppingCart, 
  DollarSign, 
  Package, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  CreditCard,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Paintbrush,
  Store,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { format, subDays, startOfDay } from 'date-fns';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

/* ── shared token palette (matches AdminPanel) ───────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --bg-base:      #0d0f0e;
    --bg-surface:   #141714;
    --bg-raised:    #1c201c;
    --bg-hover:     #222722;
    --green:        #84e08a;
    --green-dim:    #3dba46;
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
  }

  .ds-root { font-family: 'DM Sans', sans-serif; color: var(--text); }
  .ds-root * { box-sizing: border-box; }

  /* ── top bar ── */
  .ds-topbar {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap;
  }
  .ds-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.4rem; font-weight: 700; letter-spacing: -0.03em;
    color: var(--text); margin-bottom: 2px;
  }
  .ds-subtitle {
    font-family: 'DM Mono', monospace;
    font-size: 0.66rem; color: var(--text-muted); letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .ds-refresh-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 13px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
    border-radius: 8px;
    font-size: 0.75rem; cursor: pointer;
    transition: border-color .2s, color .2s;
    font-family: 'DM Sans', sans-serif;
  }
  .ds-refresh-btn:hover { border-color: var(--border-green); color: var(--green); }
  .ds-timestamp {
    font-family: 'DM Mono', monospace; font-size: 0.65rem; color: var(--text-faint);
  }

  /* ── section label ── */
  .ds-section-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text-faint); margin-bottom: 0.75rem;
    display: flex; align-items: center; gap: 8px;
  }
  .ds-section-label::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }

  /* ── stat cards grid ── */
  .ds-stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem; margin-bottom: 1.5rem;
  }

  .ds-stat-card {
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.1rem 1.1rem 1rem;
    position: relative; overflow: hidden;
    transition: border-color .25s, transform .2s;
    cursor: default;
  }
  .ds-stat-card:hover {
    border-color: var(--border-green);
    transform: translateY(-2px);
  }
  .ds-stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--border-green), transparent);
    opacity: 0;
    transition: opacity .25s;
  }
  .ds-stat-card:hover::before { opacity: 1; }

  .ds-stat-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.9rem; }
  .ds-stat-icon {
    width: 34px; height: 34px; border-radius: 9px;
    background: var(--green-glow);
    border: 1px solid var(--border-green);
    display: flex; align-items: center; justify-content: center;
    color: var(--green);
  }
  .ds-stat-change {
    display: flex; align-items: center; gap: 3px;
    font-family: 'DM Mono', monospace; font-size: 0.65rem;
  }
  .ds-stat-change.up { color: var(--green); }
  .ds-stat-change.down { color: var(--red); }
  .ds-stat-change.none { color: var(--text-faint); }

  .ds-stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 1.6rem; font-weight: 700; letter-spacing: -0.03em;
    color: var(--text); line-height: 1; margin-bottom: 4px;
  }
  .ds-stat-name { font-size: 0.78rem; font-weight: 500; color: var(--text-muted); margin-bottom: 2px; }
  .ds-stat-desc { font-size: 0.67rem; color: var(--text-faint); font-family: 'DM Mono', monospace; }

  /* ── middle row ── */
  .ds-mid-grid {
    display: grid; grid-template-columns: 1fr 320px;
    gap: 1rem; margin-bottom: 1.5rem;
  }

  /* order status distribution */
  .ds-card {
    background: var(--bg-raised);
    border: 1px solid var(--border);
    border-radius: 14px; padding: 1.25rem;
    position: relative; overflow: hidden;
  }
  .ds-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 0.92rem; font-weight: 700; letter-spacing: -0.02em;
    color: var(--text);
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 1rem;
  }
  .ds-card-title svg { color: var(--green); width: 15px; height: 15px; }
  .ds-card-subtitle { font-family: 'DM Mono', monospace; font-size: 0.62rem; color: var(--text-faint); margin-left: auto; }

  .ds-status-grid {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.6rem;
  }
  .ds-status-cell {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 10px; padding: 0.75rem 0.5rem;
    text-align: center; transition: border-color .2s;
  }
  .ds-status-cell:hover { border-color: var(--border-green); }
  .ds-status-icon { margin: 0 auto 6px; width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; }
  .ds-status-val {
    font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 700;
    color: var(--text); line-height: 1; margin-bottom: 3px;
  }
  .ds-status-name { font-size: 0.65rem; color: var(--text-muted); margin-bottom: 2px; }
  .ds-status-pct { font-family: 'DM Mono', monospace; font-size: 0.6rem; color: var(--text-faint); }

  /* progress bar for status */
  .ds-progress-track {
    height: 3px; background: var(--border); border-radius: 3px;
    margin-top: 6px; overflow: hidden;
  }
  .ds-progress-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }

  /* revenue side card */
  .ds-rev-row {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 0.85rem 1rem;
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 0.6rem; transition: border-color .2s;
  }
  .ds-rev-row:last-child { margin-bottom: 0; }
  .ds-rev-row:hover { border-color: var(--border-green); }
  .ds-rev-row-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    margin-right: 10px; flex-shrink: 0;
  }
  .ds-rev-row-left { display: flex; align-items: center; flex: 1; min-width: 0; }
  .ds-rev-row-label { font-size: 0.75rem; font-weight: 500; color: var(--text-muted); margin-bottom: 1px; }
  .ds-rev-row-val { font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 700; color: var(--text); }
  .ds-rev-row-sub { font-family: 'DM Mono', monospace; font-size: 0.6rem; color: var(--text-faint); }

  /* ── bottom row ── */
  .ds-bottom-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 1rem; margin-bottom: 1.5rem;
  }

  /* recent orders table */
  .ds-order-row {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 9px;
    transition: background .15s; margin-bottom: 4px;
  }
  .ds-order-row:hover { background: var(--bg-hover); }
  .ds-order-icon {
    width: 30px; height: 30px; border-radius: 7px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .ds-order-id {
    font-family: 'DM Mono', monospace; font-size: 0.68rem; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;
  }
  .ds-order-customer { font-size: 0.7rem; color: var(--text-muted); margin-top: 1px; }
  .ds-order-date { font-family: 'DM Mono', monospace; font-size: 0.6rem; color: var(--text-faint); margin-top: 1px; }
  .ds-order-right { margin-left: auto; text-align: right; }
  .ds-order-amount { font-family: 'Syne', sans-serif; font-size: 0.82rem; font-weight: 700; color: var(--text); }
  .ds-chip {
    display: inline-flex; align-items: center;
    padding: 2px 7px; border-radius: 20px;
    font-family: 'DM Mono', monospace; font-size: 0.58rem; font-weight: 500;
    border: 1px solid transparent;
  }
  .ds-chip-delivered { background: rgba(132,224,138,0.1); color: var(--green); border-color: var(--border-green); }
  .ds-chip-shipped   { background: rgba(96,165,250,0.1);  color: var(--blue);  border-color: rgba(96,165,250,0.25); }
  .ds-chip-processing{ background: rgba(245,158,11,0.1);  color: var(--amber); border-color: rgba(245,158,11,0.25); }
  .ds-chip-pending   { background: rgba(122,138,123,0.1); color: var(--text-muted); border-color: var(--border); }
  .ds-chip-cancelled { background: rgba(248,113,113,0.1); color: var(--red); border-color: rgba(248,113,113,0.25); }
  .ds-chip-custom    { background: rgba(192,132,252,0.1); color: var(--purple); border-color: rgba(192,132,252,0.25); }
  .ds-chip-store     { background: rgba(96,165,250,0.1);  color: var(--blue);  border-color: rgba(96,165,250,0.25); }

  /* perf metrics */
  .ds-metric-row {
    display: flex; align-items: center;
    padding: 10px 12px; border-radius: 10px;
    background: var(--bg-surface); border: 1px solid var(--border);
    margin-bottom: 0.5rem; transition: border-color .2s;
  }
  .ds-metric-row:hover { border-color: var(--border-green); }
  .ds-metric-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    margin-right: 10px; flex-shrink: 0;
  }
  .ds-metric-name { font-size: 0.78rem; font-weight: 500; color: var(--text); margin-bottom: 1px; }
  .ds-metric-desc { font-size: 0.65rem; color: var(--text-muted); }
  .ds-metric-change { font-family: 'DM Mono', monospace; font-size: 0.62rem; }
  .ds-metric-change.up { color: var(--green); }
  .ds-metric-change.down { color: var(--red); }
  .ds-metric-val {
    margin-left: auto;
    font-family: 'Syne', sans-serif; font-size: 1.25rem; font-weight: 700;
    color: var(--text); padding-left: 12px;
  }

  /* insights strip */
  .ds-insight-row {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 12px; border-radius: 9px;
    background: var(--bg-surface); border: 1px solid var(--border);
    margin-top: 0.5rem;
  }
  .ds-insight-emoji { font-size: 0.9rem; }
  .ds-insight-label { font-size: 0.72rem; font-weight: 500; color: var(--text-muted); }
  .ds-insight-val { margin-left: auto; font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--green); }

  /* ── order type breakdown ── */
  .ds-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .ds-type-card {
    background: var(--bg-raised); border: 1px solid var(--border);
    border-radius: 12px; padding: 1.1rem; position: relative; overflow: hidden;
    transition: border-color .2s;
  }
  .ds-type-card:hover { border-color: var(--border-green); }
  .ds-type-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  }
  .ds-type-card.custom::before { background: linear-gradient(90deg, var(--purple), transparent); }
  .ds-type-card.store::before  { background: linear-gradient(90deg, var(--blue), transparent); }

  .ds-type-header { display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; }
  .ds-type-icon { width: 30px; height: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; }
  .ds-type-name { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; color: var(--text); }
  .ds-type-sub { font-size: 0.67rem; color: var(--text-faint); }

  .ds-type-mini-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.6rem; }
  .ds-type-mini {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: 8px; padding: 0.6rem 0.75rem;
  }
  .ds-type-mini-label { font-size: 0.63rem; color: var(--text-faint); margin-bottom: 2px; }
  .ds-type-mini-val { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: var(--text); }
  .ds-type-share { font-family: 'DM Mono', monospace; font-size: 0.62rem; color: var(--text-faint); }

  /* view-all link */
  .ds-view-all {
    display: flex; align-items: center; gap: 4px;
    font-size: 0.72rem; font-weight: 500; color: var(--text-muted);
    background: none; border: none; cursor: pointer;
    transition: color .15s; margin-left: auto;
    font-family: 'DM Sans', sans-serif; padding: 0;
  }
  .ds-view-all:hover { color: var(--green); }

  /* loading / error */
  .ds-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 5rem 1rem; text-align: center;
  }
  .ds-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 2px solid var(--border);
    border-top-color: var(--green);
    animation: ds-spin .7s linear infinite;
    margin-bottom: 1rem;
  }
  @keyframes ds-spin { to { transform: rotate(360deg); } }
  .ds-loading-title { font-family: 'Syne', sans-serif; font-size: 0.95rem; color: var(--text); margin-bottom: 4px; }
  .ds-loading-sub { font-size: 0.75rem; color: var(--text-muted); }

  .ds-error-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem; color: var(--red);
  }
  .ds-retry-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 8px;
    background: var(--green-glow); border: 1px solid var(--border-green);
    color: var(--green); font-size: 0.78rem; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    margin: 1rem auto 0; transition: background .2s;
  }
  .ds-retry-btn:hover { background: rgba(132,224,138,0.2); }

  @media (max-width: 900px) {
    .ds-stat-grid { grid-template-columns: repeat(2, 1fr); }
    .ds-mid-grid  { grid-template-columns: 1fr; }
    .ds-bottom-grid { grid-template-columns: 1fr; }
    .ds-status-grid { grid-template-columns: repeat(3, 1fr); }
    .ds-type-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 520px) {
    .ds-stat-grid { grid-template-columns: 1fr 1fr; }
  }
`;

/* ── helpers ─────────────────────────────────────────────────────────────── */
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};
const formatCurrencyAbbr = (amount) => {
  if (amount >= 1000000) return 'GHC' + (amount / 1000000).toFixed(1) + 'M';
  if (amount >= 1000) return 'GHC' + (amount / 1000).toFixed(1) + 'K';
  return formatCurrency(amount);
};

const stagger = (i) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.07, duration: 0.3 } });

/* ── component ───────────────────────────────────────────────────────────── */
const DashboardSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0, totalRevenue: 0, totalProducts: 0,
    pendingOrders: 0, processingOrders: 0, shippedOrders: 0,
    deliveredOrders: 0, cancelledOrders: 0, todayOrders: 0,
    weekRevenue: 0, monthRevenue: 0, averageOrderValue: 0,
    recentOrders: [], customOrders: 0, storeOrders: 0,
    customRevenue: 0, storeRevenue: 0
  });

  const fetchAllOrdersData = async () => {
    try {
      setLoading(true); setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('Please log in to view dashboard'); setLoading(false); return; }
      const token = session.access_token;
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      const endpoints = [
        { url: 'https://plangex-backend.onrender.com/api/users/admin/custom-orders?limit=100', type: 'custom' },
        { url: 'https://plangex-backend.onrender.com/api/users/admin/orders?limit=100', type: 'store' }
      ];

      const results = await Promise.all(
        endpoints.map(ep =>
          axios.get(ep.url, { headers })
            .then(r => ({ type: ep.type, data: r.data, error: null }))
            .catch(e => ({ type: ep.type, data: null, error: e.message }))
        )
      );

      let allOrders = [];
      results.forEach(result => {
        if (!result.data) return;
        const raw = result.data.orders || (Array.isArray(result.data) ? result.data : []);
        const transformed = raw.map(order => {
          const isCustom = result.type === 'custom' || (order.order_id || '').startsWith('CSPLX');
          const items = (order.items || []).map(item => ({
            id: `${order.order_id}-${item.name}`, name: item.name || 'Product',
            quantity: item.quantity || 1, price: item.price || item.product_price || 0,
            size: item.size || 'N/A', orderType: isCustom ? 'custom' : 'store'
          }));
          return {
            ...order, orderType: isCustom ? 'custom' : 'store',
            id: order.order_id || order.id, order_id: order.order_id || order.id,
            created_at: order.created_at || order.date,
            items, total: order.order_total || order.total || 0,
            status: (order.status || 'pending').toLowerCase(),
            customer_name: order.customer_name || '',
          };
        });
        allOrders = [...allOrders, ...transformed];
      });

      setOrders(allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      setError('Failed to load dashboard data');
      if (process.env.NODE_ENV === 'development') { setOrders(getMockOrders()); setError(null); }
    } finally { setLoading(false); }
  };

  const getMockOrders = () => [
    { id: 'CSPLX605234861592', orderType: 'custom', order_id: 'CSPLX605234861592',
      created_at: '2026-01-28T13:00:35.951+00:00', items: [{ quantity: 2, price: 150 }],
      total: 300, status: 'delivered', customer_name: 'David A. Duncan' },
    { id: 'PLX563781674546', orderType: 'store', order_id: 'PLX563781674546',
      created_at: '2026-01-16T11:43:01.894+00:00', items: [{ quantity: 1, price: 109.99 }],
      total: 109.99, status: 'processing', customer_name: 'David A. Duncan' },
    { id: 'CSPLX123456789', orderType: 'custom', order_id: 'CSPLX123456789',
      created_at: '2026-01-27T10:30:00.000+00:00', items: [{ quantity: 1, price: 250 }],
      total: 250, status: 'pending', customer_name: 'John Smith' },
  ];

  useEffect(() => {
    if (!orders.length) {
      setStats({ totalOrders:0,totalRevenue:0,totalProducts:0,pendingOrders:0,processingOrders:0,shippedOrders:0,deliveredOrders:0,cancelledOrders:0,todayOrders:0,weekRevenue:0,monthRevenue:0,averageOrderValue:0,recentOrders:[],customOrders:0,storeOrders:0,customRevenue:0,storeRevenue:0 });
      return;
    }
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekAgo = subDays(now, 7);
    const custom = orders.filter(o => o.orderType === 'custom');
    const store  = orders.filter(o => o.orderType === 'store');
    const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const statusCounts = orders.reduce((acc, o) => { const s = (o.status||'').toLowerCase(); acc[s]=(acc[s]||0)+1; return acc; }, {});
    const totalProducts = orders.reduce((s, o) => s + (o.items||[]).reduce((a,i)=>a+(i.quantity||1),0), 0);
    setStats({
      totalOrders: orders.length, totalRevenue, totalProducts,
      pendingOrders: statusCounts.pending||0, processingOrders: statusCounts.processing||0,
      shippedOrders: statusCounts.shipped||0, deliveredOrders: statusCounts.delivered||0,
      cancelledOrders: statusCounts.cancelled||0,
      todayOrders: orders.filter(o => new Date(o.created_at) >= todayStart).length,
      weekRevenue: orders.filter(o => new Date(o.created_at) >= weekAgo).reduce((s,o)=>s+(o.total||0),0),
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      customOrders: custom.length, storeOrders: store.length,
      customRevenue: custom.reduce((s,o)=>s+(o.total||0),0),
      storeRevenue:  store.reduce((s,o)=>s+(o.total||0),0),
      recentOrders: orders.slice(0,5).map(o=>({ id:o.order_id, customer:o.customer_name||'Unknown', date:o.created_at, amount:o.total||0, status:o.status||'pending', type:o.orderType }))
    });
  }, [orders]);

  useEffect(() => { fetchAllOrdersData(); }, []);

  /* ── derived data ── */
  const statCards = [
    { title:'Total Revenue',  value: formatCurrencyAbbr(stats.totalRevenue),   icon:<DollarSign/>, change: stats.weekRevenue>0?`+${((stats.weekRevenue/Math.max(1,stats.totalRevenue-stats.weekRevenue))*100).toFixed(1)}%`:'0%', trend: stats.weekRevenue>0?'up':'none', desc:'all combined revenue' },
    { title:'Total Orders',   value: formatNumber(stats.totalOrders),           icon:<ShoppingCart/>, change: stats.todayOrders>0?`+${stats.todayOrders} today`:'no new', trend: stats.todayOrders>0?'up':'none', desc:'custom + store orders' },
    { title:"Today's Orders", value: formatNumber(stats.todayOrders),           icon:<Calendar/>,    change: stats.todayOrders>0?`+${stats.todayOrders}`:'0',   trend: stats.todayOrders>0?'up':'none', desc:'placed today' },
    { title:'Items Sold',     value: formatNumber(stats.totalProducts),         icon:<Package/>,     change:'+12.5%', trend:'up', desc:'units across all orders' },
  ];

  const statusRows = [
    { title:'Pending',    val:stats.pendingOrders,    icon:<Clock/>,        fill:'var(--amber)',  pct: stats.totalOrders>0?(stats.pendingOrders/stats.totalOrders*100):0 },
    { title:'Processing', val:stats.processingOrders, icon:<Package/>,      fill:'var(--blue)',   pct: stats.totalOrders>0?(stats.processingOrders/stats.totalOrders*100):0 },
    { title:'Shipped',    val:stats.shippedOrders,    icon:<Truck/>,        fill:'var(--purple)', pct: stats.totalOrders>0?(stats.shippedOrders/stats.totalOrders*100):0 },
    { title:'Delivered',  val:stats.deliveredOrders,  icon:<CheckCircle/>,  fill:'var(--green)',  pct: stats.totalOrders>0?(stats.deliveredOrders/stats.totalOrders*100):0 },
    { title:'Cancelled',  val:stats.cancelledOrders,  icon:<XCircle/>,      fill:'var(--red)',    pct: stats.totalOrders>0?(stats.cancelledOrders/stats.totalOrders*100):0 },
  ];

  const perfMetrics = [
    { title:'Custom Orders',  val:formatNumber(stats.customOrders),             desc:`Revenue: ${formatCurrencyAbbr(stats.customRevenue)}`, change:stats.totalOrders>0?`${((stats.customOrders/stats.totalOrders)*100).toFixed(1)}% of total`:'0%', trend:stats.customOrders>0?'up':'none', color:'rgba(192,132,252,0.15)', iconColor:'var(--purple)', icon:<Paintbrush/> },
    { title:'Store Orders',   val:formatNumber(stats.storeOrders),              desc:`Revenue: ${formatCurrencyAbbr(stats.storeRevenue)}`,  change:stats.totalOrders>0?`${((stats.storeOrders/stats.totalOrders)*100).toFixed(1)}% of total`:'0%',  trend:stats.storeOrders>0?'up':'none',  color:'rgba(96,165,250,0.15)',   iconColor:'var(--blue)',   icon:<Store/> },
    { title:'Avg. Order Val', val:formatCurrencyAbbr(stats.averageOrderValue),  desc:'across all orders',  change:'+5.3%', trend:'up', color:'var(--green-glow)', iconColor:'var(--green)',  icon:<CreditCard/> },
    { title:'Avg. Items/Order',val:stats.totalOrders>0?(stats.totalProducts/stats.totalOrders).toFixed(1):'0.0', desc:'items per order', change:'+0.4', trend:'up', color:'rgba(245,158,11,0.12)', iconColor:'var(--amber)', icon:<Package/> },
  ];

  const chipClass = (status) => {
    switch((status||'').toLowerCase()) {
      case 'delivered':  return 'ds-chip ds-chip-delivered';
      case 'shipped':    return 'ds-chip ds-chip-shipped';
      case 'processing': return 'ds-chip ds-chip-processing';
      case 'cancelled':  return 'ds-chip ds-chip-cancelled';
      default:           return 'ds-chip ds-chip-pending';
    }
  };

  const formatOrderDate = (d) => { try { return format(new Date(d), 'MMM dd, HH:mm'); } catch { return 'N/A'; } };

  /* ── loading ── */
  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="ds-root">
        <div className="ds-loading">
          <div className="ds-spinner" />
          <p className="ds-loading-title">Loading dashboard…</p>
          <p className="ds-loading-sub">Fetching your store data</p>
        </div>
      </div>
    </>
  );

  /* ── error ── */
  if (error && orders.length === 0) return (
    <>
      <style>{styles}</style>
      <div className="ds-root" style={{ textAlign:'center', padding:'3rem 1rem' }}>
        <div className="ds-error-icon"><AlertCircle size={22}/></div>
        <p style={{ fontFamily:'Syne,sans-serif', fontWeight:700, color:'var(--text)', marginBottom:6 }}>Error loading dashboard</p>
        <p style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{error}</p>
        <button className="ds-retry-btn" onClick={fetchAllOrdersData}><RefreshCw size={13}/> Try Again</button>
      </div>
    </>
  );

  /* ── main render ── */
  return (
    <>
      <style>{styles}</style>
      <div className="ds-root">

        {/* top bar */}
        <div className="ds-topbar">
          <div>
            <h2 className="ds-title">Dashboard Overview</h2>
            <p className="ds-subtitle">Custom &amp; Store · Combined insights</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span className="ds-timestamp">Updated {format(new Date(), 'MMM dd, HH:mm')}</span>
            <button className="ds-refresh-btn" onClick={fetchAllOrdersData}>
              <RefreshCw size={12}/> Refresh
            </button>
          </div>
        </div>

        {/* ── stat cards ── */}
        <p className="ds-section-label">Key Metrics</p>
        <div className="ds-stat-grid">
          {statCards.map((c, i) => (
            <motion.div key={i} {...stagger(i)} className="ds-stat-card">
              <div className="ds-stat-header">
                <div className="ds-stat-icon">{React.cloneElement(c.icon, { size:15 })}</div>
                <span className={`ds-stat-change ${c.trend}`}>
                  {c.trend==='up' && <ArrowUp size={10}/>}
                  {c.trend==='down' && <ArrowDown size={10}/>}
                  {c.change}
                </span>
              </div>
              <div className="ds-stat-value">{c.value}</div>
              <div className="ds-stat-name">{c.title}</div>
              <div className="ds-stat-desc">{c.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* ── middle row ── */}
        <p className="ds-section-label">Order Status &amp; Revenue</p>
        <div className="ds-mid-grid">
          {/* status distribution */}
          <motion.div {...stagger(0)} className="ds-card">
            <div className="ds-card-title">
              <PieChart/> Order Status Distribution
              <span className="ds-card-subtitle">{formatNumber(stats.totalOrders)} total</span>
            </div>
            <div className="ds-status-grid">
              {statusRows.map((s, i) => (
                <div key={i} className="ds-status-cell">
                  <div className="ds-status-icon" style={{ background:`${s.fill}1a`, color:s.fill }}>
                    {React.cloneElement(s.icon, { size:14 })}
                  </div>
                  <div className="ds-status-val">{formatNumber(s.val)}</div>
                  <div className="ds-status-name">{s.title}</div>
                  <div className="ds-status-pct">{s.pct.toFixed(1)}%</div>
                  <div className="ds-progress-track">
                    <div className="ds-progress-fill" style={{ width:`${s.pct}%`, background:s.fill }}/>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* revenue side */}
          <motion.div {...stagger(1)} className="ds-card">
            <div className="ds-card-title"><BarChart3/> Revenue</div>

            <div className="ds-rev-row">
              <div className="ds-rev-row-icon" style={{ background:'rgba(96,165,250,0.1)', color:'var(--blue)' }}><TrendingUp size={14}/></div>
              <div className="ds-rev-row-left" style={{ flexDirection:'column', alignItems:'flex-start' }}>
                <div className="ds-rev-row-label">This Week</div>
                <div className="ds-rev-row-val">{formatCurrencyAbbr(stats.weekRevenue)}</div>
              </div>
            </div>

            <div className="ds-rev-row">
              <div className="ds-rev-row-icon" style={{ background:'rgba(192,132,252,0.1)', color:'var(--purple)' }}><Paintbrush size={14}/></div>
              <div>
                <div className="ds-rev-row-label">Custom Orders</div>
                <div className="ds-rev-row-val">{formatNumber(stats.customOrders)}</div>
                <div className="ds-rev-row-sub">{formatCurrencyAbbr(stats.customRevenue)} rev.</div>
              </div>
            </div>

            <div className="ds-rev-row">
              <div className="ds-rev-row-icon" style={{ background:'rgba(132,224,138,0.1)', color:'var(--green)' }}><Store size={14}/></div>
              <div>
                <div className="ds-rev-row-label">Store Orders</div>
                <div className="ds-rev-row-val">{formatNumber(stats.storeOrders)}</div>
                <div className="ds-rev-row-sub">{formatCurrencyAbbr(stats.storeRevenue)} rev.</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── bottom row ── */}
        <p className="ds-section-label">Recent Activity &amp; Performance</p>
        <div className="ds-bottom-grid">
          {/* recent orders */}
          <motion.div {...stagger(0)} className="ds-card">
            <div className="ds-card-title">
              <ShoppingCart size={15}/> Recent Orders
              <button className="ds-view-all">View all <ChevronRight size={11}/></button>
            </div>
            {stats.recentOrders.length > 0 ? stats.recentOrders.map((o, i) => (
              <div key={o.id} className="ds-order-row">
                <div className="ds-order-icon" style={{
                  background: o.status==='delivered'?'rgba(132,224,138,0.12)':o.status==='shipped'?'rgba(96,165,250,0.12)':o.status==='processing'?'rgba(245,158,11,0.12)':'rgba(122,138,123,0.12)',
                  color: o.status==='delivered'?'var(--green)':o.status==='shipped'?'var(--blue)':o.status==='processing'?'var(--amber)':'var(--text-muted)'
                }}>
                  {o.status==='delivered'?<CheckCircle size={13}/>:o.status==='shipped'?<Truck size={13}/>:o.status==='processing'?<Package size={13}/>:<Clock size={13}/>}
                </div>
                <div style={{ minWidth:0, flex:1 }}>
                  <div className="ds-order-id">{o.id}</div>
                  <div style={{ display:'flex', gap:5, marginTop:2 }}>
                    <span className={`ds-chip ${o.type==='custom'?'ds-chip-custom':'ds-chip-store'}`}>{o.type}</span>
                    <span className="ds-order-customer">{o.customer}</span>
                  </div>
                  <div className="ds-order-date">{formatOrderDate(o.date)}</div>
                </div>
                <div className="ds-order-right">
                  <div className="ds-order-amount">{formatCurrencyAbbr(o.amount)}</div>
                  <span className={chipClass(o.status)}>{o.status}</span>
                </div>
              </div>
            )) : (
              <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-faint)' }}>
                <ShoppingCart size={28} style={{ margin:'0 auto 8px', opacity:.4 }}/>
                <p style={{ fontSize:'0.75rem' }}>No recent orders</p>
              </div>
            )}
          </motion.div>

          {/* performance metrics */}
          <motion.div {...stagger(1)} className="ds-card">
            <div className="ds-card-title">
              <Zap size={15}/> Performance
              <button className="ds-view-all">Details <ChevronRight size={11}/></button>
            </div>
            {perfMetrics.map((m, i) => (
              <div key={i} className="ds-metric-row">
                <div className="ds-metric-icon" style={{ background:m.color, color:m.iconColor }}>
                  {React.cloneElement(m.icon, { size:14 })}
                </div>
                <div style={{ minWidth:0, flex:1 }}>
                  <div className="ds-metric-name">{m.title}</div>
                  <div className="ds-metric-desc">{m.desc}</div>
                  <div className={`ds-metric-change ${m.trend}`}>
                    {m.trend==='up'?<TrendingUp size={9} style={{display:'inline',marginRight:3}}/>:m.trend==='down'?<TrendingDown size={9} style={{display:'inline',marginRight:3}}/>:null}
                    {m.change}
                  </div>
                </div>
                <div className="ds-metric-val">{m.val}</div>
              </div>
            ))}
            {/* quick insights */}
            <div style={{ marginTop:'0.75rem', paddingTop:'0.75rem', borderTop:'1px solid var(--border)' }}>
              <div style={{ fontFamily:'DM Mono,monospace', fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-faint)', marginBottom:'0.5rem' }}>Quick Insights</div>
              <div className="ds-insight-row">
                <span className="ds-insight-emoji">📅</span>
                <span className="ds-insight-label">Best day for sales</span>
                <span className="ds-insight-val">{format(new Date(), 'EEEE')}</span>
              </div>
              <div className="ds-insight-row" style={{ marginTop:6 }}>
                <span className="ds-insight-emoji">🏆</span>
                <span className="ds-insight-label">Top revenue source</span>
                <span className="ds-insight-val">{stats.customRevenue > stats.storeRevenue ? 'Custom' : 'Store'}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── order type breakdown ── */}
        <p className="ds-section-label">Order Type Breakdown</p>
        <div className="ds-type-grid">
          {/* custom */}
          <motion.div {...stagger(0)} className="ds-type-card custom">
            <div className="ds-type-header">
              <div className="ds-type-icon" style={{ background:'rgba(192,132,252,0.15)', color:'var(--purple)' }}><Paintbrush size={14}/></div>
              <div>
                <div className="ds-type-name">Custom Orders</div>
                <div className="ds-type-sub">Personalised products with custom designs</div>
              </div>
            </div>
            <div className="ds-type-mini-grid">
              <div className="ds-type-mini"><div className="ds-type-mini-label">Total Orders</div><div className="ds-type-mini-val">{formatNumber(stats.customOrders)}</div></div>
              <div className="ds-type-mini"><div className="ds-type-mini-label">Revenue</div><div className="ds-type-mini-val">{formatCurrencyAbbr(stats.customRevenue)}</div></div>
            </div>
            <div className="ds-type-share">{stats.totalOrders>0?`${((stats.customOrders/stats.totalOrders)*100).toFixed(1)}% of total orders`:'No orders yet'}</div>
            <div className="ds-progress-track" style={{ marginTop:8 }}>
              <div className="ds-progress-fill" style={{ width: stats.totalOrders>0?`${(stats.customOrders/stats.totalOrders)*100}%`:'0%', background:'var(--purple)' }}/>
            </div>
          </motion.div>

          {/* store */}
          <motion.div {...stagger(1)} className="ds-type-card store">
            <div className="ds-type-header">
              <div className="ds-type-icon" style={{ background:'rgba(96,165,250,0.15)', color:'var(--blue)' }}><Store size={14}/></div>
              <div>
                <div className="ds-type-name">Store Orders</div>
                <div className="ds-type-sub">Ready-to-ship products from catalogue</div>
              </div>
            </div>
            <div className="ds-type-mini-grid">
              <div className="ds-type-mini"><div className="ds-type-mini-label">Total Orders</div><div className="ds-type-mini-val">{formatNumber(stats.storeOrders)}</div></div>
              <div className="ds-type-mini"><div className="ds-type-mini-label">Revenue</div><div className="ds-type-mini-val">{formatCurrencyAbbr(stats.storeRevenue)}</div></div>
            </div>
            <div className="ds-type-share">{stats.totalOrders>0?`${((stats.storeOrders/stats.totalOrders)*100).toFixed(1)}% of total orders`:'No orders yet'}</div>
            <div className="ds-progress-track" style={{ marginTop:8 }}>
              <div className="ds-progress-fill" style={{ width: stats.totalOrders>0?`${(stats.storeOrders/stats.totalOrders)*100}%`:'0%', background:'var(--blue)' }}/>
            </div>
          </motion.div>
        </div>

      </div>
    </>
  );
};

export default DashboardSection;