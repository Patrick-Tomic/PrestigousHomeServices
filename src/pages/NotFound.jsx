import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

const links = [
  { to: '/', label: 'Home', note: 'Who we are and what we do' },
  { to: '/work', label: 'Our Work', note: 'Services and project photos' },
  { to: '/design', label: 'Design Your Room', note: 'Plan a room in 3D' },
  { to: '/contact', label: 'Contact', note: 'Free estimates' },
]

export default function NotFound() {
  return (
    <>
      <Seo path="/404" />
      <section className="bg-cream py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-oak-500 font-semibold tracking-[0.3em] uppercase text-xs mb-4">Error 404</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-stone-900 mb-4">Page not found</h1>
          <p className="text-stone-600 text-lg mb-10">
            That page doesn’t exist or may have moved. Try one of these, or call or text
            {' '}<a href="tel:+13862878579" className="font-semibold text-red-700 underline">(386) 287-8579</a>.
          </p>
          <ul className="grid sm:grid-cols-2 gap-3 text-left">
            {links.map(l => (
              <li key={l.to}>
                <Link to={l.to} className="block rounded-xl bg-white ring-1 ring-stone-200 hover:ring-red-600 px-5 py-4 transition-colors">
                  <span className="block font-semibold text-stone-900">{l.label} →</span>
                  <span className="block text-sm text-stone-500">{l.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
