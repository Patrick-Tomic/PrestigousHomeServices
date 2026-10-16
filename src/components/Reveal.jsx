import { useInView } from '../hooks/useInView'

export default function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const [ref, visible] = useInView()
  return (
    <Tag
      ref={ref}
      className={`${className} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transition: `opacity 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
