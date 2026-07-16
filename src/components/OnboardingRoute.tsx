import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// /onboarding sahifasini faqat hali ismini tanlamagan, yangi Google
// foydalanuvchisi ko'ra oladi. Boshqa hamma holatda mos joyga yo'naltiradi.
export default function OnboardingRoute({ children }: { children: ReactNode }) {
  const { currentUser, initialized } = useAuth()

  if (!initialized) return null
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.profileComplete !== false) return <Navigate to="/" replace />
  return <>{children}</>
}
