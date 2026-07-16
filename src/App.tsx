import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { LanguageProvider } from './lib/i18n'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import OnboardingRoute from './components/OnboardingRoute'
import ErrorBoundary from './components/ErrorBoundary'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import CreatePost from './pages/CreatePost'
import PostDetail from './pages/PostDetail'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <DataProvider>
            <BrowserRouter>
              <Navbar />
              <main className="app-main">
                <ErrorBoundary>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/onboarding"
                      element={
                        <OnboardingRoute>
                          <Onboarding />
                        </OnboardingRoute>
                      }
                    />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Home />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/create"
                      element={
                        <ProtectedRoute>
                          <CreatePost />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/post/:postId"
                      element={
                        <ProtectedRoute>
                          <PostDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile/:userId"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </ErrorBoundary>
              </main>
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  )
}
