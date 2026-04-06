import { CalendarDays, Wine, Briefcase, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-stone-200">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center bg-stone-950 text-stone-50 overflow-hidden">
        {/* Abstract Background Overlay */}
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-stone-950/40"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-6">
            Crafting Unforgettable Moments
          </h1>
          <p className="text-lg md:text-2xl text-stone-200 mb-10 font-light max-w-2xl">
            Exclusive event coordination for corporate gatherings, elegant weddings, and private celebrations.
          </p>
          <a href="#contact" className="inline-flex items-center gap-2 bg-stone-50 text-stone-950 px-8 py-4 text-lg font-medium hover:bg-stone-200 transition-colors">
            Book a Consultation <ChevronRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif mb-4">Our Services</h2>
          <div className="w-12 h-1 bg-stone-900 mx-auto"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {/* Service 1 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 bg-stone-100 flex items-center justify-center rounded-full mb-6 group-hover:bg-stone-900 group-hover:text-stone-50 transition-colors duration-500">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-medium mb-3">Corporate Events</h3>
            <p className="text-stone-600 leading-relaxed">
              Professional and seamless coordination for galas, product launches, and company retreats.
            </p>
          </div>
          {/* Service 2 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 bg-stone-100 flex items-center justify-center rounded-full mb-6 group-hover:bg-stone-900 group-hover:text-stone-50 transition-colors duration-500">
              <CalendarDays className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-medium mb-3">Weddings</h3>
            <p className="text-stone-600 leading-relaxed">
              Bespoke wedding planning ensuring every detail of your special day is perfectly executed.
            </p>
          </div>
          {/* Service 3 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 bg-stone-100 flex items-center justify-center rounded-full mb-6 group-hover:bg-stone-900 group-hover:text-stone-50 transition-colors duration-500">
              <Wine className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-medium mb-3">Private Parties</h3>
            <p className="text-stone-600 leading-relaxed">
              Exclusive and intimate celebrations tailored to your unique style and vision.
            </p>
          </div>
        </div>
      </section>

      {/* Showcase / Gallery Section */}
      <section className="py-24 bg-stone-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">Featured Celebrations</h2>
            <div className="w-12 h-1 bg-stone-900 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="aspect-[4/5] bg-stone-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center hover:scale-105 transition-transform duration-700"></div>
            </div>
            <div className="aspect-[4/5] bg-stone-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center hover:scale-105 transition-transform duration-700"></div>
            </div>
            <div className="aspect-[4/5] bg-stone-300 relative overflow-hidden sm:hidden lg:block">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1530103862676-de8892bf309c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center hover:scale-105 transition-transform duration-700"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / Booking Section */}
      <section id="contact" className="py-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif mb-4">Inquire About Your Event</h2>
          <p className="text-stone-600">Fill out the form below and our team will get back to you to schedule a consultation.</p>
        </div>
        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
              <input type="text" id="name" className="w-full border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
              <input type="email" id="email" className="w-full border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent" required />
            </div>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-stone-700 mb-2">Estimated Event Date</label>
            <input type="date" id="date" className="w-full border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent" />
          </div>
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-stone-700 mb-2">Event Details</label>
            <textarea id="details" rows={5} className="w-full border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent" placeholder="Tell us about your vision..." required></textarea>
          </div>
          <button type="submit" className="w-full bg-stone-900 text-stone-50 font-medium py-4 hover:bg-stone-800 transition-colors">
            Submit Inquiry
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-500 py-12 text-center">
        <p>&copy; {new Date().getFullYear()} Elegant Events. All rights reserved.</p>
      </footer>
    </div>
  );
}
