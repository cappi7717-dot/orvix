export interface BannerPreset {
  id: string
  label: string
  gradient: string
}

export const BANNER_PRESETS: BannerPreset[] = [
  { id: 'sunset', label: 'Sunset', gradient: 'linear-gradient(120deg, #ff6b35, #f7c948, #ff4d97)' },
  { id: 'aurora', label: 'Aurora', gradient: 'linear-gradient(120deg, #5ec8d8, #7c5cff, #35e3a3)' },
  { id: 'candy', label: 'Candy', gradient: 'linear-gradient(120deg, #ff5f9e, #ff9d5c, #ffe45e)' },
  { id: 'ocean', label: 'Ocean', gradient: 'linear-gradient(120deg, #0f7ea8, #35e3a3, #5ec8d8)' },
  { id: 'grape', label: 'Grape', gradient: 'linear-gradient(120deg, #7c5cff, #c65cff, #ff5c9e)' },
  { id: 'lava', label: 'Lava', gradient: 'linear-gradient(120deg, #ff4d4d, #ff8a35, #ffce35)' },
]

const DEFAULT_PRESET = BANNER_PRESETS[0]

// Foydalanuvchi hali fon tanlamagan bo'lsa ham, login nomidan kelib chiqib
// har doim bir xil (lekin har kimga xos) rangli fon berish uchun.
export function bannerForUser(id: string | undefined, username: string): BannerPreset {
  if (id) {
    // Foydalanuvchi o'zi yuklagan rasm (data URL) fon sifatida saqlangan bo'lishi mumkin
    if (id.startsWith('data:image')) {
      return { id, label: 'Custom', gradient: `url("${id}") center / cover no-repeat` }
    }
    const found = BANNER_PRESETS.find((b) => b.id === id)
    if (found) return found
  }
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  return BANNER_PRESETS[Math.abs(hash) % BANNER_PRESETS.length] ?? DEFAULT_PRESET
}
