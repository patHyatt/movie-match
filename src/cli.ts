#!/usr/bin/env node

import { Analysis } from './analysis.js';
import { runScraper } from './scraping/imdb.js';

const command = process.argv[2];

async function main() {
    switch (command) {
        case 'scrape':
            await runScraper();
            break;
        case 'analyze':
            const analysis = new Analysis();
            await analysis.run();
            break;
        default:
            console.log('Usage: movie-match <scrape|analyze>');
            console.log('');
            console.log('Commands:');
            console.log('  scrape    Scrape IMDB watchlists from configured user IDs');
            console.log('  analyze   Analyze scraped data and show top movies');
            process.exit(1);
    }
}

main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
