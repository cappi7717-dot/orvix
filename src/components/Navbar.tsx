import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useLanguage } from '../lib/i18n'
import type { Lang } from '../lib/i18n'
import Avatar from './Avatar'
import AdminPanelModal from './AdminPanelModal'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5Z" />
      <path d="M10.5 20a1.7 1.7 0 0 0 3 0" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

function CreateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 3h6a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-6" />
      <path d="M4 12h11M11 8l4 4-4 4" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h9" />
      <path d="M20 12H9M16 8l4 4-4 4" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5 19 6.5V11c0 4.8-3 8.3-7 9.5-4-1.2-7-4.7-7-9.5V6.5l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

const LANGS: { code: Lang; label: string }[] = [
  { code: 'uz', label: "O'z" },
  { code: 'ru', label: 'Ру' },
  { code: 'en', label: 'En' },
]

export default function Navbar() {
  const { currentUser, logout, allUsers, isAdmin } = useAuth()
  const { notifications, reports } = useData()
  const { lang, setLang, t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdminPanel, setShowAdminPanel] = useState(false)

  const unreadCount = currentUser
    ? notifications.filter((n) => n.toUserId === currentUser.id && !n.read).length
    : 0
  const unreadReports = isAdmin ? reports.filter((r) => !r.read).length : 0

  const searchResults = searchQuery.trim()
    ? allUsers.filter((u) => u.username.toLowerCase().includes(searchQuery.trim().toLowerCase())).slice(0, 20)
    : []

  function closeSearch() {
    setShowSearch(false)
    setSearchQuery('')
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function isActive(path: string) {
    return location.pathname === path
  }

  return (
    <header className="sidebar">
      <Link to="/" className="brand" title="Orvix">
        Ø
      </Link>

      <nav className="sidebar-links">
        {currentUser ? (
          <>
            <Link
              to="/"
              className={`sidebar-icon ${isActive('/') ? 'active' : ''}`}
              title={t('nav.home')}
            >
              <HomeIcon />
            </Link>
            <button
              type="button"
              className="sidebar-icon"
              onClick={() => setShowSearch(true)}
              title={t('search.title')}
            >
              <SearchIcon />
            </button>
            <Link
              to="/create"
              className={`sidebar-icon ${isActive('/create') ? 'active' : ''}`}
              title={t('nav.create')}
            >
              <CreateIcon />
            </Link>
            <Link
              to="/notifications"
              className={`sidebar-icon ${isActive('/notifications') ? 'active' : ''}`}
              title={t('nav.notifications')}
            >
              <BellIcon />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </Link>
            {isAdmin && (
              <button
                type="button"
                className="sidebar-icon"
                onClick={() => setShowAdminPanel(true)}
                title="Admin panel"
              >
                <ShieldIcon />
                {unreadReports > 0 && <span className="notif-badge">{unreadReports > 9 ? '9+' : unreadReports}</span>}
              </button>
            )}
            <Link
              to={`/profile/${currentUser.id}`}
              className={`sidebar-icon sidebar-profile ${
                location.pathname === `/profile/${currentUser.id}` ? 'active' : ''
              }`}
              title={currentUser.username}
            >
              <Avatar username={currentUser.username} size={26} avatarUrl={currentUser.avatarUrl} />
            </Link>
            <button className="sidebar-icon" onClick={handleLogout} title={t('nav.logout')}>
              <LogoutIcon />
            </button>
          </>
        ) : (
          <Link to="/login" className={`sidebar-icon ${isActive('/login') ? 'active' : ''}`} title={t('nav.login')}>
            <LoginIcon />
          </Link>
        )}
      </nav>

      <div className="sidebar-lang" title={t('lang.label')}>
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            className={`lang-btn ${lang === l.code ? 'active' : ''}`}
            onClick={() => setLang(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>

      {showSearch &&
        createPortal(
          <div className="modal-overlay" onClick={closeSearch}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{t('search.title')}</h3>
                <button type="button" className="modal-close-btn" onClick={closeSearch} title={t('profile.close')}>
                  ✕
                </button>
              </div>
              <div className="search-input-wrap">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search.placeholder')}
                />
              </div>
              <div className="user-list">
                {searchQuery.trim() && searchResults.length === 0 && (
                  <p className="muted">{t('search.noResults')}</p>
                )}
                {searchResults.map((u) => (
                  <Link key={u.id} to={`/profile/${u.id}`} className="user-list-item" onClick={closeSearch}>
                    <Avatar username={u.username} size={40} avatarUrl={u.avatarUrl} />
                    <span>{u.username}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
      {showAdminPanel && <AdminPanelModal onClose={() => setShowAdminPanel(false)} />}
    </header>
  )
}
