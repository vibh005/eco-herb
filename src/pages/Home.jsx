import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Droplets, Shield, Truck, Star } from 'lucide-react'
import api from '../lib/api'
import ProductCard from '../components/ProductCard'

const DEFAULT_CATEGORIES = [
  { name: 'Herbal',      slug: 'herbal',      emoji: '🌿' },
  { name: 'Ayurvedic',   slug: 'ayurvedic',   emoji: '🌸' },
  { name: 'Charcoal',    slug: 'charcoal',    emoji: '⚫' },
  { name: 'Floral',      slug: 'floral',      emoji: '🌺' },
  { name: 'Exfoliating', slug: 'exfoliating', emoji: '✨' },
]

const FEATURES = [
  { icon: Leaf,     title: '100% Natural',         desc: 'Pure botanical ingredients, no harsh chemicals' },
  { icon: Droplets, title: 'Skin Nourishing',       desc: 'Rich in natural oils, vitamins and antioxidants' },
  { icon: Shield,   title: 'Dermatologist Tested',  desc: 'Safe for all skin types including sensitive skin' },
  { icon: Truck,    title: 'Free Shipping',          desc: 'Free delivery on orders above ₹499' },
]

export default function Home() {
  const [featured, setFeatured]     = useState([])
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/api/products?featured=true'),
          api.get('/api/categories'),
        ])
        setFeatured(prodRes.data.slice(0, 4))
        if (catRes.data.length > 0) setCategories(catRes.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary-light min-h-[90vh] flex items-center">
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-accent/20 rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-sm px-4 py-2 rounded-full mb-6">
              <Leaf className="w-4 h-4" />
              <span>100% Natural • Handcrafted in India</span>
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Pure Nature,<br />
              <span className="text-accent-light">Pure Skin</span>
            </h1>
            <p className="text-green-100 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl">
              Discover our range of handcrafted herbal soaps made with nature's finest ingredients.
              Gentle on your skin, gentle on the planet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop" className="inline-flex items-center justify-center gap-2 bg-white text-primary font-semibold px-8 py-4 rounded-full hover:bg-green-50 transition-colors text-lg shadow-lg">
                Shop Now <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#about" className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-medium px-8 py-4 rounded-full hover:bg-white/10 transition-colors text-lg">
                Our Story
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white py-12 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map(f => (
              <div key={f.title} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-primary font-medium text-sm uppercase tracking-widest mb-2">Browse By</p>
          <h2 className="font-serif text-4xl font-bold text-gray-900">Our Collections</h2>
          <p className="text-gray-500 mt-3 max-w-md mx-auto">Each collection crafted for a specific skin need.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.slug || cat.name}
              to={`/shop?category=${cat.slug || cat.name}`}
              className="group flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-stone-100 hover:border-primary hover:shadow-md transition-all"
            >
              <span className="text-4xl">{cat.emoji || '🌿'}</span>
              <span className="font-medium text-sm text-gray-800 group-hover:text-primary transition-colors text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-warm py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-primary font-medium text-sm uppercase tracking-widest mb-2">Bestsellers</p>
              <h2 className="font-serif text-4xl font-bold text-gray-900">Featured Products</h2>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-8 bg-gray-200 rounded-full w-1/2 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Products coming soon! Check back later.</p>
              <Link to="/shop" className="mt-4 inline-block text-primary font-medium hover:underline">Browse All →</Link>
            </div>
          )}

          <div className="text-center mt-10 sm:hidden">
            <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-primary font-medium text-sm uppercase tracking-widest mb-3">Our Story</p>
            <h2 className="font-serif text-4xl font-bold text-gray-900 mb-6 leading-tight">
              From Nature's Garden<br /><span className="text-primary">To Your Skin</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Eco Herb was born from a deep love for nature and a belief that the best skincare
              comes from the Earth itself. Every bar we craft is made by hand, using traditional
              cold-process methods that preserve the natural goodness of our ingredients.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              We source our herbs and botanicals from trusted organic farms across India, ensuring
              the purest, most potent ingredients in every soap. No parabens, no SLS, no synthetic
              fragrances — just pure nature.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[{ num: '20+', label: 'Products' }, { num: '100%', label: 'Natural' }, { num: '1000+', label: 'Happy Customers' }].map(s => (
                <div key={s.label} className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="font-serif text-2xl font-bold text-primary">{s.num}</p>
                  <p className="text-xs text-gray-600 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-3xl flex items-center justify-center">
              <div className="text-center">
                <span className="text-8xl">🌿</span>
                <p className="font-serif text-xl text-primary-dark mt-4 font-semibold">Handcrafted with Love</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <Star className="w-6 h-6 text-white mx-auto" />
                <p className="text-white text-xs font-bold mt-1">100%</p>
                <p className="text-white text-xs">Natural</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-dark py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-serif text-4xl font-bold text-white mb-4">Ready to Transform Your Skincare?</h2>
          <p className="text-green-200 mb-8 text-lg">Join thousands of happy customers who've made the switch to natural.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-10 py-4 rounded-full hover:bg-green-50 transition-colors text-lg shadow-lg">
            Shop Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  )
}
