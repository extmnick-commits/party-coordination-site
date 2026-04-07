"use client";

import { useState, FormEvent, useEffect } from "react";
import { CalendarDays, Wine, Briefcase, ChevronRight } from "lucide-react";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import Image from "next/image";

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [pageData, setPageData] = useState<any>(null);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const docSnap = await getDoc(doc(db, "content", "home"));
        if (docSnap.exists()) {
          setPageData(docSnap.data());
        } else {
          setPageData({}); // fallback to avoid errors
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        setPageData({});
      }
    };
    fetchPageData();
  }, []);

  const getSafeKey = (url: string) => {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = (hash << 5) - hash + url.charCodeAt(i);
      hash |= 0;
    }
    return `img_${Math.abs(hash)}`;
  };

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

  if (!pageData) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
      </div>
    );
  }

  const { heroTitle, heroSubtitle, service1Desc, service2Desc, service3Desc, galleryImages = [], layouts = {}, heroBgImage, instagramUrl, facebookUrl, tiktokUrl } = pageData;

  // Calculate dynamic top position for social icons based on hero button
  const heroButtonHeight = layouts.heroButton?.height ? parseFloat(layouts.heroButton.height.toString()) : 60; // Default to 60px if not set or 'auto'
  const socialIconsTop = (layouts.heroButton?.y ?? 380) + heroButtonHeight + 40; // 40px padding below the button

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-stone-200">
      
      {/* Unified Builder Layout Canvas */}
      <div className="w-full overflow-x-hidden bg-stone-100 border-b border-stone-200">
        <div className="relative w-full max-w-[1024px] mx-auto h-[1800px] bg-white shadow-sm overflow-hidden">
          
          {/* Hero Background Block */}
          <div className="absolute top-0 left-0 w-full h-[600px] bg-stone-950 pointer-events-none" >
            <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url(${heroBgImage || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop'})` }}></div>
          </div>

          {/* Dynamic Draggable Elements mapped from State */}
          <div style={{ position: 'absolute', left: layouts.heroTitle?.x ?? 112, top: layouts.heroTitle?.y ?? 150, width: layouts.heroTitle?.width ?? 800, height: layouts.heroTitle?.height ?? 100 }} className="flex items-center justify-center text-center drop-shadow-md z-10">
            <h1 className="text-4xl md:text-6xl font-serif tracking-tight text-stone-50 w-full h-full">
              {heroTitle || 'Crafting Unforgettable Moments'}
            </h1>
          </div>

          <div style={{ position: 'absolute', left: layouts.heroSubtitle?.x ?? 212, top: layouts.heroSubtitle?.y ?? 270, width: layouts.heroSubtitle?.width ?? 600, height: layouts.heroSubtitle?.height ?? 80 }} className="flex items-center justify-center text-center drop-shadow-md z-10">
            <p className="text-lg md:text-2xl text-stone-200 font-light w-full h-full">
              {heroSubtitle || 'Exclusive event coordination for elegant weddings and private celebrations.'}
            </p>
          </div>

          <div style={{ position: 'absolute', left: layouts.heroButton?.x ?? 412, top: layouts.heroButton?.y ?? 380, width: layouts.heroButton?.width ?? 'auto', height: layouts.heroButton?.height ?? 'auto' }} className="flex items-center justify-center text-center z-10">
            <a href="#contact" className="inline-flex items-center gap-2 bg-stone-50 text-stone-950 px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:bg-stone-100 hover:shadow-xl transition-all duration-300">
              Inquire About Your Event
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          {/* Social Media Icons on the Front Page */}
          <div className="absolute w-full flex justify-center gap-6 z-10" style={{ top: socialIconsTop, left: 0 }}>
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-stone-300 transition-colors text-stone-50">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
                <span className="sr-only">Instagram</span>
              </a>
            )}
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-stone-300 transition-colors text-stone-50">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">Facebook</span>
              </a>
            )}
            {tiktokUrl && (
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:text-stone-300 transition-colors text-stone-50">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span className="sr-only">TikTok</span>
              </a>
            )}
          </div>

          <div style={{ position: 'absolute', left: layouts.service1?.x ?? 62, top: layouts.service1?.y ?? 650, width: layouts.service1?.width ?? 280, height: layouts.service1?.height ?? 250 }} className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl p-6 flex flex-col items-center text-center z-10">
            <div className="w-16 h-16 bg-stone-100 flex items-center justify-center rounded-full mb-4 hover:bg-stone-900 hover:text-stone-50 transition-colors duration-500">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium mb-3">Corporate Events</h3>
            <p className="text-stone-600 text-sm leading-relaxed overflow-hidden">
              {service1Desc || 'Professional and seamless coordination for galas and retreats.'}
            </p>
          </div>

          <div style={{ position: 'absolute', left: layouts.service2?.x ?? 372, top: layouts.service2?.y ?? 650, width: layouts.service2?.width ?? 280, height: layouts.service2?.height ?? 250 }} className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl p-6 flex flex-col items-center text-center z-10">
            <div className="w-16 h-16 bg-stone-100 flex items-center justify-center rounded-full mb-4 hover:bg-stone-900 hover:text-stone-50 transition-colors duration-500">
              <CalendarDays className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium mb-3">Weddings</h3>
            <p className="text-stone-600 text-sm leading-relaxed overflow-hidden">
              {service2Desc || 'Bespoke wedding planning ensuring perfectly executed details.'}
            </p>
          </div>

          <div style={{ position: 'absolute', left: layouts.service3?.x ?? 682, top: layouts.service3?.y ?? 650, width: layouts.service3?.width ?? 280, height: layouts.service3?.height ?? 250 }} className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl p-6 flex flex-col items-center text-center z-10">
            <div className="w-16 h-16 bg-stone-100 flex items-center justify-center rounded-full mb-4 hover:bg-stone-900 hover:text-stone-50 transition-colors duration-500">
              <Wine className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium mb-3">Private Parties</h3>
            <p className="text-stone-600 text-sm leading-relaxed overflow-hidden">
              {service3Desc || 'Exclusive and intimate celebrations tailored to your unique style.'}
            </p>
          </div>

          {galleryImages.map((url: string, idx: number) => {
            const key = getSafeKey(url);
            const defaultX = 62 + (idx % 3) * 310;
            const defaultY = 950 + Math.floor(idx / 3) * 310;
            return (
              <div
                key={key}
                style={{
                  position: 'absolute',
                  left: layouts[key]?.x ?? defaultX,
                  top: layouts[key]?.y ?? defaultY,
                  width: layouts[key]?.width ?? 280,
                  height: layouts[key]?.height ?? 280,
                }}
                className="shadow-md rounded-xl overflow-hidden bg-stone-200 z-10"
              >
                <Image src={url} alt={`Gallery ${idx}`} fill className="object-cover" />
              </div>
            );
          })}

        </div>
      </div>

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
        <div className="flex justify-center gap-6 mb-6">
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-stone-300 transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
              <span className="sr-only">Instagram</span>
            </a>
          )}
          {facebookUrl && (
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-stone-300 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
              <span className="sr-only">Facebook</span>
            </a>
          )}
          {tiktokUrl && (
            <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:text-stone-300 transition-colors">
              {/* Custom SVG for TikTok since it's not in standard icon packs usually */}
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span className="sr-only">TikTok</span>
            </a>
          )}
        </div>
        <p>&copy; {new Date().getFullYear()} Elegant Events. All rights reserved.</p>
      </footer>
    </div>
  );
}
