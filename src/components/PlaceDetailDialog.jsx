import { useEffect, useRef } from 'react'
import LocationDetails from './LocationDetails'

export default function PlaceDetailDialog({ place, onClose, onCompare }) {
  const closeRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!place) return undefined

    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [place])

  if (!place) return null

  return (
    <div
      className="detail-dialog"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="detail-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${place.name} details`}
      >
        <button
          ref={closeRef}
          type="button"
          className="detail-dialog__close"
          onClick={onClose}
          aria-label="Close details"
        >
          <span aria-hidden="true">×</span>
        </button>
        <LocationDetails place={place} onCompare={onCompare} />
      </div>
    </div>
  )
}
