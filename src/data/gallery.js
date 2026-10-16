// Photos uploaded by the owner live on the server (see public/api/gallery.php),
// not in the build, so the gallery loads them at runtime.

import { useState, useEffect } from 'react'

import imgBathroom  from '../assets/bathroom.jpg'
import imgFloorJpg  from '../assets/floor.jpg'
import imgFloorPng  from '../assets/floor.png'
import imgRoofing   from '../assets/roofing.png'
import imgShowerA   from '../assets/showerA.jpeg'
import imgShowerB   from '../assets/showerB.jpeg'
import imgShowerC   from '../assets/showerC.jpeg'
import imgShowerD   from '../assets/showerD.jpeg'
import imgShowerE   from '../assets/showerE.jpg'

// Built-in photos. New ones are added by the owner at /admin.
const builtInPhotos = [
  { id: 1, src: imgShowerA,   category: 'Bathroom', label: 'Custom Shower Tile' },
  { id: 2, src: imgFloorJpg,  category: 'Flooring', label: 'Flooring Installation' },
  { id: 3, src: imgShowerB,   category: 'Bathroom', label: 'Shower Remodel' },
  { id: 4, src: imgFloorPng,  category: 'Flooring', label: 'Hardwood Flooring' },
  { id: 5, src: imgShowerC,   category: 'Bathroom', label: 'Tile Work' },
  { id: 6, src: imgRoofing,   category: 'Roofing',  label: 'Roof Installation' },
  { id: 7, src: imgShowerD,   category: 'Bathroom', label: 'Master Shower' },
  { id: 8, src: imgBathroom,  category: 'Bathroom', label: 'Bathroom Remodel' },
  { id: 9, src: imgShowerE,   category: 'Bathroom', label: 'Walk-In Shower' },
]

export const CATEGORIES = ['Flooring', 'Bathroom', 'Kitchen', 'Patio', 'Roofing', 'Handyman']

export const API_URL = '/api/gallery.php'
const UPLOADS_URL = '/uploads/gallery/'

export async function fetchUploadedPhotos() {
  try {
    const res = await fetch(`${UPLOADS_URL}photos.json`, { cache: 'no-store' })
    if (!res.ok) return []
    const list = await res.json()
    if (!Array.isArray(list)) return []
    return list.map(p => ({ ...p, src: UPLOADS_URL + p.file }))
  } catch {
    return []
  }
}

export async function callApi(fields) {
  const body = new FormData()
  for (const [key, value] of Object.entries(fields)) body.append(key, value)

  let res
  try {
    res = await fetch(API_URL, { method: 'POST', body })
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Server error (${res.status}).`)
  return data
}

// Uploaded photos (newest first) followed by the built-in ones.
export function useGalleryPhotos() {
  const [uploaded, setUploaded] = useState([])
  useEffect(() => { fetchUploadedPhotos().then(setUploaded) }, [])
  return [...uploaded, ...builtInPhotos]
}
