import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type Lang = 'uz' | 'ru' | 'en'

const LANG_KEY = 'orvix.lang'

const dict = {
  uz: {
    'nav.home': 'Bosh sahifa',
    'nav.create': "Post qo'yish",
    'nav.logout': 'Chiqish',
    'nav.login': 'Kirish',


    'home.placeholder': 'Nima deysan?',
    'home.post': 'Joylash',
    'home.posting': 'Joylanmoqda...',
    'home.empty': "Hozircha hech qanday post yo'q.",
    'home.firstPost': 'Birinchi postni yoz',

    'create.title': 'Yangi post',
    'create.placeholder': 'Nima deysan?',
    'create.post': 'Joylash',
    'create.posting': 'Joylanmoqda...',

    'media.add': "Rasm / video qo'shish",
    'media.remove': 'Olib tashlash',

    'post.like': 'Yoqdi',
    'post.comment': 'Izoh',
    'post.delete': "O'chirish",
    'post.deleteConfirm': "Postni o'chirishni xohlaysanmi?",
    'post.notFound': 'Bu post topilmadi.',
    'post.backHome': 'Bosh sahifaga qaytish',
    'post.comments': 'Izohlar',
    'post.noComments': "Hali izoh yo'q.",
    'post.commentPlaceholder': 'Izoh yoz...',
    'post.send': 'Yubor',
    'post.back': 'Orqaga',
    'post.loading': 'Yuklanmoqda...',
    'post.reply': 'Javob berish',
    'post.replyTo': 'Javob',
    'post.repost': 'Repost',
    'post.unrepost': "Repostni bekor qilish",
    'post.repostedBy': 'repost qildi',
    'post.more': "Ko'proq",
    'post.copyLink': 'Havolani nusxalash',
    'post.linkCopied': 'Havola nusxalandi',
    'post.report': 'Shikoyat qilish',

    'report.title': 'Nega shikoyat qilyapsiz?',
    'report.placeholder': 'Sababini yozing...',
    'report.submit': 'Yuborish',
    'report.cancel': 'Bekor qilish',
    'report.submitted': 'Shikoyatingiz yuborildi',
    'report.required': "Sababni yozish shart",

    'time.now': 'hozir',
    'time.minAgo': 'daqiqa oldin',
    'time.hourAgo': 'soat oldin',
    'time.dayAgo': 'kun oldin',

    'auth.loginTitle': 'Orvixga kirish',
    'auth.loginSub': 'Google akkounting bilan davom et.',
    'auth.googleBtn': 'Google bilan davom etish',
    'auth.googleLoading': 'Kirilmoqda...',

    'auth.error.blocked': 'Sizning akkountingiz admin tomonidan bloklangan',
    'auth.error.generic': 'Xatolik yuz berdi',
    'auth.error.googleFailed': "Google orqali kirishda xatolik yuz berdi",
    'auth.error.googleNotConfigured': "Google kirish sozlanmagan (VITE_GOOGLE_CLIENT_ID)",
    'auth.error.usernameTooShort': "Ism kamida 3 ta belgidan iborat bo'lsin",
    'auth.error.usernameTaken': 'Bu ism band, boshqasini tanla',

    'onboarding.title': "Seni qanday chaqiraylik?",
    'onboarding.sub': "Orvixdagi ismingni tanla — profilingda shu koʻrinadi.",
    'onboarding.nameLabel': 'Ism',
    'onboarding.placeholder': 'Masalan: anonim',
    'onboarding.submit': 'Davom etish',

    'profile.posts': 'Postlari',
    'profile.noPosts': "Hali hech qanday post yo'q.",
    'profile.changeBanner': "Fonni o'zgartirish",
    'profile.changeAvatar': 'Profil rasmini almashtirish',
    'profile.follow': "Obuna bo'lish",
    'profile.unfollow': "Obunani bekor qilish",
    'profile.followers': 'Obunachilar',
    'profile.following': 'Obunalar',
    'profile.noFollowers': "Hozircha obunachilar yo'q.",
    'profile.noFollowing': "Hozircha hech kimga obuna bo'lmagan.",
    'profile.close': 'Yopish',
    'profile.reposts': 'Repostlar',
    'profile.noReposts': "Hali hech narsa repost qilinmagan.",
    'profile.block': 'Bloklash',
    'profile.unblock': 'Blokdan chiqarish',
    'profile.blockConfirm': "Bu foydalanuvchini bloklaysizmi? U sizning profilingizni ko'ra olmaydi.",
    'profile.report': 'Profilga shikoyat',
    'profile.blockedTitle': 'Siz bloklangansiz',
    'profile.blockedMessage': 'Bu foydalanuvchi sizni bloklagan, shuning uchun profilini ko\'ra olmaysiz.',

    'nav.notifications': 'Bildirishnomalar',
    'notif.title': 'Bildirishnomalar',
    'notif.empty': "Hozircha bildirishnoma yo'q.",
    'notif.likedPost': 'postingizni yoqtirdi',
    'notif.likedComment': 'komentariyangizni yoqtirdi',
    'notif.commented': 'postingizga izoh qoldirdi',
    'notif.replied': 'komentariyangizga javob berdi',
    'notif.reposted': 'postingizni repost qildi',

    'search.placeholder': 'Login bo\'yicha qidirish...',
    'search.noResults': 'Hech kim topilmadi',
    'search.title': 'Qidiruv',

    'lang.label': 'Til',
  },
  ru: {
    'nav.home': 'Главная',
    'nav.create': 'Создать пост',
    'nav.logout': 'Выйти',
    'nav.login': 'Войти',


    'home.placeholder': 'Что нового?',
    'home.post': 'Опубликовать',
    'home.posting': 'Публикация...',
    'home.empty': 'Пока нет постов.',
    'home.firstPost': 'Написать первый пост',

    'create.title': 'Новый пост',
    'create.placeholder': 'Что нового?',
    'create.post': 'Опубликовать',
    'create.posting': 'Публикация...',

    'media.add': 'Добавить фото / видео',
    'media.remove': 'Убрать',

    'post.like': 'Нравится',
    'post.comment': 'Комментарий',
    'post.delete': 'Удалить',
    'post.deleteConfirm': 'Удалить этот пост?',
    'post.notFound': 'Пост не найден.',
    'post.backHome': 'Вернуться на главную',
    'post.comments': 'Комментарии',
    'post.noComments': 'Пока нет комментариев.',
    'post.commentPlaceholder': 'Написать комментарий...',
    'post.send': 'Отправить',
    'post.back': 'Назад',
    'post.loading': 'Загрузка...',
    'post.reply': 'Ответить',
    'post.replyTo': 'Ответ',
    'post.repost': 'Репост',
    'post.unrepost': 'Отменить репост',
    'post.repostedBy': 'сделал(а) репост',
    'post.more': 'Ещё',
    'post.copyLink': 'Скопировать ссылку',
    'post.linkCopied': 'Ссылка скопирована',
    'post.report': 'Пожаловаться',

    'report.title': 'Почему вы жалуетесь?',
    'report.placeholder': 'Опишите причину...',
    'report.submit': 'Отправить',
    'report.cancel': 'Отмена',
    'report.submitted': 'Жалоба отправлена',
    'report.required': 'Укажите причину',

    'time.now': 'сейчас',
    'time.minAgo': 'мин. назад',
    'time.hourAgo': 'ч. назад',
    'time.dayAgo': 'дн. назад',

    'auth.loginTitle': 'Вход в Orvix',
    'auth.loginSub': 'Продолжи через аккаунт Google.',
    'auth.googleBtn': 'Продолжить с Google',
    'auth.googleLoading': 'Вход...',

    'auth.error.blocked': 'Ваш аккаунт заблокирован администратором',
    'auth.error.generic': 'Произошла ошибка',
    'auth.error.googleFailed': 'Ошибка входа через Google',
    'auth.error.googleNotConfigured': 'Вход через Google не настроен (VITE_GOOGLE_CLIENT_ID)',
    'auth.error.usernameTooShort': 'Имя должно содержать минимум 3 символа',
    'auth.error.usernameTaken': 'Это имя уже занято, выбери другое',

    'onboarding.title': 'Как тебя называть?',
    'onboarding.sub': 'Выбери имя для Orvix — оно будет видно в профиле.',
    'onboarding.nameLabel': 'Имя',
    'onboarding.placeholder': 'Например: anonim',
    'onboarding.submit': 'Продолжить',

    'profile.posts': 'Посты',
    'profile.noPosts': 'Пока нет постов.',
    'profile.changeBanner': 'Изменить фон',
    'profile.changeAvatar': 'Изменить аватар',
    'profile.follow': 'Подписаться',
    'profile.unfollow': 'Отписаться',
    'profile.followers': 'Подписчики',
    'profile.following': 'Подписки',
    'profile.noFollowers': 'Пока нет подписчиков.',
    'profile.noFollowing': 'Пока ни на кого не подписан(а).',
    'profile.close': 'Закрыть',
    'profile.reposts': 'Репосты',
    'profile.noReposts': 'Пока нет репостов.',
    'profile.block': 'Заблокировать',
    'profile.unblock': 'Разблокировать',
    'profile.blockConfirm': 'Заблокировать этого пользователя? Он не сможет видеть ваш профиль.',
    'profile.report': 'Пожаловаться на профиль',
    'profile.blockedTitle': 'Вы заблокированы',
    'profile.blockedMessage': 'Этот пользователь заблокировал вас, поэтому вы не можете видеть его профиль.',

    'nav.notifications': 'Уведомления',
    'notif.title': 'Уведомления',
    'notif.empty': 'Пока нет уведомлений.',
    'notif.likedPost': 'понравился ваш пост',
    'notif.likedComment': 'понравился ваш комментарий',
    'notif.commented': 'прокомментировал(а) ваш пост',
    'notif.replied': 'ответил(а) на ваш комментарий',
    'notif.reposted': 'сделал(а) репост вашего поста',

    'search.placeholder': 'Поиск по логину...',
    'search.noResults': 'Никого не найдено',
    'search.title': 'Поиск',

    'lang.label': 'Язык',
  },
  en: {
    'nav.home': 'Home',
    'nav.create': 'New post',
    'nav.logout': 'Log out',
    'nav.login': 'Log in',


    'home.placeholder': "What's on your mind?",
    'home.post': 'Post',
    'home.posting': 'Posting...',
    'home.empty': 'No posts yet.',
    'home.firstPost': 'Write the first post',

    'create.title': 'New post',
    'create.placeholder': "What's on your mind?",
    'create.post': 'Post',
    'create.posting': 'Posting...',

    'media.add': 'Add photo / video',
    'media.remove': 'Remove',

    'post.like': 'Like',
    'post.comment': 'Comment',
    'post.delete': 'Delete',
    'post.deleteConfirm': 'Delete this post?',
    'post.notFound': 'This post could not be found.',
    'post.backHome': 'Back to home',
    'post.comments': 'Comments',
    'post.noComments': 'No comments yet.',
    'post.commentPlaceholder': 'Write a comment...',
    'post.send': 'Send',
    'post.back': 'Back',
    'post.loading': 'Loading...',
    'post.reply': 'Reply',
    'post.replyTo': 'Reply',
    'post.repost': 'Repost',
    'post.unrepost': 'Undo repost',
    'post.repostedBy': 'reposted',
    'post.more': 'More',
    'post.copyLink': 'Copy link',
    'post.linkCopied': 'Link copied',
    'post.report': 'Report',

    'report.title': 'Why are you reporting this?',
    'report.placeholder': 'Describe the reason...',
    'report.submit': 'Submit',
    'report.cancel': 'Cancel',
    'report.submitted': 'Your report has been sent',
    'report.required': 'Please enter a reason',

    'time.now': 'now',
    'time.minAgo': 'min ago',
    'time.hourAgo': 'h ago',
    'time.dayAgo': 'd ago',

    'auth.loginTitle': 'Log in to Orvix',
    'auth.loginSub': 'Continue with your Google account.',
    'auth.googleBtn': 'Continue with Google',
    'auth.googleLoading': 'Signing in...',

    'auth.error.blocked': 'Your account has been blocked by the admin',
    'auth.error.generic': 'Something went wrong',
    'auth.error.googleFailed': 'Google sign-in failed',
    'auth.error.googleNotConfigured': 'Google sign-in is not configured (VITE_GOOGLE_CLIENT_ID)',
    'auth.error.usernameTooShort': 'Name must be at least 3 characters',
    'auth.error.usernameTaken': 'This name is already taken, pick another',

    'onboarding.title': 'What should we call you?',
    'onboarding.sub': 'Choose your name on Orvix — this is what shows on your profile.',
    'onboarding.nameLabel': 'Name',
    'onboarding.placeholder': 'e.g. anonim',
    'onboarding.submit': 'Continue',

    'profile.posts': 'Posts',
    'profile.noPosts': 'No posts yet.',
    'profile.changeBanner': 'Change banner',
    'profile.changeAvatar': 'Change avatar',
    'profile.follow': 'Follow',
    'profile.unfollow': 'Unfollow',
    'profile.followers': 'Followers',
    'profile.following': 'Following',
    'profile.noFollowers': 'No followers yet.',
    'profile.noFollowing': 'Not following anyone yet.',
    'profile.close': 'Close',
    'profile.reposts': 'Reposts',
    'profile.noReposts': 'No reposts yet.',
    'profile.block': 'Block',
    'profile.unblock': 'Unblock',
    'profile.blockConfirm': "Block this user? They won't be able to see your profile.",
    'profile.report': 'Report profile',
    'profile.blockedTitle': "You've been blocked",
    'profile.blockedMessage': "This user has blocked you, so you can't view their profile.",

    'nav.notifications': 'Notifications',
    'notif.title': 'Notifications',
    'notif.empty': 'No notifications yet.',
    'notif.likedPost': 'liked your post',
    'notif.likedComment': 'liked your comment',
    'notif.commented': 'commented on your post',
    'notif.replied': 'replied to your comment',
    'notif.reposted': 'reposted your post',

    'search.placeholder': 'Search by username...',
    'search.noResults': 'No one found',
    'search.title': 'Search',

    'lang.label': 'Language',
  },
} as const

export type TranslationKey = keyof typeof dict.uz

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved === 'uz' || saved === 'ru' || saved === 'en') return saved
  } catch {
    // localStorage yoq bolsa ham davom etamiz
  }
  return 'uz'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang)

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      // joy bolmasa e'tiborsiz qoldiramiz
    }
  }, [lang])

  function setLang(next: Lang) {
    setLangState(next)
  }

  function t(key: TranslationKey): string {
    return dict[lang][key] ?? dict.uz[key] ?? key
  }

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage LanguageProvider ichida ishlatilishi kerak')
  return ctx
}
