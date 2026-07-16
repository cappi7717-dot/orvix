import type { MediaItem } from '../types'

export const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5MB — localStorage joyi cheklangan
export const MAX_FILES_PER_POST = 1 // bitta postda faqat 1 ta rasm yoki video

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Faylni oqishda xatolik'))
    reader.readAsDataURL(file)
  })
}

export interface MediaPickResult {
  items: MediaItem[]
  errors: string[]
}

export async function filesToMedia(files: FileList | File[]): Promise<MediaPickResult> {
  const items: MediaItem[] = []
  const errors: string[] = []

  for (const file of Array.from(files)) {
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      errors.push(`${file.name}: faqat rasm yoki video qoyish mumkin`)
      continue
    }
    if (file.size > MAX_FILE_BYTES) {
      errors.push(`${file.name}: hajmi 5MB dan oshmasin`)
      continue
    }

    try {
      const url = await fileToDataUrl(file)
      items.push({ type: isImage ? 'image' : 'video', url })
    } catch {
      errors.push(`${file.name}: yuklab bolmadi`)
    }
  }

  return { items, errors }
}
