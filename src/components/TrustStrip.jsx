import { useEffect, useState } from 'react'
import { useInView } from '../hooks/useInView'

const FOUNDED = 2011

// Only facts already stated on the site — no invented numbers.
const stats = [
  { value: new Date().getFullYear() - FOUNDED, suffix: '+', label: 'Years in Business' },
  { value: 100, suffix: '%', label: 'Licensed & Insured' },
  { text: 'Free', label: 'Estimates' },
  { text: 'FL · GA · TX', label: 'Service Area' },
]

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function CountUp({ to, suffix, start }) {
  const [n, setN] = useState(() => (reducedMotion() ? to : 0))
  useEffect(() => {
    if (!start || reducedMotion()) return
    let raf
    const t0 = performance.now()
    const dur = 1600
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur)
      setN(Math.round(to * (1 - (1 - t) ** 4)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, start])
  return (
    <>
      {/* Screen readers get the final value, not every animation frame */}
      <span aria-hidden="true">{n}{suffix}</span>
      <span className="sr-only">{to}{suffix}</span>
    </>
  )
}

export default function TrustStrip() {
  const [ref, inView] = useInView(0.3)
  return (
    <section ref={ref} className="relative bg-ink-soft border-y border-oak-300/15" aria-label="Since 2011">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-14 grid grid-cols-2 lg:grid-cols-[auto_repeat(4,1fr)] gap-y-10 gap-x-6 items-center">
        <div className="col-span-2 lg:col-span-1 lg:pr-10 lg:border-r lg:border-white/10 text-center lg:text-left">
          <p className="text-oak-300 text-[11px] font-semibold tracking-[0.3em] uppercase">Est.</p>
          <p className="font-display text-3xl text-white font-semibold">Since 2011</p>
        </div>
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`text-center transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: `${i * 110}ms` }}
          >
            <p className="font-display text-4xl md:text-5xl font-semibold text-oak-200 tabular-nums">
              {s.text ?? <CountUp to={s.value} suffix={s.suffix} start={inView} />}
            </p>
            <p className="mt-2 text-xs md:text-sm font-medium tracking-wide text-stone-400 uppercase">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
