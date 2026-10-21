// The built-in project photos (responsive WebP versions live in
// src/assets/web/<name>-800.webp and -1600.webp). Plain data so both the app
// (src/data/gallery.js) and the build (scripts/prerender.mjs, for the image
// sitemap) can use it. Photos the owner uploads at /admin come on top.
export const builtinPhotos = [
  { id: 1, name: 'showerA',  category: 'Bathroom', label: 'Custom Shower Tile' },
  { id: 2, name: 'floor',    category: 'Flooring', label: 'Flooring Installation' },
  { id: 3, name: 'showerB',  category: 'Bathroom', label: 'Shower Remodel' },
  { id: 4, name: 'hardwood', category: 'Flooring', label: 'Hardwood Flooring' },
  { id: 5, name: 'showerC',  category: 'Bathroom', label: 'Tile Work' },
  { id: 6, name: 'roofing',  category: 'Roofing',  label: 'Roof Installation' },
  { id: 7, name: 'showerD',  category: 'Bathroom', label: 'Master Shower' },
  { id: 8, name: 'bathroom', category: 'Bathroom', label: 'Bathroom Remodel' },
  { id: 9, name: 'showerE',  category: 'Bathroom', label: 'Walk-In Shower' },
]
