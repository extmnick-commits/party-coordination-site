"use client";

import { useState, FormEvent, useEffect } from "react";
import { CalendarDays, Wine, Briefcase, ChevronRight, X, ChevronLeft } from "lucide-react";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import Image from "next/image";

interface LayoutPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface HeroButtonLayout {
  y: number;
  width: string | number;
  height: string | number;
}

interface EventData {
  id: string;
  title:string;
  images: string[];
}

interface PageData {
  heroTitle?: string;
  heroSubtitle?: string;
  service1Desc?: string;
  service2Desc?: string;
  service3Desc?: string;
  galleryImages?: string[];
  events?: EventData[];
  layouts?: {
    heroTitle?: LayoutPosition;
    heroSubtitle?: LayoutPosition;
    heroButton?: HeroButtonLayout;
    service1?: LayoutPosition;
    service2?: LayoutPosition;
    service3?: LayoutPosition;
  };
  heroBgImage?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  notificationEmail?: string;
}

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const docSnap = await getDoc(doc(db, "content", "home"));
        if (docSnap.exists()) {
          setPageData(docSnap.data() as PageData);
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

  const isVideo = (url: string) => /\.(mp4|webm|mov|m4v)(?:\?|$)/i.test(url);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      date: formData.get("date"),
      details: formData.get("details"),
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(db, "inquiries"), data);
      
      // If email notification is configured, write to the 'mail' collection
      if (pageData?.notificationEmail) {
        await addDoc(collection(db, "mail"), {
          to: pageData.notificationEmail,
          message: {
            subject: `New Event Inquiry from ${data.name}`,
            text: `You have a new inquiry!\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nDate: ${data.date}\nDetails: ${data.details}`,
            html: `<p><strong>You have a new inquiry!</strong></p><p><strong>Name:</strong> ${data.name}</p><p><strong>Email:</strong> ${data.email}</p><p><strong>Phone:</strong> ${data.phone}</p><p><strong>Date:</strong> ${data.date}</p><p><strong>Details:</strong><br/>${data.details}</p>`,
          },
          createdAt: new Date(),
        });
      }

      setSubmitMessage("Thank you! Your inquiry has been submitted.");
      if (e.currentTarget) {
        e.currentTarget.reset();
      }
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

  const { heroTitle, heroSubtitle, service1Desc, service2Desc, service3Desc, galleryImages = [], events = [], layouts = {}, heroBgImage, instagramUrl, facebookUrl, tiktokUrl } = pageData;

  // Calculate dynamic top position for social icons based on hero button
  const getSafeHeight = (val: any, fallback: number) => {
    if (!val) return fallback;
    const parsed = parseFloat(val.toString());
    return isNaN(parsed) ? fallback : parsed;
  };

  const heroButtonHeight = getSafeHeight(layouts.heroButton?.height, 60);
  const socialIconsTop = (layouts.heroButton?.y ?? 380) + heroButtonHeight + 40;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-stone-200">
      
      {/* DESKTOP: Unified Builder Layout Canvas (Part 1: Hero & Services) */}
      <div className="hidden lg:block w-full overflow-x-auto bg-stone-100 border-b border-stone-200">
        <div className="relative w-[1024px] mx-auto shrink-0 h-[950px] bg-white shadow-sm overflow-hidden">
          
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
              {heroSubtitle || 'Exclusive event coordination for elegant weddings and private celebrations. - Roni\'s Event Planning LLC'}
            </p>
          </div>

          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: layouts.heroButton?.y ?? 380, width: layouts.heroButton?.width ?? 'auto', height: layouts.heroButton?.height ?? 'auto' }} className="flex items-center justify-center text-center z-10">
            <a href="#contact" className="inline-flex items-center gap-2 bg-stone-50 text-stone-950 px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:bg-stone-100 hover:shadow-xl transition-all duration-300">
              Inquire About Your Event
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          {/* Social Media Icons on the Front Page */}
          <div className="absolute flex justify-center gap-6 z-10" style={{ top: socialIconsTop, left: '50%', transform: 'translateX(-50%)' }}>
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
        </div>
      </div>

      {/* MOBILE: Native Flow Layout (Replaces absolute canvas to fit perfectly on any screen) */}
      <div className="block lg:hidden w-full bg-white font-sans border-b border-stone-200">
        {/* Mobile Hero */}
        <div className="relative w-full min-h-[600px] flex flex-col items-center justify-center bg-stone-950 py-20 px-6 overflow-hidden">
          <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url(${heroBgImage || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop'})` }}></div>
          <div className="relative z-10 flex flex-col items-center text-center gap-8 w-full max-w-lg mx-auto mt-12">
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-stone-50 drop-shadow-md">
              {heroTitle || 'Crafting Unforgettable Moments'}
            </h1>
            <p className="text-lg text-stone-200 font-light">
              {heroSubtitle || 'Exclusive event coordination for elegant weddings and private celebrations.'}
            </p>
            <a href="#contact" className="inline-flex items-center gap-2 bg-stone-50 text-stone-950 px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:bg-stone-100 transition-all duration-300">
              Inquire About Your Event
              <ChevronRight className="w-5 h-5" />
            </a>
            
            {/* Mobile Social Links */}
            <div className="flex justify-center gap-6 mt-4">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-stone-300 text-stone-50 transition-colors">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                </a>
              )}
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-stone-300 text-stone-50 transition-colors">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
              )}
              {tiktokUrl && (
                <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:text-stone-300 text-stone-50 transition-colors">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Services */}
        <div className="py-20 px-6 bg-stone-100 space-y-8">
          <div className="bg-white shadow-sm rounded-2xl p-8 flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-stone-50 flex items-center justify-center rounded-full mb-6">
              <Briefcase className="w-8 h-8 text-stone-900" />
            </div>
            <h3 className="text-2xl font-medium mb-4 text-stone-900">Corporate Events</h3>
            <p className="text-stone-600 leading-relaxed">
              {service1Desc || 'Professional and seamless coordination for galas and retreats.'}
            </p>
          </div>
          <div className="bg-white shadow-sm rounded-2xl p-8 flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-stone-50 flex items-center justify-center rounded-full mb-6">
              <CalendarDays className="w-8 h-8 text-stone-900" />
            </div>
            <h3 className="text-2xl font-medium mb-4 text-stone-900">Weddings</h3>
            <p className="text-stone-600 leading-relaxed">
              {service2Desc || 'Bespoke wedding planning ensuring perfectly executed details.'}
            </p>
          </div>
          <div className="bg-white shadow-sm rounded-2xl p-8 flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-stone-50 flex items-center justify-center rounded-full mb-6">
              <Wine className="w-8 h-8 text-stone-900" />
            </div>
            <h3 className="text-2xl font-medium mb-4 text-stone-900">Private Parties</h3>
            <p className="text-stone-600 leading-relaxed">
              {service3Desc || 'Exclusive and intimate celebrations tailored to your unique style.'}
            </p>
          </div>
        </div>
      </div>

      {/* Event Gallery Section */}
      {events.length > 0 && (
        <section id="gallery" className="py-24 px-6 max-w-6xl mx-auto border-b border-stone-200 bg-stone-50">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">Event Gallery</h2>
            <p className="text-stone-600">A glimpse into our beautifully coordinated events.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="group cursor-pointer" onClick={() => { setSelectedEvent(event); setLightboxIndex(0); }}>
                <div className="aspect-[4/3] relative rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-all">
                  {event.images && event.images.length > 0 ? (
                    <Image src={event.images[0]} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                  ) : (
                    <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400">No photos</div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-medium text-stone-900 text-center">{event.title}</h3>
                <p className="text-stone-500 text-center text-sm mt-1">{event.images?.length || 0} photo{(event.images?.length || 0) !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Inspiration Area (Responsive Grid for both Desktop and Mobile) */}
      {galleryImages.length > 0 && (
        <section id="inspiration" className="py-24 px-6 bg-stone-100 border-b border-stone-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif mb-4">Inspiration</h2>
              <p className="text-stone-600">A mood board of our favorite designs and concepts.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {galleryImages.map((url: string, idx: number) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm bg-stone-200 hover:shadow-md transition-shadow">
                  {isVideo(url) ? (
                    <video src={url} autoPlay loop muted playsInline className="object-cover w-full h-full pointer-events-none" />
                  ) : (
                    <Image src={url} alt={`Inspiration ${idx}`} fill className="object-cover pointer-events-none" draggable={false} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
            <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-2">Phone Number (Optional)</label>
            <input type="tel" id="phone" name="phone" className="w-full border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-transparent" />
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
        <p>&copy; {new Date().getFullYear()} Roni's Event Planning LLC. All rights reserved.</p>
      </footer>

      {/* Lightbox Modal */}
      {selectedEvent && selectedEvent.images && selectedEvent.images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm">
          <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 text-white/70 hover:text-white p-2 transition-colors">
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative w-full max-w-5xl aspect-[4/3] md:aspect-video flex items-center justify-center p-4 md:p-12">
            <button 
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + selectedEvent.images.length) % selectedEvent.images.length); }}
              className="absolute left-4 md:left-8 text-white/70 hover:text-white p-2 bg-black/20 hover:bg-black/40 rounded-full transition-all z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <Image 
              src={selectedEvent.images[lightboxIndex]} 
              alt={`${selectedEvent.title} - Image ${lightboxIndex + 1}`}
              fill
              className="object-contain"
            />

            <button 
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % selectedEvent.images.length); }}
              className="absolute right-4 md:right-8 text-white/70 hover:text-white p-2 bg-black/20 hover:bg-black/40 rounded-full transition-all z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium tracking-widest bg-black/50 px-4 py-1.5 rounded-full">
            {lightboxIndex + 1} / {selectedEvent.images.length}
          </div>
        </div>
      )}
    </div>
  );
}
