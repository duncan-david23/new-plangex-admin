import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MoreVertical,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Printer,
  MessageSquare,
  User,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Edit3,
  Save,
  X,
  ShoppingBag,
  CreditCard,
  Home,
  Tag,
  Receipt
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { format } from 'date-fns';

const StoreOrdersSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [editingStatus, setEditingStatus] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    sortBy: 'newest'
  });

  const statusOptions = [
    { value: 'pending', label: 'Pending', bgColor: 'bg-amber-500', textColor: 'text-amber-600', icon: <Clock className="w-4 h-4" /> },
    { value: 'processing', label: 'Processing', bgColor: 'bg-blue-500', textColor: 'text-blue-600', icon: <Package className="w-4 h-4" /> },
    { value: 'out-for-delivery', label: 'Out for Delivery', bgColor: 'bg-purple-500', textColor: 'text-purple-600', icon: <Truck className="w-4 h-4" /> },
    { value: 'delivered', label: 'Delivered', bgColor: 'bg-emerald-500', textColor: 'text-emerald-600', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'cancelled', label: 'Cancelled', bgColor: 'bg-rose-500', textColor: 'text-rose-600', icon: <XCircle className="w-4 h-4" /> }
  ];

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Please log in to view orders');
        setLoading(false);
        return;
      }

      const token = session.access_token;
      const response = await axios.get(
        `https://plangex-backend.onrender.com/api/users/admin/custom-orders?page=${page}&limit=20`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.orders) {
        const transformedOrders = response.data.orders.map(order => ({
          id: order.order_id || `ORD-${order.id}`,
          order_id: order.order_id,
          date: order.created_at,
          created_at: order.created_at,
          updated_at: order.updated_at,
          items: Array.isArray(order.items) ? order.items.map(item => ({
            id: `${order.order_id}-${item.productId || item.id}`,
            name: item.name,
            productId: item.productId,
            image: item.image,
            quantity: item.quantity || 1,
            price: item.price || 0,
            size: item.size || 'N/A',
            itemTotal: item.itemTotal || (item.price * item.quantity),
            design_preview: item.design_preview
          })) : [],
          total: order.order_total || 0,
          status: order.status || 'pending',
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          customer_address: order.customer_address,
          item_count: order.item_count || 0,
          user_id: order.user_id,
          payment_method: order.payment_method || 'Credit Card',
          notes: order.notes || ''
        }));

        
        setOrders(transformedOrders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdating(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('Please log in to update order');
        return;
      }

      const token = session.access_token;
      
      console.log(`Updating order ${orderId} to status: ${status}`);
      
      const response = await axios.put(
        `https://plangex-backend.onrender.com/api/users/admin/custom-orders/status`,
        { status, orderId },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Update response:', response.data);

      if (response.status === 200 || response.status === 201) {
        // Update local state
        setOrders(prev => prev.map(order => 
          order.order_id === orderId 
            ? { ...order, status, updated_at: new Date().toISOString() }
            : order
        ));
        setEditingStatus(null);
        setNewStatus('');
        alert('Order status updated successfully!');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setUpdating(false);
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusConfig = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option || { 
      bgColor: 'bg-gray-500', 
      textColor: 'text-gray-600', 
      icon: <Clock className="w-4 h-4" />,
      label: 'Unknown'
    };
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • hh:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = 
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const matchesStatus = filters.status === 'all' || order.status === filters.status;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Sort filter
    if (filters.sortBy === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (filters.sortBy === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at);
    } else if (filters.sortBy === 'total_high') {
      return b.total - a.total;
    } else if (filters.sortBy === 'total_low') {
      return a.total - b.total;
    }
    return 0;
  });

  const OrderCard = ({ order }) => {
    const statusConfig = getStatusConfig(order.status);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
      >
        {/* Order Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${statusConfig.bgColor}`}></div>
                <h3 className="font-bold text-gray-900 text-lg">{order.order_id}</h3>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor.replace('bg-', 'bg-')} bg-opacity-10 ${statusConfig.textColor}`}>
                  {statusConfig.icon}
                  <span className="capitalize">{statusConfig.label}</span>
                </span>
                
                {/* Status Edit Button */}
                {editingStatus === order.order_id ? (
                  <div className="flex flex-wrap items-center gap-2 ml-2">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={updating}
                    >
                      <option value="">Select status</option>
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => updateOrderStatus(order.order_id, newStatus)}
                      disabled={!newStatus || updating}
                      className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingStatus(null);
                        setNewStatus('');
                      }}
                      disabled={updating}
                      className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {updating && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        Updating...
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingStatus(order.order_id);
                      setNewStatus(order.status);
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-2"
                    title="Update status"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <ShoppingBag className="w-4 h-4 text-gray-400" />
                  <span>{order.item_count} item{order.item_count !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{order.customer_name || 'No name'}</span>
                </div>
                <div className="text-right lg:text-left">
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpandedOrder(expandedOrder === order.order_id ? null : order.order_id)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="View details"
              >
                {expandedOrder === order.order_id ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              <button 
                onClick={() => window.open(`/orders/${order.order_id}`, '_blank')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                title="View order"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="More options">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {expandedOrder === order.order_id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-100"
            >
              <div className="p-6">
                {/* Customer Information */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Customer Details
                    </h4>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{order.customer_name || 'Not provided'}</span>
                      </p>
                      <p className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {order.customer_email ? (
                          <a href={`mailto:${order.customer_email}`} className="hover:text-blue-600">
                            {order.customer_email}
                          </a>
                        ) : (
                          <span>Not provided</span>
                        )}
                      </p>
                      <p className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {order.customer_phone ? (
                          <a href={`tel:${order.customer_phone}`} className="hover:text-blue-600">
                            {order.customer_phone}
                          </a>
                        ) : (
                          <span>Not provided</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Shipping Address
                    </h4>
                    <p className="text-gray-600 whitespace-pre-line">{order.customer_address || 'No address provided'}</p>
                  </div>
                </div>

                {/* Order Items */}
                <h4 className="font-semibold text-gray-900 mb-4">Order Items ({order.item_count})</h4>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => item.image && window.open(item.image, '_blank', 'noopener,noreferrer')}
                          className="group relative w-20 h-20 bg-white rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center hover:border-blue-500 transition-colors"
                          disabled={!item.image}
                        >
                          {item.image ? (
                            <>
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                            </>
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </button>
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-900 text-lg">{item.name}</h5>
                              <div className="text-right sm:hidden">
                                <p className="font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                                <p className="text-sm text-gray-500">each</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              {item.size && item.size !== 'N/A' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                                  <Tag className="w-3 h-3" />
                                  Size: {item.size}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                <ShoppingBag className="w-3 h-3" />
                                Qty: {item.quantity}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
                                <Receipt className="w-3 h-3" />
                                Item Total: {formatCurrency(item.itemTotal || item.price * item.quantity)}
                              </span>
                            </div>
                            
                            {item.productId && (
                              <div className="text-sm text-gray-500">
                                Product ID: <span className="font-medium text-gray-700">{item.productId}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Price (Desktop) */}
                          <div className="text-right hidden sm:block min-w-[100px]">
                            <p className="font-semibold text-gray-900 text-xl">{formatCurrency(item.price)}</p>
                            <p className="text-sm text-gray-500">each</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                              Total: {formatCurrency(item.itemTotal || item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-medium text-gray-900">{order.order_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer ID:</span>
                        <span className="font-medium text-gray-900">{order.user_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date:</span>
                        <span className="font-medium text-gray-900">{formatDate(order.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium text-gray-900">{formatDate(order.updated_at)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items Count:</span>
                        <span className="font-medium text-gray-900">{order.item_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium text-gray-900">{order.payment_method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor.replace('bg-', 'bg-')} bg-opacity-10 ${statusConfig.textColor}`}>
                          {statusConfig.icon}
                          <span className="capitalize">{statusConfig.label}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Timeline & Action Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Order Actions</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm text-gray-500">
                      <p>Order Total: <span className="font-bold text-gray-900">{formatCurrency(order.total)}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.order_id, 'processing')}
                          disabled={updating}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                        >
                          Mark as Processing
                        </button>
                      )}
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <button
                          onClick={() => updateOrderStatus(order.order_id, 'out-for-delivery')}
                          disabled={updating}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                        >
                          Mark as Out for Delivery
                        </button>
                      )}
                      {(order.status === 'processing' || order.status === 'out-for-delivery') && (
                        <button
                          onClick={() => updateOrderStatus(order.order_id, 'delivered')}
                          disabled={updating}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                        >
                          Mark as Delivered
                        </button>
                      )}
                      {order.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this order?')) {
                              updateOrderStatus(order.order_id, 'cancelled');
                            }
                          }}
                          disabled={updating}
                          className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                      {updating && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          Updating...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-700">Loading orders...</h3>
        <p className="text-gray-500 mt-1">Please wait while we fetch your orders</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Error loading orders</h3>
        <p className="text-gray-500">{error}</p>
        <button
          onClick={() => fetchOrders()}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Store Orders</h2>
          <p className="text-gray-500 mt-1">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button className="px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button 
            onClick={() => fetchOrders()}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by ID, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filters.status === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All Orders
            </button>
            {statusOptions.map(status => (
              <button
                key={status.value}
                onClick={() => setFilters(prev => ({ ...prev, status: status.value }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${filters.status === status.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <div className={`w-2 h-2 rounded-full ${status.bgColor}`}></div>
                {status.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Additional Filters */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="total_high">Total (High to Low)</option>
            <option value="total_low">Total (Low to High)</option>
          </select>
          
          <select 
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard key={order.order_id} order={order} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOrdersSection;