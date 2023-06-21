import puppeteer from 'puppeteer-core';
import { KnownDevices, Page, Browser, CDPSession } from 'puppeteer-core';
import * as fs from 'node:fs';
import * as url from 'node:url';

/** 
 * Main - Spin up Chromium and attach a debug session 
 */
(async () => {
  const browser = await puppeteer.launch({ headless: "new", executablePath: process.env.PUPPETEER_EXECUTABLE_PATH });
  // https://stackoverflow.com/questions/50884499/how-can-i-include-mobile-device-details-in-headers-when-making-a-request
  // https://github.com/puppeteer/puppeteer/blob/main/docs/api/puppeteer.knowndevices.md
  const device = KnownDevices['iPhone 11'];
  
  const page = await browser.newPage();
  await page.emulate(device);

  const session = await page.target().createCDPSession();
  
  await captureArchive(page, session, 'https://www.theverge.com');
  await page.close();  
  await browser.close();
})();

/**
 * Capture the page as MHTML and above-the-fold thumbnail 
 */
async function captureArchive(page: Page, session: CDPSession, url: string) {
  //await session.send('Page.enable');
  await page.goto(url);
  const parsedUrl = new URL(url);
  
  //Capture a square thumbnail screenshot
  await page.screenshot({ path: `${parsedUrl.hostname}.png` }); //, clip: { height: device.viewport.width, width: device.viewport.width, x: 0, y: 0 } 
  // await page.screenshot({ path: `${normalizeUrlToFilename(url)}.png` }); //, clip: { height: device.viewport.width, width: device.viewport.width, x: 0, y: 0 } 

  // Scroll to end to trigger lazy-load images
  await autoScroll(page);

  // https://github.com/puppeteer/puppeteer/issues/3575#issuecomment-447258318
  // https://vanilla.aslushnikov.com/?Page.captureSnapshot
  const { data } = await session.send('Page.captureSnapshot');  
  fs.writeFileSync(`${parsedUrl.hostname}.mht`, data);
}

/**
 * TODO - design filesystem layout 
 */
function normalizeUrlToFilename(url: string): string {
// Replace all characters that are not a-z nor 0-9 with _
const parsedUrl = new URL(url);
  const disallowed = /[^a-z0-9]/ig;
  return url.replaceAll(disallowed, '_');
}

/**
 * Scroll the entire page to trigger lazy-load images 
 */
async function autoScroll(page: Page) {
// https://stackoverflow.com/questions/51529332/puppeteer-scroll-down-until-you-cant-anymore
await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}