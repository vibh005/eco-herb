import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { addItem } = useCart()

  const mainImage = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : `https://placehold.co/400x400/52B788/fff?text=${encodeURIComponent(product.name)}`

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-stone-100">
      <Link to={`/product/${product.id}`} className="block">
        {/* Image */}
        <div className="product-img-wrap relative aspect-square bg-warm">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {product.is_new && (
            <span className="absolute top-3 left-3 bg-accent text-white text-xs font-medium px-2.5 py-1 rounded-full">
              New
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-primary font-medium uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h3 className="font-serif text-base font-semibold text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
              {product.original_price && (
                <span className="ml-2 text-sm text-gray-400 line-through">₹{product.original_price}</span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-3 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>
      </Link>
    </div>
  )
}
