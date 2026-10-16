import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <p className="text-red-500 font-bold tracking-widest text-sm uppercase">Prestigious</p>
          <p className="text-white font-semibold">Home Services, LLC.</p>
          <p className="text-sm mt-2">Trusted contractor since 2011.</p>
          <p className="text-sm">Licensed &amp; Insured.</p>
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <p className="text-white font-semibold mb-1">Quick Links</p>
          <Link to="/" className="hover:text-red-500 transition-colors">Home</Link>
          <Link to="/work" className="hover:text-red-500 transition-colors">Our Work</Link>
          <Link to="/contact" className="hover:text-red-500 transition-colors">Contact</Link>
        </div>

        <div className="text-sm">
          <p className="text-white font-semibold mb-1">Contact</p>
          <a href="tel:+13862878579" className="hover:text-red-500 transition-colors block">
            (386) 287-8579
          </a>
          <p className="mt-1">Serving Nationwide</p>
        </div>
      </div>
      <div className="border-t border-stone-800 text-center py-4 text-xs text-stone-600">
        &copy; {new Date().getFullYear()} Prestigious Home Services, LLC. All rights reserved.
      </div>
    </footer>
  )
}
