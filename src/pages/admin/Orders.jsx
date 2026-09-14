import { useEffect, useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import api from '../../lib/api'

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const statusColor = (s) => ({
  confirmed:  'bg-green-100 text-green-700',
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-purple-100 text-purple-700',
  cancelled:  'bg-red-100 text-red-700',
}[s] || 'bg-gray-100 text-gray-700')

export default function Orders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    setLoading(true)
    api.get('/api/admin/orders')
      .then(res => setOrders(res.data))
      .catch(err => { console.error(err); setOrders([]) })
      .finally(() => setLoading(false))
  }

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/admin/orders/${id}/status`, { status })
      setOrders(o => o.map(x => x.id === id ? { ...x, status } : x))
    } catch {
      alert('Failed to update order status')
    }
  }

  const formatDate = (ts) => {
    if (!ts) return '—'
    return new Date(ts).toLocaleString('en-IN')
  }

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      String(o.id).includes(search) ||
      o.shipping_address?.name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || o.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Orders</h1>
        <span className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
          {orders.length} total
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or order ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['all', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                filter === s ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No orders found</div>
        ) : (
          filtered.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-mono font-medium text-gray-800">#{order.id}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-700">{order.shipping_address?.name || '—'}</p>
                    <p className="text-xs text-gray-500">{order.shipping_address?.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-gray-900">₹{Number(order.total).toFixed(2)}</p>
                  <select
                    value={order.status}
                    onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value) }}
                    onClick={e => e.stopPropagation()}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-primary/30 cursor-pointer ${statusColor(order.status)}`}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded === order.id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {expanded === order.id && (
                <div className="px-6 pb-5 pt-1 border-t border-gray-100 bg-gray-50">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Items */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Items Ordered</p>
                      <div className="space-y-2">
                        {(order.items || []).map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.name} × {item.quantity}</span>
                            <span className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm font-bold mt-3 pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>₹{Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Shipping */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Shipping Address</p>
                      {order.shipping_address && (
                        <div className="text-sm text-gray-700 space-y-0.5">
                          <p className="font-medium">{order.shipping_address.name}</p>
                          <p>{order.shipping_address.address}</p>
                          <p>{order.shipping_address.city}, {order.shipping_address.state} – {order.shipping_address.pincode}</p>
                          <p className="text-gray-500">{order.shipping_address.phone}</p>
                          <p className="text-gray-500">{order.shipping_address.email}</p>
                        </div>
                      )}
                      {order.razorpay_payment_id && (
                        <p className="text-xs text-gray-400 mt-3 font-mono">Payment: {order.razorpay_payment_id}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
