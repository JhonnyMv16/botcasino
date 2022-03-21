"use strict";

const actions = require('./actions.js')
const utils = require('./utils.js')

function range(start, end, step = 1) {
    var ans = [];
    for (let i = start; i <= end; i += step) {
        ans.push(i);
    }
    return ans;
}

const dG = range(25, 36)
const dM = range(13, 24)
const dB = range(1, 12)

const cOne = range(1, 36, 3)
const cTwo = range(2, 36, 3)
const cThree = range(3, 36, 3)

const DB_DM = 'DB_DM'
const DM_DA = 'DM_DA'
const DB_DA = 'DB_DA'

const BET_C1_C2 = 'BET_C1_C2'
const BET_C2_C3 = 'BET_C2_C3'
const BET_C1_C3 = 'BET_C1_C3'

/**
 * total bet history to slice verifier
 */
const BET_SLICE = 5

function canBet(duzia, history) {
    let lastResults = history.slice(0, BET_SLICE)
    let canBet = true

    lastResults.forEach(item => {
        if (!canBet) return
        canBet = duzia.includes(item)
    })

    return canBet
}

exports.betCodes = {
    DB_DM,
    DM_DA,
    DB_DA
}

const findPossibleBet = function (tables) {
    let tablesToBet = []

    tables.forEach(table => {
        let name = table.name
        let index = table.index

        if (table.history.length <= BET_SLICE) {
            console.log(`Histórico não encontrado, mesa ${name}, history: ${table.history}`)
            return
        }

        let history = table.history.slice(0, BET_SLICE)

        if (table.min === 2.50) {
            if (canBet(dG, table.history)) {
                let bet = 'Dúzia baixa e dúzia média'
                let code = DB_DM
                tablesToBet.push({ name, bet, code, history, index })
            } else if (canBet(dM, table.history)) {
                let bet = 'Dúzia baixa e dúzia alta'
                let code = DB_DA
                tablesToBet.push({ name, bet, code, history, index })
            } else if (canBet(dB, table.history)) {
                let bet = 'Dúzia média e dúzia alta'
                let code = DM_DA
                tablesToBet.push({ name, bet, code, history, index })
            } else if (canBet(cOne, table.history)) {
                let bet = 'Coluna 2 e coluna 3'
                let code = BET_C2_C3
                tablesToBet.push({ name, bet, code, history, index })
            } else if (canBet(cTwo, table.history)) {
                let bet = 'Coluna 1 e coluna 3'
                let code = BET_C1_C3
                tablesToBet.push({ name, bet, code, history, index })
            } else if (canBet(cThree, table.history)) {
                let bet = 'Coluna 1 e coluna 2'
                let code = BET_C1_C2
                tablesToBet.push({ name, bet, code, history, index })
            }
        }
    })

    return tablesToBet
}

async function clickMinValue(frame) {
    await frame.evaluate(_ => {
        let element = document.querySelector('.chip.arrow-slider__element')
        let rect = element.getBoundingClientRect()

        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y, false, false,
            false, false, 0, null
        );

        document.elementFromPoint(rect.x, rect.y).dispatchEvent(clickEvent);
    })
}

async function clickLowDozen(frame, count) {
    return await frame.evaluate((count) => {
        let elements = document.querySelectorAll('text.roulette-table-cell__text-tag')
        var element = undefined

        for (let index = 0; index < elements.length; index++) {
            let el = elements[index]
            if (el.textContent.includes("1st 12")) {
                element = el
            }
        }

        let rect = element.getBoundingClientRect()
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y + 10, false, false,
            false, false, 0, null
        );

        for (let index = 0; index < count; index++) {
            document.elementFromPoint(rect.x, rect.y + 10).dispatchEvent(clickEvent);   
        }
    }, count)
}

async function clickMediumDozen(frame, count) {
    return await frame.evaluate((count) => {
        let elements = document.querySelectorAll('text.roulette-table-cell__text-tag')
        var element = undefined

        for (let index = 0; index < elements.length; index++) {
            let el = elements[index]
            if (el.textContent.includes("2nd 12")) {
                element = el
            }
        }

        let rect = element.getBoundingClientRect()
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y + 10, false, false,
            false, false, 0, null
        );

        for (let index = 0; index < count; index++) {
            document.elementFromPoint(rect.x, rect.y + 10).dispatchEvent(clickEvent);   
        }
    }, count)
}

async function clickHighDozen(frame, count) {
    return await frame.evaluate((count) => {
        let elements = document.querySelectorAll('text.roulette-table-cell__text-tag')
        var element = undefined

        for (let index = 0; index < elements.length; index++) {
            let el = elements[index]
            if (el.textContent.includes("3rd 12")) {
                element = el
            }
        }

        let rect = element.getBoundingClientRect()
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y + 10, false, false,
            false, false, 0, null
        );

        for (let index = 0; index < count; index++) {
            document.elementFromPoint(rect.x, rect.y + 10).dispatchEvent(clickEvent);   
        }
    }, count)
}

async function clickColOne(frame, count) {
    return await frame.evaluate((count) => {
        let elements = document.querySelectorAll('text.roulette-table-cell__text-tag')
        let filtered = []

        for (let index = 0; index < elements.length; index++) {
            let element = elements[index]
            if (element.textContent.includes("2to1")) {
                filtered.push(element)
            }
        }

        var element = filtered[2]
        let rect = element.getBoundingClientRect()
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y, false, false,
            false, false, 0, null
        );

        document.elementFromPoint(rect.x, rect.y).dispatchEvent(clickEvent);
    }, count)
}

async function clickColTwo(frame, count) {
    return await frame.evaluate((count) => {
        let elements = document.querySelectorAll('text.roulette-table-cell__text-tag')
        let filtered = []

        for (let index = 0; index < elements.length; index++) {
            let element = elements[index]
            if (element.textContent.includes("2to1")) {
                filtered.push(element)
            }
        }

        var element = filtered[1]
        let rect = element.getBoundingClientRect()
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y, false, false,
            false, false, 0, null
        );

        document.elementFromPoint(rect.x, rect.y).dispatchEvent(clickEvent);
    }, count)
}

async function clickColThree(frame, count) {
    return await frame.evaluate((count) => {
        let elements = document.querySelectorAll('text.roulette-table-cell__text-tag')
        let filtered = []

        for (let index = 0; index < elements.length; index++) {
            let element = elements[index]
            if (element.textContent.includes("2to1")) {
                filtered.push(element)
            }
        }

        var element = filtered[0]
        let rect = element.getBoundingClientRect()
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y, false, false,
            false, false, 0, null
        );

        document.elementFromPoint(rect.x, rect.y).dispatchEvent(clickEvent);
    }, count)
}

async function clickHeaderAccount(page) {
    await page.click('div.members-dropdown-component__members-icon-container')
}

async function clickMenuExit(page) {
    await page.click('div.members-dropdown-component__log-out-link')
}

async function clickAnnouncementButton(page, casinoFrame) {
    let btn = await page.$('button.important-announcement__button')
    if (btn) {
        console.log('Dialog 1 exists')
        await btn.click()
    }

    let btnCasino = await casinoFrame.$('button.important-announcement__button')
    if (btnCasino) {
        console.log('Dialog casino 1 exists')
        await btnCasino.click()
    }

    await utils.sleep(500)

    let btn2 = await page.$('button.overlay-banner__close-button')
    if (btn2) {
        console.log('Dialog 2 exists')
        await btn2.click()
    }
}

function isBetGreen(betCode, number) {
    var result = false

    switch (betCode) {
        case DB_DM: {
            result = (dB.includes(number) || dM.includes(number))
            break;
        }
        case DM_DA: {
            result = (dM.includes(number) || dG.includes(number))
            break;
        }
        case DB_DA: {
            result = (dB.includes(number) || dG.includes(number))
            break;
        }
        case BET_C1_C2: {
            result = (cOne.includes(number) || cTwo.includes(number))
            break;
        }
        case BET_C2_C3: {
            result = (cTwo.includes(number) || cThree.includes(number))
            break;
        }
        case BET_C1_C3: {
            result = (cOne.includes(number) || cThree.includes(number))
            break;
        }
    }

    return result
}

const bet = async function (page, casinoFrame, table) {
    return new Promise(async (resolve, reject) => {
        try {

            await actions.openTable(casinoFrame, table)
            await utils.sleep(4000)
            await actions.printScreen(page)

            await actions.closeBetModal(casinoFrame)

            let state = await actions.getTableState(casinoFrame)
            let xHistory = table.history.slice(0, BET_SLICE)
            let yHistory = state.history.slice(0, BET_SLICE)

            if (JSON.stringify(xHistory) !== JSON.stringify(yHistory)) {
                console.error('Erro -> Divergencia encontrada no histórico da mesa!\n')
                console.log(xHistory)
                console.log(yHistory)
                console.log('\n')
                await utils.sleep(15000)
                await actions.closeCasinoLive(casinoFrame)
                resolve(false)
                return
            }

            if (!state.canBet) {
                console.error('Erro -> O casino não está em periodo de aposta!\n')
                await actions.printScreen(page)
                await utils.sleep(15000)
                await actions.closeCasinoLive(casinoFrame)
                resolve(false)
                return
            }

            const MAX_ATTEMTPS = 2

            var currentState = state
            var isResultGreen = false
            var resultNumber = 0

            console.log('Click no valor mínimo')
            await clickMinValue(casinoFrame)
            await utils.sleep(1000)
            await actions.printScreen(page)

            for (let attempts = 1; attempts <= MAX_ATTEMTPS && !isResultGreen; attempts++) {

                console.log(`Tentativa ${attempts}\n`)

                var clicksToBet = 1

                if (attempts === 2) {
                    clicksToBet = 3
                }

                switch (table.code) {
                    case DB_DM: {
                        await clickLowDozen(casinoFrame, clicksToBet)
                        await clickMediumDozen(casinoFrame, clicksToBet)
                        break;
                    }
                    case DM_DA: {
                        await clickMediumDozen(casinoFrame, clicksToBet)
                        await clickHighDozen(casinoFrame, clicksToBet)
                        break;
                    }
                    case DB_DA: {
                        await clickLowDozen(casinoFrame, clicksToBet)
                        await clickHighDozen(casinoFrame, clicksToBet)
                        break;
                    }
                    case BET_C1_C2: {
                        await clickColOne(casinoFrame, clicksToBet)
                        await clickColTwo(casinoFrame, clicksToBet)
                        break;
                    }
                    case BET_C2_C3: {
                        await clickColTwo(casinoFrame, clicksToBet)
                        await clickColThree(casinoFrame, clicksToBet)
                        break;
                    }
                    case BET_C1_C3: {
                        await clickColOne(casinoFrame, clicksToBet)
                        await clickColThree(casinoFrame, clicksToBet)
                        break;
                    }
                }

                console.log('Aposta realizada!')
                await utils.sleep(2000)
                await actions.printScreen(page)

                var finishedRound = false
                while (!finishedRound) {
                    await utils.sleep(2000)

                    let newState = await actions.getTableState(casinoFrame)
                    resultNumber = newState.history[0]
                    finishedRound = currentState.history[0] !== resultNumber

                    if (finishedRound) {
                        isResultGreen = isBetGreen(table.code, resultNumber)
                        currentState = newState
                    }
                }
            }

            if (isResultGreen) {
                console.log(`${resultNumber} GREEN ✔️\n`)
                await actions.printGreen(page)
            } else {
                console.log(`${resultNumber} LOSS ❌\n`)
                await actions.printLoss(page)
            }

            await actions.closeCasinoLive(casinoFrame)

            resolve(true)
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    findPossibleBet,
    bet,
    clickMinValue,
    clickLowDozen,
    clickMediumDozen,
    clickHighDozen,
    clickColOne,
    clickColTwo,
    clickColThree,
    clickHeaderAccount,
    clickMenuExit,
    clickAnnouncementButton
}