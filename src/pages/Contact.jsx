import { Link, useSearchParams } from 'react-router-dom'
import Seo from '../components/Seo'
import EstimateForm from '../components/EstimateForm'
import { SERVICE_OPTIONS } from '../data/inquiries'
import { useProject } from '../components/designer/projectStore'
import { faq } from '../data/faq'
import { HOME_BASE, TERRITORY } from '../data/areas'
import { services } from '../data/services'

function InfoIcon({ children }) {
  return (
    <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-oak-100 text-oak-600 ring-1 ring-oak-200 shrink-0">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        {children}
      </svg>
    </span>
  )
}

const details = [
  {
    title: 'Phone / Text',
    body: <a href="tel:+13862878579" className="text-red-700 hover:text-red-600 font-semibold text-lg">(386) 287-8579</a>,
    icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />,
  },
  {
    title: 'Service Area',
    body: <p>Based in {HOME_BASE.label} · Serving {TERRITORY}. <Link to="/service-areas" className="font-semibold text-red-700 underline">See service areas</Link></p>,
    icon: <><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>,
  },
  {
    title: 'License & Insurance',
    body: 'Fully Licensed & Insured',
    icon: <><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></>,
  },
  {
    title: 'Estimates',
    body: 'Free — no obligation',
    icon: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></>,
  },
]

export default function Contact() {
  const [params] = useSearchParams()
  const service = SERVICE_OPTIONS.includes(params.get('service')) ? params.get('service') : ''
  const rooms = useProject()

  return (
    <>
      <Seo path="/contact" />

      {/* Page header */}
      <section className="bg-ink text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" aria-hidden="true" />
        <div className="max-w-6xl mx-auto px-6 py-14 md:py-16">
          <p className="text-oak-300 font-semibold tracking-[0.3em] uppercase text-xs mb-4">Free Estimates</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold leading-tight mb-4">Contact Us</h1>
          <p className="text-stone-300 text-lg max-w-xl leading-relaxed">
            Ready to get started? We offer free estimates and are happy to answer any questions
            about your project. Call or text us today — we'd love to hear what you have in mind.
          </p>
        </div>
      </section>

      <section className="bg-cream py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-[1fr_1.15fr] gap-10 md:gap-14 items-start">

          {/* Info */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="font-display text-3xl font-semibold text-stone-900 mb-6">Get in Touch</h2>
              <ul className="space-y-5 text-stone-700">
                {details.map(d => (
                  <li key={d.title} className="flex items-start gap-4">
                    <InfoIcon>{d.icon}</InfoIcon>
                    <div>
                      <p className="font-semibold text-stone-900">{d.title}</p>
                      {typeof d.body === 'string' ? <p>{d.body}</p> : d.body}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <a
              href="tel:+13862878579"
              className="inline-flex items-center justify-center bg-ink hover:bg-stone-800 text-white font-bold px-8 py-4 rounded-full text-lg transition-colors"
            >
              Call (386) 287-8579
            </a>

            <div className="rounded-2xl bg-white ring-1 ring-stone-200 p-5">
              <p className="font-semibold text-stone-900 mb-1">Planning a remodel?</p>
              {rooms.length > 0 ? (
                <p className="text-stone-600 text-sm">
                  You have {rooms.length} room{rooms.length === 1 ? '' : 's'} in your project.{' '}
                  <Link to="/project" className="font-semibold text-red-700 underline">Send your project</Link> and we’ll have every detail for your estimate.
                </p>
              ) : (
                <p className="text-stone-600 text-sm">
                  <Link to="/design" className="font-semibold text-red-700 underline">Design your room in 3D</Link> — pick the size, flooring and finishes — and send it with your request.
                </p>
              )}
            </div>
          </div>

          {/* Inquiry form */}
          <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-stone-900 mb-1">Send Us a Message</h2>
            <p className="text-sm text-stone-600 mb-6">We’ll get back to you about your free estimate.</p>
            <EstimateForm kind="contact" defaultService={service} />
          </div>
        </div>
      </section>

      {/* Frequently asked questions */}
      <section className="bg-white py-14 md:py-20" aria-labelledby="faq-title">
        <div className="max-w-3xl mx-auto px-6">
          <h2 id="faq-title" className="font-display text-3xl md:text-4xl font-semibold text-stone-900 mb-8">Frequently asked questions</h2>
          <div className="divide-y divide-stone-200 border-y border-stone-200">
            {faq.map(item => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-stone-900 text-lg">
                  {item.q}
                  <span className="text-2xl font-light text-stone-400 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-stone-700 leading-relaxed">{item.a}</p>
                {item.areas && (
                  <Link to="/service-areas" className="mt-3 inline-block text-sm font-semibold text-red-700 hover:underline">See our service areas →</Link>
                )}
                {item.links && (
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {services.map(sv => (
                      <li key={sv.slug}><Link to={`/services/${sv.slug}`} className="font-semibold text-red-700 hover:underline">{sv.title}</Link></li>
                    ))}
                  </ul>
                )}
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
