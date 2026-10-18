import { Component } from 'react'

// Last line of defence: if a page crashes while rendering, show a message
// and a way out instead of a blank white screen.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <section className="bg-cream py-24">
        <div className="max-w-lg mx-auto px-6 text-center">
          <h1 className="font-display text-3xl font-semibold text-stone-900 mb-3">Something went wrong</h1>
          <p className="text-stone-600 mb-8">
            This page hit an unexpected error. Reloading usually fixes it. If it keeps happening,
            call or text us at (386) 287-8579.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-full cursor-pointer"
            >
              Reload the page
            </button>
            <a href="/" className="ring-1 ring-inset ring-stone-300 hover:ring-stone-500 text-stone-800 font-bold px-6 py-3 rounded-full">
              Go to the home page
            </a>
          </div>
        </div>
      </section>
    )
  }
}
