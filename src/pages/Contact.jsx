export default function Contact() {
  return (
    <>
      {/* Page header */}
      <section className="bg-zinc-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <div className="w-16 h-1 bg-red-600 mb-6" />
          <p className="text-zinc-300 text-lg max-w-xl leading-relaxed">
            Ready to get started? We offer free estimates and are happy to answer any questions
            about your project. Call or text us today — we'd love to hear what you have in mind.
          </p>
        </div>
      </section>

      {/* Contact content */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-start">

          {/* Info */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-bold text-zinc-800 mb-4">Get in Touch</h2>
              <div className="w-12 h-1 bg-red-600 mb-6" />
              <div className="space-y-4 text-zinc-600">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">📞</span>
                  <div>
                    <p className="font-semibold text-zinc-800">Phone / Text</p>
                    <a
                      href="tel:+13862878579"
                      className="text-red-600 hover:text-red-500 font-semibold text-lg transition-colors"
                    >
                      (386) 287-8579
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-semibold text-zinc-800">Service Area</p>
                    <p>Serving North Florida</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-2xl">🏷️</span>
                  <div>
                    <p className="font-semibold text-zinc-800">License &amp; Insurance</p>
                    <p>Fully Licensed &amp; Insured</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-2xl">🗓️</span>
                  <div>
                    <p className="font-semibold text-zinc-800">Estimates</p>
                    <p>Free — no obligation</p>
                  </div>
                </div>
              </div>
            </div>

            <a
              href="tel:+13862878579"
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 rounded text-lg transition-colors text-center"
            >
              Call (386) 287-8579
            </a>
          </div>

          {/* Inquiry form */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-8">
            <h2 className="text-xl font-bold text-zinc-800 mb-6">Send Us a Message</h2>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                alert('Thank you! We\'ll be in touch shortly.')
              }}
            >
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-zinc-700" htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Your name"
                  className="border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-zinc-700" htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Your phone number"
                  className="border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-zinc-700" htmlFor="service">Service Interested In</label>
                <select
                  id="service"
                  className="border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-zinc-700"
                >
                  <option value="">Select a service...</option>
                  <option>Flooring Installation</option>
                  <option>Bathroom Remodel</option>
                  <option>Kitchen Updates</option>
                  <option>Enclosed Patio</option>
                  <option>Roofing</option>
                  <option>Handyman Services</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-zinc-700" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  rows={4}
                  required
                  placeholder="Tell us about your project..."
                  className="border border-zinc-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white resize-none"
                />
              </div>
              <button
                type="submit"
                className="bg-zinc-900 hover:bg-zinc-700 text-white font-bold py-3 rounded transition-colors mt-2"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
