import * as cheerio from 'cheerio';
import { readFile } from 'fs/promises';
import puppeteer from 'puppeteer';

import { UserRepository } from '../repositories/user-repository.js';

export async function runScraper(): Promise<void> {
    const userRepository = new UserRepository();

    // Load IMDB user IDs from config file
    let ids: string[];
    try {
        const configFile = await readFile('config.json', 'utf-8');
        const config = JSON.parse(configFile);
        ids = config.scraping?.imdb?.ids || [];

        if (ids.length === 0) {
            console.error('No IMDB user IDs found in config.json');
            process.exit(1);
        }
    } catch (error) {
        console.error('Error loading config.json:', error);
        console.error('Please create a config.json file with the format: { "scraping": { "imdb": { "ids": ["ur123...", "ur456..."] } } }');
        process.exit(1);
    }

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299');

    for (const id of ids) {
        // Navigate the page to a URL.
        await page.goto(`https://www.imdb.com/user/${id}/watchlist/`);
        // Set screen size.
        await page.setViewport({ width: 1080, height: 1024 });

        const content = await page.content();
        const $ = cheerio.load(content);

        let current = await userRepository.findById(id);
        if (!current) {
            const name = $('a[data-testid="list-author-link"]').first().text() || '(Anonymous)';
            current = await userRepository.create({ id: id, name: name, watchlist: [] });
        }

        console.log('id:', id);
        const watchlist: string[] = [];
        $('button.ipc-rate-button')
            .each((_, el) => {
                const element = $(el);
                const ariaLabel = element.attr('aria-label');
                if (ariaLabel && ariaLabel.length > 5) {
                    const title = ariaLabel.substring(5).trim();
                    if (title) {
                        watchlist.push(title);
                        console.log(title);
                    }
                }
            });

        await userRepository.updateWatchlist(id, watchlist);
    }

    await userRepository.save();

    await browser.close();
}

// Allow running directly (check if this file is the entry point)
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const isMainModule = process.argv[1] &&
    fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMainModule) {
    await runScraper();
}