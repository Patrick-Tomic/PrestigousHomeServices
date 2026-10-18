import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Suspense, lazy } from 'react'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

// Home ships in the main bundle; every other page loads its own code when
// visited, so first visits download much less JavaScript.
const Work = lazy(() => import('./pages/Work'))
const Contact = lazy(() => import('./pages/Contact'))
const Design = lazy(() => import('./pages/Design'))
const Project = lazy(() => import('./pages/Project'))
const Admin = lazy(() => import('./pages/Admin'))

function PageLoading() {
  return <div className="min-h-[60vh] bg-cream" aria-busy="true" aria-label="Loading page" />
}

// A crash on one page resets when the visitor navigates elsewhere.
function PageBoundary({ children }) {
  const { pathname } = useLocation()
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-white focus:text-stone-900 focus:font-semibold focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          <PageBoundary>
            <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/work" element={<Work />} />
              <Route path="/gallery" element={<Navigate to="/work" replace />} />
              <Route path="/design" element={<Design />} />
              <Route path="/project" element={<Project />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </PageBoundary>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
