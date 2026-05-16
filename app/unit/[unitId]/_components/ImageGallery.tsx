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

  // ── Lightbox keyboard navigation ──────────────────────────────────────────
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
      <div className="flex flex-col gap-3">

        {/* Main image */}
        <div
          className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-muted cursor-zoom-in"
          onClick={() => openLightbox(activeIndex)}
        >
          <Image
            src={images[activeIndex]}
            alt={`${alt} — image ${activeIndex + 1}`}
            fill
            priority
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, 60vw"
          />

          {/* Image counter badge */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
            {activeIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden transition-all duration-200',
                activeIndex === i
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'opacity-60 hover:opacity-90'
              )}
            >
              <Image
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setLightboxOpen(false)}
          />

          {/* Close */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
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
              className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div className="relative w-full max-w-4xl mx-16 aspect-[4/3]">
            <Image
              src={images[lightboxIndex]}
              alt={`${alt} — image ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((i) => (i + 1) % images.length)
              }}
              className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Lightbox counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Lightbox thumbnails */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex(i)
                }}
                className={cn(
                  'relative w-12 h-9 rounded overflow-hidden transition-all',
                  lightboxIndex === i
                    ? 'ring-2 ring-white'
                    : 'opacity-50 hover:opacity-80'
                )}
              >
                <Image
                  src={src}
                  alt={`thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}