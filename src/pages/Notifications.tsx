import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../lib/i18n'
import Avatar from '../components/Avatar'
import type { AppNotification } from '../types'

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

function notifText(
  n: AppNotification,
  t: (key: 'notif.likedPost' | 'notif.likedComment' | 'notif.commented' | 'notif.replied' | 'notif.reposted') => string
) {
  if (n.type === 'like_post') return t('notif.likedPost')
  if (n.type === 'like_comment') return t('notif.likedComment')
  if (n.type === 'reply') return t('notif.replied')
  if (n.type === 'repost') return t('notif.reposted')
  return t('notif.commented')
}

export default function Notifications() {
  const { notifications, markNotificationsRead } = useData()
  const { currentUser, getUserById } = useAuth()
  const { t } = useLanguage()
  const timeAgo = useTimeAgo()

  const myNotifications = currentUser
    ? notifications.filter((n) => n.toUserId === currentUser.id)
    : []

  useEffect(() => {
    if (currentUser) markNotificationsRead(currentUser.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id])

  return (
    <div className="notifications-screen">
      <h1 className="section-heading" style={{ margin: '0 0 14px' }}>
        {t('notif.title')}
      </h1>

      {myNotifications.length === 0 ? (
        <p className="muted">{t('notif.empty')}</p>
      ) : (
        <div className="notif-list">
          {myNotifications.map((n) => {
            const fromUser = getUserById(n.fromUserId)
            return (
              <Link key={n.id} to={`/post/${n.postId}`} className={`notif-item ${n.read ? '' : 'unread'}`}>
                <Avatar username={n.fromUsername} size={38} avatarUrl={fromUser?.avatarUrl} />
                <div className="notif-body">
                  <p>
                    <strong>{n.fromUsername}</strong> {notifText(n, t)}
                  </p>
                  <span className="notif-time">{timeAgo(n.createdAt)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
