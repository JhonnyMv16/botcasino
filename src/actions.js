const fs = require('fs');
const vars = require('./vars.js')

const TABLES_BLOCK_LIST = [
    'Football French Roulette',
    'Spread Bet Roulette'
]

var print_step = 1;
var print_green = 1;
var print_loss = 1;

async function findAsync(arr, asyncCallback) {
    const promises = arr.map(asyncCallback);
    const results = await Promise.all(promises);
    const index = results.findIndex(result => result);
    return arr[index];
}

async function findBalanceStr(casinoFrame) {
    let text = await casinoFrame.$eval('.balance__value ', (el) => el.innerText.trim())
    return text
}

const getBalance = async function (casinoFrame) {
    var balance = await findBalanceStr(casinoFrame)
    balance = balance.replace('R$', '').replace(' ', '').replace(', ', '.')
    return Number(balance)
}

exports.getBalance = getBalance

exports.printBalance = async function (casinoFrame) {
    let balance = await findBalanceStr(casinoFrame)
    console.log(`Saldo ${balance}`)
}

exports.printScreen = async function (page) {
    if (vars.enablePrint) {

        if (!fs.existsSync('screenshots')) {
            fs.mkdirSync('screenshots');
        }

        let path = `screenshots/step-${print_step}.jpg`
        await page.screenshot({ path: path });
        console.log(`print -> ${path}\n`)
    }

    print_step++;
}

exports.printGreen = async function (page) {
    if (vars.enablePrint) {

        if (!fs.existsSync('screenshots')) {
            fs.mkdirSync('screenshots');
        }

        let path = `screenshots/green-${print_green}.jpg`
        await page.screenshot({ path: path });
        console.log(`print green -> ${path}\n`)
    }

    print_green++;
}


exports.printLoss = async function (page) {
    if (vars.enablePrint) {

        if (!fs.existsSync('screenshots')) {
            fs.mkdirSync('screenshots');
        }

        let path = `screenshots/loss-${print_loss}.jpg`
        await page.screenshot({ path: path });
        console.log(`print loss -> ${path}\n`)
    }

    print_loss++;
}

exports.toggleExpandTables = async function (mainPage) {
    let button = await mainPage.$('.inline-games-page-component__game-header-right ')

    if (!button) {
        throw Error("Expand button not found")
    } else {
        await button.click()
    }
}

exports.clickRouletteTab = async function clickRouletteTab(frame) {
    console.log('Click roulette tab...')
    let tabs = await frame.$$('.lobby-category-item')
    let rouletteTab = await findAsync(tabs, async h => await h.evaluate(el => el.textContent.trim().includes('Roulette')))

    if (!rouletteTab) {
        throw Error("Roullete tab not found")
    }

    await rouletteTab.click()
}

exports.findTablesToBet = async function (casinoFrame) {
    return await casinoFrame.evaluate((TABLES_BLOCK_LIST) => {
        let tablesElements = document.querySelectorAll('.lobby-table__container')
        let tables = []
        for (let index = 0; index < tablesElements.length; index++) {

            let table = tablesElements[index]
            let name = table.querySelector('.lobby-table__name-container').textContent
            var min = table.querySelector('.lobby-table-limits__min').textContent

            min = min.replace('R$', '').replace(' ', '').replace(',', '.').trim()
            min = Number(min)

            if (min === 2.5 && !TABLES_BLOCK_LIST.includes(name)) {
                let historyElements = table.querySelectorAll('div:first-child > div:nth-child(5) > div')

                let history = []
                for (let index = 0; index < historyElements.length; index++) {
                    let result = historyElements[index].textContent.split('x')[0]
                    history.push(Number(result))
                }

                let object = { name, min, history, index }
                tables.push(object)
            }
        }
        return tables
    }, TABLES_BLOCK_LIST)
}

exports.findCasinoFrame = async function (page) {
    console.log('Finding casino frame...')
    let frames = await page.frames()
    let rouletteFrame = frames.find(f => f.url() === 'https://casino.bet365.com/Play/LiveRoulette')

    if (!rouletteFrame) {
        console.error('Error -> Frame roulette live not found!\n')
        process.exit(0)
    }

    let gamingFrame = rouletteFrame.childFrames().find(f => f.url().includes('https://www.sgla365.com/GamingLaunch'))

    if (!gamingFrame) {
        console.error('Error -> Frame gaming launch not found!\n')
        process.exit(0)
    }

    let casinoFrame = gamingFrame.childFrames().find(f => f.name() === 'gamecontent')

    if (!casinoFrame) {
        console.error('Error -> Frame casino client not found!\n')
        process.exit(0)
    }

    return casinoFrame
}

exports.closeCasinoLive = async function (casinoFrame) {
    console.log('Closing casino live...')
    await casinoFrame.waitForXPath('//*[contains(text(), "2.5")]')
    let buttons = await casinoFrame.$('.close-button__icon')

    if (buttons.length === 0) {
        console.error('Error -> Close button not found\n')
        process.exit(0)
    }

    await casinoFrame.click('.close-button__icon')
}

exports.openTable = async function (casinoFrame, table) {
    console.log(`Opening table ${table.name}..`)
    let elements = await casinoFrame.$$('.lobby-table__container')
    let tableEl = elements[table.index]
    await tableEl.click()
}

exports.getTableState = async function (casinoFrame) {
    var canBet = false

    try {
        canBet = await casinoFrame.$eval('span.dealer-message-text', el => el.innerText.includes('FAÇA AS SUAS APOSTAS'))
    } catch (error) {
        canBet = await casinoFrame.evaluate(_ => {
            return (document.documentElement.textContent || document.documentElement.innerText).indexOf('FAÇA AS SUAS APOSTAS') > -1
        })
    }

    let historyStr = await casinoFrame.$eval('.roulette-game-area__history-line', el => el.innerText)
    let history = historyStr.split('\n').map(value => Number(value))
    let balance = await getBalance(casinoFrame)
    return { balance, canBet, history }
}

exports.closeBetModal = async function (casinoFrame) {
    let elements = await casinoFrame.$$('.close-button')
    let shouldClose = elements.length > 1

    if (shouldClose) {
        let last = elements.length - 1
        let modalClose = elements[last]
        console.log('Closing bet dialog...')
        await modalClose.click()
    }

    return shouldClose
}
