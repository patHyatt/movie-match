# Movie-Match

## Project Overview

Movie-Match is a collaborative movie recommendation tool that scrapes IMDB watchlists from multiple users and identifies the most popular movies to help groups decide what to watch together.

## Development Commands

### Build and Run
```bash
# Build the project
npm run build     # Compiles TypeScript to JavaScript (outputs to dist/)

# Run via npm scripts
npm run scrape    # Compiles and runs the IMDB scraper
npm run analyze   # Compiles and runs the movie analysis
npm test          # Compiles and runs unit tests

# Run via CLI (after npm link)
movie-match scrape    # Scrape IMDB watchlists
movie-match analyze   # Analyze and show top movies
```

### Project Structure
```
src/
├── models.ts           # Type definitions (User, MovieCount)
├── cli.ts              # CLI entry point with command routing
├── repositories/
│   └── user-repository.ts  # Repository pattern for database access
├── scraping/
│   └── imdb.ts         # Puppeteer-based IMDB watchlist scraper (exports runScraper)
├── analysis.ts         # Movie aggregation and top-N recommendation logic
└── heap.ts             # Max-heap data structure for finding top movies

test/
└── heap.test.ts        # Unit tests for heap implementation

config.json             # IMDB user IDs configuration (gitignored)
config.example.json     # Template for configuration
db.json                 # Scraped data (gitignored)
```

## Architecture

### Data Flow
1. **Configuration**:
   - User IDs loaded from `config.json` (format: `{ "scraping": { "imdb": { "ids": ["ur123..."] } } }`)
   - Template available in `config.example.json`

2. **Scraping Phase** (`movie-match scrape` or `npm run scrape`):
   - Launches Puppeteer headless browser
   - Scrapes watchlists from IMDB user IDs in `config.json`
   - Extracts movie titles from page elements (`button.ipc-rate-button`)
   - Uses `UserRepository` to persist data to `db.json`

3. **Analysis Phase** (`movie-match analyze` or `npm run analyze`):
   - Loads user watchlists via `UserRepository`
   - Aggregates movies across all users into a `Map<string, MovieCount>`
   - Builds a max-heap to efficiently find top N movies by user count
   - Outputs top 3 movies, marking unanimous choices

### Key Components

**CLI (`cli.ts`)**
- Entry point for the `movie-match` command
- Routes to scraper or analysis based on command argument
- Installed via npm bin, accessible globally after `npm link`

**Repository Pattern (`user-repository.ts`)**
- Abstracts database access using lowdb
- Provides methods: `getAll()`, `findById()`, `create()`, `update()`, `updateWatchlist()`, `delete()`, `save()`
- Returns defensive copies to prevent external mutation
- Enables dependency injection for testing

**Database (lowdb)**
- Stores data in `db.json` (gitignored)
- Schema: `{ users: User[] }` where `User = { id, name, watchlist: string[] }`
- No migrations needed; simple JSON persistence

**Heap Implementation**
- Custom max-heap in `heap.ts` prioritizes movies by user count
- Used for efficient top-N selection without full sorting
- Fully implemented with `heapUp()`, `heapDown()`, `push()`, and `pop()` methods
- Tested with comprehensive unit tests

**Web Scraping**
- Uses Puppeteer with custom User-Agent to avoid bot detection
- Cheerio for HTML parsing after page load
- Viewport set to 1080x1024 for consistent rendering

### Important Technical Details

- **ES Modules**: Project uses `"type": "module"` in package.json
- **Import Extensions**: When importing compiled JS, use `.js` extension even in `.ts` files (e.g., `import { TopMovieHeap } from './heap.js'`)
- **Strict TypeScript**: Enabled with `forceConsistentCasingInFileNames`
- **Target**: ES2022 with Node module resolution
- **Output Structure**: TypeScript preserves source structure in `dist/` (e.g., `dist/src/`, `dist/test/`)
- **Module Detection**: Uses `fileURLToPath` and `resolve` for cross-platform main module detection
- **Testing**: Node.js built-in test runner (no external dependencies)

### Configuration

User IDs are configured in `config.json` (not committed to git). Structure:
```json
{
  "scraping": {
    "imdb": {
      "ids": ["ur117462831", "ur22654354", "ur27661388"]
    }
  }
}
```

### Error Handling

- **Database errors**: Caught and logged with helpful messages
- **Config errors**: Clear messages if `config.json` is missing or malformed
- **Empty data**: Graceful handling of empty watchlists or no users
- **Invalid titles**: Skips empty or whitespace-only movie titles
