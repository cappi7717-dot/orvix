export interface User {
  id: string;
  username: string;
  googleId: string; // Google "sub" identifikatori — foydalanuvchini shu orqali topamiz
  email: string;
  name: string; // Google akkountidagi to'liq ism
  createdAt: number;
  profileComplete?: boolean; // Google orqali birinchi marta kirganda ism tanlanguncha false
  avatarUrl?: string; // foydalanuvchi o'zi yuklagan profil rasmi (data URL)
  banner?: string; // profildagi fon uchun tanlangan gradient id yoki data URL rasm
  following?: string[]; // shu foydalanuvchi obuna bo'lgan boshqa foydalanuvchilar id'lari
  blocked?: boolean; // admin tomonidan bloklangan foydalanuvchi saytga kira olmaydi
  blockedUsers?: string[]; // shu foydalanuvchi o'zi bloklagan boshqa foydalanuvchilar id'lari
}

export interface Comment {
  id: string;
  authorId: string;
  authorUsername: string;
  content: string;
  createdAt: number;
  likedBy: string[]; // komentariyani layk qilgan foydalanuvchilar
  parentId?: string; // javob berilayotgan komentariya id (agar bu javob bo'lsa)
}

export type NotificationType = 'like_post' | 'like_comment' | 'comment' | 'reply' | 'repost';

export interface AppNotification {
  id: string;
  type: NotificationType;
  toUserId: string; // bildirishnoma kimga tegishli
  fromUserId: string;
  fromUsername: string;
  postId: string;
  commentId?: string;
  createdAt: number;
  read: boolean;
}

export type ReportTargetType = 'post' | 'user';

export interface Report {
  id: string;
  reporterId: string;
  reporterUsername: string;
  targetType: ReportTargetType;
  targetUserId: string; // postning muallifi yoki jalb qilingan profil egasi
  targetUsername: string;
  postId?: string; // targetType === 'post' bo'lsa
  postContent?: string; // jalb paytidagi post matni (post keyin o'chsa ham saqlanib qoladi)
  reason: string;
  createdAt: number;
  read: boolean;
}

export interface MediaItem {
  type: 'image' | 'video';
  url: string; // data URL
}

export interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
  content: string;
  createdAt: number;
  likedBy: string[]; // user ids
  comments: Comment[];
  media?: MediaItem[];
  repostedBy?: string[]; // shu postni repost qilgan foydalanuvchilar id'lari
}
