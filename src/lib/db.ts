import { db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const COLLECTION = 'orvix-data'

export async function idbGet<T>(key: string): Promise<T | undefined> {
  const snap = await getDoc(doc(db, COLLECTION, key))
  if (!snap.exists()) return undefined
  return snap.data().value as T
}

export async function idbSet(key: string, value: unknown): Promise<void> {
  await setDoc(doc(db, COLLECTION, key), { value })
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
