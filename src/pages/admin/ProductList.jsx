import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Pencil, Trash2, Search, Eye, EyeOff } from 'lucide-react'
import api from '../../lib/api'

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { loadProducts() }, [])

  async function loadProducts() {
    setLoading(true)
    api.get('/api/admin/products')
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setDeleting(id)
    try {
      await api.delete(`/api/admin/products/${id}`)
      setProducts(p => p.filter(x => x.id !== id))
    } catch (err) {
      alert('Failed to delete product')
    } finally {
      setDeleting(null)
    }
  }

  const toggleActive = async (product) => {
    try {
      const res = await api.patch(`/api/admin/products/${product.id}`, { active: !product.active })
      setProducts(p => p.map(x => x.id === product.id ? res.data : x))
    } catch {
      alert('Failed to update product')
    }
  }

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Products</h1>
        <Link
          to="/admin/add-product"
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-medium hover:bg-primary-dark"
        >
          <PlusCircle className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Product</th>
                <th className="px-6 py-3 text-left font-medium">Category</th>
                <th className="px-6 py-3 text-left font-medium">Price</th>
                <th className="px-6 py-3 text-left font-medium">Stock</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No products found</td></tr>
              ) : (
                filtered.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-warm flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                          {product.is_featured && (
                            <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{product.category}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">₹{product.price}</span>
                      {product.original_price && (
                        <span className="ml-1.5 text-xs text-gray-400 line-through">₹{product.original_price}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={product.stock === 0 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {product.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/edit-product/${product.id}`}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => toggleActive(product)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={product.active ? 'Hide' : 'Show'}
                        >
                          {product.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
