import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const { saveToken }  = useAuth()
  const navigate       = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      navigate('/login?error=1', { replace: true })
      return
    }
    saveToken(token).then(() => {
      navigate('/', { replace: true })
    }).catch(() => {
      navigate('/login?error=1', { replace: true })
    })
  }, [])

  return (
    <div className="min-h-screen bg-warm flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Leaf className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600 font-medium">Signing you in...</p>
      </div>
    </div>
  )
}
