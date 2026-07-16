import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import type { MediaItem } from '../types'
import { MAX_FILES_PER_POST, filesToMedia } from '../lib/media'
import { useLanguage } from '../lib/i18n'

interface MediaPickerProps {
  media: MediaItem[]
  onChange: (media: MediaItem[]) => void
}

export default function MediaPicker({ media, onChange }: MediaPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remaining = MAX_FILES_PER_POST - media.length
    const toRead = Array.from(files).slice(0, Math.max(remaining, 0))
    const { items, errors } = await filesToMedia(toRead)

    if (errors.length > 0) alert(errors.join('\n'))
    if (items.length > 0) onChange([...media, ...items])

    e.target.value = ''
  }

  function removeAt(idx: number) {
    onChange(media.filter((_, i) => i !== idx))
  }

  return (
    <div className="media-picker">
      {media.length > 0 && (
        <div className="media-preview-grid">
          {media.map((item, idx) => (
            <div className="media-preview-item" key={idx}>
              {item.type === 'image' ? (
                <img src={item.url} alt="" />
              ) : (
                <video src={item.url} controls />
              )}
              <button
                type="button"
                className="media-remove-btn"
                onClick={() => removeAt(idx)}
                title={t('media.remove')}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {media.length < MAX_FILES_PER_POST && (
        <>
          <button
            type="button"
            className="btn-ghost media-add-btn"
            onClick={() => inputRef.current?.click()}
          >
            🖼️ {t('media.add')}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={handleFiles}
          />
        </>
      )}
    </div>
  )
}
