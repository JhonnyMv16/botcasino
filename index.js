const fs = require('fs');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const enablePrint = true

const screenshots = {
    home: 'screenshots/home.png'
}

const login = {
    username: 'magnoramos23',
    password: 'Timao@12345'
}

const headers = { 'Accept-Language': 'en' }
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'

const HOME_URL = 'https://www.bet365.com/#/HO/'

const exportFiles = {
    cookies: './cookies.json'
}

if (!fs.existsSync('screenshots')){
    fs.mkdirSync('screenshots');
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

function openHome() {
    (async () => {

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setExtraHTTPHeaders(headers);
        await page.setUserAgent(userAgent);
        await page.setDefaultTimeout(1000000)
    
        const cookies = await page.cookies();
        fs.writeFileSync(exportFiles.cookies, JSON.stringify(cookies, null, 2));
    
        await page.setViewport({
            width: 1280,
            height: 960,
            deviceScaleFactor: 1,
        });
        await page.goto(HOME_URL);

        await sleep(2000)
    
        // click login
        let loginLinks = await page.$$('.hm-MainHeaderRHSLoggedOutWide_Login ')
        if (loginLinks.length === 1) {
            await loginLinks[0].click()
        } else {
            console.error('Links de logins -> ', loginLinks.length)
            process.exit()
        }

        await sleep(2000)

        // type username and password
        let inputs = await page.$$('input')

        if (inputs.length === 0) {
            console.error('Inputs de login não encontrados')
            process.exit()
        }

        await page.type('.lms-StandardLogin_Username ', login.username)
        await page.type('.lms-StandardLogin_Password ', login.password)
        await page.click('.lms-LoginButton ')
        await page.waitForNavigation()

        await sleep(2000)

        await page.goto('https://casino.bet365.com/Play/LiveRoulette')

        await sleep(30000)

        // close button

        if (enablePrint) {
            await page.screenshot({ path: screenshots.home });
        }

        let buttons = await page.$$('.close-button__icon')

        if (buttons.length === 1) {
            await sleep(2000)
            if (enablePrint) {
                await page.screenshot({ path: screenshots.home });
            }
        } else {
            console.log('links de close -> ', buttons.length)
        }
      
        await browser.close();
    })();
}


openHome()