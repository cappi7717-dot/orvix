import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

// React'da faqat class komponent error boundary bo'la oladi.
// Bu bo'lmasa, render vaqtida yoki event handlerda tashlangan istalgan xato
// butun ilovani "oq/bo'sh sahifa"ga aylantirib qo'yadi va foydalanuvchi
// hech narsa ko'rmay qoladi. Endi bunday holatda tiklanish tugmasi chiqadi.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('Orvix xato:', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="empty-state" style={{ padding: '48px 16px' }}>
          <p>Nimadir xato ketdi. Iltimos, qayta urinib ko'ring.</p>
          <button type="button" className="btn-primary-sm" onClick={this.handleReload}>
            Bosh sahifaga qaytish
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
