import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import api from '../lib/api'
import ProductCard from '../components/ProductCard'

const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Newest First' },
  { value: 'price-asc',       label: 'Price: Low to High' },
  { value: 'price-desc',      label: 'Price: High to Low' },
  { value: 'name-asc',        label: 'Name A–Z' },
]

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]         = useState([])
  const [allProducts, setAllProducts]   = useState([])
  const [categories, setCategories]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')

  const activeCategory = searchParams.get('category') || 'all'
  const sortBy         = searchParams.get('sort') || 'created_at-desc'

  useEffect(() => {
    api.get('/api/categories')
      .then(res => setCategories(res.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { sort: sortBy }
    if (activeCategory !== 'all') params.category = activeCategory

    api.get('/api/products', { params })
      .then(res => {
        setAllProducts(res.data)
        setProducts(res.data)
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [activeCategory, sortBy])

  // Client-side search filter
  useEffect(() => {
    if (!search.trim()) {
      setProducts(allProducts)
    } else {
      setProducts(
        allProducts.filter(p =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase())
        )
      )
    }
  }, [search, allProducts])

  const setCategory = (cat) => {
    const params = new URLSearchParams(searchParams)
    cat === 'all' ? params.delete('category') : params.set('category', cat)
    setSearchParams(params)
  }

  const setSort = (sort) => {
    const params = new URLSearchParams(searchParams)
    params.set('sort', sort)
    setSearchParams(params)
  }

  const allCats = [{ name: 'All', slug: 'all' }, ...categories]

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-gray-900">
          {activeCategory === 'all' ? 'All Products' : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
        </h1>
        <p className="text-gray-500 mt-2">{loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''}`}</p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={sortBy}
          onChange={e => setSort(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        {allCats.map(cat => (
          <button
            key={cat.slug}
            onClick={() => setCategory(cat.slug)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all border ${
              activeCategory === cat.slug
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl">🌿</span>
          <h3 className="font-serif text-xl mt-4 text-gray-700">No products found</h3>
          <p className="text-gray-500 mt-2">{search ? `No results for "${search}"` : 'No products in this category yet.'}</p>
          {search && <button onClick={() => setSearch('')} className="mt-4 text-primary font-medium hover:underline">Clear search</button>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </main>
  )
}
