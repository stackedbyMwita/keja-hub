'use client'

import { Search, X } from 'lucide-react'
import { useRef } from 'react'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClear = () => {
    onSearchChange('')
    inputRef.current?.focus()
  }

  return (
    <div className="group relative w-full max-w-md mx-auto transition-all duration-300 ease-in-out">
      {/* Search Icon (Changes color on focus) */}
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300 peer-focus:text-primary z-10" />
      
      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Search by location or property name..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="peer w-full h-10 pl-10 pr-10 rounded-full border border-border/60 bg-muted/40 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-all duration-300 focus:outline-none focus:bg-background focus:border-primary/50 focus:ring-[3px] focus:ring-primary/10 hover:border-border"
      />

      {/* Clear Button (Only visible when there's text) */}
      <div 
        className={`absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-200 ${
          searchQuery.length > 0 ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={handleClear}
          className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}