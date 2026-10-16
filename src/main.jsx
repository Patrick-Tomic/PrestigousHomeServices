import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'

// The prerendered per-page head tags (scripts/prerender.mjs) are for
// crawlers; once the app runs, react-helmet-async manages them instead.
document.querySelectorAll('head [data-rh]').forEach(el => el.remove())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
