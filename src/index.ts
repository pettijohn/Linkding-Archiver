import puppeteer from 'puppeteer-core';
 

(async() => {
  const browser = await puppeteer.launch({headless: "new", executablePath: process.env.PUPPETEER_EXECUTABLE_PATH});
  const page = await browser.newPage();
  await page.goto('https://theverge.com');
  const session = await page.target().createCDPSession();
  await session.send('Page.enable');
  // TODO - scroll to end to trigger lazy-load images
  const {data} = await session.send('Page.captureSnapshot');
  console.log(data);
  await browser.close();
})();