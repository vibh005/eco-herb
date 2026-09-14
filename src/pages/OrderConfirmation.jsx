import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Package, Home } from 'lucide-react'
import api from '../lib/api'

export default function OrderConfirmation() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    api.get(`/api/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(() => {})
  }, [id])

  return (
    <main className="min-h-screen bg-warm flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-3xl shadow-lg p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-6">
            Thank you for your order. We'll get it packed and shipped shortly!
          </p>

          {order && (
            <div className="bg-green-50 rounded-2xl p-5 text-left mb-6 space-y-2">
              <p className="text-sm font-semibold text-gray-800">Order Details</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono font-medium text-gray-900">#{order.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Paid</span>
                <span className="font-bold text-primary">₹{Number(order.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className="text-green-600 font-medium capitalize">{order.status}</span>
              </div>
              {order.shipping_address && (
                <div className="text-sm pt-2 border-t border-green-100">
                  <p className="text-gray-600 mb-1">Delivering to:</p>
                  <p className="text-gray-800">
                    {order.shipping_address.name}, {order.shipping_address.address},{' '}
                    {order.shipping_address.city}, {order.shipping_address.state} – {order.shipping_address.pincode}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/shop"
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-full font-medium hover:bg-primary-dark transition-colors"
            >
              <Package className="w-4 h-4" />
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 py-3.5 rounded-full font-medium hover:border-primary hover:text-primary transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            You'll receive a confirmation email at {order?.shipping_address?.email}
          </p>
        </div>
      </div>
    </main>
  )
}
