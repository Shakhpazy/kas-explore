import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function formatNumber(value: number, maximumFractionDigits: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
  }).format(value)
}

export function formatKasFromSompi(
  sompi: number | null | undefined,
  maximumFractionDigits = 4,
) {
  if (sompi === null || sompi === undefined) return '—'
  return formatNumber(sompi / 100_000_000, maximumFractionDigits)
}

export function formatKasValue(
  value: number | null | undefined,
  maximumFractionDigits = 4,
) {
  if (value === null || value === undefined) return '—'
  return formatNumber(value, maximumFractionDigits)
}

export function formatDateMedium(
  timestamp: number | null | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
) {
  if (timestamp === null || timestamp === undefined) return '—'
  return new Intl.DateTimeFormat('en-US', options).format(timestamp)
}

export function shortHash(value: string, start = 12, end = 8) {
  if (value.length <= start + end + 1) return value
  return `${value.slice(0, start)}…${value.slice(-end)}`
}

export function shortAddress(value: string, start = 16, end = 10) {
  if (value.length <= start + end + 1) return value
  return `${value.slice(0, start)}…${value.slice(-end)}`
}

export function formatSignedKasValue(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${formatKasValue(Math.abs(value))}`
}

export function formatPercent(
  value: number | null | undefined,
  maximumFractionDigits = 2,
) {
  if (value === null || value === undefined) return '—'
  return `${formatNumber(value, maximumFractionDigits)}%`
}

function toBigIntValue(value: string | number | bigint | null | undefined) {
  if (value === null || value === undefined) return null
  if (typeof value === 'bigint') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null
    return BigInt(Math.trunc(value))
  }

  const normalized = value.trim()
  if (!/^[-]?\d+$/.test(normalized)) return null
  return BigInt(normalized)
}

function formatScaledBigInt(
  value: bigint,
  divisor: bigint,
  maximumFractionDigits: number,
) {
  const negative = value < 0n
  const absolute = negative ? -value : value
  const fractionDigits = Math.max(0, Math.trunc(maximumFractionDigits))
  const scale = 10n ** BigInt(fractionDigits)
  const scaled = (absolute * scale + divisor / 2n) / divisor
  const whole = scaled / scale
  const fraction = scaled % scale

  if (fractionDigits === 0) {
    return `${negative ? '-' : ''}${whole.toString()}`
  }

  return `${negative ? '-' : ''}${whole.toString()}.${fraction
    .toString()
    .padStart(fractionDigits, '0')}`
}

export function formatKasBillionsFromSompi(
  value: string | number | bigint | null | undefined,
  maximumFractionDigits = 2,
) {
  const parsed = toBigIntValue(value)
  if (parsed === null) return '—'

  return `${formatScaledBigInt(
    parsed,
    100_000_000_000_000_000n,
    maximumFractionDigits,
  )}B`
}

export function formatKasBillions(
  value: string | number | bigint | null | undefined,
  maximumFractionDigits = 2,
) {
  const parsed = toBigIntValue(value)
  if (parsed === null) return '—'

  return `${formatScaledBigInt(
    parsed,
    1_000_000_000n,
    maximumFractionDigits,
  )}B`
}

export function formatPercentFromBigInt(
  part: string | number | bigint | null | undefined,
  total: string | number | bigint | null | undefined,
  maximumFractionDigits = 2,
) {
  const partValue = toBigIntValue(part)
  const totalValue = toBigIntValue(total)
  if (partValue === null || totalValue === null || totalValue <= 0n) return '—'

  const fractionDigits = Math.max(0, Math.trunc(maximumFractionDigits))
  const scale = 10n ** BigInt(fractionDigits)
  const scaled = (partValue * 100n * scale + totalValue / 2n) / totalValue
  const whole = scaled / scale
  const fraction = scaled % scale

  if (fractionDigits === 0) {
    return `${whole.toString()}%`
  }

  return `${whole.toString()}.${fraction.toString().padStart(fractionDigits, '0')}%`
}
