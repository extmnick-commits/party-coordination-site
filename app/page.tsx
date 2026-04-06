"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import Image from "next/image";

interface Content {
  heroTitle: string;
  heroSubtitle: string;
  service1Desc: string;
  service2Desc: string;
  service3Desc: string;
  galleryImages: string[];
}

export default function HomePage() {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, "content", "home");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setContent(docSnap.data() as Content);
        } else {
          setError("No content found for the homepage.");
        }
      } catch (err: any) {
        console.error("Error fetching homepage content:", err);
        setError("Failed to load homepage content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-50 text-xl font-serif">
        Loading Elegant Events...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-red-300 text-xl font-serif">
        Error: {error}
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-50 text-xl font-serif">
        No content available.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-50 font-sans">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center text-center p-6 bg-cover bg-center" style={{ backgroundImage: `url(${content.galleryImages[0] || 'https://images.unsplash.com/photo-1555776606-f68285514fcc?q=80&w=2070&auto=format&fit=crop'})` }}>
        <div className="absolute inset-0 bg-black/60 backdrop-brightness-75"></div>
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight">{content.heroTitle}</h1>
          <p className="text-lg md:text-2xl text-stone-300 font-light max-w-2xl mx-auto">{content.heroSubtitle}</p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif text-center mb-16">Our Signature Services</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-serif border-b border-stone-800 pb-4">Corporate Events</h3>
            <p className="text-stone-400 leading-relaxed">{content.service1Desc}</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-serif border-b border-stone-800 pb-4">Elegant Weddings</h3>
            <p className="text-stone-400 leading-relaxed">{content.service2Desc}</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-serif border-b border-stone-800 pb-4">Private Celebrations</h3>
            <p className="text-stone-400 leading-relaxed">{content.service3Desc}</p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {content.galleryImages && content.galleryImages.length > 0 && (
        <section className="py-24 bg-stone-900 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif text-center mb-16">Featured Moments</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {content.galleryImages.slice(0, 3).map((url, idx) => (
                <div key={idx} className="relative aspect-square overflow-hidden rounded-lg">
                  <Image 
                    src={url} 
                    alt={`Gallery Image ${idx + 1}`} 
                    fill 
                    className="object-cover hover:scale-105 transition-transform duration-500" 
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}