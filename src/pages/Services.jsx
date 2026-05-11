import { Link } from 'react-router-dom'

const services = [
  {
    num: '01',
    title: 'Flooring Installation',
    body: 'We install all major flooring types — laminate, hardwood, tile, and natural stone. Whether you\'re refreshing a single room or updating your entire home, we\'ll help you choose the right material and deliver a flawless installation.',
    detail: 'Laminate · Hardwood · Tile · Natural Stone',
  },
  {
    num: '02',
    title: 'Bathroom Remodels',
    body: 'A bathroom remodel is one of the best investments you can make in your home. We handle tile work, fixtures, vanities, and complete custom bathroom builds. Tell us your vision and we\'ll bring it to life.',
    detail: 'Tile Work · Fixtures · Vanities · Custom Builds',
  },
  {
    num: '03',
    title: 'Kitchen Updates',
    body: 'From cabinet installation to new flooring and backsplash, we help transform kitchens into spaces you\'ll love spending time in. Clean finishes, solid work, on schedule.',
    detail: 'Cabinets · Flooring · Backsplash',
  },
  {
    num: '04',
    title: 'Enclosed Patios',
    body: 'Extend your living space without leaving home. We build enclosed patios designed to handle Florida\'s weather while giving you a comfortable, functional area year-round.',
    detail: 'Custom Enclosures · Florida-Rated · Year-Round Use',
  },
  {
    num: '05',
    title: 'Roofing',
    body: 'We offer roofing services to keep your home protected. Contact us for an assessment and free estimate.',
    detail: 'Assessment · Repair · Replacement',
  },
  {
    num: '06',
    title: 'Handyman Services',
    body: 'Got a project that doesn\'t fit neatly into a category? We do that too. If it\'s in or around your home, give us a call and we\'ll let you know what we can do.',
    detail: 'Repairs · Installs · Odd Jobs',
  },
]

export default function Services() {
  return (
    <>
      {/* Page header */}
      <section className="bg-zinc-950 pt-20 pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" aria-hidden="true" />
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-red-500 font-bold tracking-[0.25em] uppercase text-xs mb-4">
            What We Offer
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-8">
            Our Services
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            From the floors beneath your feet to the tile on your walls, we handle it all.
            Every job is backed by our commitment to quality craftsmanship and customer satisfaction.
          </p>
        </div>
      </section>

      {/* Services list */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {services.map(({ num, title, body, detail }, i) => (
            <div
              key={num}
              className={`grid md:grid-cols-12 gap-6 md:gap-12 py-14 md:py-20 border-b border-zinc-100 ${
                i === 0 ? 'border-t border-zinc-100' : ''
              }`}
            >
              {/* Number */}
              <div className="md:col-span-1 flex md:block items-center gap-4">
                <span className="text-red-600 font-black text-sm tabular-nums">{num}</span>
              </div>

              {/* Title */}
              <div className="md:col-span-4">
                <h2 className="text-3xl md:text-4xl font-black text-zinc-900 leading-tight">
                  {title}
                </h2>
                <p className="text-xs text-zinc-400 font-semibold tracking-widest uppercase mt-4">
                  {detail}
                </p>
              </div>

              {/* Body + CTA */}
              <div className="md:col-span-7 flex flex-col justify-between gap-8">
                <p className="text-zinc-600 text-lg leading-relaxed">{body}</p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-zinc-900 font-bold hover:text-red-700 transition-colors text-sm tracking-wide group"
                >
                  GET A FREE ESTIMATE
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-zinc-950 py-24 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Not sure what you need?
          </h2>
          <p className="text-zinc-400 text-lg mb-10">
            Give us a call and describe your project. If it's in or around your home, chances are we can help.
          </p>
          <a
            href="tel:+13862878579"
            className="bg-red-600 hover:bg-red-500 text-zinc-950 font-black px-10 py-5 text-lg tracking-wide transition-colors inline-block"
          >
            CALL (386) 287-8579
          </a>
        </div>
      </section>
    </>
  )
}
