import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser, initialized } = useAuth()

  // Sessiya localStorage'dan hali tekshirilayotgan bo'lsa (masalan, sahifa
  // endigina yangilangan bo'lsa), hech narsaga qaror qilmaymiz — aks holda
  // foydalanuvchi bir lahzaga login sahifasiga otkazib yuboriladi.
  if (!initialized) return null

  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.profileComplete === false) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}
