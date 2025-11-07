import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

import { JSONFilePreset } from 'lowdb/node';
import { User } from '../models';

const defaultData: { users: User[] } = { users: [] };
const db = await JSONFilePreset('db.json', defaultData);
const { users } = db.data;


const ids = [
    'ur117462831',
    'ur22654354',
    'ur27661388'
]

// Launch the browser and open a new blank page
const browser = await puppeteer.launch(
    {
        headless: true,
    }
);
const page = await browser.newPage();
await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299');

for (const id of ids) {
    // Navigate the page to a URL.
    await page.goto(`https://www.imdb.com/user/${id}/watchlist/`);
    // Set screen size.
    await page.setViewport({ width: 1080, height: 1024 });

    const content = await page.content();
    const $ = cheerio.load(content);

    let current = users.find((user) => user.id === id);
    if (!current) {
        const name = $('a[data-testid="list-author-link"]').first().text() || '(Anonymous)';
        await db.update(({ users }) => users.push({ id: id, name: name, watchlist: [] }));
        current = users.find((user) => user.id === id);
    }

    console.log('id:', id);
    const watchlist: string[] = [];
    $('button.ipc-rate-button')
        .each((_, el) => {
            const title = $(el)!
                .attr('aria-label')!
                .substring(5);
            watchlist.push(title);
            console.log(title)
        });

    current!.watchlist = watchlist;
}

await db.write();

await browser.close();