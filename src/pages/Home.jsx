import { Link } from 'react-router-dom'

const services = [
  { num: '01', label: 'Flooring Installation', blurb: 'Laminate, hardwood, tile & natural stone.' },
  { num: '02', label: 'Bathroom Remodels', blurb: 'Tile, fixtures, vanities & full custom builds.' },
  { num: '03', label: 'Kitchen Updates', blurb: 'Cabinets, backsplash, flooring & more.' },
  { num: '04', label: 'Enclosed Patios', blurb: 'Comfortable, Florida-ready outdoor living.' },
  { num: '05', label: 'Roofing', blurb: 'Keep your home protected year-round.' },
  { num: '06', label: 'Handyman Services', blurb: 'If it\'s in or around your home, we can help.' },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-end bg-zinc-950 overflow-hidden">
        {/* Diagonal line texture */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -55deg,
              transparent,
              transparent 60px,
              rgba(255,255,255,0.018) 60px,
              rgba(255,255,255,0.018) 61px
            )`
          }}
          aria-hidden="true"
        />
        {/* Red atmospheric glow — top-right */}
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.18) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        {/* Subtle bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-zinc-950 to-transparent" aria-hidden="true" />

        {/* Red accent bar */}
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" aria-hidden="true" />

        <div className="relative max-w-6xl mx-auto px-6 pb-20 md:pb-28 w-full">
          <p className="text-red-500 font-bold tracking-[0.25em] uppercase text-xs mb-6">
            Licensed &bull; Insured &bull; Since 2011
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight max-w-3xl mb-8">
            Prestigious<br />
            <span className="text-red-500">Home</span><br />
            Services.
          </h1>
          <p className="text-zinc-300 text-lg md:text-xl max-w-lg leading-relaxed mb-10">
            North Florida's trusted flooring and home improvement contractor.
            Built on craftsmanship, backed by over a decade of results.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="tel:+13862878579"
              className="bg-red-600 hover:bg-red-500 text-white font-black px-8 py-4 text-base tracking-wide transition-colors"
            >
              CALL (386) 287-8579
            </a>
            <Link
              to="/contact"
              className="border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 text-base tracking-wide transition-colors"
            >
              FREE ESTIMATE →
            </Link>
          </div>
        </div>
      </section>

      {/* About strip */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-5 gap-12 items-start">
          <div className="md:col-span-3">
            <p className="text-red-600 font-bold tracking-widest text-xs uppercase mb-4">Who We Are</p>
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 leading-tight mb-8">
              A contractor<br />you can trust.
            </h2>
            <div className="space-y-5 text-zinc-600 text-lg leading-relaxed">
              <p>
                When you invite a contractor into your home, you deserve someone you can trust.
                At Prestigious Home Services, we've spent over a decade building that trust one
                project at a time — delivering top-quality workmanship at competitive rates,
                without cutting corners.
              </p>
              <p>
                We're fully licensed and insured, and we walk every client through the process
                so there are never any surprises. Whether it's a floor upgrade or a full bathroom
                transformation, we treat every job like it's our own home.
              </p>
            </div>
          </div>
          <div className="md:col-span-2 flex flex-col gap-6 md:pt-16">
            {[
              { stat: '14+', label: 'Years in Business' },
              { stat: '100%', label: 'Licensed & Insured' },
              { stat: '$0', label: 'Estimate Cost' },
            ].map(({ stat, label }) => (
              <div key={label} className="border-l-4 border-red-600 pl-6">
                <p className="text-5xl font-black text-zinc-900">{stat}</p>
                <p className="text-zinc-500 font-semibold mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services list */}
      <section className="bg-zinc-950 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-red-500 font-bold tracking-widest text-xs uppercase mb-3">What We Do</p>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">Our Services</h2>
            </div>
            <Link
              to="/services"
              className="hidden md:inline text-red-400 hover:text-red-300 font-bold text-sm tracking-wide transition-colors"
            >
              VIEW ALL →
            </Link>
          </div>
          <div className="mt-12 divide-y divide-zinc-800 border-y border-zinc-800">
            {services.map(({ num, label, blurb }) => (
              <Link
                key={num}
                to="/services"
                className="group flex items-center justify-between py-6 md:py-7 hover:pl-3 transition-all duration-200"
              >
                <div className="flex items-center gap-6 md:gap-10">
                  <span className="text-red-600/60 font-black text-xs md:text-sm tabular-nums group-hover:text-red-500 transition-colors">
                    {num}
                  </span>
                  <div>
                    <p className="text-white font-bold text-xl md:text-2xl group-hover:text-red-500 transition-colors">
                      {label}
                    </p>
                    <p className="text-zinc-500 text-sm mt-0.5">{blurb}</p>
                  </div>
                </div>
                <span className="text-zinc-600 group-hover:text-red-500 text-2xl transition-all duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8 md:hidden">
            <Link to="/services" className="text-red-500 font-bold text-sm tracking-wide">
              VIEW ALL SERVICES →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-600 py-20 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Ready to start your project?
          </h2>
          <p className="text-red-100 text-lg mb-10 max-w-xl mx-auto">
            Free estimates, no pressure. Call or text us and we'll walk you through every step.
          </p>
          <a
            href="tel:+13862878579"
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-black px-10 py-5 text-lg tracking-wide transition-colors inline-block"
          >
            CALL (386) 287-8579
          </a>
        </div>
      </section>
    </>
  )
}
