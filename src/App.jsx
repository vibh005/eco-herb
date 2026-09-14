import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

// Layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'

// Admin
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import ProductList from './pages/admin/ProductList'
import AddProduct from './pages/admin/AddProduct'
import Categories from './pages/admin/Categories'
import Orders from './pages/admin/Orders'

function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      {children}
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/shop" element={<MainLayout><Shop /></MainLayout>} />
            <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            {/* Protected routes */}
            <Route path="/checkout" element={
              <ProtectedRoute>
                <MainLayout><Checkout /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/order-confirmation/:id" element={
              <ProtectedRoute>
                <MainLayout><OrderConfirmation /></MainLayout>
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="add-product" element={<AddProduct />} />
              <Route path="edit-product/:id" element={<AddProduct />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<Orders />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
