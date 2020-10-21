const playwright = require('playwright');
const fs = require('fs');

const url = "https://www.supremenewyork.com/checkout";
const sitekey = "6LeWwRkUAAAAAOBsau7KpuC9AV-6J8mhw4AjC3Xz"
const body = fs.readFileSync('public/captcha.html', 'utf-8').replace("{sitekey}", sitekey);

(async () => {
    const browser = await playwright["webkit"].launch({headless: false});
    const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/12.0 Mobile/15A372 Safari/604.1",
        viewport: {width:500, height:700},
        locale: "en-US"
    });
    const page = await context.newPage();

    await page.exposeFunction('recaptchaCallback', async data => {
        console.log({"g-recaptcha-response": data});
        await page.evaluate(() => {window.grecaptcha.reset()})
    });

    await page.route('**', route => {
        if (route.request().url() === url) {
            route.fulfill({
                status: 200,
                contentType: 'text/html',
                body: body
            });
        } else {
            route.continue();
        }
    });

    await page.goto(url);
})();