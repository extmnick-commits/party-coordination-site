'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { auth, db, storage } from '../firebase';
import Image from 'next/image';
import { Save, ImagePlus, Loader2, LogOut, Trash2, LayoutDashboard, Monitor, Smartphone, Briefcase, CalendarDays, Wine, ChevronRight, UploadCloud, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { Rnd } from 'react-rnd';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [heroBgImage, setHeroBgImage] = useState<string>('');
  const [uploadingHero, setUploadingHero] = useState(false);
  const [layouts, setLayouts] = useState<Record<string, { x: number; y: number; width: number | string; height: number | string }>>({});
  const [events, setEvents] = useState<{ id: string; title: string; images: string[] }[]>([]);
  
  const [formData, setFormData] = useState({
    heroTitle: '',
    heroSubtitle: '',
    service1Desc: '',
    service2Desc: '',
    service3Desc: '',
    instagramUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
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
            instagramUrl: data.instagramUrl || '',
            facebookUrl: data.facebookUrl || '',
            tiktokUrl: data.tiktokUrl || '',
          });
          setGalleryImages(data.galleryImages || []);
          setHeroBgImage(data.heroBgImage || '');
          setLayouts(data.layouts || {});
          setEvents(data.events || []);
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

  const updateLayout = (id: string, newProps: any) => {
    setLayouts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...newProps },
    }));
  };

  const getSafeKey = (url: string) => {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = (hash << 5) - hash + url.charCodeAt(i);
      hash |= 0;
    }
    return `img_${Math.abs(hash)}`;
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert('User is not authenticated. Please log in.');
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, 'content', 'home');
      await updateDoc(docRef, { ...formData, layouts, heroBgImage, events });
      alert('Content published successfully!');
    } catch (err) {
      console.error('Error saving content:', err);
      alert('Failed to publish content.');
    } finally {
      setSaving(false);
    }
  };

  const handleHeroBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!auth.currentUser) {
      alert('User is not authenticated. Please log in.');
      return;
    }

    setUploadingHero(true);
    try {
      // Use a consistent name to overwrite the old hero image
      const storageRef = ref(storage, `hero/background`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const docRef = doc(db, 'content', 'home');
      await updateDoc(docRef, { heroBgImage: downloadURL });

      setHeroBgImage(downloadURL);
    } catch (err) {
      console.error('Error uploading hero background:', err);
      alert('Failed to upload hero background.');
    } finally {
      setUploadingHero(false);
      e.target.value = '';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!auth.currentUser) {
      alert('User is not authenticated. Please log in.');
      return;
    }

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
    
    if (!auth.currentUser) {
      alert('User is not authenticated. Please log in.');
      return;
    }

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

  const handleAddEvent = () => {
    setEvents([...events, { id: Date.now().toString(), title: 'New Event', images: [] }]);
  };

  const handleDeleteEvent = (id: string) => {
    if (!confirm('Are you sure you want to delete this event album?')) return;
    setEvents(events.filter(e => e.id !== id));
  };

  const handleMoveEvent = (index: number, direction: number) => {
    const newEvents = [...events];
    const temp = newEvents[index];
    newEvents[index] = newEvents[index + direction];
    newEvents[index + direction] = temp;
    setEvents(newEvents);
  };

  const handleEventTitleChange = (id: string, newTitle: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, title: newTitle } : e));
  };

  const handleEventImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, eventId: string) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `events/${eventId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setEvents(events.map(ev => ev.id === eventId ? { ...ev, images: [...ev.images, downloadURL] } : ev));
    } catch (err) {
      console.error('Error uploading event image:', err);
      alert('Failed to upload image to event.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteEventImage = (eventId: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to remove this photo from the event?')) return;
    setEvents(events.map(ev => ev.id === eventId ? { ...ev, images: ev.images.filter(img => img !== imageUrl) } : ev));
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
    <div className="h-screen bg-stone-100 font-sans flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-stone-200 px-6 py-4 z-50 shrink-0">
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

      {/* Main Split Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Column - Controls */}
        <div className="w-[400px] bg-white border-r border-stone-200 flex flex-col overflow-y-auto z-10 shadow-lg shrink-0">
          <form onSubmit={handleSaveContent} className="flex flex-col min-h-full">
            <div className="p-6 space-y-8 flex-1">
              <div>
                <h2 className="text-2xl font-serif text-stone-800 mb-6">Content Elements</h2>
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

                  <div className="space-y-2 pt-4">
                    <label className="block text-sm font-medium text-stone-700">Hero Background</label>
                    <div className="aspect-video w-full bg-stone-100 rounded-lg relative overflow-hidden border">
                      {heroBgImage && <Image src={heroBgImage} alt="Hero Background Preview" fill className="object-cover" />}
                    </div>
                    <label className="cursor-pointer w-full flex items-center justify-center p-3 bg-stone-50 border-2 border-dashed border-stone-300 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors">
                      {uploadingHero ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                      <span className="ml-2 font-medium text-sm">Change Background</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleHeroBgUpload} disabled={uploadingHero} />
                    </label>
                  </div>
                </div>

                <div className="space-y-4 pt-6 mt-6 border-t border-stone-100">
                  <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Services Section</h3>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Corporate Events</label>
                    <textarea
                      name="service1Desc"
                      rows={2}
                      value={formData.service1Desc}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-stone-50 text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Elegant Weddings</label>
                    <textarea
                      name="service2Desc"
                      rows={2}
                      value={formData.service2Desc}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-stone-50 text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Private Celebrations</label>
                    <textarea
                      name="service3Desc"
                      rows={2}
                      value={formData.service3Desc}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-stone-50 text-stone-800"
                    />
                  </div>
                </div>

                {/* Event Albums Section */}
                <div className="space-y-4 pt-6 mt-6 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Event Albums (Gallery)</h3>
                    <button type="button" onClick={handleAddEvent} className="flex items-center gap-1 text-xs bg-stone-200 hover:bg-stone-300 text-stone-800 px-3 py-1.5 rounded-md font-medium transition-colors">
                      <Plus className="w-3 h-3"/> Add Event
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {events.map((event, index) => (
                      <div key={event.id} className="border border-stone-200 rounded-lg p-4 bg-stone-50 space-y-3 shadow-sm">
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={event.title} 
                            onChange={(e) => handleEventTitleChange(event.id, e.target.value)}
                            className="flex-1 px-3 py-1.5 text-sm border border-stone-300 rounded focus:ring-2 focus:ring-stone-400 bg-white"
                            placeholder="Event Title"
                          />
                          <div className="flex gap-1">
                            <button type="button" onClick={() => handleMoveEvent(index, -1)} disabled={index === 0} className="p-1.5 bg-white border border-stone-200 rounded hover:bg-stone-100 disabled:opacity-50 transition-colors" title="Move Up"><ArrowUp className="w-4 h-4"/></button>
                            <button type="button" onClick={() => handleMoveEvent(index, 1)} disabled={index === events.length - 1} className="p-1.5 bg-white border border-stone-200 rounded hover:bg-stone-100 disabled:opacity-50 transition-colors" title="Move Down"><ArrowDown className="w-4 h-4"/></button>
                            <button type="button" onClick={() => handleDeleteEvent(event.id)} className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded hover:bg-red-100 transition-colors" title="Delete Event"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        </div>
                        <label className="cursor-pointer flex items-center justify-center p-2 bg-white border border-dashed border-stone-300 text-stone-600 hover:bg-stone-50 rounded transition-colors text-sm font-medium">
                          <ImagePlus className="h-4 w-4 mr-2" /> Upload Photos
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleEventImageUpload(e, event.id)} disabled={uploading} />
                        </label>
                        {event.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {event.images.map((img, imgIdx) => (
                              <div key={imgIdx} className="relative aspect-square bg-stone-200 rounded overflow-hidden group border border-stone-200">
                                <Image src={img} alt="Event img" fill className="object-cover" />
                                <button type="button" onClick={() => handleDeleteEventImage(event.id, img)} className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3"/></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-6 mt-6 border-t border-stone-100">
                  <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Social Media Links</h3>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Instagram URL</label>
                    <input
                      type="url"
                      name="instagramUrl"
                      value={formData.instagramUrl}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/..."
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-stone-50 text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Facebook URL</label>
                    <input
                      type="url"
                      name="facebookUrl"
                      value={formData.facebookUrl}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/..."
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-stone-50 text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">TikTok URL</label>
                    <input
                      type="url"
                      name="tiktokUrl"
                      value={formData.tiktokUrl}
                      onChange={handleInputChange}
                      placeholder="https://tiktok.com/@..."
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-400 focus:border-stone-400 bg-stone-50 text-stone-800"
                    />
                  </div>
                </div>
              </div>

              {/* Gallery List inside Left Pane */}
              <div className="space-y-4 pt-6 border-t border-stone-100">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Canvas Draggable Images</h3>
                <label className="cursor-pointer flex items-center justify-center p-3 bg-stone-50 border-2 border-dashed border-stone-300 text-stone-700 hover:bg-stone-100 rounded-lg transition-colors">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                  <span className="ml-2 font-medium text-sm">Upload New Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {galleryImages.map((url, idx) => (
                    <div key={idx} className="relative aspect-square bg-stone-100 rounded-lg overflow-hidden group">
                      <Image src={url} alt="Gallery" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(url)}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-white border-t border-stone-200 sticky bottom-0 z-20">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save & Publish
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Live Preview */}
        <div className="flex-1 bg-stone-200 flex flex-col relative">
          {/* Toggle Bar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-md border px-2 py-2 flex gap-2 z-50">
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-2 rounded-full transition-colors ${previewDevice === 'mobile' ? 'bg-stone-200 text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
              title="Mobile View"
            >
              <Smartphone className="h-5 w-5" />
            </button>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-2 rounded-full transition-colors ${previewDevice === 'desktop' ? 'bg-stone-200 text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
              title="Desktop View"
            >
              <Monitor className="h-5 w-5" />
            </button>
          </div>

          {/* Canvas Container */}
          <div className="flex-1 overflow-auto flex justify-center pb-24 pt-20 px-4 md:px-8">
            {previewDevice === 'desktop' ? (
              <div className="w-full max-w-[1024px] flex flex-col gap-8">
                {/* DESKTOP CANVAS 1 (Hero + Services) */}
                <div className="relative bg-stone-50 shadow-2xl overflow-hidden ring-1 ring-stone-900/5 w-full h-[950px]">
                  <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                  <div className="absolute top-0 left-0 w-full h-[600px] bg-stone-950 pointer-events-none">
                    <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url(${heroBgImage || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop'})` }}></div>
                  </div>

                  <Rnd bounds="parent" dragGrid={[8, 8]} resizeGrid={[8, 8]} position={{ x: layouts.heroTitle?.x ?? 112, y: layouts.heroTitle?.y ?? 150 }} size={{ width: layouts.heroTitle?.width ?? 800, height: layouts.heroTitle?.height ?? 100 }} onDragStop={(e, d) => updateLayout('heroTitle', { x: d.x, y: d.y })} onResizeStop={(e, dir, ref, delta, pos) => updateLayout('heroTitle', { width: ref.style.width, height: ref.style.height, ...pos })} className="group border border-dashed border-transparent hover:border-white/50 cursor-move">
                    <div className="w-full h-full flex items-center justify-center text-center drop-shadow-md">
                      <h1 className="text-4xl md:text-6xl font-serif tracking-tight text-stone-50 pointer-events-none">{formData.heroTitle || 'Crafting Unforgettable Moments'}</h1>
                    </div>
                  </Rnd>

                  <Rnd bounds="parent" dragGrid={[8, 8]} resizeGrid={[8, 8]} position={{ x: layouts.heroSubtitle?.x ?? 212, y: layouts.heroSubtitle?.y ?? 270 }} size={{ width: layouts.heroSubtitle?.width ?? 600, height: layouts.heroSubtitle?.height ?? 80 }} onDragStop={(e, d) => updateLayout('heroSubtitle', { x: d.x, y: d.y })} onResizeStop={(e, dir, ref, delta, pos) => updateLayout('heroSubtitle', { width: ref.style.width, height: ref.style.height, ...pos })} className="group border border-dashed border-transparent hover:border-white/50 cursor-move">
                    <div className="w-full h-full flex items-center justify-center text-center drop-shadow-md">
                      <p className="text-lg md:text-2xl text-stone-200 font-light pointer-events-none">{formData.heroSubtitle || 'Exclusive event coordination for elegant weddings and private celebrations.'}</p>
                    </div>
                  </Rnd>

                  <Rnd bounds="parent" dragGrid={[8, 8]} resizeGrid={[8, 8]} position={{ x: layouts.heroButton?.x ?? 412, y: layouts.heroButton?.y ?? 380 }} size={{ width: layouts.heroButton?.width ?? 200, height: layouts.heroButton?.height ?? 60 }} onDragStop={(e, d) => updateLayout('heroButton', { x: d.x, y: d.y })} onResizeStop={(e, dir, ref, delta, pos) => updateLayout('heroButton', { width: ref.style.width, height: ref.style.height, ...pos })} className="group border border-dashed border-transparent hover:border-white/50 cursor-move">
                    <div className="w-full h-full flex items-center justify-center text-center">
                      <div className="inline-flex items-center gap-2 bg-stone-50 text-stone-950 px-8 py-4 text-lg font-medium pointer-events-none">Inquire About Your Event <ChevronRight className="w-5 h-5" /></div>
                    </div>
                  </Rnd>

                  <Rnd bounds="parent" dragGrid={[8, 8]} resizeGrid={[8, 8]} position={{ x: layouts.service1?.x ?? 62, y: layouts.service1?.y ?? 650 }} size={{ width: layouts.service1?.width ?? 280, height: layouts.service1?.height ?? 250 }} onDragStop={(e, d) => updateLayout('service1', { x: d.x, y: d.y })} onResizeStop={(e, dir, ref, delta, pos) => updateLayout('service1', { width: ref.style.width, height: ref.style.height, ...pos })} className="group border border-dashed border-transparent hover:border-stone-400 cursor-move bg-white/80 backdrop-blur-sm shadow-sm rounded-xl p-6 flex flex-col items-center text-center">
                    <div className="w-full h-full flex flex-col items-center pointer-events-none">
                      <div className="w-16 h-16 bg-stone-100 flex items-center justify-center rounded-full mb-4"><Briefcase className="w-8 h-8 text-stone-900" /></div>
                      <h3 className="text-xl font-medium mb-3 text-stone-900">Corporate Events</h3>
                      <p className="text-stone-600 text-sm leading-relaxed overflow-hidden">{formData.service1Desc || 'Professional and seamless coordination for galas and retreats.'}</p>
                    </div>
                  </Rnd>

                  <Rnd bounds="parent" dragGrid={[8, 8]} resizeGrid={[8, 8]} position={{ x: layouts.service2?.x ?? 372, y: layouts.service2?.y ?? 650 }} size={{ width: layouts.service2?.width ?? 280, height: layouts.service2?.height ?? 250 }} onDragStop={(e, d) => updateLayout('service2', { x: d.x, y: d.y })} onResizeStop={(e, dir, ref, delta, pos) => updateLayout('service2', { width: ref.style.width, height: ref.style.height, ...pos })} className="group border border-dashed border-transparent hover:border-stone-400 cursor-move bg-white/80 backdrop-blur-sm shadow-sm rounded-xl p-6 flex flex-col items-center text-center">
                    <div className="w-full h-full flex flex-col items-center pointer-events-none">
                      <div className="w-16 h-16 bg-stone-100 flex items-center justify-center rounded-full mb-4"><CalendarDays className="w-8 h-8 text-stone-900" /></div>
                      <h3 className="text-xl font-medium mb-3 text-stone-900">Weddings</h3>
                      <p className="text-stone-600 text-sm leading-relaxed overflow-hidden">{formData.service2Desc || 'Bespoke wedding planning ensuring perfectly executed details.'}</p>
                    </div>
                  </Rnd>

                  <Rnd bounds="parent" dragGrid={[8, 8]} resizeGrid={[8, 8]} position={{ x: layouts.service3?.x ?? 682, y: layouts.service3?.y ?? 650 }} size={{ width: layouts.service3?.width ?? 280, height: layouts.service3?.height ?? 250 }} onDragStop={(e, d) => updateLayout('service3', { x: d.x, y: d.y })} onResizeStop={(e, dir, ref, delta, pos) => updateLayout('service3', { width: ref.style.width, height: ref.style.height, ...pos })} className="group border border-dashed border-transparent hover:border-stone-400 cursor-move bg-white/80 backdrop-blur-sm shadow-sm rounded-xl p-6 flex flex-col items-center text-center">
                    <div className="w-full h-full flex flex-col items-center pointer-events-none">
                      <div className="w-16 h-16 bg-stone-100 flex items-center justify-center rounded-full mb-4"><Wine className="w-8 h-8 text-stone-900" /></div>
                      <h3 className="text-xl font-medium mb-3 text-stone-900">Private Parties</h3>
                      <p className="text-stone-600 text-sm leading-relaxed overflow-hidden">{formData.service3Desc || 'Exclusive and intimate celebrations tailored to your unique style.'}</p>
                    </div>
                  </Rnd>
                </div>

                {/* MOCK EVENT GALLERY - Responsive Flow */}
                <div className="w-full bg-white shadow-xl ring-1 ring-stone-900/5 py-16 px-6 text-center border-t border-stone-200">
                  <h2 className="text-3xl font-serif mb-4 text-stone-800">Event Gallery</h2>
                  <p className="text-stone-500 text-sm mb-8">This responsive section will automatically populate here based on the albums you create.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 pointer-events-none">
                    {[1,2,3].map(i => <div key={i} className="aspect-[4/3] bg-stone-200 rounded-xl border border-stone-300"></div>)}
                  </div>
                </div>

                {/* DESKTOP CANVAS 2 (Draggable Images) */}
                <div className="relative bg-stone-50 shadow-2xl overflow-hidden ring-1 ring-stone-900/5 w-full h-[850px]">
                  <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                  {galleryImages.map((url, idx) => {
                    const key = getSafeKey(url);
                    const defaultX = 62 + (idx % 3) * 310;
                    const defaultY = 950 + Math.floor(idx / 3) * 310;
                    const itemY = (layouts[key]?.y ?? defaultY) - 950;
                    return (
                      <Rnd
                        key={key}
                        bounds="parent"
                        dragGrid={[8, 8]}
                        resizeGrid={[8, 8]}
                        position={{ x: layouts[key]?.x ?? defaultX, y: itemY }}
                        size={{ width: layouts[key]?.width ?? 280, height: layouts[key]?.height ?? 280 }}
                        onDragStop={(e, d) => updateLayout(key, { x: d.x, y: d.y + 950 })}
                        onResizeStop={(e, dir, ref, delta, pos) => updateLayout(key, { width: ref.style.width, height: ref.style.height, x: pos.x, y: pos.y + 950 })}
                        className="group border border-dashed border-transparent hover:border-stone-400 cursor-move shadow-md rounded-xl overflow-hidden bg-stone-200"
                      >
                        <div className="w-full h-full relative pointer-events-none">
                          <Image src={url} alt={`Gallery ${idx}`} fill className="object-cover" />
                        </div>
                      </Rnd>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="w-[375px] bg-white shadow-2xl ring-1 ring-stone-900/5 overflow-hidden flex flex-col font-sans">
                {/* Mobile Hero Preview */}
                <div className="relative w-full h-[500px] flex flex-col items-center justify-center bg-stone-950 px-6 text-center">
                  <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url(${heroBgImage || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop'})` }}></div>
                  <div className="relative z-10 flex flex-col items-center gap-6">
                    <h1 className="text-3xl font-serif text-stone-50 drop-shadow-md">{formData.heroTitle || 'Crafting Unforgettable Moments'}</h1>
                    <p className="text-sm text-stone-200 font-light">{formData.heroSubtitle || 'Exclusive event coordination for elegant weddings and private celebrations.'}</p>
                    <div className="inline-flex items-center gap-2 bg-stone-50 text-stone-950 px-6 py-3 text-sm font-medium rounded-full shadow-lg">
                      Inquire <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                {/* Mobile Services Preview */}
                <div className="py-12 px-6 bg-stone-100 space-y-4">
                  <div className="bg-white shadow-sm rounded-xl p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-stone-50 flex items-center justify-center rounded-full mb-3"><Briefcase className="w-6 h-6 text-stone-900" /></div>
                    <h3 className="text-lg font-medium mb-2 text-stone-900">Corporate Events</h3>
                    <p className="text-stone-600 text-xs leading-relaxed">{formData.service1Desc || 'Professional and seamless coordination for galas and retreats.'}</p>
                  </div>
                  <div className="bg-white shadow-sm rounded-xl p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-stone-50 flex items-center justify-center rounded-full mb-3"><CalendarDays className="w-6 h-6 text-stone-900" /></div>
                    <h3 className="text-lg font-medium mb-2 text-stone-900">Weddings</h3>
                    <p className="text-stone-600 text-xs leading-relaxed">{formData.service2Desc || 'Bespoke wedding planning ensuring perfectly executed details.'}</p>
                  </div>
                  <div className="bg-white shadow-sm rounded-xl p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-stone-50 flex items-center justify-center rounded-full mb-3"><Wine className="w-6 h-6 text-stone-900" /></div>
                    <h3 className="text-lg font-medium mb-2 text-stone-900">Private Parties</h3>
                    <p className="text-stone-600 text-xs leading-relaxed">{formData.service3Desc || 'Exclusive and intimate celebrations tailored to your unique style.'}</p>
                  </div>
                </div>
                {/* Mock Event Gallery Preview */}
                <div className="py-12 px-6 bg-stone-50 text-center border-t border-stone-200">
                  <h2 className="text-2xl font-serif mb-4 text-stone-800">Event Gallery</h2>
                  <div className="space-y-4 opacity-40 pointer-events-none">
                    <div className="aspect-[4/3] bg-stone-200 rounded-xl border border-stone-300"></div>
                  </div>
                </div>
                {/* Mobile Draggable Images Mock Preview */}
                {galleryImages.length > 0 && (
                  <div className="py-12 px-6 bg-stone-100 border-t border-stone-200">
                    <h2 className="text-2xl font-serif mb-6 text-center text-stone-800">Inspiration</h2>
                    <div className="grid grid-cols-2 gap-3 opacity-60 pointer-events-none">
                      {galleryImages.map((url, idx) => (
                        <div key={idx} className="aspect-square bg-stone-200 rounded-lg overflow-hidden relative shadow-sm">
                          <Image src={url} alt="img" fill className="object-cover"/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}