// "My Project": the rooms a visitor has designed, kept in their own browser
// (localStorage). Each room stores its design as the same query string the
// designer uses, so saved rooms survive option changes and open straight
// back into the designer.

import { useSyncExternalStore } from 'react'
import { ROOM_TYPES, parseDesign, serializeDesign } from './designOptions'

const KEY = 'phs-project-v1'
const listeners = new Set()
let cache = null

function read() {
  try {
    const raw = window.localStorage.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list.filter(r => r && r.id && typeof r.params === 'string') : []
  } catch {
    return []
  }
}

function write(list) {
  cache = list
  try { window.localStorage.setItem(KEY, JSON.stringify(list)) } catch { /* storage blocked: keep in memory */ }
  listeners.forEach(l => l())
}

function snapshot() {
  if (cache === null) cache = read()
  return cache
}

function subscribe(listener) {
  listeners.add(listener)
  const onStorage = (e) => { if (e.key === KEY) { cache = read(); listener() } }
  window.addEventListener('storage', onStorage)
  return () => { listeners.delete(listener); window.removeEventListener('storage', onStorage) }
}

const newId = () => Math.random().toString(36).slice(2, 10)

// "Bathroom", then "Bathroom 2", "Bathroom 3"…
function defaultName(list, type) {
  const label = ROOM_TYPES[type].label
  const taken = new Set(list.map(r => r.name))
  if (!taken.has(label)) return label
  let n = 2
  while (taken.has(`${label} ${n}`)) n++
  return `${label} ${n}`
}

export function useProject() {
  const rooms = useSyncExternalStore(subscribe, snapshot, () => [])
  return rooms
}

export function roomDesign(room) {
  return parseDesign(new URLSearchParams(room.params))
}

export function addRoom(design, name) {
  const list = snapshot()
  const room = { id: newId(), name: name || defaultName(list, design.type), params: serializeDesign(design).toString() }
  write([...list, room])
  return room
}

export function updateRoom(id, patch) {
  write(snapshot().map(r => {
    if (r.id !== id) return r
    const next = { ...r }
    if (patch.design) next.params = serializeDesign(patch.design).toString()
    if (typeof patch.name === 'string') next.name = patch.name.slice(0, 40)
    return next
  }))
}

export function duplicateRoom(id) {
  const list = snapshot()
  const i = list.findIndex(r => r.id === id)
  if (i < 0) return
  const copy = { ...list[i], id: newId(), name: defaultName(list, roomDesign(list[i]).type) }
  write([...list.slice(0, i + 1), copy, ...list.slice(i + 1)])
}

export function removeRoom(id) {
  write(snapshot().filter(r => r.id !== id))
}

// Share links carry the whole project as compact base64url JSON.
export function encodeProject(rooms) {
  const bytes = new TextEncoder().encode(JSON.stringify(rooms.map(r => [r.name, r.params])))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeProject(code) {
  try {
    const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
    const list = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))))
    if (!Array.isArray(list)) return []
    return list
      .filter(x => Array.isArray(x) && typeof x[0] === 'string' && typeof x[1] === 'string')
      .slice(0, 30)
      .map(([name, params]) => ({ id: newId(), name: name.slice(0, 40), params: serializeDesign(parseDesign(new URLSearchParams(params))).toString() }))
  } catch {
    return []
  }
}

export function importRooms(rooms) {
  const list = snapshot()
  write([...list, ...rooms.map(r => ({ ...r, id: newId() }))])
}

// Put a removed room back where it was (undo).
export function restoreRoom(room, index) {
  const list = snapshot()
  const { id, name, params } = room
  write([...list.slice(0, index), { id, name, params }, ...list.slice(index)])
}
