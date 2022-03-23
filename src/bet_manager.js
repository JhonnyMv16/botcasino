const actions = require('./actions.js')
const utils = require('./utils.js')
const { STRATEGY_LOW, STRATEGY_HIGH } = require('./setup.js')
const BET_MAX_ATTEMTPS = 3

const dG = utils.range(25, 36)
const dM = utils.range(13, 24)
const dB = utils.range(1, 12)

const cOne = utils.range(1, 36, 3)
const cTwo = utils.range(2, 36, 3)
const cThree = utils.range(3, 36, 3)

const DB_DM = 'DB_DM'
const DM_DA = 'DM_DA'
const DB_DA = 'DB_DA'

const BET_C1_C2 = 'BET_C1_C2'
const BET_C2_C3 = 'BET_C2_C3'
const BET_C1_C3 = 'BET_C1_C3'

function canBet(duzia, history, criterion) {
    let lastResults = history.slice(0, criterion)
    let canBet = true

    lastResults.forEach(item => {
        if (!canBet) return
        canBet = duzia.includes(item)
    })

    return canBet
}

const findPossibleBet = function (tables, config) {
    let tablesToBet = []

    tables.forEach(table => {
        let name = table.name
        let index = table.index

        if (table.history.length <= config.criterion) {
            console.log(`Histórico não encontrado, mesa ${name}, history: ${table.history}`)
            return
        }

        let history = table.history

        if (table.min === 2.50) {
            if (canBet(dG, history, config.criterion)) {
                let bet = 'Dúzia baixa e dúzia média'
                let code = DB_DM
                tablesToBet.push({ name, bet, code, history, index })
            } else if (canBet(dM, history, config.criterion)) {
                let bet = 'Dúzia baixa e dúzia alta'
                let code = DB_DA
                tablesToBet.push({ name, bet, code, history, index })
            } else if (canBet(dB, history, config.criterion)) {
                let bet = 'Dúzia média e dúzia alta'
                let code = DM_DA
                tablesToBet.push({ name, bet, code, history, index })
            } else if (canBet(cOne, history, config.criterion)) {
                let bet = 'Coluna 2 e coluna 3'
                let code = BET_C2_C3
                tablesToBet.push({ name, bet, code, history, index })
            } else if (canBet(cTwo, history, config.criterion)) {
                let bet = 'Coluna 1 e coluna 3'
                let code = BET_C1_C3
                tablesToBet.push({ name, bet, code, history, index })
            } else if (canBet(cThree, history, config.criterion)) {
                let bet = 'Coluna 1 e coluna 2'
                let code = BET_C1_C2
                tablesToBet.push({ name, bet, code, history, index })
            }
        }
    })

    return tablesToBet
}

async function clickZero(frame, count) {
    return await frame.evaluate((count) => {
        let elements = document.querySelectorAll('text.roulette-table-cell__text-tag')
        var element = undefined

        for (let index = 0; index < elements.length; index++) {
            let el = elements[index]
            if (el.textContent === "0") {
                element = el
            }
        }

        let rect = element.getBoundingClientRect()
        var clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(
            'click', true, true, window, 0,
            0, 0, rect.x, rect.y, false, false,
            false, false, 0, null
        );

        for (let index = 0; index < count; index++) {
            document.elementFromPoint(rect.x, rect.y + 10).dispatchEvent(clickEvent);
        }
    }, count)
}

async function clickMinValue(page, frame) {
    console.log('Click no valor mínimo..')
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
    await utils.sleep(1000)
    await actions.printScreen(page)
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

        for (let index = 0; index < count; index++) {
            document.elementFromPoint(rect.x, rect.y + 10).dispatchEvent(clickEvent);
        }
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

        for (let index = 0; index < count; index++) {
            document.elementFromPoint(rect.x, rect.y + 10).dispatchEvent(clickEvent);
        }
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

        for (let index = 0; index < count; index++) {
            document.elementFromPoint(rect.x, rect.y + 10).dispatchEvent(clickEvent);
        }
    }, count)
}

async function clickHeaderAccount(page) {
    await page.click('div.members-dropdown-component__members-icon-container')
}

async function clickMenuExit(page) {
    await page.click('div.members-dropdown-component__log-out-link')
}

async function clickAnnouncementButton(page, casinoFrame) {
    console.log('Closing offers...')
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

function isBetGreen(betCode, number, strategy) {
    var result = false

    switch (betCode) {
        case DB_DM: {
            result = (dB.includes(number) || dM.includes(number)) || (strategy == STRATEGY_HIGH && number === 0)
            break;
        }
        case DM_DA: {
            result = (dM.includes(number) || dG.includes(number)) || (strategy == STRATEGY_HIGH && number === 0)
            break;
        }
        case DB_DA: {
            result = (dB.includes(number) || dG.includes(number)) || (strategy == STRATEGY_HIGH && number === 0)
            break;
        }
        case BET_C1_C2: {
            result = (cOne.includes(number) || cTwo.includes(number)) || (strategy == STRATEGY_HIGH && number === 0)
            break;
        }
        case BET_C2_C3: {
            result = (cTwo.includes(number) || cThree.includes(number)) || (strategy == STRATEGY_HIGH && number === 0)
            break;
        }
        case BET_C1_C3: {
            result = (cOne.includes(number) || cThree.includes(number)) || (strategy == STRATEGY_HIGH && number === 0)
            break;
        }
    }

    return result
}

function hasErrorInState(state, table, criterion) {
    let xHistory = table.history.slice(0, criterion)
    let yHistory = state.history.slice(0, criterion)

    if (JSON.stringify(xHistory) !== JSON.stringify(yHistory)) {
        console.error('Erro -> Divergencia encontrada no histórico da mesa!\n')
        console.log(xHistory)
        console.log(yHistory)
        console.log('\n')
        return true
    }

    if (!state.canBet) {
        console.error('Erro -> O casino não está em periodo de aposta!\n')
        return true
    }

    console.log('Tudo certo para aposta!')
    return false
}

async function betByStrategy(betCode, attempt, strategy) {
    switch (strategy) {
        case STRATEGY_LOW:
            await betByStrategyLow(betCode, attempt)
            break
        case STRATEGY_HIGH:
            await betByStrategyHigh(betCode, attempt)
            break
        default:
            throw Error("Invalid strategy")
    }
}

async function betByStrategyLow(betCode, attempt) {
    var clicksToBet = 0

    switch (attempt) {
        case 3:
            clicksToBet = 9
            break
        case 2:
            clicksToBet = 3
            break
        default:
            clicksToBet = 1
    }

    switch (betCode) {
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
}

async function betByStrategyHigh(betCode, attempt) {
    var clicksToBet = 0
    var clicksZeroToBet = 0

    switch (attempt) {
        case 3:
            clicksToBet = 24
            clicksZeroToBet = 2
            break
        case 2:
            clicksToBet = 7
            clicksZeroToBet = 1
            break
        default:
            clicksToBet = 2
            clicksZeroToBet = 1
    }

    await clickZero(casinoFrame, clicksZeroToBet)

    switch (betCode) {
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
}

async function executeBet(page, casinoFrame, table, state, config) {
    await clickMinValue(page, casinoFrame)

    var currentState = state
    var isResultGreen = false
    var resultNumber = -1

    for (let attempts = 1; attempts <= BET_MAX_ATTEMTPS && !isResultGreen; attempts++) {

        console.log(`Tentativa ${attempts}\n`)

        await betByStrategy(table.code, attempts, config.strategy)

        console.log('Aposta realizada!')
        await utils.sleep(1000)
        await actions.printScreen(page)

        var finishedRound = false
        var oldHistory = currentState.history

        while (!finishedRound) {
            await utils.sleep(500)

            let newState = await actions.getTableState(casinoFrame)
            currentState = newState

            finishedRound = JSON.stringify(oldHistory) !== JSON.stringify(newState.history)
            resultNumber = newState.history[0]

            isResultGreen = isBetGreen(table.code, resultNumber, config.strategy)
        }

        if (!isResultGreen) {
            // wait some time for next bet
            await utils.sleep(2000)
        }
    }

    if (isResultGreen) {
        console.log(`${resultNumber} GREEN ✔️\n`)
        await actions.printGreen(page)
    } else {
        console.log(`${resultNumber} LOSS ❌\n`)
        await actions.printLoss(page)
    }

    console.log('Aposta finalizada!')
    await utils.sleep(5000)
    await actions.printBalance(casinoFrame)
}

const bet = async function (page, casinoFrame, table, config) {
    var betRealized = false

    console.log('\n✨ GO BET ✨ \n')
    console.log(`Mesa: ${table.name}\nAposta: ${table.bet}`)

    await actions.openTable(casinoFrame, table)
    await utils.sleep(5000)
    await actions.closeBetModal(casinoFrame)

    let state = await actions.getTableState(casinoFrame)

    if (hasErrorInState(state, table, config.criterion) === false) {
        await executeBet(page, casinoFrame, table, state, config)
        betRealized = true
    } else {
        await utils.sleep(10000)
    }

    await actions.printScreen(page)
    await actions.closeCasinoLive(casinoFrame)

    return betRealized
}

exports.betCodes = {
    DB_DM,
    DM_DA,
    DB_DA
}

module.exports = {
    findPossibleBet,
    bet,
    isBetGreen,
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