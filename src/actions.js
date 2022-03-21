"use strict";

const vars = require('./vars.js')
const fs = require('fs');

var print_step = 1;
var print_green = 1;
var print_loss = 1;

async function findAsync(arr, asyncCallback) {
    const promises = arr.map(asyncCallback);
    const results = await Promise.all(promises);
    const index = results.findIndex(result => result);
    return arr[index];
}

const getBalance = async function (casinoFrame) {
    return await casinoFrame.$eval('.balance__value ', (el) => Number(el.innerText.trim().replace('R$', '').replace(' ', '').replace(', ', '.')))
}

/* Functions to expose */

const clickXy = function (x, y, count) {
    var ev = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'screenX': x,
        'screenY': y
    });

    var el = document.elementFromPoint(x, y);
    for (let index = 1; index <= count; index++) {
        el.dispatchEvent(ev);
    }
}

const simulateClick = function (x, y, count = 1) {
    var clickEvent = document.createEvent('MouseEvents');
    clickEvent.initMouseEvent(
        'click', true, true, window, 0,
        0, 0, x, y, false, false,
        false, false, 0, null
    );
    for (let index = 0; index < count; index++) {
        document.elementFromPoint(x, y).dispatchEvent(clickEvent);
    }
}

exports.exposeFunctions = async function (page) {
    await page.exposeFunction("clickXy", clickXy)
    await page.exposeFunction("simulateClick", simulateClick)
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
    return  await casinoFrame.evaluate(_ => {
        let tablesElements = document.querySelectorAll('.lobby-table__container')
        let tables = []
        for (let index = 0; index < tablesElements.length; index++) {

            let table = tablesElements[index]
            let name = table.querySelector('.lobby-table__name-container').textContent
            var min = table.querySelector('.lobby-table-limits__min').textContent

            min = min.replace('R$', '').replace(' ', '').replace(',', '.').trim()

            min = Number(min)

            if (min === 2.5 && name !== 'Spread Bet Roulette') {
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
    })
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
    let links = await page.$$eval('div.members-dropdown-component__log-out-link')
    if (links && links.length > 0) {
        let logoutLink = links[0]
        await logoutLink.click()
        console.log('Logout sucess!\n')
    } else {
        console.error('Error -> Logout link not found!\n')
    }
}

exports.closeCasinoLive = async function (casinoFrame) {
    await casinoFrame.waitForXPath('//*[contains(text(), "2.5")]', { timeout: 0 })
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
    let elements = await casinoFrame.$$('.lobby-table__container')
    let tableEl = elements[table.index]
    await tableEl.click()
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


    var minBtn = await casinoFrame.$$eval('text.chip__label', els => {
        let e = els.filter(e => e.textContent.trim() === "2.5")[0]
        let rect = e.getBoundingClientRect()
        return { name: 'Botão 2.5', x: rect.x, y: rect.y }
    })

    let columns = await findColumns()
    let dozens = await findDozens()

    return { ...columns, ...dozens, minBtn: minBtn }
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
        await modalClose.click()
    }

    return shouldClose
}
