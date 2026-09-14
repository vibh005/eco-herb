import { Link } from 'react-router-dom'
import { Leaf, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif text-xl font-semibold">Eco Herb</span>
            </div>
            <p className="text-green-200 text-sm leading-relaxed mb-4">
              Handcrafted natural soaps made with love, pure herbs, and botanical goodness.
              Kind to your skin, kind to the Earth.
            </p>
            <div className="flex gap-3">
              {['Instagram', 'Facebook', 'X'].map(platform => (
                <a key={platform} href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors text-xs font-bold text-white">
                  {platform[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop All' },
                { to: '/about', label: 'About Us' },
                { to: '/orders', label: 'Track Order' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-green-200 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-4">Policies</h4>
            <ul className="space-y-2">
              {[
                'Privacy Policy',
                'Shipping Policy',
                'Return & Refund',
                'Terms of Service',
              ].map(item => (
                <li key={item}>
                  <a href="#" className="text-green-200 hover:text-white text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-primary-light mt-0.5 flex-shrink-0" />
                <span className="text-green-200 text-sm">hello@ecoherb.in</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-primary-light mt-0.5 flex-shrink-0" />
                <span className="text-green-200 text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary-light mt-0.5 flex-shrink-0" />
                <span className="text-green-200 text-sm">India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-green-300 text-sm">
            © {new Date().getFullYear()} Eco Herb. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <img src="https://razorpay.com/favicon.ico" alt="Razorpay" className="w-4 h-4 opacity-60" />
            <span className="text-green-300 text-xs">Secured by Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
