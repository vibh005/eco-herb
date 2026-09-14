import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, TrendingUp, PlusCircle } from 'lucide-react'
import api from '../../lib/api'

export default function AdminDashboard() {
  const [stats, setStats]             = useState({ products: 0, orders: 0, revenue: 0, pending_orders: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/orders/stats'),
      api.get('/api/admin/orders/recent'),
    ])
      .then(([statsRes, recentRes]) => {
        setStats(statsRes.data)
        setRecentOrders(recentRes.data)
      })
      .catch(err => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Products', value: stats.products,      icon: Package,      color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Orders',   value: stats.orders,        icon: ShoppingBag,  color: 'bg-green-50 text-green-600' },
    { label: 'Revenue',        value: `₹${Number(stats.revenue).toFixed(2)}`, icon: TrendingUp, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Pending Orders', value: stats.pending_orders, icon: ShoppingBag, color: 'bg-red-50 text-red-600' },
  ]

  const statusColor = (s) => ({
    confirmed:  'bg-green-100 text-green-700',
    pending:    'bg-yellow-100 text-yellow-700',
    shipped:    'bg-blue-100 text-blue-700',
    delivered:  'bg-purple-100 text-purple-700',
    cancelled:  'bg-red-100 text-red-700',
  }[s] || 'bg-gray-100 text-gray-700')

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <Link
          to="/admin/add-product"
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-medium hover:bg-primary-dark transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? '—' : card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Order ID</th>
                <th className="px-6 py-3 text-left font-medium">Customer</th>
                <th className="px-6 py-3 text-left font-medium">Total</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No orders yet</td></tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-gray-700">#{order.id}</td>
                    <td className="px-6 py-4 text-gray-800">{order.shipping_address?.name || '—'}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">₹{Number(order.total).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
