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
const BET_SLICE = 6

function canBetInDUZIA(duzia, history) {
    let lastResults = history.slice(0, BET_SLICE)
    let canBet = true

    lastResults.forEach(item => {
        if (!canBet) return
        canBet = duzia.includes(item)
    })

    return canBet
}

function canBetInCOLUMN(column, history) {
    let lastResults = history.slice(0, BET_SLICE)
    let canBet = true

    lastResults.forEach(item => {
        if (!canBet) return
        canBet = column.includes(item)
    })

    return canBet
}

exports.betCodes = {
    DB_DM,
    DM_DA,
    DB_DA
}

const findPossibleBet = function (tables) {
    // console.log('Verificando possibilidade de aposta..\n')
    let tablesToBet = []

    tables.forEach(table => {
        let name = table.name
        let history = table.history.slice(0, BET_SLICE)
        let className = table.className
        let index = table.index

        if (table.min !== '2.50') {
            // skip tables
            return
        }
        // check duzias
        else if (canBetInDUZIA(dG, table.history)) {
            let bet = 'Dúzia baixa e dúzia média'
            let code = DB_DM
            tablesToBet.push({ name, bet, code, history, className, index })
        }

        else if (canBetInDUZIA(dM, table.history)) {
            let bet = 'Dúzia baixa e dúzia alta'
            let code = DB_DA
            tablesToBet.push({ name, bet, code, history, className, index })
        }

        else if (canBetInDUZIA(dB, table.history)) {
            let bet = 'Dúzia média e dúzia alta'
            let code = DM_DA
            tablesToBet.push({ name, bet, code, history, className, index })
        }

        // check columns
        else if (canBetInCOLUMN(cOne, table.history)) {
            let bet = 'Coluna 2 e coluna 3'
            let code = BET_C2_C3
            tablesToBet.push({ name, bet, code, history, className, index })
        }

        else if (canBetInCOLUMN(cTwo, table.history)) {
            let bet = 'Coluna 1 e coluna 3'
            let code = BET_C1_C3
            tablesToBet.push({ name, bet, code, history, className, index })
        }

        else if (canBetInCOLUMN(cThree, table.history)) {
            let bet = 'Coluna 1 e coluna 2'
            let code = BET_C1_C2
            tablesToBet.push({ name, bet, code, history, className, index })
        }
    })

    return tablesToBet
}

async function clickAt(page, x, y, count) {
    return await Promise.all([
        page.mouse.click(x, y, { clickCount: count }),
        utils.sleep(300)
    ])
}

async function clickAtFrame(frame, count=1, elementSelector) {


    return await frame.evaluate((count) => {
        var el = document.querySelectorAll('.chip-animation-wrapper')[0]
        let rect = el.getBoundingClientRect()
        clickXy(rect.x, rect.y, count)
    }, count)
}

async function exposeFunction(frame) {
    return await frame.exposeFunction("clickXy", function click(x, y, count){
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
    })
}

async function clickMinValue(frame, count) {
    await exposeFunction(frame)
    return await frame.evaluate((count) => {
        var el = document.querySelectorAll('.chip-animation-wrapper')[0]
        let rect = el.getBoundingClientRect()
        clickXy(rect.x, rect.y, count)
    }, count)
}

async function clickLowDozen(page, count) {
    return await clickAt(page, 667.5, 736.4, count)
}

async function clickMediumDozen(page, count) {
    return await clickAt(page, 832.7, 736.4, count)
}

async function clickHighDozen(page, count) {
    return await clickAt(page, 1002.22, 736.4, count)
}

async function clickColOne(page, count) {
    return await clickAt(page, 1114.4, 696.4, count)
}

async function clickColTwo(page, count) {
    return await clickAt(page, 1114.4, 654.6, count)
}

async function clickColThree(page, count) {
    return await clickAt(page, 1114.4, 612.8, count)
}

const bet = async function (page, casinoFrame, table) {
    return new Promise(async (resolve, reject) => {
        try {
            await actions.openTable(casinoFrame, table)
            await utils.sleep(4000)
            await actions.printScreen(page)
      
            await actions.closeBetModal(casinoFrame)
    
            let balance = await actions.getBalance(casinoFrame)
    
            console.log(`Saldo atual: R$ ${balance}\n`.replace('.', ','))
    
            if (Number(balance) < 20) {
                console.error('Erro -> Saldo insuficiente para realizar aposta!\n')
                await utils.sleep(30000)
                await actions.closeCasinoLive(casinoFrame)
                resolve(false)
                return
            }
    
            let state = await actions.getTableState(casinoFrame)
            let xHistory = table.history.slice(0, BET_SLICE)
            let yHistory = state.history.slice(0, BET_SLICE)
    
            if (JSON.stringify(xHistory) !== JSON.stringify(yHistory)) {
                console.error('Erro -> Divergencia encontrada no histórico da mesa!\n')
                console.log(xHistory)
                console.log(yHistory)
                console.log('\n')
                await utils.sleep(30000)
                await actions.closeCasinoLive(casinoFrame)
                resolve(false)
                return
            }
    
            if (!state.canBet) {
                console.error('Erro -> O casino não está em periodo de aposta!\n')
                await actions.printScreen(page)
                await utils.sleep(30000)
                await actions.closeCasinoLive(casinoFrame)
                resolve(false)
                return
            }
    
            const MAX_ATTEMTPS = 2
    
            var currentState = state
            var isResultGreen = false 
            var resultNumber = 0
    
            await clickMinValue(page, 1)
            await actions.printScreen(page)
    
            for (let attempts = 1; attempts <= MAX_ATTEMTPS && !isResultGreen; attempts++) {
                
                console.log(`Tentativa ${attempts}\n`)
    
                var clicksToBet = 1
    
                if (attempts === 2) {
                    clicksToBet = 3
                }
    
                switch (table.code) {
                    case DB_DM: {
                        await clickLowDozen(page, clicksToBet)
                        await clickMediumDozen(page, clicksToBet)
                        break;
                    }
                    case DM_DA: {
                        await clickMediumDozen(page, clicksToBet)
                        await clickHighDozen(page, clicksToBet)
                        break;
                    }
                    case DB_DA: {
                        await clickLowDozen(page, clicksToBet)
                        await clickHighDozen(page, clicksToBet)
                        break;
                    }
                    case BET_C1_C2: {
                        await clickColOne(page, clicksToBet)
                        await clickColTwo(page, clicksToBet)
                        break;
                    }
                    case BET_C2_C3: {
                        await clickColTwo(page, clicksToBet)
                        await clickColThree(page, clicksToBet)
                        break;
                    }
                    case BET_C1_C3: {
                        await clickColOne(page, clicksToBet)
                        await clickColThree(page, clicksToBet)
                        break;
                    }
                }

                console.log('Aposta feita!')
                await actions.printScreen(page)
    
                var finishedRound = false
                while (!finishedRound) {
                    await utils.sleep(2000)
    
                    console.log('Get Table State')
                    await actions.printScreen(page)
                    let newState = await actions.getTableState(casinoFrame)
                    resultNumber = newState.history[0]
                    finishedRound = currentState.history[0] !== resultNumber
    
                    if (finishedRound) {
                        isResultGreen = newState.balance > currentState.balance
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
    
            console.log('Finish bet')
            console.log(`Saldo atual: R$ ${balance}\n`.replace('.', ','))
            await actions.printScreen(page)

            resolve(true)
        }catch(e){
            reject(e)
        }
    })
}

module.exports = {
    findPossibleBet,
    bet,
    clickMinValue
}