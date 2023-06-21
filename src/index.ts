import puppeteer from 'puppeteer-core';
import { KnownDevices, ScreenshotClip } from 'puppeteer-core';
import * as fs from 'fs';

(async () => {
  // https://stackoverflow.com/questions/50884499/how-can-i-include-mobile-device-details-in-headers-when-making-a-request
  // https://github.com/puppeteer/puppeteer/blob/main/docs/api/puppeteer.knowndevices.md
  const device = KnownDevices['iPhone 11'];
  
  const browser = await puppeteer.launch({ headless: "new", executablePath: process.env.PUPPETEER_EXECUTABLE_PATH });
  const page = await browser.newPage();
  await page.emulate(device);

  await page.goto('https://theverge.com');
  const session = await page.target().createCDPSession();
  await session.send('Page.enable');

  //Capture a square thumbnail screenshot
  await page.screenshot({ path: "thumbnail.png", clip: { height: device.viewport.width, width: device.viewport.width, x: 0, y: 0 } });

  // Scroll to end to trigger lazy-load images
  await autoScroll(page);

  const { data } = await session.send('Page.captureSnapshot');  
  fs.writeFileSync('capture.mht', data);

  await browser.close();
})();



async function autoScroll(page) {
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