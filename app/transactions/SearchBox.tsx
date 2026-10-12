'use client'
import { useEffect, useEffectEvent, useState } from 'react'
import { Input } from '@/components/ui'
import { useDebouncedValue } from '@/lib/useDebouncedValue'

const DEBOUNCE_MS = 300

export interface SearchBoxProps {
  /** The committed search, from the URL. */
  value: string
  onCommit: (q: string) => void
  className?: string
}

/**
 * Search input that commits after typing pauses, on Enter, or immediately when cleared.
 * Typing stays local, so keystrokes are instant and only settled searches reach the URL and API.
 */
export function SearchBox({ value, onCommit, className }: SearchBoxProps) {
  const [draft, setDraft] = useState(value)
  const [prevValue, setPrevValue] = useState(value)
  const debounced = useDebouncedValue(draft, DEBOUNCE_MS)

  // The URL changed. Unless it's the echo of our own debounced commit (the user may have typed on
  // since), it changed from outside, via Back or Clear filters, so show the new value.
  if (value !== prevValue) {
    setPrevValue(value)
    if (value !== debounced.trim() && value !== draft.trim()) setDraft(value)
  }

  const commit = (next: string) => {
    const q = next.trim()
    if (q !== value) onCommit(q)
  }
  const commitDebounced = useEffectEvent(commit)
  useEffect(() => commitDebounced(debounced), [debounced])

  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault()
        commit(draft)
      }}
    >
      <Input
        label="Search"
        type="search"
        enterKeyHint="search"
        leadingIcon="search"
        placeholder="Search by reference, name or narration"
        autoComplete="off"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          if (!e.target.value) commit('')
        }}
      />
    </form>
  )
}
