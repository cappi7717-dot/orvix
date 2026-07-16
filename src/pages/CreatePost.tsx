import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useLanguage } from '../lib/i18n'
import MediaPicker from '../components/MediaPicker'
import type { MediaItem } from '../types'

const MAX_LEN = 280

export default function CreatePost() {
  const { currentUser } = useAuth()
  const { createPost } = useData()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<MediaItem[]>([])

  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!currentUser || (!content.trim() && media.length === 0)) return
    setError(null)
    setSubmitting(true)
    const result = await createPost(currentUser, content, media)
    setSubmitting(false)
    if (result.ok) {
      navigate('/')
    } else {
      setError(result.error ?? 'Postni joylashda xatolik yuz berdi.')
    }
  }

  return (
    <div className="create-screen">
      <form className="create-card" onSubmit={handleSubmit}>
        <h1>{t('create.title')}</h1>

        <textarea
          value={content}
          maxLength={MAX_LEN}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('create.placeholder')}
          rows={5}
          autoFocus
        />
        <div className="char-count">
          {content.length}/{MAX_LEN}
        </div>

        <MediaPicker media={media} onChange={setMedia} />

        {error && <div className="form-error">{error}</div>}

        <button
          type="submit"
          className="btn-primary"
          disabled={submitting || (!content.trim() && media.length === 0)}
        >
          {submitting ? t('create.posting') : t('create.post')}
        </button>
      </form>
    </div>
  )
}
