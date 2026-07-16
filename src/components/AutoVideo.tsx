import { useEffect, useRef } from 'react'

export default function AutoVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            el.play().catch(() => {
              // Brauzer autoplayni bloklashi mumkin, foydalanuvchi bosganda ishga tushadi
            })
          } else {
            el.pause()
          }
        }
      },
      { threshold: [0, 0.6, 1] }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return <video ref={videoRef} src={src} controls loop muted playsInline />
}
