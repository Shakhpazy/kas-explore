import { ExternalLink, Network } from 'lucide-react'
import { useEffect, useState } from 'react'

const KGI_URL = 'https://kgi.kaspad.net/'

export function BlockdagVisualizer() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = document.documentElement
    const syncTheme = () => setTheme(root.classList.contains('dark') ? 'dark' : 'light')
    const observer = new MutationObserver(syncTheme)

    syncTheme()
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const visualizerUrl = `${KGI_URL}?theme=${theme}`

  return (
    <section
      className="network-overview mt-6"
      aria-label="Live BlockDAG visualizer"
    >
      <header className="network-overview-header">
        <div className="flex items-center gap-3">
          <span className="live-panel-icon">
            <Network className="size-5" />
          </span>
          <div>
            <p className="eyebrow m-0">Live network data</p>
            <h2>BlockDAG</h2>
          </div>
        </div>
        <a
          href={visualizerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--accent-deep)] no-underline hover:text-[var(--ink)]"
        >
          Open visualizer <ExternalLink className="size-3.5" />
        </a>
      </header>
      <iframe
        className="blockdag-frame"
        title="Kaspa Graph Inspector live BlockDAG visualizer"
        key={theme}
        src={visualizerUrl}
        loading="lazy"
        allow="fullscreen"
      />
    </section>
  )
}
