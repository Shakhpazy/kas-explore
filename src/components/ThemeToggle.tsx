import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type ThemeMode = 'light' | 'dark' | 'auto'
function readMode(): ThemeMode {
  try {
    const stored = window.localStorage.getItem('theme')
    return stored === 'light' || stored === 'dark' ? stored : 'auto'
  } catch {
    return 'auto'
  }
}
function apply(mode: ThemeMode) {
  const dark =
    mode === 'dark' ||
    (mode === 'auto' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.classList.toggle('light', !dark)
  if (mode === 'auto') document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', mode)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  return dark
}
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => {
    const sync = () => setIsDark(apply(readMode()))
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystemChange = () => {
      if (!document.documentElement.hasAttribute('data-theme')) sync()
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'theme' || event.key === null) sync()
    }
    sync()
    media.addEventListener('change', onSystemChange)
    window.addEventListener('storage', onStorage)
    return () => {
      media.removeEventListener('change', onSystemChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [])
  const toggle = () => {
    const value = document.documentElement.classList.contains('dark')
      ? 'light'
      : 'dark'
    setIsDark(apply(value))
    try {
      window.localStorage.setItem('theme', value)
    } catch {
      // Switching still works when browser storage is unavailable.
    }
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className="grid size-9 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
    >
      {isDark ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  )
}
