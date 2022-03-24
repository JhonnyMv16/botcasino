const readline = require('readline');
const utils = require('./utils.js')

const DEFAULT_MAX_BETS = 5
const DEFAULT_VERIFICATIONS = 500
const DEFAULT_MIN_BALANCE = 5
const DEFAULT_CRITERION = 5
const DEFAULT_MAX_LOSS = 1

const STRATEGY_LOW = 1
const STRATEGY_HIGH = 2

const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const ask = (question) => new Promise(resolve => {
    reader.question(question, answer => resolve(answer))
})

async function askStrategy() {
    let answer = await ask(`Stratégia 1 ou Stratégia 2? (1 - $70) (2 - $180) \n`)

    if (answer === "1") {
        return STRATEGY_LOW
    }

    if (answer === "2") {
        return STRATEGY_HIGH
    }

    throw Error(`${answer} is an invalid Strategy, should be 1 or 2`)
}

async function askMaxBets() {
    let answer = await ask(`Máximo de apostas? (${DEFAULT_MAX_BETS}) \n`)

    if (answer === "") {
        return DEFAULT_MAX_BETS
    }

    return Number(answer)
}

async function askVerifications() {
    let answer = await ask(`Quantas verificações? (${DEFAULT_VERIFICATIONS})\n`)

    if (answer === "") {
        return DEFAULT_VERIFICATIONS
    }

    return Number(answer)
}

async function askBetCriterion() {
    let answer = await ask(`Critério de aposta? (${DEFAULT_CRITERION}) \n`)

    if (answer === "") {
        return DEFAULT_CRITERION
    }

    return Number(answer)
}

async function askUsername() {
    let answer = await ask("Usuário: \n")

    if (answer === "") {
        throw Error("O Usuário não pode ser vazio")
    }

    return answer
}

async function askPassword() {
    let answer = await ask("Senha: \n")

    if (answer === "") {
        throw Error("A senha não pode ser vazia")
    }

    return answer
}

async function askAttempts() {
    let possibleAttempts = ['1', '2', '3']
    let answer = await ask("Quantidade de tentativas? [1 - 3]\n")

    if (!possibleAttempts.includes(answer)) {
        throw Error("A quantidade precisar estar entre 1 e 3")
    }

    return Number(answer)
}

async function askMaxLoss() {
    let answer = await ask(`Máximo de 'Loss'? (${DEFAULT_MAX_LOSS})\n`)

    if (answer === "") {
        return DEFAULT_MAX_LOSS
    }

    return Number(answer)
}

const runSetup = async function () {
    return new Promise(async (resolve, reject) => {
        try {

            await utils.clearFolder('screenshots')

            let strategy = await askStrategy()
            let attempts = await askAttempts()
            let maxLoss = await askMaxLoss()
            let maxBets = await askMaxBets()
            let verifications = await askVerifications()
            let criterion = await askBetCriterion()
            let username = await askUsername()
            let password = await askPassword()
            let minBalance = DEFAULT_MIN_BALANCE

            resolve({ strategy, attempts, maxLoss, maxBets, verifications, username, password, minBalance, criterion })
        } catch (e) {
            reject(e)
        } finally {
            reader.close()
        }
    })
}

module.exports = {
    runSetup,
    STRATEGY_LOW,
    STRATEGY_HIGH
}
