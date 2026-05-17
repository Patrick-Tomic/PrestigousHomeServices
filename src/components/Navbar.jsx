import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-zinc-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="Prestigious Home Services" className="w-[5vw] h-[5vh] object-contain" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide transition-colors ${
                  isActive ? 'text-red-500' : 'text-zinc-300 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <a
            href="tel:+13862878579"
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-4 py-2 rounded transition-colors"
          >
            (386) 287-8579
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded text-zinc-300 hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div className="w-5 flex flex-col gap-1">
            <span className={`block h-0.5 bg-current transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-current transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-zinc-800 border-t border-zinc-700 px-4 pb-4 flex flex-col gap-3 pt-3">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-sm font-medium py-1 ${isActive ? 'text-red-500' : 'text-zinc-300'}`
              }
            >
              {label}
            </NavLink>
          ))}
          <a
            href="tel:+13862878579"
            className="bg-red-600 text-white font-bold text-sm px-4 py-2 rounded text-center mt-1"
          >
            Call (386) 287-8579
          </a>
        </div>
      )}
    </header>
  )
}
