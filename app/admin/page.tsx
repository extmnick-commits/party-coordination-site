'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { auth, db, storage } from '../firebase';
import Image from 'next/image';
import { Save, ImagePlus, Loader2, LogOut, Trash2, LayoutDashboard } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    heroTitle: '',
    heroSubtitle: '',
    service1Desc: '',
    service2Desc: '',
    service3Desc: '',
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, 'content', 'home');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            heroTitle: data.heroTitle || '',
            heroSubtitle: data.heroSubtitle || '',
            service1Desc: data.service1Desc || '',
            service2Desc: data.service2Desc || '',
            service3Desc: data.service3Desc || '',
          });
          setGalleryImages(data.galleryImages || []);
        }
      } catch (err) {
        console.error('Error fetching admin content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, 'content', 'home');
      await updateDoc(docRef, { ...formData });
      alert('Content published successfully!');
    } catch (err) {
      console.error('Error saving content:', err);
      alert('Failed to publish content.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const docRef = doc(db, 'content', 'home');
      await updateDoc(docRef, {
        galleryImages: arrayUnion(downloadURL)
      });

      setGalleryImages((prev) => [...prev, downloadURL]);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
      // Reset the input value so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (url: string) => {
    if (!confirm('Are you sure you want to remove this image from the gallery?')) return;
    
    try {
      const docRef = doc(db, 'content', 'home');
      await updateDoc(docRef, {
        galleryImages: arrayRemove(url)
      });
      setGalleryImages((prev) => prev.filter((img) => img !== url));
    } catch (err) {
      console.error('Error removing image:', err);
      alert('Failed to remove image.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-stone-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 font-sans pb-24">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-stone-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-800">
            <LayoutDashboard className="h-6 w-6" />
            <h1 className="text-xl font-serif font-medium">Administration</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Text Content Manager */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200">
            <h2 className="text-2xl font-serif text-stone-800 mb-6">Homepage Content</h2>
            
            <form onSubmit={handleSaveContent} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Hero Section</h3>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Hero Title</label>
                  <input
                    type="text"
                    name="heroTitle"
                    value={formData.heroTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-stone-50 text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Hero Subtitle</label>
                  <textarea
                    name="heroSubtitle"
                    rows={2}
                    value={formData.heroSubtitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-stone-50 text-stone-800"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-stone-100">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Services Section</h3>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Corporate Events Description</label>
                  <textarea
                    name="service1Desc"
                    rows={3}
                    value={formData.service1Desc}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-stone-50 text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Elegant Weddings Description</label>
                  <textarea
                    name="service2Desc"
                    rows={3}
                    value={formData.service2Desc}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-stone-50 text-stone-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Private Celebrations Description</label>
                  <textarea
                    name="service3Desc"
                    rows={3}
                    value={formData.service3Desc}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-stone-50 text-stone-800"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Image Gallery Manager */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif text-stone-800">Gallery</h2>
              <label className="cursor-pointer flex items-center justify-center p-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg transition-colors">
                {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {galleryImages.map((url, idx) => (
                <div key={idx} className="group relative aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                  <Image src={url} alt={`Gallery Image ${idx + 1}`} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteImage(url)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {galleryImages.length === 0 && !uploading && (
                <div className="col-span-2 py-8 text-center text-stone-400 text-sm border-2 border-dashed border-stone-200 rounded-lg">
                  No images in gallery.<br/>Click the icon above to upload.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}