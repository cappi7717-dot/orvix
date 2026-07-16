import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../lib/i18n'
import Avatar from '../components/Avatar'
import PostCard from '../components/PostCard'
import ReportModal from '../components/ReportModal'
import { BANNER_PRESETS, bannerForUser } from '../lib/banners'
import { filesToMedia } from '../lib/media'

export default function Profile() {
  const { userId } = useParams()
  const { posts, submitReport } = useData()
  const {
    currentUser,
    getUserById,
    updateProfile,
    toggleFollow,
    isFollowing,
    getFollowers,
    getFollowing,
    toggleBlockUser,
    hasBlocked,
    isBlockedBy,
  } = useAuth()
  const { t } = useLanguage()
  const fileRef = useRef<HTMLInputElement>(null)
  const bannerFileRef = useRef<HTMLInputElement>(null)
  const [showBannerPicker, setShowBannerPicker] = useState(false)
  const [userListModal, setUserListModal] = useState<'followers' | 'following' | null>(null)
  const [activeTab, setActiveTab] = useState<'posts' | 'reposts'>('posts')
  const [showMenu, setShowMenu] = useState(false)
  const [showReport, setShowReport] = useState(false)

  if (!userId) return null

  const isOwnProfile = currentUser?.id === userId
  const profileUser = getUserById(userId)
  const blockedByOwner = !isOwnProfile && isBlockedBy(userId)
  const iBlockedThem = !isOwnProfile && hasBlocked(userId)

  const userPosts = posts.filter((p) => p.authorId === userId)
  const repostedPosts = posts.filter((p) => (p.repostedBy ?? []).includes(userId))
  const username = profileUser?.username ?? userPosts[0]?.authorUsername ?? 'Foydalanuvchi'
  const totalLikes = userPosts.reduce((sum, p) => sum + (p.likedBy ?? []).length, 0)
  const banner = bannerForUser(profileUser?.banner, username)
  const followers = getFollowers(userId)
  const following = getFollowing(userId)
  const currentlyFollowing = isFollowing(userId)

  async function handleAvatarPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !currentUser) return
    if (!file.type.startsWith('image/')) {
      alert('Faqat rasm fayli tanlang')
      return
    }
    const { items, errors } = await filesToMedia([file])
    if (errors.length > 0) {
      alert(errors.join('\n'))
      return
    }
    if (items[0]) {
      updateProfile(currentUser.id, { avatarUrl: items[0].url })
    }
  }

  function handlePickBanner(id: string) {
    if (!currentUser) return
    updateProfile(currentUser.id, { banner: id })
    setShowBannerPicker(false)
  }

  async function handleBannerImagePick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !currentUser) return
    if (!file.type.startsWith('image/')) {
      alert('Faqat rasm fayli tanlang')
      return
    }
    const { items, errors } = await filesToMedia([file])
    if (errors.length > 0) {
      alert(errors.join('\n'))
      return
    }
    if (items[0]) {
      updateProfile(currentUser.id, { banner: items[0].url })
      setShowBannerPicker(false)
    }
  }

  function handleFollowClick() {
    if (!userId) return
    toggleFollow(userId)
  }

  function handleToggleBlock() {
    if (!userId) return
    if (!iBlockedThem && !confirm(t('profile.blockConfirm'))) return
    toggleBlockUser(userId)
    setShowMenu(false)
  }

  function handleReportSubmit(reason: string) {
    if (!currentUser || !userId) return
    submitReport({
      reporter: currentUser,
      targetType: 'user',
      targetUserId: userId,
      targetUsername: username,
      reason,
    })
  }

  if (blockedByOwner) {
    return (
      <div className="profile-screen">
        <div className="blocked-screen">
          <div className="blocked-icon">🚫</div>
          <h2>{t('profile.blockedTitle')}</h2>
          <p className="muted">{t('profile.blockedMessage')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-screen">
      <div className="profile-banner" style={{ background: banner.gradient }}>
        {isOwnProfile && (
          <button
            type="button"
            className="btn-ghost banner-edit-btn"
            onClick={() => setShowBannerPicker((v) => !v)}
          >
            🎨 {t('profile.changeBanner')}
          </button>
        )}
        {showBannerPicker && (
          <div className="banner-picker">
            {BANNER_PRESETS.map((b) => (
              <button
                key={b.id}
                type="button"
                className="banner-swatch"
                style={{ background: b.gradient }}
                title={b.label}
                onClick={() => handlePickBanner(b.id)}
              />
            ))}
            <button
              type="button"
              className="banner-swatch banner-swatch-upload"
              title={t('profile.changeBanner')}
              onClick={() => bannerFileRef.current?.click()}
            >
              📷
            </button>
            <input
              ref={bannerFileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleBannerImagePick}
            />
          </div>
        )}
      </div>

      <div className="profile-head">
        <div className="profile-avatar-wrap">
          <Avatar username={username} size={72} avatarUrl={profileUser?.avatarUrl} />
          {isOwnProfile && (
            <button
              type="button"
              className="avatar-edit-btn"
              onClick={() => fileRef.current?.click()}
              title={t('profile.changeAvatar')}
            >
              📷
            </button>
          )}
          {isOwnProfile && (
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarPick}
            />
          )}
        </div>
        <div className="profile-head-info">
          <div className="profile-head-row">
            <h1>{username}</h1>
            {!isOwnProfile && currentUser && (
              <div className="profile-head-actions">
                <button
                  type="button"
                  className={currentlyFollowing ? 'btn-ghost follow-btn following' : 'btn-primary-sm follow-btn'}
                  onClick={handleFollowClick}
                >
                  {currentlyFollowing ? t('profile.unfollow') : t('profile.follow')}
                </button>
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
                        <button type="button" className="post-menu-danger" onClick={handleToggleBlock}>
                          🚫 {iBlockedThem ? t('profile.unblock') : t('profile.block')}
                        </button>
                        <button
                          type="button"
                          className="post-menu-danger"
                          onClick={() => {
                            setShowMenu(false)
                            setShowReport(true)
                          }}
                        >
                          🚩 {t('profile.report')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <p className="aura-score">
            {userPosts.length} post • {totalLikes} like
          </p>
          <p className="follow-counts">
            <button
              type="button"
              className="follow-count-btn"
              onClick={() => setUserListModal('followers')}
              disabled={followers.length === 0}
            >
              <strong>{followers.length}</strong> {t('profile.followers')}
            </button>
            <button
              type="button"
              className="follow-count-btn"
              onClick={() => setUserListModal('following')}
              disabled={following.length === 0}
            >
              <strong>{following.length}</strong> {t('profile.following')}
            </button>
          </p>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          type="button"
          className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          {t('profile.posts')}
        </button>
        <button
          type="button"
          className={`profile-tab ${activeTab === 'reposts' ? 'active' : ''}`}
          onClick={() => setActiveTab('reposts')}
        >
          {t('profile.reposts')}
        </button>
      </div>

      <section>
        {activeTab === 'posts' ? (
          userPosts.length === 0 ? (
            <p className="muted">{t('profile.noPosts')}</p>
          ) : (
            <div className="feed">
              {userPosts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )
        ) : repostedPosts.length === 0 ? (
          <p className="muted">{t('profile.noReposts')}</p>
        ) : (
          <div className="feed">
            {repostedPosts.map((p) => (
              <div key={p.id}>
                <p className="repost-label">🔁 {username} {t('post.repostedBy')}</p>
                <PostCard post={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {userListModal && (
        <div className="modal-overlay" onClick={() => setUserListModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{userListModal === 'followers' ? t('profile.followers') : t('profile.following')}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setUserListModal(null)} title={t('profile.close')}>
                ✕
              </button>
            </div>
            <div className="user-list">
              {(userListModal === 'followers' ? followers : following).length === 0 ? (
                <p className="muted">
                  {userListModal === 'followers' ? t('profile.noFollowers') : t('profile.noFollowing')}
                </p>
              ) : (
                (userListModal === 'followers' ? followers : following).map((u) => (
                  <Link
                    key={u.id}
                    to={`/profile/${u.id}`}
                    className="user-list-item"
                    onClick={() => setUserListModal(null)}
                  >
                    <Avatar username={u.username} size={40} avatarUrl={u.avatarUrl} />
                    <span>{u.username}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showReport && (
        <ReportModal onClose={() => setShowReport(false)} onSubmit={handleReportSubmit} />
      )}
    </div>
  )
}
