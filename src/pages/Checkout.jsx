import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Lock } from 'lucide-react'
import api from '../lib/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Chandigarh','Puducherry',
]

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate  = useNavigate()

  const shipping = subtotal >= 499 ? 0 : 60
  const total    = subtotal + shipping

  const [form, setForm] = useState({
    name:    user?.name || '',
    email:   user?.email || '',
    phone:   '',
    address: '',
    city:    '',
    state:   '',
    pincode: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const update = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())             errs.name    = 'Name is required'
    if (!form.email.trim())            errs.email   = 'Email is required'
    if (!/^\d{10}$/.test(form.phone))  errs.phone   = 'Enter a valid 10-digit phone number'
    if (!form.address.trim())          errs.address = 'Address is required'
    if (!form.city.trim())             errs.city    = 'City is required'
    if (!form.state)                   errs.state   = 'Select your state'
    if (!/^\d{6}$/.test(form.pincode)) errs.pincode = 'Enter a valid 6-digit pincode'
    return errs
  }

  const loadRazorpay = () =>
    new Promise(resolve => {
      if (window.Razorpay) return resolve(true)
      const s = document.createElement('script')
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.onload  = () => resolve(true)
      s.onerror = () => resolve(false)
      document.body.appendChild(s)
    })

  const handlePlaceOrder = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    if (items.length === 0) return

    setLoading(true)
    try {
      const ok = await loadRazorpay()
      if (!ok) { alert('Payment gateway failed to load. Check your connection.'); setLoading(false); return }

      // Create order in backend (gets Razorpay order ID)
      const { data: order } = await api.post('/api/orders', {
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        subtotal,
        shipping,
        total,
        shippingAddress: form,
      })

      // Open Razorpay checkout
      const options = {
        key:         order.keyId,
        amount:      order.amount,
        currency:    order.currency,
        order_id:    order.razorpayOrderId,
        name:        'Eco Herb',
        description: `Order #${order.orderId}`,
        image:       '/leaf.svg',
        handler: async function (response) {
          try {
            // Verify payment signature on backend
            await api.post(`/api/orders/${order.orderId}/verify`, {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            })
            clearCart()
            navigate(`/order-confirmation/${order.orderId}`)
          } catch {
            alert('Payment verification failed. Please contact support.')
            setLoading(false)
          }
        },
        prefill: {
          name:    form.name,
          email:   form.email,
          contact: `+91${form.phone}`,
        },
        theme:  { color: '#2D6A4F' },
        modal:  { ondismiss: () => setLoading(false) },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => {
        alert('Payment failed. Please try again.')
        setLoading(false)
      })
      rzp.open()
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <ShoppingBag className="w-16 h-16 text-gray-300" />
      <h2 className="font-serif text-2xl text-gray-700">Your cart is empty</h2>
      <Link to="/shop" className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-dark">Continue Shopping</Link>
    </div>
  )

  const Field = ({ label, name, type = 'text', placeholder, required }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={form[name]}
        onChange={e => update(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary'
        }`}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-10">
        {/* Shipping form */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-serif text-xl font-semibold mb-5">Shipping Details</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name"  name="name"  placeholder="Your full name"       required />
                <Field label="Email"      name="email" type="email" placeholder="email@example.com" required />
              </div>
              <Field label="Phone Number" name="phone" type="tel" placeholder="10-digit mobile number" required />
              <Field label="Street Address" name="address" placeholder="Flat, House No., Building..." required />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="City" name="city" placeholder="City" required />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">State <span className="text-red-500">*</span></label>
                  <select
                    value={form.state}
                    onChange={e => update('state', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.state ? 'border-red-400' : 'border-gray-200 focus:border-primary'}`}
                  >
                    <option value="">Select State</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
              </div>
              <div className="w-1/2">
                <Field label="Pincode" name="pincode" placeholder="6-digit pincode" required />
              </div>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-24">
            <h2 className="font-serif text-xl font-semibold mb-5">Order Summary</h2>
            <div className="space-y-3 mb-5">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-warm rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={(Array.isArray(item.images) && item.images[0]) || `https://placehold.co/48x48/52B788/fff?text=${item.name?.slice(0,2)}`}
                      alt={item.name} className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-primary font-medium' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-100 pt-3 mt-2">
                <span>Total</span><span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-4 rounded-full transition-colors disabled:opacity-70 text-lg"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Lock className="w-4 h-4" /> Pay ₹{total.toFixed(2)}</>
              }
            </button>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Lock className="w-3 h-3 text-gray-400" />
              <p className="text-xs text-gray-400">Secured by Razorpay · 256-bit SSL</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
