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

async function click(page, x, y, count) {
    for (let index = 1; index <= count; index++) {
        await page.mouse.click(x, y)
        await utils.sleep(250)
    }
}

const bet = async function (page, casinoFrame, table) {
    return new Promise(async (resolve) => {
        
        await actions.openTable(casinoFrame, table)
        await utils.sleep(1500)
        await actions.printScreen(page)
        
        await actions.closeBetModal(casinoFrame)

        let balance = await actions.getBalance(casinoFrame)

        if (Number(balance) < 5) {
            console.error('Erro -> Saldo insuficiente para realizar aposta!\n')
            await actions.closeCasinoLive(casinoFrame)
            resolve()
            return
        }

        let state = await actions.getTableState(casinoFrame)
        let xHistory = table.history.slice(0, 3)
        let yHistory = state.history.slice(0, 3)

        if (JSON.stringify(xHistory) !== JSON.stringify(yHistory)) {
            console.error('Erro -> Divergencia encontrada no histórico da mesa!\n')
            console.log(xHistory)
            console.log(yHistory)
            await actions.closeCasinoLive(casinoFrame)
            resolve()
            return
        }

        if (!state.canBet) {
            console.error('Erro -> O casino não está em periodo de aposta!\n')
            await actions.printScreen(page)
            await actions.closeCasinoLive(casinoFrame)
            resolve()
            return
        }

        await actions.clickMinValue(casinoFrame)
        await utils.sleep(500)

        const MAX_ATTEMTPS = 2

        var currentState = state
        var isResultGreen = false 
        var resultNumber = 0

        const betPoints = await actions.getTableBetPoints(casinoFrame)

        for (let attempts = 1; attempts <= MAX_ATTEMTPS && !isResultGreen; attempts++) {
            
            switch (table.code) {
                case DB_DM: {
                    click(page, betPoints.db.x, betPoints.db.y, attempts)
                    click(page, betPoints.dm.x, betPoints.dm.y, attempts)
                }
                case DM_DA: {
                    click(page, betPoints.dm.x, betPoints.dm.y, attempts)
                    click(page, betPoints.da.x, betPoints.da.y, attempts)
                }
                case DB_DA: {
                    click(page, betPoints.db.x, betPoints.db.y, attempts)
                    click(page, betPoints.da.x, betPoints.da.y, attempts)
                }
                case BET_C1_C2: {
                    click(page, betPoints.c1.x, betPoints.c1.y, attempts)
                    click(page, betPoints.c2.x, betPoints.c2.y, attempts)
                }
                case BET_C2_C3: {
                    click(page, betPoints.c2.x, betPoints.c2.y, attempts)
                    click(page, betPoints.c3.x, betPoints.c3.y, attempts)
                }
                case BET_C1_C3: {
                    click(page, betPoints.c1.x, betPoints.c1.y, attempts)
                    click(page, betPoints.c3.x, betPoints.c3.y, attempts)
                }
            }

            var finishedRound = false
            while (!finishedRound) {
                await utils.sleep(1000)

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
        } else {
            console.log(`${resultNumber} LOSS ❌\n`)
        }

        resolve()
    })
}

module.exports = {
    findPossibleBet,
    bet
}