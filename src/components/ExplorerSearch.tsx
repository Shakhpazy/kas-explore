import { Search } from 'lucide-react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { resolveHash } from '@/api/Search'

export function ExplorerSearch() {
  const location = useLocation()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  function normalizeSearchInput(input: string) {
    const value = input.trim()
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }

  function isAddress(input: string) {
    const value = input.trim()
    return /^kaspa:[a-z0-9]+(?:\?[^\s]*)?$/i.test(value)
  }

  function isTransactionHash(input: string) {
    const value = input.trim().replace(/^0x/i, '')
    return /^[a-f0-9]{64}$/i.test(value)
  }

  function detectSearchType(input: string) {
    const value = normalizeSearchInput(input)

    if (isAddress(value)) {
      return 'address'
    }

    if (isTransactionHash(value)) {
      return 'transaction'
    }

    return 'unknown'
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (searching) return
    setError('')
    const value = normalizeSearchInput(query)
    if (!value) {
      return
    }

    const type = detectSearchType(value)
    if (type === 'transaction') {
      const hash = value.replace(/^0x/i, '').toLowerCase()
      setSearching(true)
      try {
        const kind = await resolveHash(hash)
        if (kind === 'block') {
          await navigate({ to: '/blocks/$block', params: { block: hash } })
        } else {
          await navigate({ to: '/transactions/$transaction', params: { transaction: hash } })
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Search is unavailable. Please try again.')
      } finally {
        setSearching(false)
      }
      return
    } else if (type === 'address') {
      await navigate({ to: '/addresses/$address', params: { address: value } })
      return
    } else {
      setError('Enter a valid Kaspa address or a 64-character hash.')
      return
    }
  }

  useEffect(() => {
    setQuery('')
    setError('')
  }, [location.pathname])

  return (
    <section className="explorer-search-shell" aria-label="Explorer search">
      <form
        className="explorer-search"
        onSubmit={(event) => void handleSubmit(event)}
        aria-busy={searching}
      >
        <Search className="size-5 shrink-0 text-[var(--accent-deep)]" />
        <input
          id="explorer-search"
          aria-label="Search address, transaction, or block"
          placeholder="Search address, transaction, or block hash"
          className="explorer-search-input"
          value={query}
          disabled={searching}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit" className="explorer-search-button" disabled={searching}>
          {searching ? 'Searching…' : 'Explore'}
        </button>
      </form>
      {error && <p role="alert" className="mt-2 text-sm text-[var(--danger)]">{error}</p>}
    </section>
  )
}
