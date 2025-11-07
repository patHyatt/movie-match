# Movie-Match

A collaborative movie recommendation tool that scrapes IMDB watchlists from multiple users and identifies the most popular movies to help groups decide what to watch together.

## Purpose

Choosing a movie to watch with friends or family can be challenging when everyone has different preferences. Movie-Match solves this problem by:

- Scraping IMDB watchlists from multiple users
- Aggregating movies across all watchlists
- Finding the most popular movies (appearing on the most watchlists)
- Highlighting unanimous choices that everyone wants to watch

Perfect for movie nights, watch parties, or any group trying to find common ground!

## Usage

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd movie-match

# Install dependencies
npm install

# Build the project
npm run build

# Link the CLI globally (one-time setup)
npm link
```

### Configuration

Create a `config.json` file in the project root (use `config.example.json` as a template):

```json
{
  "scraping": {
    "imdb": {
      "ids": [
        "ur117462831",
        "ur22654354",
        "ur27661388"
      ]
    }
  }
}
```

Replace the IDs with the IMDB user IDs you want to scrape. You can find IMDB user IDs in the URL of a user's watchlist (e.g., `https://www.imdb.com/user/ur12345678/watchlist/`).

The user ids **MUST** be publicly visible in order to scrape their watchlist.

### Running the Tool

```bash
# Scrape IMDB watchlists
movie-match scrape

# Analyze the data and see top movies
movie-match analyze
```

### Output

The analyze command will show the top 3 movies by popularity:

```
Top 3 Movies:

*UNANIMOUS* The Matrix Wanted by 3 people
Inception Wanted by 2 people
Interstellar Wanted by 2 people
```

Movies marked as `*UNANIMOUS*` appear on everyone's watchlist!

## Developer Use

### Prerequisites

- Node.js 18+ (for ES modules and native test runner)
- npm

### Project Structure

```
src/
├── analysis.ts           # Movie aggregation and top-N recommendation logic
├── heap.ts              # Max-heap data structure for efficient top-N selection
├── models.ts            # TypeScript type definitions
├── cli.ts               # CLI entry point
├── repositories/
│   └── user-repository.ts  # Database access layer
└── scraping/
    └── imdb.ts          # Puppeteer-based IMDB scraper

test/
└── heap.test.ts         # Unit tests for heap implementation

config.json              # IMDB user IDs (gitignored)
config.example.json      # Template for configuration
db.json                  # Scraped data (gitignored)
```

### Development Commands

```bash
# Build TypeScript to JavaScript
npm run build

# Run tests
npm test

# Run scraper directly (without CLI)
npm run scrape

# Run analysis directly (without CLI)
npm run analyze
```

### Tech Stack

- **TypeScript** - Type-safe development
- **Puppeteer** - Headless browser for web scraping
- **Cheerio** - HTML parsing
- **lowdb** - Simple JSON file database
- **Node.js native test runner** - Zero-dependency testing

### Architecture

1. **Scraping Phase**: Launches headless Chrome, navigates to IMDB watchlists, extracts movie titles, stores in `db.json`
2. **Analysis Phase**: Loads user data, aggregates movies using a Map, uses a max-heap to efficiently find top N movies by popularity
3. **Repository Pattern**: Abstracts database access for better testability and maintainability

### Adding Features

The codebase uses a repository pattern for database access. To add new features:

1. **Add new scraper**: Create a new file in `src/scraping/` and export a function
2. **Extend analysis**: Modify `Analysis` class in `src/analysis.ts`
3. **Update CLI**: Add new commands in `src/cli.ts`
4. **Add tests**: Create test files in `test/` directory

### Running Tests

```bash
npm test
```

Tests use Node.js's built-in test runner (no external dependencies). Currently covers the heap data structure implementation.

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests to ensure nothing breaks
5. Submit a pull request

## License

MIT

---