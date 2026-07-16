import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import type { AppNotification, MediaItem, Post, Report, User } from '../types'
import { idbGet, idbSet, readLegacyLocalStorage } from '../lib/db'

const POSTS_KEY = 'orvix.posts'
const NOTIFS_KEY = 'orvix.notifications'
const REPORTS_KEY = 'orvix.reports'

async function loadPosts(): Promise<Post[]> {
  try {
    const fromDb = await idbGet<Post[]>(POSTS_KEY)
    if (fromDb) return fromDb.map(normalizePost)

    // Eski versiyada localStorage'da saqlangan postlar bo'lsa, bir martalik
    // IndexedDB'ga ko'chirib olamiz, shunda foydalanuvchi eski postlarini yo'qotmaydi.
    const legacy = readLegacyLocalStorage<Post[]>(POSTS_KEY)
    if (legacy && legacy.length > 0) {
      const normalized = legacy.map(normalizePost)
      try {
        await idbSet(POSTS_KEY, normalized)
        localStorage.removeItem(POSTS_KEY)
      } catch {
        // ko'chirish muvaffaqiyatsiz bo'lsa ham, o'qishda hech bo'lmasa eski postlarni qaytaramiz
      }
      return normalized
    }
    return []
  } catch {
    return []
  }
}

// Eski yoki qo'lda o'zgartirilgan yozuvlarda ba'zi maydonlar (likedBy, comments)
// yo'q bo'lishi mumkin — bu butun ilovani "Nimadir xato ketdi" ekraniga
// olib borib qolayotgan edi. Shu yerda har doim xavfsiz qiymatlarga tenglaymiz.
function normalizePost(post: Post): Post {
  return {
    ...post,
    likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
    repostedBy: Array.isArray(post.repostedBy) ? post.repostedBy : [],
    comments: (Array.isArray(post.comments) ? post.comments : []).map((c) => ({
      ...c,
      likedBy: Array.isArray(c.likedBy) ? c.likedBy : [],
    })),
  }
}

async function loadNotifications(): Promise<AppNotification[]> {
  try {
    const fromDb = await idbGet<AppNotification[]>(NOTIFS_KEY)
    return fromDb ?? []
  } catch {
    return []
  }
}

async function saveNotificationsSafe(list: AppNotification[]): Promise<{ ok: boolean }> {
  try {
    await idbSet(NOTIFS_KEY, list)
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

async function loadReports(): Promise<Report[]> {
  try {
    const fromDb = await idbGet<Report[]>(REPORTS_KEY)
    return fromDb ?? []
  } catch {
    return []
  }
}

async function saveReportsSafe(list: Report[]): Promise<{ ok: boolean }> {
  try {
    await idbSet(REPORTS_KEY, list)
    return { ok: true }
  } catch {
    return { ok: false }
  }
}

// IndexedDB hajmi localStorage'dan ancha katta bo'lgani uchun (odatda diskning
// katta qismi), video/rasmli postlar tez-tez "joy tugadi" xatosiga uchramaydi.
async function savePostsSafe(posts: Post[]): Promise<{ ok: boolean; error?: string }> {
  try {
    await idbSet(POSTS_KEY, posts)
    return { ok: true }
  } catch (err) {
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      return {
        ok: false,
        error: 'Xotira joyi tugadi. Eski postlaringizni o\'chirib, qayta urinib ko\'ring.',
      }
    }
    return { ok: false, error: 'Postni saqlashda xatolik yuz berdi.' }
  }
}

interface DataContextValue {
  posts: Post[] // newest first
  loading: boolean
  createPost: (author: User, content: string, media?: MediaItem[]) => Promise<{ ok: boolean; error?: string }>
  deletePost: (postId: string, userId: string) => Promise<void>
  toggleLike: (postId: string, user: User) => Promise<void>
  toggleRepost: (postId: string, user: User) => Promise<void>
  addComment: (postId: string, user: User, content: string, parentId?: string) => Promise<void>
  toggleCommentLike: (postId: string, commentId: string, user: User) => Promise<void>
  getPost: (postId: string) => Post | undefined
  notifications: AppNotification[] // newest first
  markNotificationsRead: (userId: string) => Promise<void>
  reports: Report[] // newest first, admin panel uchun
  submitReport: (input: {
    reporter: User
    targetType: 'post' | 'user'
    targetUserId: string
    targetUsername: string
    postId?: string
    postContent?: string
    reason: string
  }) => Promise<void>
  markReportsRead: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const postsRef = useRef<Post[]>([])
  postsRef.current = posts
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [reports, setReports] = useState<Report[]>([])

  const refresh = useCallback(async () => {
    const all = await loadPosts()
    all.sort((a, b) => b.createdAt - a.createdAt)
    setPosts(all)
    setLoading(false)
  }, [])

  const refreshNotifications = useCallback(async () => {
    const all = await loadNotifications()
    all.sort((a, b) => b.createdAt - a.createdAt)
    setNotifications(all)
  }, [])

  const refreshReports = useCallback(async () => {
    const all = await loadReports()
    all.sort((a, b) => b.createdAt - a.createdAt)
    setReports(all)
  }, [])

  useEffect(() => {
    refresh()
    refreshNotifications()
    refreshReports()
  }, [refresh, refreshNotifications, refreshReports])

  // Layk yoki komentariya qoldirgan odam bilan bildirishnoma egasi bir xil
  // bo'lsa (ya'ni o'z postiga/komentariyasiga o'zi layk bossa), bildirishnoma
  // yaratilmaydi.
  async function addNotification(input: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
    if (input.toUserId === input.fromUserId) return
    const all = await loadNotifications()
    const notif: AppNotification = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      read: false,
    }
    await saveNotificationsSafe([notif, ...all])
    await refreshNotifications()
  }

  async function createPost(author: User, content: string, media?: MediaItem[]) {
    const trimmed = content.trim()
    const hasMedia = media && media.length > 0
    if (!trimmed && !hasMedia) return { ok: false, error: 'Post bosh bolmasin' }
    const post: Post = {
      id: crypto.randomUUID(),
      authorId: author.id,
      authorUsername: author.username,
      content: trimmed,
      createdAt: Date.now(),
      likedBy: [],
      comments: [],
      media: hasMedia ? media : undefined,
    }
    const all = await loadPosts()
    const result = await savePostsSafe([post, ...all])
    if (result.ok) await refresh()
    return result
  }

  async function deletePost(postId: string, userId: string) {
    const all = await loadPosts()
    const post = all.find((p) => p.id === postId)
    if (!post || post.authorId !== userId) return
    const result = await savePostsSafe(all.filter((p) => p.id !== postId))
    if (result.ok) await refresh()
  }

  async function toggleLike(postId: string, user: User) {
    const all = await loadPosts()
    const idx = all.findIndex((p) => p.id === postId)
    if (idx === -1) return
    const post = all[idx]
    const liked = post.likedBy.includes(user.id)
    all[idx] = {
      ...post,
      likedBy: liked
        ? post.likedBy.filter((id) => id !== user.id)
        : [...post.likedBy, user.id],
    }
    const result = await savePostsSafe(all)
    if (result.ok) {
      await refresh()
      if (!liked) {
        await addNotification({
          type: 'like_post',
          toUserId: post.authorId,
          fromUserId: user.id,
          fromUsername: user.username,
          postId: post.id,
        })
      }
    }
  }

  async function toggleRepost(postId: string, user: User) {
    const all = await loadPosts()
    const idx = all.findIndex((p) => p.id === postId)
    if (idx === -1) return
    const post = all[idx]
    const reposted = (post.repostedBy ?? []).includes(user.id)
    all[idx] = {
      ...post,
      repostedBy: reposted
        ? (post.repostedBy ?? []).filter((id) => id !== user.id)
        : [...(post.repostedBy ?? []), user.id],
    }
    const result = await savePostsSafe(all)
    if (result.ok) {
      await refresh()
      if (!reposted) {
        await addNotification({
          type: 'repost',
          toUserId: post.authorId,
          fromUserId: user.id,
          fromUsername: user.username,
          postId: post.id,
        })
      }
    }
  }

  async function addComment(postId: string, user: User, content: string, parentId?: string) {
    const trimmed = content.trim()
    if (!trimmed) return
    const all = await loadPosts()
    const idx = all.findIndex((p) => p.id === postId)
    if (idx === -1) return
    const post = all[idx]
    const parentComment = parentId ? post.comments.find((c) => c.id === parentId) : undefined
    const newComment = {
      id: crypto.randomUUID(),
      authorId: user.id,
      authorUsername: user.username,
      content: trimmed,
      createdAt: Date.now(),
      likedBy: [],
      parentId,
    }
    all[idx] = {
      ...post,
      comments: [...post.comments, newComment],
    }
    const result = await savePostsSafe(all)
    if (result.ok) {
      await refresh()
      if (parentComment) {
        // Bu boshqa komentariyaga javob — javob berilayotgan odamga bildirishnoma boradi
        await addNotification({
          type: 'reply',
          toUserId: parentComment.authorId,
          fromUserId: user.id,
          fromUsername: user.username,
          postId: post.id,
          commentId: newComment.id,
        })
      } else {
        // Oddiy (yangi) komentariya — post egasiga bildirishnoma boradi
        await addNotification({
          type: 'comment',
          toUserId: post.authorId,
          fromUserId: user.id,
          fromUsername: user.username,
          postId: post.id,
        })
      }
    }
  }

  async function toggleCommentLike(postId: string, commentId: string, user: User) {
    const all = await loadPosts()
    const idx = all.findIndex((p) => p.id === postId)
    if (idx === -1) return
    const post = all[idx]
    const cidx = post.comments.findIndex((c) => c.id === commentId)
    if (cidx === -1) return
    const comment = post.comments[cidx]
    const liked = comment.likedBy.includes(user.id)
    const updatedComments = [...post.comments]
    updatedComments[cidx] = {
      ...comment,
      likedBy: liked
        ? comment.likedBy.filter((id) => id !== user.id)
        : [...comment.likedBy, user.id],
    }
    all[idx] = { ...post, comments: updatedComments }
    const result = await savePostsSafe(all)
    if (result.ok) {
      await refresh()
      if (!liked) {
        await addNotification({
          type: 'like_comment',
          toUserId: comment.authorId,
          fromUserId: user.id,
          fromUsername: user.username,
          postId: post.id,
          commentId: comment.id,
        })
      }
    }
  }

  async function markNotificationsRead(userId: string) {
    const all = await loadNotifications()
    const hasUnread = all.some((n) => n.toUserId === userId && !n.read)
    if (!hasUnread) return
    const updated = all.map((n) => (n.toUserId === userId ? { ...n, read: true } : n))
    await saveNotificationsSafe(updated)
    await refreshNotifications()
  }

  async function submitReport(input: {
    reporter: User
    targetType: 'post' | 'user'
    targetUserId: string
    targetUsername: string
    postId?: string
    postContent?: string
    reason: string
  }) {
    const trimmed = input.reason.trim()
    if (!trimmed) return
    const all = await loadReports()
    const report: Report = {
      id: crypto.randomUUID(),
      reporterId: input.reporter.id,
      reporterUsername: input.reporter.username,
      targetType: input.targetType,
      targetUserId: input.targetUserId,
      targetUsername: input.targetUsername,
      postId: input.postId,
      postContent: input.postContent,
      reason: trimmed,
      createdAt: Date.now(),
      read: false,
    }
    await saveReportsSafe([report, ...all])
    await refreshReports()
  }

  async function markReportsRead() {
    const all = await loadReports()
    const hasUnread = all.some((r) => !r.read)
    if (!hasUnread) return
    const updated = all.map((r) => ({ ...r, read: true }))
    await saveReportsSafe(updated)
    await refreshReports()
  }

  function getPost(postId: string) {
    return postsRef.current.find((p) => p.id === postId)
  }

  return (
    <DataContext.Provider
      value={{
        posts,
        loading,
        createPost,
        deletePost,
        toggleLike,
        toggleRepost,
        addComment,
        toggleCommentLike,
        getPost,
        notifications,
        markNotificationsRead,
        reports,
        submitReport,
        markReportsRead,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData DataProvider ichida ishlatilishi kerak')
  return ctx
}
