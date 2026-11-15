export default function SearchBar({ value, onChange, resultCount, totalCount }) {
  return (
    <div className="search-bar">
      <label className="search-bar__label" htmlFor="mars-search">
        Search Mars locations
      </label>
      <div className="search-bar__field">
        <svg
          className="search-bar__icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 16l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          id="mars-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Try “crater”, “volcano” or “Jezero”"
          autoComplete="off"
        />
        {value ? (
          <button
            type="button"
            className="search-bar__clear"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            ×
          </button>
        ) : null}
      </div>
      <p className="search-bar__meta" aria-live="polite">
        {resultCount} of {totalCount} locations
      </p>
    </div>
  )
}
