import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import Avatar from './Avatar'

type Mode = 'menu' | 'delete' | 'block' | 'create' | 'reports'

interface AdminPanelModalProps {
  onClose: () => void
}

export default function AdminPanelModal({ onClose }: AdminPanelModalProps) {
  const { allUsers, setUserBlocked } = useAuth()
  const { posts, deletePost, createPost, reports, markReportsRead } = useData()

  const [mode, setMode] = useState<Mode>('menu')
  const [query, setQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [postContent, setPostContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')
  const [postedOk, setPostedOk] = useState(false)

  const results = query.trim()
    ? allUsers.filter((u) => u.username.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 20)
    : []

  const selectedUser = selectedUserId ? allUsers.find((u) => u.id === selectedUserId) ?? null : null
  const selectedUserPosts = selectedUser
    ? posts.filter((p) => p.authorId === selectedUser.id)
    : []
  const blockedUsers = allUsers.filter((u) => u.blocked)

  function resetSelection() {
    setQuery('')
    setSelectedUserId(null)
    setPostContent('')
    setPostError('')
    setPostedOk(false)
  }

  function goMenu() {
    setMode('menu')
    resetSelection()
  }

  function goReports() {
    setMode('reports')
    markReportsRead()
  }

  function handleClose() {
    resetSelection()
    setMode('menu')
    onClose()
  }

  async function handleDeletePost(postId: string) {
    if (!selectedUser) return
    const confirmed = window.confirm(
      "Bu postni o'chirishni tasdiqlaysizmi? Undagi barcha layk va kommentariyalar ham birga o'chadi."
    )
    if (!confirmed) return
    await deletePost(postId, selectedUser.id)
  }

  async function handleDeleteReportedPost(postId: string, authorId: string) {
    const confirmed = window.confirm(
      "Bu postni o'chirishni tasdiqlaysizmi? Undagi barcha layk va kommentariyalar ham birga o'chadi."
    )
    if (!confirmed) return
    await deletePost(postId, authorId)
  }

  function toggleBlockFor(userId: string, currentlyBlocked: boolean) {
    setUserBlocked(userId, !currentlyBlocked)
  }

  function handleToggleBlock() {
    if (!selectedUser) return
    toggleBlockFor(selectedUser.id, !!selectedUser.blocked)
  }

  async function handleCreatePost() {
    if (!selectedUser) return
    const trimmed = postContent.trim()
    if (!trimmed) {
      setPostError("Post matni bo'sh bo'lmasin")
      return
    }
    setPosting(true)
    setPostError('')
    setPostedOk(false)
    const result = await createPost(selectedUser, trimmed)
    setPosting(false)
    if (!result.ok) {
      setPostError(result.error ?? 'Xatolik yuz berdi')
      return
    }
    setPostContent('')
    setPostedOk(true)
  }

  const title =
    mode === 'menu'
      ? 'Admin panel'
      : mode === 'delete'
        ? "Post o'chirish"
        : mode === 'block'
          ? 'Foydalanuvchini bloklash'
          : mode === 'reports'
            ? 'Shikoyatlar'
            : "Post qo'yish"

  return createPortal(
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="modal-close-btn" onClick={handleClose} title="Yopish">
            ✕
          </button>
        </div>

        {mode === 'menu' && (
          <div className="admin-menu">
            <button type="button" className="admin-menu-btn" onClick={() => setMode('delete')}>
              <span>Post o'chirish</span>
              <span className="admin-menu-btn-arrow">›</span>
            </button>
            <button type="button" className="admin-menu-btn" onClick={() => setMode('block')}>
              <span>Foydalanuvchini bloklash</span>
              <span className="admin-menu-btn-arrow">›</span>
            </button>
            <button type="button" className="admin-menu-btn" onClick={() => setMode('create')}>
              <span>Post qo'yish</span>
              <span className="admin-menu-btn-arrow">›</span>
            </button>
            <button type="button" className="admin-menu-btn" onClick={goReports}>
              <span>
                Shikoyatlar
                {reports.some((r) => !r.read) && <span className="admin-menu-badge">{reports.filter((r) => !r.read).length}</span>}
              </span>
              <span className="admin-menu-btn-arrow">›</span>
            </button>
          </div>
        )}

        {mode !== 'menu' && (
          <div className="admin-body">
            <button type="button" className="btn-back" onClick={goMenu}>
              ← Orqaga
            </button>

            {mode === 'reports' && (
              <div className="admin-reports-list">
                {reports.length === 0 && <p className="muted">Hozircha shikoyatlar yo'q</p>}
                {reports.map((r) => {
                  const targetUser = allUsers.find((u) => u.id === r.targetUserId)
                  const reporterUser = allUsers.find((u) => u.id === r.reporterId)
                  const reportedPost = r.postId ? posts.find((p) => p.id === r.postId) : undefined
                  return (
                    <div key={r.id} className={`admin-report-card ${r.read ? '' : 'unread'}`}>
                      <div className="admin-report-row">
                        <Avatar username={r.reporterUsername} size={30} avatarUrl={reporterUser?.avatarUrl} />
                        <span>
                          <strong>{r.reporterUsername}</strong> shikoyat qildi
                          {r.targetType === 'post' ? ' (post)' : ' (profil)'}
                        </span>
                      </div>
                      <p className="admin-report-reason">"{r.reason}"</p>
                      <div className="admin-report-target">
                        <Avatar username={r.targetUsername} size={30} avatarUrl={targetUser?.avatarUrl} />
                        <div>
                          <strong>{r.targetUsername}</strong>
                          {targetUser?.blocked && <span className="admin-blocked-tag">bloklangan</span>}
                          {r.postId && (
                            <p className="admin-post-preview">{r.postContent || '(media post)'}</p>
                          )}
                          {r.postId && !reportedPost && (
                            <p className="muted admin-report-post-gone">Bu post allaqachon o'chirilgan</p>
                          )}
                        </div>
                      </div>
                      <div className="admin-report-actions">
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => {
                            setMode('block')
                            setSelectedUserId(r.targetUserId)
                          }}
                        >
                          Profilga o'tish
                        </button>
                        {reportedPost && (
                          <button
                            type="button"
                            className="btn-delete-sm"
                            onClick={() => handleDeleteReportedPost(reportedPost.id, r.targetUserId)}
                          >
                            Postni o'chirish
                          </button>
                        )}
                        {targetUser && (
                          <button
                            type="button"
                            className={targetUser.blocked ? 'btn-primary-sm' : 'btn-block-sm'}
                            onClick={() => toggleBlockFor(targetUser.id, !!targetUser.blocked)}
                          >
                            {targetUser.blocked ? 'Blokdan chiqarish' : 'Bloklash'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {mode !== 'reports' && !selectedUser && (
              <>
                {mode === 'block' && blockedUsers.length > 0 && (
                  <div className="admin-blocked-section">
                    <p className="section-heading admin-blocked-heading">Bloklangan foydalanuvchilar</p>
                    <div className="user-list">
                      {blockedUsers.map((u) => (
                        <div key={u.id} className="admin-post-row">
                          <button
                            type="button"
                            className="user-list-item admin-user-item admin-user-item-inline"
                            onClick={() => setSelectedUserId(u.id)}
                          >
                            <Avatar username={u.username} size={36} avatarUrl={u.avatarUrl} />
                            <span>{u.username}</span>
                          </button>
                          <button
                            type="button"
                            className="btn-primary-sm"
                            onClick={() => toggleBlockFor(u.id, true)}
                          >
                            Blokdan chiqarish
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="search-input-wrap">
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Foydalanuvchi nikini yozing..."
                  />
                </div>
                <div className="user-list">
                  {query.trim() && results.length === 0 && <p className="muted">Hech kim topilmadi</p>}
                  {results.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      className="user-list-item admin-user-item"
                      onClick={() => setSelectedUserId(u.id)}
                    >
                      <Avatar username={u.username} size={40} avatarUrl={u.avatarUrl} />
                      <span>{u.username}</span>
                      {u.blocked && <span className="admin-blocked-tag">bloklangan</span>}
                    </button>
                  ))}
                </div>
              </>
            )}

            {mode !== 'reports' && selectedUser && (
              <div className="admin-selected">
                <div className="admin-selected-user">
                  <Avatar username={selectedUser.username} size={44} avatarUrl={selectedUser.avatarUrl} />
                  <div className="admin-selected-user-info">
                    <strong>{selectedUser.username}</strong>
                    {selectedUser.blocked && <span className="admin-blocked-tag">bloklangan</span>}
                  </div>
                  <button type="button" className="btn-ghost" onClick={() => setSelectedUserId(null)}>
                    Boshqa odam
                  </button>
                </div>

                {mode === 'delete' && (
                  <div className="admin-post-list">
                    {selectedUserPosts.length === 0 && (
                      <p className="muted">Bu foydalanuvchining postlari yo'q</p>
                    )}
                    {selectedUserPosts.map((p) => (
                      <div key={p.id} className="admin-post-row">
                        <span className="admin-post-preview">{p.content || '(media post)'}</span>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => handleDeletePost(p.id)}
                          title="Postni o'chirish (layk va kommentariyalar bilan birga)"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {mode === 'block' && (
                  <div className="admin-block-action">
                    <p className="muted">
                      {selectedUser.blocked
                        ? "Bu foydalanuvchi hozir bloklangan va saytga kira olmaydi."
                        : 'Bloklansa, bu foydalanuvchi saytga kira olmay qoladi.'}
                    </p>
                    <button
                      type="button"
                      className={selectedUser.blocked ? 'btn-primary-sm' : 'btn-block-sm'}
                      onClick={handleToggleBlock}
                    >
                      {selectedUser.blocked ? 'Blokdan chiqarish' : 'Bloklash'}
                    </button>
                  </div>
                )}

                {mode === 'create' && (
                  <div className="admin-create-post">
                    <textarea
                      value={postContent}
                      onChange={(e) => {
                        setPostContent(e.target.value)
                        setPostedOk(false)
                      }}
                      placeholder={`${selectedUser.username} nomidan post matni...`}
                      rows={4}
                    />
                    {postError && <p className="form-error">{postError}</p>}
                    {postedOk && <p className="admin-success-msg">Post muvaffaqiyatli joylandi ✓</p>}
                    <button
                      type="button"
                      className="btn-primary-sm"
                      onClick={handleCreatePost}
                      disabled={posting}
                    >
                      {posting ? 'Joylanmoqda...' : 'Post joylash'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
