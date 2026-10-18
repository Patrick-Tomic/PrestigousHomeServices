import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useProject } from './designer/projectStore'
import { CartIcon } from './designer/icons'

const links = [
  { to: '/', label: 'Home' },
  { to: '/work', label: 'Our Work' },
  { to: '/design', label: 'Design Your Room' },
  { to: '/contact', label: 'Contact' },
]

function PhoneIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

// My Project link with a count badge.
function ProjectLink({ count, onClick, className = '' }) {
  return (
    <NavLink
      to="/project"
      onClick={onClick}
      aria-label={`My project, ${count} room${count === 1 ? '' : 's'}`}
      className={({ isActive }) => `relative p-2.5 rounded-md transition-colors ${isActive ? 'text-white bg-white/10' : 'text-stone-300 hover:text-white hover:bg-white/5'} ${className}`}
    >
      <CartIcon className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold leading-[18px] text-center tabular-nums ring-2 ring-stone-900">
          {count}
        </span>
      )}
    </NavLink>
  )
}

export default function Navbar() {
  const projectCount = useProject().length
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => setOpen(false)

  return (
    <header
      className={`sticky top-0 z-50 text-white transition-all duration-300 ${
        scrolled || open
          ? 'bg-stone-900/95 backdrop-blur-md shadow-lg shadow-black/30 border-b border-white/5'
          : 'bg-stone-900 border-b border-transparent'
      }`}
    >
      <div
        className={`max-w-6xl mx-auto px-4 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'h-16' : 'h-20'
        }`}
      >
        <Link to="/" onClick={close} className="flex items-center gap-3 group" aria-label="Prestigious Home Services — Home">
          <span
            className={`relative overflow-hidden rounded-lg bg-black ring-1 ring-white/10 transition-all duration-300 ${
              scrolled ? 'w-10 h-10' : 'w-12 h-12'
            }`}
          >
            <img
              src="/logo-nav.webp"
              alt=""
              width="48"
              height="48"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.07]"
            />
          </span>
          <span className="leading-tight">
            <span className="block text-red-500 font-bold tracking-[0.2em] text-xs uppercase">Prestigious</span>
            <span className="block text-white font-semibold text-sm sm:text-base">Home Services</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Main">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `relative py-2 text-sm font-medium tracking-wide transition-colors after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-full after:bg-red-500 after:origin-left after:transition-transform after:duration-300 ${
                  isActive
                    ? 'text-white after:scale-x-100'
                    : 'text-stone-300 hover:text-white after:scale-x-0 hover:after:scale-x-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <ProjectLink count={projectCount} className="-mx-3" />
          <a
            href="tel:+13862878579"
            className="group flex items-center gap-2.5 bg-red-600 hover:bg-red-500 text-white pl-3 pr-4 py-2 rounded-md shadow-md shadow-red-900/40 transition-all hover:-translate-y-px"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/15">
              <PhoneIcon className="w-3.5 h-3.5" />
            </span>
            <span className="leading-tight text-left">
              <span className="block text-[10px] uppercase tracking-wider text-red-100">Free Estimates</span>
              <span className="block font-bold text-sm">(386) 287-8579</span>
            </span>
          </a>
        </nav>

        {/* Mobile actions */}
        <div className="lg:hidden flex items-center gap-1">
          <ProjectLink count={projectCount} onClick={close} />
          <a
            href="tel:+13862878579"
            className="p-2.5 rounded-md text-red-500 hover:text-red-400 hover:bg-white/5"
            aria-label="Call (386) 287-8579"
          >
            <PhoneIcon className="w-5 h-5" />
          </a>
          <button
            className="p-2.5 rounded-md text-stone-300 hover:text-white hover:bg-white/5"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <div className="w-5 flex flex-col gap-1">
              <span className={`block h-0.5 bg-current transition-all duration-300 ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`lg:hidden grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
        inert={!open}
      >
        <div className="overflow-hidden">
          <nav className="border-t border-white/10 px-4 py-4 flex flex-col gap-1" aria-label="Mobile">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={close}
                className={({ isActive }) =>
                  `px-3 py-3 rounded-md text-base font-medium border-l-2 transition-colors ${
                    isActive
                      ? 'text-white bg-white/5 border-red-500'
                      : 'text-stone-300 border-transparent hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <a
              href="tel:+13862878579"
              className="mt-3 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-3 rounded-md"
            >
              <PhoneIcon className="w-4 h-4" />
              Call for a Free Estimate
            </a>
            <p className="text-center text-xs text-stone-500 mt-2">Licensed &amp; Insured · Trusted since 2011</p>
          </nav>
        </div>
      </div>
    </header>
  )
}
