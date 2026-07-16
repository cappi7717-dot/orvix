import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Post } from '../types'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useLanguage } from '../lib/i18n'
import Avatar from './Avatar'
import AutoVideo from './AutoVideo'
import ReportModal from './ReportModal'

function useTimeAgo() {
  const { t } = useLanguage()
  return (ts: number): string => {
    const diff = Date.now() - ts
    const mins = Math.floor(diff / 60_000)
    if (mins < 1) return t('time.now')
    if (mins < 60) return `${mins} ${t('time.minAgo')}`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} ${t('time.hourAgo')}`
    return `${Math.floor(hours / 24)} ${t('time.dayAgo')}`
  }
}

export default function PostCard({ post }: { post: Post }) {
  const { currentUser, getUserById } = useAuth()
  const { toggleLike, toggleRepost, deletePost, submitReport } = useData()
  const { t } = useLanguage()
  const timeAgo = useTimeAgo()

  const [showMenu, setShowMenu] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const liked = currentUser ? (post.likedBy ?? []).includes(currentUser.id) : false
  const reposted = currentUser ? (post.repostedBy ?? []).includes(currentUser.id) : false
  const isOwner = currentUser?.id === post.authorId
  const author = getUserById(post.authorId)

  function handleLike() {
    if (!currentUser) return
    toggleLike(post.id, currentUser)
  }

  function handleRepost() {
    if (!currentUser) return
    toggleRepost(post.id, currentUser)
  }

  function handleDelete() {
    if (!currentUser) return
    if (confirm(t('post.deleteConfirm'))) {
      deletePost(post.id, currentUser.id)
    }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/post/${post.id}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // clipboard mavjud bo'lmasa ham indikatorni ko'rsatamiz
    }
    setShowMenu(false)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 1500)
  }

  function handleReportSubmit(reason: string) {
    if (!currentUser) return
    submitReport({
      reporter: currentUser,
      targetType: 'post',
      targetUserId: post.authorId,
      targetUsername: post.authorUsername,
      postId: post.id,
      postContent: post.content,
      reason,
    })
  }

  return (
    <article className="post-card">
      <div className="post-head">
        <Link to={`/profile/${post.authorId}`}>
          <Avatar username={post.authorUsername} size={38} avatarUrl={author?.avatarUrl} />
        </Link>
        <div>
          <Link to={`/profile/${post.authorId}`} className="post-author">
            {post.authorUsername}
          </Link>
          <div className="post-sub">{timeAgo(post.createdAt)}</div>
        </div>

        <div className="post-head-actions">
          {linkCopied && <span className="link-copied-toast">{t('post.linkCopied')}</span>}
          {isOwner && (
            <button className="btn-delete" onClick={handleDelete} title={t('post.delete')}>
              ✕
            </button>
          )}
          {currentUser && (
            <div className="post-menu-wrap">
              <button
                type="button"
                className="btn-post-menu"
                onClick={() => setShowMenu((v) => !v)}
                title={t('post.more')}
              >
                ⋯
              </button>
              {showMenu && (
                <>
                  <div className="post-menu-backdrop" onClick={() => setShowMenu(false)} />
                  <div className="post-menu-dropdown">
                    <button type="button" onClick={handleCopyLink}>
                      🔗 {t('post.copyLink')}
                    </button>
                    {!isOwner && (
                      <button
                        type="button"
                        className="post-menu-danger"
                        onClick={() => {
                          setShowMenu(false)
                          setShowReport(true)
                        }}
                      >
                        🚩 {t('post.report')}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {post.content && (
        <p className="post-content">
          <Link to={`/post/${post.id}`}>{post.content}</Link>
        </p>
      )}

      {post.media && post.media.length > 0 && (
        <Link to={`/post/${post.id}`} className={`post-media-grid count-${post.media.length}`}>
          {post.media.map((item, idx) =>
            item.type === 'image' ? (
              <img key={idx} src={item.url} alt="" />
            ) : (
              <AutoVideo key={idx} src={item.url} />
            )
          )}
        </Link>
      )}

      <div className="post-actions">
        <button className={`btn-like ${liked ? 'liked' : ''}`} onClick={handleLike}>
          {liked ? '♥' : '♡'} {(post.likedBy ?? []).length}
        </button>
        <Link className="btn-comment" to={`/post/${post.id}`}>
          💬 {(post.comments ?? []).length}
        </Link>
        <button
          className={`btn-repost ${reposted ? 'reposted' : ''}`}
          onClick={handleRepost}
          title={reposted ? t('post.unrepost') : t('post.repost')}
        >
          🔁 {(post.repostedBy ?? []).length}
        </button>
      </div>

      {showReport && (
        <ReportModal onClose={() => setShowReport(false)} onSubmit={handleReportSubmit} />
      )}
    </article>
  )
}
