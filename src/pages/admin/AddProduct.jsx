import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, X, Plus, Trash2, ArrowLeft } from 'lucide-react'
import api from '../../lib/api'

export default function AddProduct() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const isEdit   = Boolean(id)

  const [form, setForm] = useState({
    name: '', description: '', price: '', original_price: '',
    category: '', weight: '', stock: '', active: true,
    is_featured: false, is_new: false,
  })
  const [images, setImages]               = useState([])         // File objects to upload
  const [existingImages, setExistingImages] = useState([])       // URLs already saved
  const [benefits, setBenefits]           = useState([''])
  const [ingredients, setIngredients]     = useState([''])
  const [categories, setCategories]       = useState([])
  const [saving, setSaving]               = useState(false)
  const [errors, setErrors]               = useState({})

  useEffect(() => {
    // Load categories
    api.get('/api/categories').then(res => setCategories(res.data)).catch(() => {})

    // Load existing product if editing
    if (isEdit) {
      api.get(`/api/admin/products`).then(res => {
        const prod = res.data.find(p => String(p.id) === String(id))
        if (prod) {
          setForm({
            name:           prod.name || '',
            description:    prod.description || '',
            price:          prod.price || '',
            original_price: prod.original_price || '',
            category:       prod.category || '',
            weight:         prod.weight || '',
            stock:          prod.stock || '',
            active:         prod.active ?? true,
            is_featured:    prod.is_featured || false,
            is_new:         prod.is_new || false,
          })
          setExistingImages(prod.images || [])
          setBenefits(prod.benefits?.length ? prod.benefits : [''])
          setIngredients(prod.ingredients?.length ? prod.ingredients : [''])
        }
      }).catch(() => {})
    }
  }, [id, isEdit])

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleImgSelect = (e) => {
    const files = Array.from(e.target.files)
    setImages(prev => [...prev, ...files].slice(0, 5 - existingImages.length))
  }

  const removeNewImg     = (i)   => setImages(prev => prev.filter((_, idx) => idx !== i))
  const removeExistingImg = (url) => setExistingImages(prev => prev.filter(u => u !== url))

  const addBenefit    = () => setBenefits(b => [...b, ''])
  const updateBenefit = (i, v) => setBenefits(b => b.map((x, idx) => idx === i ? v : x))
  const removeBenefit = (i) => setBenefits(b => b.filter((_, idx) => idx !== i))

  const addIngredient    = () => setIngredients(ing => [...ing, ''])
  const updateIngredient = (i, v) => setIngredients(ing => ing.map((x, idx) => idx === i ? v : x))
  const removeIngredient = (i) => setIngredients(ing => ing.filter((_, idx) => idx !== i))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name required'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) errs.price = 'Valid price required'
    if (!form.category) errs.category = 'Category required'
    if (form.stock === '' || isNaN(form.stock)) errs.stock = 'Stock quantity required'
    return errs
  }

  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data.url
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSaving(true)
    try {
      // Upload new images to Cloudinary via backend
      const uploadedUrls = []
      for (const file of images) {
        const url = await uploadImage(file)
        uploadedUrls.push(url)
      }

      const payload = {
        name:           form.name.trim(),
        description:    form.description.trim(),
        price:          Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        category:       form.category,
        weight:         form.weight ? Number(form.weight) : null,
        stock:          Number(form.stock),
        active:         form.active,
        is_featured:    form.is_featured,
        is_new:         form.is_new,
        images:         [...existingImages, ...uploadedUrls],
        benefits:       benefits.filter(b => b.trim()),
        ingredients:    ingredients.filter(i => i.trim()),
      }

      if (isEdit) {
        await api.put(`/api/admin/products/${id}`, payload)
      } else {
        await api.post('/api/admin/products', payload)
      }

      navigate('/admin/products')
    } catch (err) {
      console.error(err)
      alert(`Error: ${err.response?.data?.error || err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={e => update(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
          errors[name] ? 'border-red-400' : 'border-gray-200'
        }`}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin/products')} className="text-gray-500 hover:text-primary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-serif text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Basic Information</h2>
          <Field label="Product Name *" name="name" placeholder="e.g. Neem & Tulsi Herbal Soap" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              rows={4}
              placeholder="Describe your product..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={e => update('category', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${errors.category ? 'border-red-400' : 'border-gray-200'}`}
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.slug || c.name}>{c.name}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
            <Field label="Weight (grams)" name="weight" type="number" placeholder="100" />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800">Pricing & Stock</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Selling Price (₹) *"  name="price"          type="number" placeholder="199" />
            <Field label="Original Price (₹)"   name="original_price" type="number" placeholder="249" />
            <Field label="Stock Quantity *"      name="stock"          type="number" placeholder="50" />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Product Images</h2>
          <div className="flex flex-wrap gap-3 mb-3">
            {existingImages.map((url, i) => (
              <div key={i} className="relative w-20 h-20">
                <img src={url} alt={`img-${i}`} className="w-full h-full object-cover rounded-xl" />
                <button
                  onClick={() => removeExistingImg(url)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.map((file, i) => (
              <div key={i} className="relative w-20 h-20">
                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover rounded-xl opacity-80" />
                <button
                  onClick={() => removeNewImg(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {existingImages.length + images.length < 5 && (
              <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-green-50 transition-colors">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Upload</span>
                <input type="file" multiple accept="image/*" onChange={handleImgSelect} className="hidden" />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-500">Up to 5 images. First image will be the main product image.</p>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Benefits</h2>
            <button onClick={addBenefit} className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {benefits.map((b, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={b}
                  onChange={e => updateBenefit(i, e.target.value)}
                  placeholder={`Benefit ${i + 1}`}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {benefits.length > 1 && (
                  <button onClick={() => removeBenefit(i)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Key Ingredients</h2>
            <button onClick={addIngredient} className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={ing}
                  onChange={e => updateIngredient(i, e.target.value)}
                  placeholder="e.g. Neem Extract"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {ingredients.length > 1 && (
                  <button onClick={() => removeIngredient(i)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Settings</h2>
          <div className="space-y-3">
            {[
              { key: 'active',      label: 'Active (visible on website)' },
              { key: 'is_featured', label: 'Featured (shown on homepage)' },
              { key: 'is_new',      label: 'Show "New" badge' },
            ].map(toggle => (
              <label key={toggle.key} className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => update(toggle.key, !form[toggle.key])}
                  className={`w-11 h-6 rounded-full transition-colors relative ${form[toggle.key] ? 'bg-primary' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form[toggle.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm text-gray-700">{toggle.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex gap-3 pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none sm:px-10 py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
          </button>
          <button
            onClick={() => navigate('/admin/products')}
            className="px-6 py-3.5 border-2 border-gray-200 text-gray-700 font-medium rounded-full hover:border-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
