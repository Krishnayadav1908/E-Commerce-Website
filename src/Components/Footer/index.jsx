import { NavLink } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-black text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white">KrishCart</h2>
          <p className="mt-4 text-sm text-gray-400 leading-relaxed">
            A modern ecommerce platform built with React & Tailwind CSS.
            Designed for a smooth and delightful shopping experience.
          </p>
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <NavLink to="/" className="hover:text-white transition">
                All Products
              </NavLink>
            </li>
            <li>
              <NavLink to="/clothes" className="hover:text-white transition">
                Clothes
              </NavLink>
            </li>
            <li>
              <NavLink to="/electronics" className="hover:text-white transition">
                Electronics
              </NavLink>
            </li>
            <li>
              <NavLink to="/furnitures" className="hover:text-white transition">
                Furniture
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <NavLink to="/my-account" className="hover:text-white transition">
                My Account
              </NavLink>
            </li>
            <li>
              <NavLink to="/my-orders" className="hover:text-white transition">
                My Orders
              </NavLink>
            </li>
            <li>
              <NavLink to="/sign-in" className="hover:text-white transition">
                Sign In
              </NavLink>
            </li>
            <li>
              <NavLink to="/performance" className="hover:text-white transition">
                Performance
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Social / External */}
        <div>
          <h3 className="text-white font-semibold mb-4">Connect</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://github.com/Krishnayadav1908"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                Twitter
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 text-center py-6 text-sm text-gray-500">
        © {new Date().getFullYear()} KrishCart. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer