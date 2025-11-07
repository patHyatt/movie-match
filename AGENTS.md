# Movie-Match

## Project Overview

Movie-Match is a collaborative movie recommendation tool that scrapes IMDB watchlists from multiple users and identifies the most popular movies to help groups decide what to watch together.

## Development Commands

### Build and Run
```bash
# Compile TypeScript to JavaScript (outputs to dist/)
npm run scrape    # Compiles and runs the IMDB scraper
npm run analyze   # Compiles and runs the movie analysis

# Manual compilation
tsc               # Compiles all .ts files to dist/
```

### Project Structure
```
src/
├── models.ts           # Type definitions (User, MovieCount)
├── scraping/
│   └── imdb.ts        # Puppeteer-based IMDB watchlist scraper
├── analysis.ts        # Movie aggregation and top-N recommendation logic
└── heap.ts            # Max-heap data structure for finding top movies
```

## Architecture

### Data Flow
1. **Scraping Phase** (`npm run scrape`):
   - Launches Puppeteer headless browser
   - Scrapes watchlists from hardcoded IMDB user IDs in `src/scraping/imdb.ts`
   - Extracts movie titles from page elements (`button.ipc-rate-button`)
   - Persists to `db.json` using lowdb (JSON file database)

2. **Analysis Phase** (`npm run analyze`):
   - Loads user watchlists from `db.json`
   - Aggregates movies across all users into a `Map<string, MovieCount>`
   - Builds a max-heap to efficiently find top N movies by user count
   - Outputs top 3 movies, marking unanimous choices

### Key Components

**Database (lowdb)**
- Stores data in `db.json` (gitignored)
- Schema: `{ users: User[] }` where `User = { id, name, watchlist: string[] }`
- No migrations needed; simple JSON persistence

**Heap Implementation**
- Custom max-heap in `heap.ts` prioritizes movies by user count
- Used for efficient top-N selection without full sorting
- **Note**: Currently has incomplete `heapDown()` implementation

**Web Scraping**
- Uses Puppeteer with custom User-Agent to avoid bot detection
- Cheerio for HTML parsing after page load
- Viewport set to 1080x1024 for consistent rendering

### Important Technical Details

- **ES Modules**: Project uses `"type": "module"` in package.json
- **Import Extensions**: When importing compiled JS, use `.js` extension even in `.ts` files (e.g., `import { TopMovieHeap } from './heap.js'`)
- **Strict TypeScript**: Enabled with `forceConsistentCasingInFileNames`
- **Target**: ES2022 with Node module resolution

### Known Issues

1. **Bug in analysis.ts:22**: Map key is hardcoded as `'title'` instead of variable `title`
2. **Incomplete heap.ts**: `heapDown()` method has no implementation (empty while loop)
3. **Logic error in heap.pop()**: Incorrect element removal order causes heap corruption

See `todo.local.md` for detailed issue tracking.
