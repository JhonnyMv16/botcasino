"use strict";

const vars = require('./vars.js')
const fs = require('fs');

var print_step = 1;

async function findAsync(arr, asyncCallback) {
    const promises = arr.map(asyncCallback);
    const results = await Promise.all(promises);
    const index = results.findIndex(result => result);
    return arr[index];
}

const getBalance = async function (casinoFrame) {
    return await casinoFrame.$eval('.balance__value ', (el) => Number(el.innerText.trim().replace('R$', '').replace(' ', '').replace(', ', '.')))
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

exports.toggleExpandTables = async function expandTables(mainPage) {
    console.log('Trying expand/collapse tables..')
    let button = await mainPage.$('.inline-games-page-component__game-header-right ')

    if (!button) {
        console.error('Error -> Expand button not found')
    } else {
        await button.click()
        console.log('Tables expanded/collapsed!\n')
    }
}

/**
 * this method will click on tab with name 'Roulette'
 */
exports.clickRouletteTab = async function clickRouletteTab(frame) {
    console.log('Finding tab..')
    let tabs = await frame.$$('.lobby-category-item')
    let rouletteTab = await findAsync(tabs, async h => await h.evaluate(el => el.textContent.trim().includes('Roulette')))

    if (!rouletteTab) {
        console.log('Roullete tab not found!\n')
        process.exit(0)
    }

    await rouletteTab.click()
    console.log('Roulette tab clicked!\n')
}

/**
* this method will retrieve all tables from page
*/
exports.findTablesToBet = async function (casinoFrame) {

    let tables = await casinoFrame.$$('.lobby__container .lobby-tables__item .lobby-table__wrapper')
    let result = await Promise.all(
        tables.map(async (table, index) => {
            let className = await table.evaluate(e => e.className)
            let name = await table.$eval('.lobby-table__name-container', el => el.innerText.trim())
            let minMax = await table.$eval('.lobby-table__limits', el => el.innerText.trim())
            let historyContainerList = await table.$$('.lobby-table__container > div:nth-child(4) > div')

            let inlineMinMax = minMax.replace('R$', '').replace(/(\r\n|\n|\r)/gm, "").replace('- ', '-').replace(' ', '')
            let min = inlineMinMax.split('-')[0]
            let max = inlineMinMax.split('-')[1]

            let history = []

            for (let h of historyContainerList) {
                let divs = await h.$$('div')
                for (let div of divs) {
                    let object = await div.evaluate(e => {
                        let value = Number(e.innerText.trim())
                        return { class: e.className, value }
                    })

                    if (object.class.includes('roulette-history-item__value-')) {
                        history.push(object.value)
                    }
                }
            }

            return { name, min, max, history, className, index }
        })
    )

    return result
}

exports.findCasinoFrame = async function (page) {
    let frames = await page.frames()
    let rouletteFrame = frames.find(f => f.url() === 'https://casino.bet365.com/Play/LiveRoulette')

    if (!rouletteFrame) {
        console.error('Error -> Frame roulette live not found!\n')
        process.exit(0)
    } else {
        console.log('Frame roulette found!\n')
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
    } else {
        console.log('Frame casino client found!\n')
    }

    return casinoFrame
}

exports.logout = async function logout(page) {
    let links = await page.$$('.members-dropdown-component__log-out-link')
    if (links.length > 0) {
        let logoutLink = links[0]
        await logoutLink.click()
    } else {
        console.error('Error -> Logout link not found!\n')
    }
}

exports.closeCasinoLive = async function (casinoFrame) {
    let buttons = await casinoFrame.$('.close-button__icon')

    if (buttons.length === 0) {
        console.error('Error -> Close button not found\n')
        process.exit(0)
    }

    await casinoFrame.click('.close-button__icon')
}

exports.getBalance = getBalance

exports.openTable = async function (casinoFrame, table) {
    console.log(`Opening table ${table.name}..`)
    let elements = await casinoFrame.$$('.lobby-tables__item .lobby-table__wrapper .lobby-table .lobby-table__container')
    let tableEl = elements[table.index]
    await tableEl.click()
    await casinoFrame.waitForXPath('//*[contains(text(), "MAIS JOGOS")]', { timeout: 0, visible: true })
    console.log('Table opened!\n')
}

exports.getTableBetPoints = async function (casinoFrame) {
    async function findColumns() {
        let result = await casinoFrame.$$eval('text', elements => {
            let columns = elements.filter(el => el.textContent === '2to1')
            return columns.map(c => {
                let rect = c.getBoundingClientRect()
                return { x: rect.x, y: rect.y }
            })
        })

        let c3 = { name: 'Coluna 3', ...result[0] }
        let c2 = { name: 'Coluna 2', ...result[1] }
        let c1 = { name: 'Coluna 1', ...result[2] }

        return { c1, c2, c3 }
    }

    async function findDozens() {
       var elements = await casinoFrame.$x('//*[contains(text(), "1st 12")]')
       let db = await elements[0].evaluate(e => {
           let rect = e.getBoundingClientRect()
           return { name: 'Dúzia baixa', x: rect.x, y: rect.y }
       })

       elements = await casinoFrame.$x('//*[contains(text(), "2nd 12")]')
       let dm = await elements[0].evaluate(e => {
           let rect = e.getBoundingClientRect()
           return { name: 'Dúzia média', x: rect.x, y: rect.y }
       })

       elements = await casinoFrame.$x('//*[contains(text(), "3rd 12")]')
       let da = await elements[0].evaluate(e => {
           let rect = e.getBoundingClientRect()
           return { name: 'Dúzia alta', x: rect.x, y: rect.y }
       })
    
       return { db, dm, da }
    }

    let columns = await findColumns()
    let dozens = await findDozens()

    return  { ...columns, ...dozens }
} 

exports.getTableState = async function (casinoFrame) {
    let canBet = await casinoFrame.$eval('.dealer-message-text', el => el.innerText.includes('FAÇA AS SUAS APOSTAS') || el.innerText.includes('ÚLTIMAS APOSTAS'))
    let historyStr = await casinoFrame.$eval('.roulette-game-area__history-line', el => el.innerText)
    let history = historyStr.split('\n').map(value => Number(value))
    let balance = await getBalance(casinoFrame)
    return { balance, canBet, history }
}

exports.closeBetModal = async function (casinoFrame) {
    console.log(`Closing modal..`)
    let elements = await casinoFrame.$$('.close-button')
    let shouldClose = elements.length > 1

    if (shouldClose) {
        let last = elements.length - 1
        let modalClose = elements[last]
        await modalClose.click()
        console.log(`Modal closed!\n`)
    } else {
        console.log(`Modal not found!\n`)
    }

    return shouldClose
}

exports.getLastResult = async function (casinoFrame) {
    return await casinoFrame.evaluate(_ => {
        let el = document.querySelector('.roulette-game-area__history-line')
        let lastResult = el.innerText.split('\n')[0]
        return lastResult
    })
}

exports.clickDuziaBaixa = async function (page) {
    console.log(`Selecionando apostando duzia baixa..\n`)
    await page.mouse.click(540, 672)
}

exports.clickDuziaMedia = async function (page) {
    console.log(`Selecionando apostando duzia média..\n`)
    await page.mouse.click(684, 677)
}

exports.clickDuziaAlta = async function (page) {
    console.log(`Selecionando apostando duzia alta..\n`)
    await page.mouse.click(825, 671)
}

exports.clickMinValue = async function (casinoFrame) {
    console.log(`Selecting min value..`)
    await casinoFrame.evaluate(_ => {
        function click(x, y) {
            var ev = new MouseEvent('click', {
                'view': window,
                'bubbles': true,
                'cancelable': true,
                'screenX': x,
                'screenY': y
            });

            var el = document.elementFromPoint(x, y);
            el.dispatchEvent(ev);
        }

        let chips = document.querySelectorAll('.arrow-slider__scrollable-content svg')
        let chip = chips[0]
        let rec = chip.getBoundingClientRect()
        click(rec.x, rec.y)
    })
    console.log(`Min value selected\n`)
}