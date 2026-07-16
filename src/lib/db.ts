// localStorage o'rniga IndexedDB ishlatamiz — uning hajmi ancha katta
// (odatda diskning katta qismi), shuning uchun video/rasmli postlar
// "joy tugadi" xatosiga tez uchramaydi.

const DB_NAME = 'orvix-db'
const STORE_NAME = 'kv'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('Bu brauzer IndexedDB ni qollamaydi'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB ochilmadi'))
  })
}

export async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(key)
    req.onsuccess = () => resolve(req.result as T | undefined)
    req.onerror = () => reject(req.error ?? new Error('Oqishda xatolik'))
  })
}

export async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Yozishda xatolik'))
    tx.onabort = () => reject(tx.error ?? new Error('Yozish bekor qilindi (joy yetmadi)'))
  })
}

// Eski versiyada localStorage'da qolgan postlarni bir martalik ko'chirish uchun
export function readLegacyLocalStorage<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}
