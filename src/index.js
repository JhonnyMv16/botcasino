const utils = require('./utils.js')
const actions = require('./actions.js')
const vars = require('./vars.js')
const fs = require('fs');
const puppeteer = require('puppeteer');

if (!fs.existsSync('screenshots')){
    fs.mkdirSync('screenshots');
}

async function printScreen(page, path) {
    if (vars.enablePrint) {
        await page.screenshot({ path: path });
        console.log('print -> ', path)
    }
}

async function createBrowser() {
    return await puppeteer.launch();
}

async function saveCookies(page) {
    try {
        const cookies = await page.cookies();
        fs.writeFileSync(vars.exportFiles.cookies, JSON.stringify(cookies, null, 2));
        console.log('Cookies salvos -> ', cookies.length)
    }catch(e) {
        console.log('Não foi possível salvar os cookies')
        console.error(e.message)
    }
}

function readCookies() {
    try {
        return fs.readFileSync('cookies.json', 'utf-8')
    } catch (e) {
        console.log('Não foi possível ler os cookies')
        console.error(e.message)
        return []
    }
}

async function createPage(browser) {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders(vars.headers);
    await page.setUserAgent(vars.userAgent);
    await page.setViewport(vars.viewPort);
    return page
}

async function goToHome(page) {
    console.log('Starting...')
    await page.goto(vars.HOME_URL);
    await utils.sleep(5000)
    console.log('Home opened!')
    await printScreen(page, vars.screenshots.home)
}  

async function doLogin(page) {
    console.log('Starting login...')
    let loginLinks = await page.$$('.hm-MainHeaderRHSLoggedOutWide_Login ')

    if (loginLinks.length !== 1) {
        console.error('Links de logins -> ', loginLinks.length)
        printScreen(page, vars.screenshots.error)
        process.exit(0)
    }

    await loginLinks[0].click()
    await utils.sleep(2000)

    let inputs = await page.$$('input')
    if (inputs.length <= 1) {
        console.error('Inputs de login-> ', inputs.length)
        printScreen(page, vars.screenshots.error)
        process.exit(0)
    }

    await printScreen(page, vars.screenshots.form)
    await page.type('.lms-StandardLogin_Username ', vars.login.username)
    await utils.sleep(1000)
    await page.type('.lms-StandardLogin_Password ', vars.login.password)
    await utils.sleep(1000)

    await printScreen(page, vars.screenshots.form_fill)
    await page.click('.lms-LoginButton ')
    await utils.sleep(15000)
    await saveCookies(page)

    console.log('Login realized!')
    await printScreen(page, vars.screenshots.login_complete)
}

// maximizar
// inline-games-page-component__game-header-right 

// Criador de apostas

// Aba de Roletas
// lobby-category-item__wrapper [1]

// Cada roleta
// lobby-tables__item
// roulette-history...$31d21d2 > roulette-history-item_4343432

async function goToCasinoLive(page) {
    console.log('Opening casino live...')
    await page.goto('https://casino.bet365.com/Play/LiveRoulette')
    await page.waitForXPath('//*[contains(text(), "Live Roulette ")]', { timeout: 0 })
    await utils.sleep(20000)

    console.log('Casino opened!')
    await printScreen(page, vars.screenshots.casino_home)
}

async function closeCasinoLive(page) {
    let frames = await page.frames()
    let rouletteFrame = frames.find(f => f.url() === 'https://casino.bet365.com/Play/LiveRoulette')

    if (!rouletteFrame) {
        console.error('Frame roulette live not found')
        process.exit(0)
    } else {
        console.log('Frame roulette found')
    }

    let gamingFrame = rouletteFrame.childFrames().find(f => f.url().includes('https://www.sgla365.com/GamingLaunch'))

    if (!gamingFrame) {
        console.error('Frame gaming launch not found')
        process.exit(0)
    } else {
        console.log('Frame gaming launch found')

        let hasCloseButton = await gamingFrame.$$('.close-button__icon').length > 0
        console.log('gaming launch has close button? ', hasCloseButton)
    }

    let casinoFrame = gamingFrame.childFrames().find(f => f.name() === 'gamecontent')

    if (!casinoFrame) {
        console.error('Frame casino client not found')
        process.exit(0)
    } else {
        console.log('Frame casino client found')
    }

    let buttons = await casinoFrame.$$('.close-button__icon')

    if (buttons.length !== 1) {
        console.error('links de close -> ', buttons.length)

        try {
            let gamingContent = await gamingFrame.content()
            fs.writeFileSync('gaming-frame.html', gamingContent)
         } catch(e) {
             console.log('Fail to get gaming frame html content')
             console.log(e.message)
        }

        try {
            let frameContent = await casinoFrame.content()
            fs.writeFileSync('casino-frame.html', frameContent)
         } catch(e) {
             console.log('Fail to get casino client frame html content')
             console.log(e.message)
        }

        process.exit(0)
    }

    await casinoFrame.click('.close-button__icon')
    await utils.sleep(2000)
    await printScreen(page, vars.screenshots.games_home)
}

async function start() {
    const browser = await createBrowser()
    const page = await createPage(browser)

    await goToHome(page)
    await doLogin(page)
    await goToCasinoLive(page)
    await closeCasinoLive(page)
    await actions.clickRouletteTab(page)

    let tables = actions.retrieveTables(page)
    findTablesToBet(tables)


    await browser.close()
}

start();