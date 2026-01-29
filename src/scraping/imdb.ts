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
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
    } catch (error) {
        console.error('Error launching browser:', error);
        console.error('Please ensure Chromium is installed correctly.');
        throw error;
    }

    const page = await browser.newPage();
    
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299');

        for (const id of ids) {
            try {
                console.log('Scraping watchlist for user:', id);
                
                // Navigate the page to a URL with timeout
                await page.goto(`https://www.imdb.com/user/${id}/watchlist/`, {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });
                
                // Set screen size.
                await page.setViewport({ width: 1080, height: 1024 });

                const content = await page.content();
                const $ = cheerio.load(content);

                let current = await userRepository.findById(id);
                if (!current) {
                    const name = $('a[data-testid="list-author-link"]').first().text() || '(Anonymous)';
                    current = await userRepository.create({ id: id, name: name, watchlist: [] });
                }

                const watchlist: string[] = [];
                const buttons = $('button.ipc-rate-button');
                
                if (buttons.length === 0) {
                    console.warn(`No movies found for user ${id}. The page structure may have changed or the watchlist is empty.`);
                }
                
                buttons.each((_, el) => {
                    try {
                        const ariaLabel = $(el).attr('aria-label');
                        if (ariaLabel && ariaLabel.startsWith('Rate ')) {
                            const title = ariaLabel.substring(5);
                            if (title && title.trim() !== '') {
                                watchlist.push(title);
                                console.log('  -', title);
                            }
                        }
                    } catch (error) {
                        console.warn(`Error extracting movie title:`, error);
                    }
                });

                try {
                    await userRepository.updateWatchlist(id, watchlist);
                    console.log(`Successfully scraped ${watchlist.length} movies for user ${id}`);
                } catch (error) {
                    console.error(`Error updating watchlist for user ${id}:`, error);
                    throw error;
                }
            } catch (error) {
                console.error(`Error scraping user ${id}:`, error);
                // Continue with next user instead of failing completely
                continue;
            }
        }

        try {
            await userRepository.save();
            console.log('Database saved successfully');
        } catch (error) {
            console.error('Error saving database:', error);
            throw error;
        }
    } finally {
        // Always attempt to close the browser
        try {
            await browser.close();
        } catch (error) {
            console.error('Error closing browser:', error);
        }
    }
}

// Allow running directly (check if this file is the entry point)
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const isMainModule = process.argv[1] &&
    fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isMainModule) {
    await runScraper();
}