import { dayLabel, localDayKey } from './date'

// Built from local-time parts so the tests hold in any time zone.
const local = (...parts: [number, number, number, number?, number?]) => {
  const [y, m, d, h = 12, min = 0] = parts
  return new Date(y, m - 1, d, h, min).toISOString()
}

describe('dayLabel', () => {
  const now = new Date(local(2026, 10, 12, 9))

  it('labels today and yesterday by calendar day, not 24h windows', () => {
    expect(dayLabel(local(2026, 10, 12, 0, 1), now)).toBe('Today')
    expect(dayLabel(local(2026, 10, 11, 23, 59), now)).toBe('Yesterday')
    expect(dayLabel(local(2026, 10, 11, 0, 0), now)).toBe('Yesterday')
  })

  it('falls back to the full date', () => {
    expect(dayLabel(local(2026, 10, 5), now)).toBe('Mon, 5 Oct 2026')
  })

  it('handles month boundaries', () => {
    expect(dayLabel(local(2026, 9, 30), new Date(local(2026, 10, 1)))).toBe('Yesterday')
  })
})

describe('localDayKey', () => {
  it('groups times on the same local day', () => {
    expect(localDayKey(local(2026, 10, 5, 0, 5))).toBe(localDayKey(local(2026, 10, 5, 23, 55)))
  })
})
