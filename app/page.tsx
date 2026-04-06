"use client";

import { useState, useEffect, FormEvent } from "react";
import { CalendarDays, Wine, Briefcase, ChevronRight, Loader2 } from "lucide-react";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  const [content, setContent] = useState({
    heroTitle: "Crafting Unforgettable Moments",
    heroSubtitle: "Exclusive event coordination for corporate gatherings, elegant weddings, and private celebrations.",
    service1Desc: "Professional and seamless coordination for galas, product launches, and company retreats.",
    service2Desc: "Bespoke wedding planning ensuring every detail of your special day is perfectly executed.",
    service3Desc: "Exclusive and intimate celebrations tailored to your unique style and vision.",
    galleryImages: [
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2069&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1530103862676-de8892bf309c?q=80&w=2070&auto=format&fit=crop"
    ]
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, "content", "home");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data() as any);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setIsLoadingContent(false);
      }
    };
    fetchContent();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      date: formData.get("date"),
      details: formData.get("details"),
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(db, "inquiries"), data);
      setSubmitMessage("Thank you! Your inquiry has been submitted.");
      e.currentTarget.reset();
    } catch (error) {
      console.error("Error adding document: ", error);
      setSubmitMessage("An error occurred while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingContent) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-stone-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-stone-200">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center bg-stone-950 text-stone-50 overflow-hidden">
        {/* Abstract Background Overlay */}
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-stone-950/40"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-6">
            {content.heroTitle}
          </h1>
          <p className="text-lg md:text-2xl text-stone-200 mb-10 font-light max-w-2xl">
            {content.heroSubtitle}
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
              {content.service1Desc}
            </p>
          </div>
          {/* Service 2 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 bg-stone-100 flex items-center justify-center rounded-full mb-6 group-hover:bg-stone-900 group-hover:text-stone-50 transition-colors duration-500">
              <CalendarDays className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-medium mb-3">Weddings</h3>
            <p className="text-stone-600 leading-relaxed">
              {content.service2Desc}
            </p>
          </div>
          {/* Service 3 */}
          <div className="flex flex-col items-center text-center group">
            <div className="w-20 h-20 bg-stone-100 flex items-center justify-center rounded-full mb-6 group-hover:bg-stone-900 group-hover:text-stone-50 transition-colors duration-500">
              <Wine className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-medium mb-3">Private Parties</h3>
            <p className="text-stone-600 leading-relaxed">
              {content.service3Desc}
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
            {content.galleryImages[0] && (
              <div className="aspect-[4/5] bg-stone-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url('${content.galleryImages[0]}')` }}></div>
              </div>
            )}
            {content.galleryImages[1] && (
              <div className="aspect-[4/5] bg-stone-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url('${content.galleryImages[1]}')` }}></div>
              </div>
            )}
            {content.galleryImages[2] && (
              <div className="aspect-[4/5] bg-stone-300 relative overflow-hidden group sm:hidden lg:block">
                <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url('${content.galleryImages[2]}')` }}></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact / Booking Section */}
      <section id="contact" className="py-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif mb-4">Inquire About Your Event</h2>
          <p className="text-stone-600">Fill out the form below and our team will get back to you to schedule a consultation.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
              <input type="text" id="name" name="name" className="w-full border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
              <input type="email" id="email" name="email" className="w-full border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent" required />
            </div>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-stone-700 mb-2">Estimated Event Date</label>
            <input type="date" id="date" name="date" className="w-full border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent" />
          </div>
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-stone-700 mb-2">Event Details</label>
            <textarea id="details" name="details" rows={5} className="w-full border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent" placeholder="Tell us about your vision..." required></textarea>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-stone-900 text-stone-50 font-medium py-4 hover:bg-stone-800 transition-colors disabled:opacity-50">
            {isSubmitting ? "Submitting..." : "Submit Inquiry"}
          </button>
          {submitMessage && (
            <p className="text-center text-sm font-medium mt-4 text-stone-800">{submitMessage}</p>
          )}
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-500 py-12 text-center">
        <p>&copy; {new Date().getFullYear()} Elegant Events. All rights reserved.</p>
      </footer>
    </div>
  );
}
