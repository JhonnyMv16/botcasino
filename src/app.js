"use strict";

const utils = require('./utils.js')
const actions = require('./actions.js')
const betManager = require('./bet_manager.js')
const vars = require('./vars.js')
const fs = require('fs')
const puppeteer = require('puppeteer')

const INITAL_CASINO = "bet365 Roulette"

var isExpand = false

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
}

async function goToCasinoLive(page) {
    console.log('Opening casino live...')
    await page.goto('https://casino.bet365.com/Play/LiveRoulette')
    await page.waitForXPath('//*[contains(text(), "Live Roulette ")]', { timeout: 0 })
    await utils.sleep(20000)
    console.log('Casino opened!\n')
}

async function logout(page) {
    if (isExpand) {
        await toggleExpand(page)
    }

    await betManager.clickHeaderAccount(page)
    await utils.sleep(5000)
    console.log('Click account header')
    await actions.printScreen(page)

    await betManager.clickMenuExit(page)
    await utils.sleep(5000)
    console.log('Click exit')
    await actions.printScreen(page)
}

async function toggleExpand(page) {
    console.log('toggleExpandTables')
    await actions.printScreen(page)
    await actions.toggleExpandTables(page)
    await utils.sleep(2000)
    isExpand = !isExpand
}

async function start() {

    const browser = await createBrowser()
    const page = await createPage(browser)

    try {

        await actions.exposeFunctions(page)

        await goToHome(page)

        console.log('printScreen')
        await actions.printScreen(page)
        await doLogin(page)

        console.log('goToCasinoLive')
        await actions.printScreen(page)
        await goToCasinoLive(page)

        // close initial casino frame
        console.log('findCasinoFrame')
        await actions.printScreen(page)
        let casinoFrame = await actions.findCasinoFrame(page)
        await utils.sleep(20000)

        // close info dialog
        console.log('clickAnnouncementButton')
        await actions.printScreen(page)
        await betManager.clickAnnouncementButton(page, casinoFrame)
        await utils.sleep(2000)

        console.log('clickMinValue')
        await betManager.clickMinValue(casinoFrame)
        await utils.sleep(2000)
        await actions.printScreen(page)

        console.log('closeCasinoLive')
        await actions.printScreen(page)
        await actions.closeCasinoLive(casinoFrame)
        await utils.sleep(5000)

        // click roulette 
        console.log('clickRouletteTab')
        await actions.printScreen(page)
        await actions.clickRouletteTab(casinoFrame)
        await utils.sleep(2000)

        // expand tables
        await toggleExpand(page)

        // check balance
        let balance = await actions.getBalance(casinoFrame)
        console.log(`\nSaldo ${balance}\n`)

        let hasBalance = Number(balance) > 20
        if (hasBalance === false) {
            await logout(page)
            return
        }

        // find possible bets
        var lastEnterTable = INITAL_CASINO
        var betFound = 0

        const MAX_BET = 5
        const TOTAL_VERIFICATIONS = 1000
        const VERIFICATION_DELAY = 1500 // Five seconds

        for (var index = 1; index <= TOTAL_VERIFICATIONS && (betFound < MAX_BET); index++) {

            await page.keyboard.press('ArrowDown')
            await utils.sleep(VERIFICATION_DELAY) // await for next verification
            await page.keyboard.press('ArrowUp')

            let tables = await actions.findTablesToBet(casinoFrame)
            let possibleBets = betManager.findPossibleBet(tables)
            let hasPossibleBet = possibleBets.length > 0

            console.log(`Verificação ${index}, Mesas ${tables.length}, Possíveis apostas ${possibleBets.length}`)

            if (hasPossibleBet) {

                let randomBet = Math.floor(Math.random() * possibleBets.length)
                let possibleBet = possibleBets[randomBet]

                try {
                    if (lastEnterTable !== possibleBet.name) {
                        lastEnterTable = possibleBet.name

                        let balance = await actions.getBalance(casinoFrame)
                        if (Number(balance) < 20) {
                            console.error('Erro -> Saldo insuficiente para realizar aposta!\n')
                            await utils.sleep(5000)
                            return
                        }

                        console.log('\n✨ GO BET ✨ \n')
                        console.log(`Mesa: ${possibleBet.name}\nAposta: ${possibleBet.bet}`)
                        console.log(`Saldo atual: R$ ${balance}\n`.replace('.', ','))

                        let betRealized = await betManager.bet(page, casinoFrame, possibleBet)

                        if (betRealized) {
                            betFound += 1;

                            console.log('Aposta finalizada')
                            await utils.sleep(2000)

                            let balance = await actions.getBalance(casinoFrame)
                            console.log(`Saldo atual: R$ ${balance}\n`.replace('.', ','))

                            await actions.printScreen(page)

                            console.log(`Apostas realizadas: ${betFound}\n`)
                        }
                    } else {
                        console.log(`Não é possível seguir para aposta na mesma roleta ${lastEnterTable}`)
                    }
                    
                } catch (e) {
                    console.error(`Error na tentativa de aposta-> ${e.message}\n`)
                    console.log('-------------------------')
                    console.log(`\n${e.stack}\n`)
                    console.log('-------------------------')
                }
            }
        }

        await logout(page)
    } catch (e) {
        console.error(`Error -> ${e.message}\n`)
        console.log('-------------------------')
        console.log(`\n${e.stack}\n`)
        console.log('-------------------------')
        await actions.printScreen(page)
    } finally {
        // close browser
        await browser.close()
    }
}

start();