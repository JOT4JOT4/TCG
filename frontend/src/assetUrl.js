
export function assetUrl(path) {
  if (!path) return ''

  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path
  }

  const base = import.meta.env.BASE_URL
  const cleanPath = path.replace(/^\/+/, '')

  return `${base}${cleanPath}`
}
