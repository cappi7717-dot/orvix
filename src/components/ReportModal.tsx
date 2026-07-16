import { useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../lib/i18n'

interface ReportModalProps {
  onClose: () => void
  onSubmit: (reason: string) => void
}

export default function ReportModal({ onClose, onSubmit }: ReportModalProps) {
  const { t } = useLanguage()
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = reason.trim()
    if (!trimmed) {
      setError(t('report.required'))
      return
    }
    onSubmit(trimmed)
    setSent(true)
    setTimeout(onClose, 900)
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t('report.title')}</h3>
          <button type="button" className="modal-close-btn" onClick={onClose} title={t('profile.close')}>
            ✕
          </button>
        </div>
        {sent ? (
          <p className="admin-success-msg report-sent-msg">{t('report.submitted')} ✓</p>
        ) : (
          <form className="report-form" onSubmit={handleSubmit}>
            <textarea
              autoFocus
              rows={4}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError('')
              }}
              placeholder={t('report.placeholder')}
            />
            {error && <p className="form-error">{error}</p>}
            <div className="report-form-actions">
              <button type="button" className="btn-ghost" onClick={onClose}>
                {t('report.cancel')}
              </button>
              <button type="submit" className="btn-primary-sm">
                {t('report.submit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  )
}
