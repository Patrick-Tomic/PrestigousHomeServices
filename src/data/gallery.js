// Photos uploaded by the owner live on the server (see public/api/gallery.php),
// not in the build, so the gallery loads them at runtime.

import { useState, useEffect } from 'react'
import { postApi } from './api'

// Built-in photos as responsive WebP (src/assets/web/, made from the
// originals in src/assets/): 800px for phones and grids, 1600px for large
// screens and the lightbox.
const pics = import.meta.glob('../assets/web/*.webp', { eager: true, import: 'default' })
const pic = (name) => {
  const small = pics[`../assets/web/${name}-800.webp`]
  const large = pics[`../assets/web/${name}-1600.webp`]
  return { src: large, srcSet: `${small} 800w, ${large} 1600w` }
}

// Built-in photos. New ones are added by the owner at /admin.
const builtInPhotos = [
  { id: 1, ...pic('showerA'),  category: 'Bathroom', label: 'Custom Shower Tile' },
  { id: 2, ...pic('floor'),    category: 'Flooring', label: 'Flooring Installation' },
  { id: 3, ...pic('showerB'),  category: 'Bathroom', label: 'Shower Remodel' },
  { id: 4, ...pic('hardwood'), category: 'Flooring', label: 'Hardwood Flooring' },
  { id: 5, ...pic('showerC'),  category: 'Bathroom', label: 'Tile Work' },
  { id: 6, ...pic('roofing'),  category: 'Roofing',  label: 'Roof Installation' },
  { id: 7, ...pic('showerD'),  category: 'Bathroom', label: 'Master Shower' },
  { id: 8, ...pic('bathroom'), category: 'Bathroom', label: 'Bathroom Remodel' },
  { id: 9, ...pic('showerE'),  category: 'Bathroom', label: 'Walk-In Shower' },
]

export const CATEGORIES = ['Flooring', 'Bathroom', 'Kitchen', 'Patio', 'Roofing', 'Handyman']

export const API_URL = '/api/gallery.php'
const UPLOADS_URL = '/uploads/gallery/'

export async function fetchUploadedPhotos() {
  try {
    const res = await fetch('/api/photos.php', { cache: 'no-store' })
    if (!res.ok) return []
    const list = await res.json()
    if (!Array.isArray(list)) return []
    return list
      .filter(p => p && typeof p.file === 'string' && p.id)
      .map(p => ({ ...p, src: UPLOADS_URL + p.file }))
  } catch {
    return []
  }
}

export const callApi = (fields) => postApi(API_URL, fields)

// Uploaded photos (newest first) followed by the built-in ones.
export function useGalleryPhotos() {
  const [uploaded, setUploaded] = useState([])
  useEffect(() => { fetchUploadedPhotos().then(setUploaded) }, [])
  return [...uploaded, ...builtInPhotos]
}
