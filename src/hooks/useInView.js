import { useEffect, useRef, useState } from 'react'

// True once the element has scrolled into view (then stays true).
export function useInView(threshold = 0.12) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}
