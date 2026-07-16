import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../lib/i18n'
import type { TranslationKey } from '../lib/i18n'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5Z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3c-7.6 0-14.2 4.3-17.7 10.7Z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.4 0 10.3-2.1 14-5.5l-6.5-5.5C29.4 35.6 26.8 36.5 24 36.5c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.7 40.6 16.3 45 24 45Z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5C40.9 36.3 44 30.6 44 24c0-1.2-.1-2.4-.4-3.5Z"
      />
    </svg>
  )
}

export default function Login() {
  const { currentUser, loginWithGoogle } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.profileComplete === false ? '/onboarding' : '/', { replace: true })
    }
  }, [currentUser, navigate])

  async function handleGoogleLogin() {
    if (submitting) return
    setError(null)
    setSubmitting(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const { uid, email, displayName, photoURL } = result.user
      const outcome = loginWithGoogle({ uid, email, displayName, photoURL })
      if (!outcome.ok) {
        setError(t((outcome.error as TranslationKey) ?? 'auth.error.generic'))
        setSubmitting(false)
        return
      }
      navigate(outcome.needsOnboarding ? '/onboarding' : '/', { replace: true })
    } catch {
      setError(t('auth.error.googleFailed'))
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card auth-card-google">
        <div className="auth-brand" aria-hidden="true">
          Ø
        </div>
        <h1>{t('auth.loginTitle')}</h1>
        <p className="auth-sub">{t('auth.loginSub')}</p>

        {error && <div className="auth-error">{error}</div>}

        <button
          type="button"
          className="google-signin-btn"
          onClick={handleGoogleLogin}
          disabled={submitting}
        >
          <GoogleIcon />
          <span>{submitting ? t('auth.googleLoading') : t('auth.googleBtn')}</span>
        </button>
      </div>
    </div>
  )
}
