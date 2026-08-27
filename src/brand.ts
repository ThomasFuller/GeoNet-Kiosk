/** Public brand files, rooted at Vite's base so GitHub Pages can find them. */
export function publicUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

export function brandIcon(name: string): string {
  return publicUrl(`brand/icons/${name}`)
}

export function applyBrandAssets() {
  const pattern = `url("${brandIcon('pattern-altogether.svg')}")`
  document.documentElement.style.setProperty('--brand-pattern', pattern)
}
