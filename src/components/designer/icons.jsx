// Icons shared by the designer, the project page and the navbar.

const roomIcons = {
  living: <><path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" /><path d="M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v4H2z" /><path d="M5 17v2M19 17v2" /></>,
  bedroom: <><path d="M3 18V7" /><path d="M3 14h18v4" /><path d="M21 14v-2a3 3 0 0 0-3-3h-7v5" /><circle cx="7" cy="11" r="1.6" /></>,
  kitchen: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 10h18M12 10v11M9.5 14.5v2M14.5 14.5v2M7 6.5h2.5M14.5 6.5H17" /></>,
  bathroom: <><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3z" /><path d="M6 12V5.5a2.5 2.5 0 0 1 4.6-1.4" /><path d="M9.5 6.5l2.5-1.5M7 19l-1 2M17 19l1 2" /></>,
  patio: <><path d="M2 20h20" /><path d="M4 20V9.5L12 4l8 5.5V20" /><path d="M4 12.5h16M8 12.5V20M12 12.5V20M16 12.5V20" /></>,
}

function Icon({ children, className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {children}
    </svg>
  )
}

export function RoomIcon({ type, className = 'w-5 h-5' }) {
  return <Icon className={className}>{roomIcons[type]}</Icon>
}

export function CartIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2" />
      <circle cx="10" cy="20.5" r="1.2" />
      <circle cx="17" cy="20.5" r="1.2" />
    </svg>
  )
}
