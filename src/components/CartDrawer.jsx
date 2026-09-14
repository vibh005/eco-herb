import { Link } from 'react-router-dom'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
  const { items, isOpen, closeDrawer, removeItem, updateQty, subtotal, itemCount } = useCart()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="cart-overlay fixed inset-0 bg-black/40 z-40"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="cart-drawer fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl font-semibold">
              Your Cart
              {itemCount > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">({itemCount} items)</span>
              )}
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-9 h-9 text-primary-light" />
              </div>
              <div>
                <p className="font-serif text-lg text-gray-700">Your cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">Add some natural goodness!</p>
              </div>
              <button
                onClick={closeDrawer}
                className="mt-2 px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-dark transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => {
                const image = Array.isArray(item.images) && item.images.length > 0
                  ? item.images[0]
                  : `https://placehold.co/80x80/52B788/fff?text=${encodeURIComponent(item.name?.slice(0,2))}`
                return (
                  <div key={item.id} className="flex gap-4 bg-warm rounded-xl p-3">
                    <img
                      src={image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-primary font-medium">{item.category}</p>
                      <p className="font-medium text-sm text-gray-900 line-clamp-2">{item.name}</p>
                      <p className="text-primary font-bold text-sm mt-1">₹{item.price}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200 px-2 py-1">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-primary"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-primary"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 space-y-4 bg-white">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Shipping</span>
              <span className={subtotal >= 499 ? 'text-primary font-medium' : ''}>
                {subtotal >= 499 ? 'FREE' : '₹60'}
              </span>
            </div>
            {subtotal < 499 && (
              <p className="text-xs text-gray-400 text-center">
                Add ₹{(499 - subtotal).toFixed(0)} more for free shipping!
              </p>
            )}
            <Link
              to="/checkout"
              onClick={closeDrawer}
              className="block w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-medium text-center rounded-full transition-colors"
            >
              Proceed to Checkout · ₹{(subtotal + (subtotal >= 499 ? 0 : 60)).toFixed(2)}
            </Link>
            <button
              onClick={closeDrawer}
              className="block w-full py-2.5 text-sm text-gray-600 hover:text-primary text-center"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
