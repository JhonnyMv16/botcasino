"use strict";

const utils = require('./utils.js')
const actions = require('./actions.js')
const betManager = require('./bet_manager.js')
const vars = require('./vars.js')
const fs = require('fs')
const puppeteer = require('puppeteer')

async function createBrowser() {
    return await puppeteer.launch()
}

async function saveCookies(page) {
    try {
        const cookies = await page.cookies();
        fs.writeFileSync(vars.exportFiles.cookies, JSON.stringify(cookies, null, 2));
        console.log('Cookies salvos -> ', cookies.length)
    } catch (e) {
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
    await page.setViewport(vars.viewPort);
    await page.setExtraHTTPHeaders(vars.headers);
    await page.setUserAgent(vars.userAgent);
    return page
}

async function goToHome(page) {
    console.log('Starting...')
    await page.goto(vars.HOME_URL);
    await page.waitForXPath('//*[contains(text(), "Login")]', { timeout: 0 })
    await utils.sleep(5000)
    console.log('Home opened!')
    await actions.printScreen(page)
}

async function doLogin(page) {
    console.log('Starting login...')

    await page.mouse.click(1648, 66.5)
    await utils.sleep(1000)

    await page.type('.lms-StandardLogin_Username ', vars.login.username)
    await utils.sleep(1000)

    await page.type('.lms-StandardLogin_Password ', vars.login.password)
    await utils.sleep(1000)

    await page.click('.lms-LoginButton ')
    await utils.sleep(15000)
    await saveCookies(page)

    console.log('Login realized!\n')
    await actions.printScreen(page)
}

async function goToCasinoLive(page) {
    console.log('Opening casino live...')
    await page.goto('https://casino.bet365.com/Play/LiveRoulette')
    await page.waitForXPath('//*[contains(text(), "Live Roulette ")]', { timeout: 0 })
    await utils.sleep(10000)
    console.log('Casino opened!\n')
}

async function start() {

    const browser = await createBrowser()
    const page = await createPage(browser)

    try {

        /// open home
        await goToHome(page)

        // do login
        await doLogin(page)

        // open casino
        await goToCasinoLive(page)
        await utils.sleep(2000)
        await actions.printScreen(page)

        // close casino frame
        let casinoFrame = await actions.findCasinoFrame(page)
        await utils.sleep(20000)

        console.log('Casino aberto!')
        await actions.printScreen(page)

        await betManager.clickMinValue(casinoFrame, 1)
        console.log('Click no valor mínimo com o frame')
        await actions.printScreen(page)

        /*

        await actions.closeCasinoLive(casinoFrame)
        await utils.sleep(5000)

        // click roulette 
        await actions.clickRouletteTab(casinoFrame)
        await utils.sleep(3000)
        await actions.printScreen(page)

        // expand tables
        await actions.toggleExpandTables(page)
        await utils.sleep(20000)
        await actions.printScreen(page)

        // find possible bets

        var lastEnterTable = ""
        var betFound = 0

        const MAX_BET = 2
        const TOTAL_VERIFICATIONS = 4000
        const VERIFICATION_DELAY = 1500 // Five seconds

        for (let index = 1; index <= TOTAL_VERIFICATIONS && (betFound < MAX_BET); index++) {

            if (index > 1) {
                await page.keyboard.press('ArrowDown');

                // await for next verification
                await utils.sleep(VERIFICATION_DELAY)

                await page.keyboard.press('ArrowUp');
            }

            let tables = await actions.findTablesToBet(casinoFrame)
            let possibleBets = betManager.findPossibleBet(tables)

            console.log(`Verificação ${index}`)

            if (possibleBets.length > 0) {
                let possibleBet = possibleBets[0]

                if (lastEnterTable !== possibleBet.name) {
                    lastEnterTable = possibleBet.name
                    console.log('\n✨ GO BET ✨ \n')
                    console.log(`Mesa: ${possibleBet.name}, aposta: ${possibleBet.bet}\n`)

                    let betRealized = await betManager.bet(page, casinoFrame, possibleBet)
                    if (betRealized) {
                        betFound++;
                    }
                }
            }
        }

        await actions.toggleExpandTables(page)
        await utils.sleep(2000)

        // logout
        //await actions.logout(page)
        //await utils.sleep(5000)
        //await actions.printScreen(page)

        */

    } catch (e) {
        console.error(`Error -> ${e.message}\n`)
        console.log('-------------------------')
        console.log(`\n${e.stack}\n`)
        console.log('-------------------------')
    } finally {
        // close browser
        await browser.close()
    }
}

start();