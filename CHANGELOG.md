# Changelog

## [1.2.0] - 2026-01-01

### Added
- **Real-Time Statistics Updates**: Network stats (block height, difficulty, connections, chain) now update automatically every 5 seconds without requiring page refresh
- **Real-Time Recent Blocks Display**: Recent blocks table updates every 5 seconds to show new blocks as they are mined
- **Mobile Responsive Design**:
  - Added CSS media queries for tablets (768px breakpoint)
  - Added CSS media queries for mobile phones (480px breakpoint)
  - Touch-friendly UI elements
  - Responsive font sizing
  - Horizontally scrollable tables on mobile devices
- **Search Bar Security & Validation**:
  - Client-side validation: Search button disabled until user enters text
  - Server-side validation: Blocks empty search queries
  - Input length limit: Maximum 128 characters
  - Prevents injection attacks with proper input sanitization
  - Graceful error messages for invalid queries
  - Supports block heights (0-999999999) and hash lookups (64 hex chars)

### Changed
- Updated `/api/blocks/:n` endpoint documentation
- Enhanced homepage with real-time data updates
- Improved search form UX with visual feedback
- Reorganized API endpoint table in README

### Technical Details
- Auto-refresh intervals set to 5 seconds for stats and blocks
- Uses existing `/api/info` endpoint for stats refresh
- Uses existing `/api/blocks/10` endpoint for recent blocks
- Client-side rendering of updated data preserves interactivity

### Performance
- Client-side updates avoid full page reload
- Efficient DOM manipulation with querySelectorAll
- Error handling for failed API calls

---

## [1.1.0] - Previous Release

- Initial block explorer implementation
- Basic wallet API
- Transaction broadcasting
- Address lookup

---

*Version 1.2.0 deployed to production at https://tetsuoarena.com*
