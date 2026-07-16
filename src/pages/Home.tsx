import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useLanguage } from '../lib/i18n'
import PostCard from '../components/PostCard'
import MediaPicker from '../components/MediaPicker'
import type { MediaItem } from '../types'

const MAX_LEN = 280

export default function Home() {
  const { currentUser } = useAuth()
  const { posts, createPost } = useData()
  const { t } = useLanguage()
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
      setContent('')
      setMedia([])
    } else {
      setError(result.error ?? 'Postni joylashda xatolik yuz berdi.')
    }
  }

  return (
    <div className="home">
      {currentUser && (
        <form className="quick-post" onSubmit={handleSubmit}>
          <textarea
            value={content}
            maxLength={MAX_LEN}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('home.placeholder')}
            rows={3}
          />
          <MediaPicker media={media} onChange={setMedia} />
          {error && <div className="form-error">{error}</div>}
          <div className="quick-post-row">
            <span className="char-count">{content.length}/{MAX_LEN}</span>
            <button
              type="submit"
              className="btn-primary-sm"
              disabled={submitting || (!content.trim() && media.length === 0)}
            >
              {submitting ? t('home.posting') : t('home.post')}
            </button>
          </div>
        </form>
      )}

      {posts.length === 0 ? (
        <div className="empty-state">
          <p>{t('home.empty')}</p>
          <Link to="/create" className="btn-primary-sm">
            {t('home.firstPost')}
          </Link>
        </div>
      ) : (
        <div className="feed">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
