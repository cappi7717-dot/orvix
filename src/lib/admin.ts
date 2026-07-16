export const ADMIN_USERNAME = 'boom'

export function isAdminUsername(username: string | undefined | null): boolean {
  const admin = ADMIN_USERNAME.trim()
  if (!admin || !username) return false
  return username.trim().toLowerCase() === admin.toLowerCase()
}
