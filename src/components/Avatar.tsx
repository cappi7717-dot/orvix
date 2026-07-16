interface AvatarProps {
  username: string
  size?: number
  avatarUrl?: string
}

// Deterministic color from the username, so each person has a stable,
// distinct avatar color without any backend or uploaded image.
function colorFor(username: string): string {
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 55%, 45%)`
}

export default function Avatar({ username, size = 40, avatarUrl }: AvatarProps) {
  if (avatarUrl) {
    return (
      <img
        className="avatar avatar-img"
        src={avatarUrl}
        alt={username}
        style={{ width: size, height: size }}
      />
    )
  }

  const initial = username.slice(0, 1).toUpperCase()
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: colorFor(username),
        fontSize: size * 0.42,
      }}
    >
      {initial}
    </div>
  )
}
