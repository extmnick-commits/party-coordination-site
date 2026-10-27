"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type PhotoViewerProps = {
  title: string;
  images: string[];
  index: number;
  onIndexChange: (updater: (index: number) => number) => void;
  onClose: () => void;
};

export default function PhotoViewer({ title, images, index, onIndexChange, onClose }: PhotoViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const count = images.length;

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const move = (direction: number) => {
    onIndexChange((current) => (current + direction + count) % count);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={`${title} photo viewer`}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onKeyDown={(event) => {
        if (count < 2) return;
        if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      }}
      className="fixed inset-0 m-0 flex h-[100dvh] max-h-none w-screen max-w-none flex-col overflow-hidden bg-stone-950 p-0 text-white backdrop:bg-stone-950"
    >
      <header className="flex shrink-0 items-center justify-between gap-4 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 sm:px-8">
        <div className="min-w-0">
          <p className="truncate font-serif text-lg sm:text-xl">{title}</p>
          <p className="mt-0.5 text-xs tracking-wide text-stone-400" aria-live="polite">{index + 1} of {count}</p>
        </div>
        <button type="button" autoFocus onClick={onClose} aria-label="Close photo viewer" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          <X className="h-5 w-5" />
        </button>
      </header>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden touch-pan-y"
        onTouchStart={(event) => {
          if (event.touches.length === 1) touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
          else touchStart.current = null;
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start || count < 2 || event.changedTouches.length !== 1) return;
          const dx = event.changedTouches[0].clientX - start.x;
          const dy = event.changedTouches[0].clientY - start.y;
          if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.2) move(dx < 0 ? 1 : -1);
        }}
        onTouchCancel={() => { touchStart.current = null; }}
      >
        <div className="relative h-full w-full max-w-7xl mx-4 sm:mx-20">
          <Image key={images[index]} src={images[index]} alt={`${title}, photo ${index + 1} of ${count}`} fill sizes="(max-width: 640px) 100vw, 85vw" className="object-contain select-none" draggable={false} priority />
        </div>
        {count > 1 && <>
          <button type="button" onClick={() => move(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-stone-950/65 text-white shadow-lg ring-1 ring-white/20 transition-colors hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6"><ChevronLeft className="h-6 w-6" /></button>
          <button type="button" onClick={() => move(1)} aria-label="Next photo" className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-stone-950/65 text-white shadow-lg ring-1 ring-white/20 transition-colors hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6"><ChevronRight className="h-6 w-6" /></button>
        </>}
      </div>
      <div className="shrink-0 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-xs text-stone-400">
        {count > 1 ? "Swipe or use the arrows to explore" : " "}
      </div>
    </dialog>
  );
}
