import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../lib/i18n'
import type { TranslationKey } from '../lib/i18n'
import Avatar from '../components/Avatar'

export default function Onboarding() {
  const { currentUser, completeProfile } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [name, setName] = useState(currentUser?.username ?? '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    const result = completeProfile(name)
    setSubmitting(false)
    if (!result.ok) {
      setError(t((result.error as TranslationKey) ?? 'auth.error.generic'))
      return
    }
    navigate('/', { replace: true })
  }

  if (!currentUser) return null

  return (
    <div className="auth-screen">
      <form className="auth-card onboarding-card" onSubmit={handleSubmit}>
        <div className="onboarding-avatar">
          <Avatar username={currentUser.username} size={72} avatarUrl={currentUser.avatarUrl} />
        </div>

        <h1>{t('onboarding.title')}</h1>
        <p className="auth-sub">{t('onboarding.sub')}</p>

        {error && <div className="auth-error">{error}</div>}

        <label>
          {t('onboarding.nameLabel')}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('onboarding.placeholder')}
            autoFocus
            maxLength={24}
          />
        </label>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {t('onboarding.submit')}
        </button>
      </form>
    </div>
  )
}
