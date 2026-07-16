import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'
import { isAdminUsername } from '../lib/admin'

// Firebase'ning signInWithPopup natijasidan (result.user) olinadigan
// minimal maydonlar — AuthContext Firebase SDK'ga bevosita bog'lanmasligi
// uchun shu kichik interfeys orqali qabul qilinadi.
export interface GoogleProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

const USERS_KEY = 'orvix.users'
const SESSION_KEY = 'orvix.session'

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as User[]) : []
  } catch {
    return []
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

interface AuthContextValue {
  currentUser: User | null
  initialized: boolean
  allUsers: User[]
  isAdmin: boolean
  loginWithGoogle: (profile: GoogleProfile) => { ok: boolean; error?: string; needsOnboarding?: boolean }
  completeProfile: (name: string) => { ok: boolean; error?: string }
  logout: () => void
  getUserById: (userId: string) => User | undefined
  updateProfile: (userId: string, updates: Partial<Pick<User, 'avatarUrl' | 'banner'>>) => void
  toggleFollow: (targetUserId: string) => void
  isFollowing: (targetUserId: string) => boolean
  getFollowers: (userId: string) => User[]
  getFollowing: (userId: string) => User[]
  setUserBlocked: (userId: string, blocked: boolean) => void
  toggleBlockUser: (targetUserId: string) => void
  hasBlocked: (targetUserId: string) => boolean
  isBlockedBy: (otherUserId: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  // Sessiya localStorage'dan tekshirilib bo'lguncha ProtectedRoute qaror
  // qabul qilmasligi kerak — aks holda sahifani yangilaganda (refresh)
  // foydalanuvchi bir lahzalik currentUser=null holatida login sahifasiga
  // otkazib yuboriladi.
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const users = loadUsers()
    setAllUsers(users)
    const sessionId = localStorage.getItem(SESSION_KEY)
    if (sessionId) {
      const user = users.find((u) => u.id === sessionId)
      if (user && !user.blocked) {
        setCurrentUser(user)
      } else {
        // Sessiya bor, lekin foydalanuvchi topilmadi yoki bloklangan — sessiyani tozalaymiz.
        localStorage.removeItem(SESSION_KEY)
      }
    }
    setInitialized(true)
  }, [])

  // Google'dan qaytgan bir martalik username'ni mavjud loginlar bilan
  // to'qnashmaydigan qilib tayyorlaydi (masalan "asadbek", band bo'lsa "asadbek2").
  function makeUniqueUsername(base: string, users: User[]): string {
    const cleaned = base.trim().toLowerCase().replace(/[^a-z0-9._]/g, '') || 'user'
    let candidate = cleaned
    let i = 1
    while (users.some((u) => u.username.toLowerCase() === candidate)) {
      i += 1
      candidate = `${cleaned}${i}`
    }
    return candidate
  }

  function loginWithGoogle(profile: GoogleProfile) {
    if (!profile.email) return { ok: false, error: 'auth.error.googleFailed' }

    const users = loadUsers()
    const existing = users.find((u) => u.googleId === profile.uid || u.email === profile.email)

    if (existing) {
      if (existing.blocked) return { ok: false, error: 'auth.error.blocked' }
      localStorage.setItem(SESSION_KEY, existing.id)
      setAllUsers(users)
      setCurrentUser(existing)
      return { ok: true, needsOnboarding: existing.profileComplete === false }
    }

    const usernameBase = profile.email.split('@')[0] || profile.displayName || 'user'
    const user: User = {
      id: crypto.randomUUID(),
      username: makeUniqueUsername(usernameBase, users),
      googleId: profile.uid,
      email: profile.email,
      name: profile.displayName ?? usernameBase,
      avatarUrl: profile.photoURL ?? undefined,
      createdAt: Date.now(),
      following: [],
      profileComplete: false,
    }
    const updated = [...users, user]
    saveUsers(updated)
    setAllUsers(updated)
    localStorage.setItem(SESSION_KEY, user.id)
    setCurrentUser(user)
    return { ok: true, needsOnboarding: true }
  }

  // Google orqali birinchi marta kirgan foydalanuvchi shu yerda o'ziga
  // ism/login tanlaydi va profili "to'liq" deb belgilanadi.
  function completeProfile(name: string) {
    if (!currentUser) return { ok: false, error: 'auth.error.generic' }
    const trimmed = name.trim()
    if (trimmed.length < 3) return { ok: false, error: 'auth.error.usernameTooShort' }

    const users = loadUsers()
    const taken = users.some(
      (u) => u.id !== currentUser.id && u.username.toLowerCase() === trimmed.toLowerCase()
    )
    if (taken) return { ok: false, error: 'auth.error.usernameTaken' }

    const idx = users.findIndex((u) => u.id === currentUser.id)
    if (idx === -1) return { ok: false, error: 'auth.error.generic' }
    const updated = { ...users[idx], username: trimmed, profileComplete: true }
    users[idx] = updated
    saveUsers(users)
    setAllUsers(users)
    setCurrentUser(updated)
    return { ok: true }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    setCurrentUser(null)
  }

  function getUserById(userId: string) {
    return allUsers.find((u) => u.id === userId) ?? loadUsers().find((u) => u.id === userId)
  }

  function updateProfile(userId: string, updates: Partial<Pick<User, 'avatarUrl' | 'banner'>>) {
    const users = loadUsers()
    const idx = users.findIndex((u) => u.id === userId)
    if (idx === -1) return
    const updated = { ...users[idx], ...updates }
    users[idx] = updated
    saveUsers(users)
    setAllUsers(users)
    setCurrentUser((prev) => (prev && prev.id === userId ? updated : prev))
  }

  function toggleFollow(targetUserId: string) {
    if (!currentUser || currentUser.id === targetUserId) return
    const users = loadUsers()
    const idx = users.findIndex((u) => u.id === currentUser.id)
    if (idx === -1) return
    const following = users[idx].following ?? []
    const alreadyFollowing = following.includes(targetUserId)
    const nextFollowing = alreadyFollowing
      ? following.filter((id) => id !== targetUserId)
      : [...following, targetUserId]
    const updatedUser = { ...users[idx], following: nextFollowing }
    users[idx] = updatedUser
    saveUsers(users)
    setAllUsers(users)
    setCurrentUser(updatedUser)
  }

  function isFollowing(targetUserId: string) {
    if (!currentUser) return false
    return (currentUser.following ?? []).includes(targetUserId)
  }

  function getFollowers(userId: string) {
    return allUsers.filter((u) => (u.following ?? []).includes(userId))
  }

  function getFollowing(userId: string) {
    const user = allUsers.find((u) => u.id === userId)
    if (!user) return []
    const ids = new Set(user.following ?? [])
    return allUsers.filter((u) => ids.has(u.id))
  }

  // Admin panel: foydalanuvchini bloklash/blokdan chiqarish. Agar hozir shu
  // brauzerda o'sha foydalanuvchi login qilgan bo'lsa (masalan admin o'zini
  // emas, boshqa ochiq tabda o'tirgan odamni bloklasa), sessiyasi darhol
  // tugatiladi va u saytdan chiqarib yuboriladi.
  function setUserBlocked(userId: string, blocked: boolean) {
    const users = loadUsers()
    const idx = users.findIndex((u) => u.id === userId)
    if (idx === -1) return
    const updated = { ...users[idx], blocked }
    users[idx] = updated
    saveUsers(users)
    setAllUsers(users)
    setCurrentUser((prev) => {
      if (!prev || prev.id !== userId) return prev
      if (blocked) {
        localStorage.removeItem(SESSION_KEY)
        return null
      }
      return updated
    })
  }

  // Oddiy foydalanuvchi boshqa bir foydalanuvchini bloklashi (admin bloki bilan
  // aralashtirmaslik kerak — bu faqat bloklovchi profilini va postlarini
  // bloklangan odamdan yashiradi, saytga kirishiga xalaqit bermaydi).
  function toggleBlockUser(targetUserId: string) {
    if (!currentUser || currentUser.id === targetUserId) return
    const users = loadUsers()
    const idx = users.findIndex((u) => u.id === currentUser.id)
    if (idx === -1) return
    const blockedUsers = users[idx].blockedUsers ?? []
    const alreadyBlocked = blockedUsers.includes(targetUserId)
    const nextBlocked = alreadyBlocked
      ? blockedUsers.filter((id) => id !== targetUserId)
      : [...blockedUsers, targetUserId]
    const updatedUser = { ...users[idx], blockedUsers: nextBlocked }
    users[idx] = updatedUser
    saveUsers(users)
    setAllUsers(users)
    setCurrentUser(updatedUser)
  }

  function hasBlocked(targetUserId: string) {
    if (!currentUser) return false
    return (currentUser.blockedUsers ?? []).includes(targetUserId)
  }

  function isBlockedBy(otherUserId: string) {
    if (!currentUser) return false
    const other = allUsers.find((u) => u.id === otherUserId)
    return (other?.blockedUsers ?? []).includes(currentUser.id)
  }

  const isAdmin = isAdminUsername(currentUser?.username)

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        initialized,
        allUsers,
        isAdmin,
        loginWithGoogle,
        completeProfile,
        logout,
        getUserById,
        updateProfile,
        toggleFollow,
        isFollowing,
        getFollowers,
        getFollowing,
        setUserBlocked,
        toggleBlockUser,
        hasBlocked,
        isBlockedBy,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth AuthProvider ichida ishlatilishi kerak')
  return ctx
}
