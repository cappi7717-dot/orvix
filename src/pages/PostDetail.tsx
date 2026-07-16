import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../lib/i18n'
import Avatar from '../components/Avatar'
import AutoVideo from '../components/AutoVideo'

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

export default function PostDetail() {
  const { postId } = useParams()
  const { getPost, toggleLike, addComment, toggleCommentLike, deletePost, loading } = useData()
  const { currentUser, getUserById } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const post = postId ? getPost(postId) : undefined
  const [comment, setComment] = useState('')
  const [replyTarget, setReplyTarget] = useState<{ commentId: string; username: string } | null>(null)
  const [replyText, setReplyText] = useState('')
  const timeAgo = useTimeAgo()

  if (!post) {
    if (loading) {
      return (
        <div className="empty-state">
          <p>{t('post.loading')}</p>
        </div>
      )
    }
    return (
      <div className="empty-state">
        <p>{t('post.notFound')}</p>
        <Link to="/" className="btn-primary-sm">
          {t('post.backHome')}
        </Link>
      </div>
    )
  }

  const liked = currentUser ? (post.likedBy ?? []).includes(currentUser.id) : false
  const likedBy = post.likedBy ?? []
  const comments = post.comments ?? []
  const isOwner = currentUser?.id === post.authorId
  const author = getUserById(post.authorId)

  function handleLike() {
    if (!currentUser || !post) return
    toggleLike(post.id, currentUser)
  }

  function handleComment(e: FormEvent) {
    e.preventDefault()
    if (!currentUser || !comment.trim() || !post) return
    addComment(post.id, currentUser, comment)
    setComment('')
  }

  function handleCommentLike(commentId: string) {
    if (!currentUser || !post) return
    toggleCommentLike(post.id, commentId, currentUser)
  }

  function handleReplySubmit(e: FormEvent) {
    e.preventDefault()
    if (!currentUser || !post || !replyTarget || !replyText.trim()) return
    addComment(post.id, currentUser, replyText, replyTarget.commentId)
    setReplyText('')
    setReplyTarget(null)
  }

  async function handleDelete() {
    if (!currentUser || !post) return
    if (confirm(t('post.deleteConfirm'))) {
      await deletePost(post.id, currentUser.id)
      navigate('/')
    }
  }

  function renderComment(c: (typeof comments)[number]) {
    const commentLikedBy = c.likedBy ?? []
    const commentLiked = currentUser ? commentLikedBy.includes(currentUser.id) : false
    const parent = c.parentId ? comments.find((p) => p.id === c.parentId) : undefined
    return (
      <div className="comment" key={c.id}>
        <Avatar username={c.authorUsername} size={30} avatarUrl={getUserById(c.authorId)?.avatarUrl} />
        <div>
          <div className="comment-head">
            <span className="comment-author">{c.authorUsername}</span>
            <span className="comment-time">{timeAgo(c.createdAt)}</span>
          </div>
          {parent && <span className="comment-reply-tag">@{parent.authorUsername}</span>}
          <p className="comment-content">{c.content}</p>
          <div className="comment-actions">
            <button
              type="button"
              className={`btn-comment-like ${commentLiked ? 'liked' : ''}`}
              onClick={() => handleCommentLike(c.id)}
              disabled={!currentUser}
            >
              {commentLiked ? '♥' : '♡'} {commentLikedBy.length}
            </button>
            {currentUser && (
              <button
                type="button"
                className="btn-comment-reply"
                onClick={() => {
                  setReplyTarget({ commentId: c.id, username: c.authorUsername })
                  setReplyText('')
                }}
              >
                {t('post.reply')}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="detail-screen">
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← {t('post.back')}
      </button>

      <article className="detail-card">
        <div className="post-head">
          <Avatar username={post.authorUsername} size={44} avatarUrl={author?.avatarUrl} />
          <div>
            <div className="post-author">{post.authorUsername}</div>
            <div className="post-sub">{timeAgo(post.createdAt)}</div>
          </div>
          {isOwner && (
            <button className="btn-delete" onClick={handleDelete} title={t('post.delete')}>
              ✕
            </button>
          )}
        </div>

        {post.content && <p className="post-content large">{post.content}</p>}

        {post.media && post.media.length > 0 && (
          <div className={`post-media-grid count-${post.media.length}`}>
            {post.media.map((item, idx) =>
              item.type === 'image' ? (
                <img key={idx} src={item.url} alt="" />
              ) : (
                <AutoVideo key={idx} src={item.url} />
              )
            )}
          </div>
        )}

        <div className="post-actions">
          <button className={`btn-like ${liked ? 'liked' : ''}`} onClick={handleLike}>
            {liked ? '♥' : '♡'} {likedBy.length}
          </button>
          <span className="btn-comment">💬 {comments.length}</span>
        </div>

        <h2 className="trail-heading">{t('post.comments')} ({comments.length})</h2>

        {currentUser && (
          <form className="comment-form" onSubmit={handleComment}>
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('post.commentPlaceholder')}
              maxLength={280}
            />
            <button type="submit" className="btn-primary-sm" disabled={!comment.trim()}>
              {t('post.send')}
            </button>
          </form>
        )}

        <div className="comments">
          {comments.length === 0 ? (
            <p className="muted">{t('post.noComments')}</p>
          ) : (
            comments
              .filter((c) => !c.parentId)
              .map((top) => {
                const replies = comments.filter((c) => rootIdOf(c, comments) === top.id && c.id !== top.id)
                return (
                  <div className="comment-thread" key={top.id}>
                    {renderComment(top)}
                    <div className="comment-replies">
                      {replies.map((r) => renderComment(r))}
                    </div>
                  </div>
                )
              })
          )}
        </div>

        {replyTarget && (
          <form className="comment-form reply-form" onSubmit={handleReplySubmit}>
            <input
              autoFocus
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`${t('post.replyTo')} @${replyTarget.username}...`}
              maxLength={280}
            />
            <button type="submit" className="btn-primary-sm" disabled={!replyText.trim()}>
              {t('post.send')}
            </button>
            <button type="button" className="btn-ghost" onClick={() => { setReplyTarget(null); setReplyText('') }}>
              {t('profile.close')}
            </button>
          </form>
        )}
      </article>
    </div>
  )
}

function rootIdOf(comment: { id: string; parentId?: string }, all: { id: string; parentId?: string }[]): string {
  let current = comment
  const seen = new Set<string>()
  while (current.parentId && !seen.has(current.id)) {
    seen.add(current.id)
    const parent = all.find((c) => c.id === current.parentId)
    if (!parent) break
    current = parent
  }
  return current.id
}
