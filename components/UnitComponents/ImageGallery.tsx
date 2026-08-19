'use client'

import Image from 'next/image'
import { useState, useCallback, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Lightbox keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i - 1 + images.length) % images.length)
    },
    [lightboxOpen, images.length]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxOpen])

  function openLightbox(index: number) {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      {/* ── Main gallery ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 unit-page">
        
        {/* Main image */}
        <div
          className="relative w-full aspect-[16/9] lg:aspect-[16/9] rounded-3xl overflow-hidden bg-muted ring-1 ring-border/50 shadow-sm group"
          onClick={() => openLightbox(activeIndex)}
        >
          <Image
            src={images[activeIndex]}
            alt={`${alt} — image ${activeIndex + 1}`}
            fill
            priority
            quality={100} 
            className="unit-page-image"
            sizes="(max-width: 1024px) 100vw, 80vw"
          />

          {/* Image counter badge */}
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-md text-foreground text-xs font-semibold border border-border/50 shadow-sm">
            {activeIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 mask-image:linear-gradient(to_right,white_90%,transparent)]">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                // THE FIX IS HERE: Added overflow-hidden and rounded-xl so the image cannot spill over the edges
                'thumbnail-image relative flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden transition-all',
                activeIndex === i
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background opacity-100'
                  : 'opacity-60 hover:opacity-100 ring-1 ring-border'
              )}
            >
              <Image
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center unit-page">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/95 backdrop-blur-xl"
            onClick={() => setLightboxOpen(false)}
          />

          {/* Close */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors border border-border/50"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((i) => (i - 1 + images.length) % images.length)
              }}
              className="absolute left-6 z-10 p-3 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors border border-border/50 hidden sm:block"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div className="relative w-full max-w-5xl mx-4 sm:mx-20 aspect-[4/3] md:aspect-[16/9]">
            <Image
              src={images[lightboxIndex]}
              alt={`${alt} — image ${lightboxIndex + 1}`}
              fill
              quality={100}
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((i) => (i + 1) % images.length)
              }}
              className="absolute right-6 z-10 p-3 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors border border-border/50 hidden sm:block"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Lightbox counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-muted/50 backdrop-blur-md text-foreground text-xs font-semibold border border-border/50">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}