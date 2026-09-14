import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Check, Minus, Plus, Leaf, ArrowLeft } from 'lucide-react'
import api from '../lib/api'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'

export default function ProductDetail() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [product, setProduct]         = useState(null)
  const [related, setRelated]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)
  const [quantity, setQuantity]       = useState(1)
  const [added, setAdded]             = useState(false)

  useEffect(() => {
    setLoading(true)
    setSelectedImg(0)
    setQuantity(1)
    setAdded(false)

    api.get(`/api/products/${id}`)
      .then(res => {
        setProduct(res.data)
        // Load related products
        return api.get('/api/products', { params: { category: res.data.category } })
      })
      .then(res => {
        setRelated(res.data.filter(p => String(p.id) !== String(id)).slice(0, 4))
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  )

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="font-serif text-2xl text-gray-700">Product not found</h2>
      <Link to="/shop" className="mt-4 inline-block text-primary font-medium hover:underline">← Back to Shop</Link>
    </div>
  )

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [`https://placehold.co/600x600/52B788/fff?text=${encodeURIComponent(product.name)}`]

  const benefits    = Array.isArray(product.benefits)    ? product.benefits    : []
  const ingredients = Array.isArray(product.ingredients) ? product.ingredients : []

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category}`} className="hover:text-primary capitalize">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-warm mb-4">
            <img src={images[selectedImg]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${selectedImg === i ? 'border-primary' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-primary font-medium text-sm uppercase tracking-wide mb-2">{product.category}</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
            {product.original_price && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.original_price}</span>
                <span className="bg-green-100 text-green-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {benefits.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Benefits</h3>
              <ul className="space-y-2">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />{b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ingredients.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-gray-900 text-sm">Key Ingredients</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing, i) => (
                  <span key={i} className="bg-white text-gray-700 text-xs px-3 py-1 rounded-full border border-green-100">{ing}</span>
                ))}
              </div>
            </div>
          )}

          {product.weight && <p className="text-sm text-gray-500 mb-6">Net Weight: <strong>{product.weight}g</strong></p>}

          {product.stock === 0 ? (
            <div className="mb-6">
              <span className="inline-block bg-red-100 text-red-700 text-sm font-medium px-4 py-2 rounded-full">Out of Stock</span>
            </div>
          ) : (
            <p className="text-sm text-green-600 font-medium mb-6">✓ In Stock ({product.stock} left)</p>
          )}

          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-2">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-primary">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-primary">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-base transition-all ${
                  added ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary-dark text-white'
                }`}
              >
                {added ? <><Check className="w-5 h-5" /> Added!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
              </button>
            </div>
          )}

          <div className="mt-6 p-4 bg-warm rounded-xl text-sm text-gray-600 space-y-1">
            <p>🚚 Free delivery on orders above ₹499</p>
            <p>📦 Usually ships in 1–2 business days</p>
            <p>↩️ Easy 7-day returns</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </main>
  )
}
