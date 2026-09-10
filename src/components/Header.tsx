import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'

const links = [
  ['/', 'Overview'],
  ['/addresses', 'Addresses'],
  ['/transactions', 'Transactions'],
  ['/blocks', 'Blocks'],
  ['/blockdag', 'BlockDAG'],
] as const
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--canvas)_90%,transparent)] px-4 backdrop-blur-xl">
      <nav
        className="page-wrap flex min-h-16 items-center py-3"
        aria-label="Main navigation"
      >
        <div className="flex w-full items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <img src="/favicon.svg" alt="Kaspa" className="size-8" />
            <span className="text-[15px] font-extrabold tracking-[-.05em]">
              Kas<span className="text-[var(--accent)]">Explore</span>
            </span>
          </Link>
          <div className="hidden items-center gap-5 md:flex">
            {links.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="nav-link whitespace-nowrap"
                activeProps={{ className: 'nav-link is-active' }}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full text-[var(--ink)] transition-colors hover:bg-[var(--surface)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={
                menuOpen ? 'Close navigation menu' : 'Open navigation menu'
              }
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>
      </nav>
      <div
        id="mobile-navigation"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        className={`page-wrap grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out md:hidden motion-reduce:transition-none ${
          menuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0">
          <div className="border-t border-[var(--line)] py-3">
            {links.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="nav-link flex min-h-11 items-center px-1 text-base"
                activeProps={{
                  className:
                    'nav-link is-active flex min-h-11 items-center px-1 text-base',
                }}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
