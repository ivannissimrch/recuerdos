'use client'

import { useState } from 'react'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { Grid } from '@giphy/react-components'
import type { IGif } from '@giphy/js-types'

interface GifPickerProps {
  onSelectGif: (gifUrl: string) => void
  onClose: () => void
}

/**
 * ===================================
 * GIF PICKER COMPONENT WITH GIPHY SDK
 * ===================================
 *
 * This component demonstrates how to integrate the Giphy SDK into your React app.
 *
 * KEY CONCEPTS YOU'LL LEARN:
 *
 * 1. **SDK Integration**: How to use external SDKs (Giphy) in Next.js
 * 2. **API Client Setup**: Creating and using the GiphyFetch client
 * 3. **Built-in Components**: Using Giphy's Grid component for optimal UX
 * 4. **Search vs Trending**: Switching between search and trending endpoints
 * 5. **Type Safety**: Using TypeScript with third-party libraries (IGif type)
 *
 * WHY USE THE SDK?
 * - Pre-built components (Grid, Carousel, etc.)
 * - Optimized performance (lazy loading, virtualization)
 * - Type safety with TypeScript
 * - Less code to maintain
 */

export default function GifPicker({ onSelectGif, onClose }: GifPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Initialize Giphy API client
  // This is how you connect to external services using their SDKs
  const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || '')

  /**
   * Fetch function for the Grid component
   *
   * The Grid component needs a function that returns GIFs.
   * We use the ternary operator to decide: search or trending?
   *
   * Parameters explained:
   * - offset: for pagination (load more as you scroll)
   * - limit: how many GIFs to fetch per request
   */
  const fetchGifs = (offset: number) => {
    return searchQuery
      ? gf.search(searchQuery, { offset, limit: 10 })
      : gf.trending({ offset, limit: 10 })
  }

  /**
   * Handle GIF selection
   *
   * The Grid component calls this when user clicks a GIF.
   * We extract the URL and pass it to the parent component.
   */
  const handleGifClick = (gif: IGif, e: React.SyntheticEvent) => {
    e.preventDefault()
    // Use downsized_medium for good quality without huge file size
    onSelectGif(gif.images.downsized_medium.url)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--color-background)] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">

        {/* ========== HEADER ========== */}
        <div className="p-4 border-b-2 border-[var(--color-border)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">
              Buscar GIF
            </h2>
            <button
              onClick={onClose}
              className="text-3xl text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          {/* Search Input - Large for seniors */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Busca GIFs... (ej: feliz, abrazo, amor)"
            className="w-full px-4 py-3 text-lg border-2 border-[var(--color-border)] rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        {/* ========== GIF GRID ========== */}
        <div className="flex-1 overflow-y-auto p-4">
          {/**
           * Giphy Grid Component
           *
           * This is a pre-built component from @giphy/react-components
           *
           * Props explained:
           * - width: sets the grid width (we use full width)
           * - columns: how many columns in the grid
           * - fetchGifs: function that returns GIFs (defined above)
           * - onGifClick: callback when user clicks a GIF
           * - key: React needs this to re-render when search changes
           *
           * COOL FEATURES:
           * - Automatically handles infinite scroll
           * - Lazy loads images for performance
           * - Responsive masonry layout
           * - Built-in loading states
           */}
          <Grid
            width={600}
            columns={2}
            fetchGifs={fetchGifs}
            onGifClick={handleGifClick}
            key={searchQuery} // Re-mount when search changes
          />
        </div>

        {/* ========== FOOTER ========== */}
        <div className="p-3 border-t-2 border-[var(--color-border)] text-center text-sm text-gray-500">
          Powered by GIPHY
        </div>
      </div>
    </div>
  )
}
