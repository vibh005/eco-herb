import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import api from '../../lib/api'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [adding, setAdding]         = useState(false)
  const [editId, setEditId]         = useState(null)
  const [newCat, setNewCat]         = useState({ name: '', slug: '', description: '', emoji: '🌿' })
  const [editForm, setEditForm]     = useState({})

  useEffect(() => { load() }, [])

  async function load() {
    api.get('/api/admin/categories')
      .then(res => setCategories(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const handleAdd = async () => {
    if (!newCat.name.trim()) return
    const slug = newCat.slug || slugify(newCat.name)
    try {
      await api.post('/api/admin/categories', {
        name:        newCat.name.trim(),
        slug,
        description: newCat.description.trim(),
        emoji:       newCat.emoji,
        sort_order:  categories.length + 1,
      })
      setNewCat({ name: '', slug: '', description: '', emoji: '🌿' })
      setAdding(false)
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add category')
    }
  }

  const handleEdit = async (id) => {
    try {
      await api.put(`/api/admin/categories/${id}`, editForm)
      setEditId(null)
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update category')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      await api.delete(`/api/admin/categories/${id}`)
      setCategories(c => c.filter(x => x.id !== id))
    } catch {
      alert('Failed to delete category')
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-medium hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-white rounded-2xl border border-primary/20 p-6 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">New Category</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
              <input
                value={newCat.name}
                onChange={e => setNewCat(n => ({ ...n, name: e.target.value, slug: slugify(e.target.value) }))}
                placeholder="e.g. Herbal"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug (auto)</label>
              <input
                value={newCat.slug}
                onChange={e => setNewCat(n => ({ ...n, slug: e.target.value }))}
                placeholder="herbal"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Emoji</label>
              <input
                value={newCat.emoji}
                onChange={e => setNewCat(n => ({ ...n, emoji: e.target.value }))}
                className="w-20 px-4 py-2.5 border border-gray-200 rounded-xl text-2xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <input
                value={newCat.description}
                onChange={e => setNewCat(n => ({ ...n, description: e.target.value }))}
                placeholder="Short description"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary-dark">
              <Check className="w-4 h-4" /> Save Category
            </button>
            <button onClick={() => setAdding(false)} className="flex items-center gap-2 border border-gray-200 text-gray-600 px-5 py-2.5 rounded-full text-sm font-medium hover:border-gray-300">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Category</th>
              <th className="px-6 py-3 text-left font-medium">Slug</th>
              <th className="px-6 py-3 text-left font-medium">Description</th>
              <th className="px-6 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No categories yet. Add one above!</td></tr>
            ) : (
              categories.map(cat => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  {editId === cat.id ? (
                    <>
                      <td className="px-6 py-3">
                        <input
                          value={editForm.name || ''}
                          onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          value={editForm.slug || ''}
                          onChange={e => setEditForm(f => ({ ...f, slug: e.target.value }))}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          value={editForm.description || ''}
                          onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(cat.id)} className="text-green-600 hover:text-green-700">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{cat.emoji || '🌿'}</span>
                          <span className="font-medium text-gray-900">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{cat.slug}</td>
                      <td className="px-6 py-4 text-gray-600">{cat.description || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditId(cat.id); setEditForm(cat) }}
                            className="p-2 text-gray-500 hover:text-primary hover:bg-green-50 rounded-lg"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
