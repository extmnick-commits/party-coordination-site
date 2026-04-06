"use client";

import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signOut } from "firebase/auth";
import { db, storage, auth } from "../firebase";
import { useRouter } from "next/navigation";
import { Save, Upload, Image as ImageIcon, Type, LogOut, Trash2, Loader2, Check } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  
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
      }
    };
    fetchContent();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/login");
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage("");
    try {
      await setDoc(doc(db, "content", "home"), content);
      setSaveMessage("Content saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving content:", error);
      setSaveMessage("Failed to save content.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newImageUrls = [...content.galleryImages];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(storage, `gallery/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        newImageUrls.push(downloadURL);
      }
      
      setContent({ ...content, galleryImages: newImageUrls });
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...content.galleryImages];
    newImages.splice(index, 1);
    setContent({ ...content, galleryImages: newImages });
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-900 pb-20">
      {/* Top Navigation */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-serif font-medium">Elegant Events <span className="text-stone-400 font-sans text-sm ml-2">Admin Panel</span></h1>
          <div className="flex items-center gap-4">
            {saveMessage && (
              <span className="text-sm font-medium flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <Check className="w-4 h-4" /> {saveMessage}
              </span>
            )}
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-stone-900 text-stone-50 px-4 py-2 rounded-md hover:bg-stone-800 transition-colors disabled:opacity-50 text-sm font-medium">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save & Publish
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-10 space-y-8">
        {/* Text Content Editor */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-stone-200">
          <div className="flex items-center gap-3 mb-6 border-b border-stone-100 pb-4">
            <Type className="w-6 h-6 text-stone-400" />
            <h2 className="text-2xl font-serif">Hero & Services Content</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Hero Title</label>
              <input type="text" value={content.heroTitle} onChange={(e) => setContent({...content, heroTitle: e.target.value})} className="w-full border border-stone-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900 font-serif text-lg" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Hero Subtitle</label>
              <textarea rows={2} value={content.heroSubtitle} onChange={(e) => setContent({...content, heroSubtitle: e.target.value})} className="w-full border border-stone-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none" />
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Corporate Events Description</label>
                <textarea rows={4} value={content.service1Desc} onChange={(e) => setContent({...content, service1Desc: e.target.value})} className="w-full border border-stone-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Weddings Description</label>
                <textarea rows={4} value={content.service2Desc} onChange={(e) => setContent({...content, service2Desc: e.target.value})} className="w-full border border-stone-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Private Parties Description</label>
                <textarea rows={4} value={content.service3Desc} onChange={(e) => setContent({...content, service3Desc: e.target.value})} className="w-full border border-stone-300 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none text-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* Image Gallery Manager */}
        <section className="bg-white p-8 rounded-xl shadow-sm border border-stone-200">
          <div className="flex items-center justify-between mb-6 border-b border-stone-100 pb-4">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-6 h-6 text-stone-400" />
              <h2 className="text-2xl font-serif">Featured Celebrations Gallery</h2>
            </div>
            
            <div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} multiple accept="image/*" className="hidden" id="gallery-upload" />
              <label htmlFor="gallery-upload" className="flex items-center gap-2 bg-stone-100 text-stone-800 px-4 py-2 rounded-md hover:bg-stone-200 transition-colors cursor-pointer text-sm font-medium border border-stone-200">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload Images
              </label>
            </div>
          </div>
          
          {content.galleryImages.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-lg text-stone-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <p>No images in the gallery yet.</p>
              <p className="text-sm mt-1">Upload images to display them on the homepage.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {content.galleryImages.map((url, index) => (
                <div key={index} className="group relative aspect-square rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                  <img src={url} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => removeImage(index)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Badge for homepage visibility */}
                  {index < 3 && (
                     <span className="absolute top-2 left-2 bg-white/90 text-stone-900 text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                       Home Page
                     </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-stone-500 mt-4">
            Note: The homepage currently displays the first 3 images in this gallery. You can re-upload or manage them here.
          </p>
        </section>
      </main>
    </div>
  );
}