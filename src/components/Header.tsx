import { Link } from '@tanstack/react-router'
import { Search, Zap } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const links = [
  ['/', 'Overview'],
  ['/addresses', 'Addresses'],
  ['/transactions', 'Transactions'],
  ['/blocks', 'Blocks'],
] as const
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--canvas)_90%,transparent)] px-4 backdrop-blur-xl">
      <nav className="page-wrap flex min-h-16 flex-wrap items-center gap-x-7 gap-y-3 py-3">
        <div className='flex items-center justify-between w-full'>
          <Link
          to="/"
          className="mr-auto flex items-center gap-2.5 no-underline sm:mr-4"
          >
            <span className="grid size-8 place-items-center rounded-[10px] bg-[var(--ink)] text-[var(--canvas)]">
              <Zap className="size-4 fill-current" />
            </span>
            <span className="text-[15px] font-extrabold tracking-[-.05em]">
              kas<span className="text-[var(--accent)]">explore</span>
            </span>
          </Link>
          <div className="order-3 flex w-full items-center gap-5 overflow-x-auto pb-1 sm:order-none sm:w-auto sm:pb-0">
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
          </div>
        </div>
      </nav>
    </header>
  )
}
