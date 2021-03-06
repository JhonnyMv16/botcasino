const fs = require('fs')

const setup = require('./setup.js')
const utils = require('./utils.js')
const actions = require('./actions.js')
const betManager = require('./bet_manager.js')
const vars = require('./vars.js')
const puppeteer = require('puppeteer');

const INITAL_CASINO = "bet365 Roulette"
const VERIFICATION_DELAY = 1500

var lastEnterTable = INITAL_CASINO
var isExpand = false
var betCounter = 0
var betLossCount = 0
var betGreenCount = 0
var lastEnterTableCount = 0

var browser = undefined
var page = undefined
var config = undefined
var casinoFrame = undefined

async function createBrowser() {
    return await puppeteer.launch()
}

async function saveCookies() {
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
        let cookies = fs.readFileSync('cookies.json', 'utf-8')
        if (cookies) {
            return JSON.parse(cookies)
        } else {
            return ""
        }
    } catch (e) {
        console.log('Não foi possível ler os cookies')
        console.error(e.message)
        return []
    }
}

async function createPage(browser) {
    page = await browser.newPage();
    await page.setViewport(vars.viewPort);
    await page.setExtraHTTPHeaders(vars.headers);
    await page.setUserAgent(vars.userAgent);
}

async function initHomePage() {
    console.log('\nInitializing...\n')
    await page.goto(vars.HOME_URL);
    await page.waitForXPath('//*[contains(text(), "Login")]', { timeout: 0 })
    await utils.sleep(5000)
    await utils.printScreen(page)
}

async function login(username, password) {
    console.log('Starting login...')

    await page.mouse.click(1648, 66.5)
    await utils.sleep(1000)

    await page.type('.lms-StandardLogin_Username ', username)
    await utils.sleep(1000)

    await page.type('.lms-StandardLogin_Password ', password)
    await utils.sleep(1000)

    await page.click('.lms-LoginButton ')
    await utils.sleep(15000)
    await saveCookies(page)

    console.log('Login success!\n')
    await utils.printScreen(page)
}

async function openCasinoLive() {
    console.log('Opening casino live...')
    await page.goto('https://casino.bet365.com/Play/LiveRoulette')
    await page.waitForXPath('//*[contains(text(), "Live Roulette ")]', { timeout: 0 })
    await utils.sleep(35000)
    await utils.printScreen(page)
    console.log('Casino opened!\n')
}

async function findCasinoFrame() {
    return await actions.findCasinoFrame(page)
}

async function closeCasinoLive() {
    await actions.closeCasinoLive(casinoFrame)
    await utils.sleep(5000)
    await utils.printScreen(page)
}

async function closeCasinoOffers() {
    await betManager.clickAnnouncementButton(page, casinoFrame)
    await utils.sleep(2000)
}

async function clickRouletteTab() {
    await actions.clickRouletteTab(casinoFrame)
    await utils.sleep(2000)
    await utils.printScreen(page)
}

async function logout() {
    console.log('\nEncerrando...\n')
    if (isExpand) await toggleExpand(page)

    await betManager.clickHeaderAccount(page)
    await utils.sleep(2000)

    await betManager.clickMenuExit(page)
    await utils.sleep(2000)

    await utils.printScreen(page)
}

async function toggleExpand() {
    console.log(isExpand ? 'Collapsing...' : 'Expanding...')
    isExpand = !isExpand
    await actions.toggleExpandTables(page)
    await utils.sleep(2000)
    await utils.printScreen(page)
}

async function mouseUpAndDown() {
    await page.keyboard.press('ArrowDown')
    await utils.sleep(300)
    await page.keyboard.press('ArrowUp')
}

function hasBalanceToBet(balance, minBalance) {
    let hasBalance = balance > minBalance
    if (!hasBalance) console.log('Saldo insuficiente para continuar =/\n')
    return hasBalance
}

async function printBetsResult() {
    console.log(`Apostas realizadas: ${betCounter}\n`)
    console.log(`GREEN: ${betGreenCount}\n`)
    console.log(`LOSS: ${betLossCount}\n`)

    const balance = await actions.getBalance(casinoFrame)
    printBalance(balance)
}

function printBalance(balance) {
    console.log(`Saldo R$ ${balance}\n`.replace('.', ','))
}

function shouldContinueVerification(verifications, config) {

    if (betLossCount === config.maxLoss) {
        console.log('Máximo de loss configurado foi atingido!\n')
        return false
    }

    if (verifications >= config.verifications) {
        console.log('Limite de verificações atingido!\n')
        return false
    }

    if (betCounter >= config.maxBets) {
        console.log('Limite de apostas atingido!\n')
        return false
    }

    return true
}

async function executeVerificationsToBet() {
    var verifications = 1

    console.log('🔹 Iniciando verificações 🔹')

    while (shouldContinueVerification(verifications, config)) {

        verifications += 1
        lastEnterTableCount += 1

        await utils.sleep(VERIFICATION_DELAY)
        await mouseUpAndDown(page)

        casinoFrame = await findCasinoFrame(page)

        let tables = await actions.findTablesToBet(casinoFrame)
        let possibleBets = betManager.findPossibleBet(tables, config)
        let hasPossibleBet = possibleBets.length > 0

        if (config.shouldShowVerifications) {
            console.log(`Verificação ${verifications}, Mesas ${tables.length}, Possíveis apostas ${possibleBets.length}`)
        }

        // needed to avoid auto disconnect
        if (lastEnterTableCount % 300 === 0) {
            console.log('\nOpen some table to avoid disconnect!')
            await utils.printScreen(page)

            let someTable = tables[utils.getRandomInt(0, tables.length)]
            await actions.openTable(casinoFrame, someTable)
            await utils.sleep(10000)
            await actions.closeCasinoLive(casinoFrame)
            lastEnterTable = someTable.name
            lastEnterTableCount = 0
            continue
        }

        if (!hasPossibleBet) {
            continue
        }

        let possibleBet = possibleBets[utils.getRandomInt(0, possibleBets.length)]
        if (lastEnterTable === possibleBet.name) {
            continue
        }

        lastEnterTable = possibleBet.name

        let balance = await actions.getBalance(casinoFrame)
        printBalance(balance)

        if (!hasBalanceToBet(balance, config.minBalance)) {
            continue
        }

        let result = await betManager.bet(page, casinoFrame, possibleBet, config)

        // reset because .bet method enter a table
        lastEnterTableCount = 0

        if (result.isBetRealized) {
            betCounter += 1
            console.log(`Apostas realizadas: ${betCounter}\n`)

            if (result.isResultGreen) {
                betGreenCount += 1
            } else {
                betLossCount += 1
            }
        }
    }
}

async function start() {    
    await utils.runCatchingAsync(async _ => {
        config = await setup.runSetup()
        browser = await createBrowser()
        page = await createPage(browser)

        await initHomePage()
        await login(config.username, config.password)
        await openCasinoLive()

        casinoFrame = await findCasinoFrame()

        await closeCasinoOffers()
        await closeCasinoLive()
        await clickRouletteTab()
        await toggleExpand()

        let balance = await actions.getBalance()
        printBalance(balance)

        if (hasBalanceToBet(balance, config.minBalance)) {
            await executeVerificationsToBet(config)
        }

        await printBetsResult()
        await logout()

    }, async () => { await utils.printScreen() })

    await browser.close()
}

start();