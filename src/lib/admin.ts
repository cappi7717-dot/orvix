export const ADMIN_USERNAME = 'cappi7717'

export function isAdminUsername(username: string | undefined | null): boolean {
  const admin = ADMIN_USERNAME.trim()
  if (!admin || !username) return false
  return username.trim().toLowerCase() === admin.toLowerCase()
}
