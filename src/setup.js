const readline = require('readline');
const utils = require('./utils.js')

const DEFAULT_MAX_BETS = 5
const DEFAULT_VERIFICATIONS = 500
const DEFAULT_MIN_BALANCE = 5
const DEFAULT_CRITERION = 5
const DEFAULT_MAX_LOSS = 1

const STRATEGY_SIMPLE = 1
const STRATEGY_DOUBLE = 2
const STRATEGY_DOUBLE_ZERO = 3
const STRATEGY_UNIC_DOZEN = 4

const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const ask = (question) => new Promise(resolve => {
    reader.question(question, answer => resolve(answer))
})

async function askShouldSendResult() {
    let answer = await ask('Deseja receber os resultados por email?\n')
    switch (answer.toLowerCase()) {
        case "sim":
        case "ss":
        case "s":
            return true
        case "não":
        case "nao":
        case "n":
            return false
        default:
            throw Error("Resposta inválida, você precisa digitar 'Sim' ou 'Não'!")
    }
}

async function askEmail() {
    let answer = await ask(`Digite o email?\n`)

    if (answer === "") {
        throw Error("Email inválido")
    }

    return answer
}

async function askStrategy() {
    let answer = await ask(`Escolha uma estratégia?\n1 - Simples \n2 - Dupla \n3 - Dupla com zero\n4 - Dúzia única\n`)

    switch (answer) {
        case "1":
            return STRATEGY_SIMPLE
        case "2":
            return STRATEGY_DOUBLE
        case "3":
            return STRATEGY_DOUBLE_ZERO
        case "4":
            return STRATEGY_UNIC_DOZEN
    }

    throw Error(`${answer} is an invalid Strategy`)
}

async function askMaxBets() {
    let answer = await ask(`Quantas apostas? (${DEFAULT_MAX_BETS})\n`)

    if (answer === "") {
        return DEFAULT_MAX_BETS
    }

    return Number(answer)
}

async function askVerifications() {
    let answer = await ask(`Quantas verificações? (${DEFAULT_VERIFICATIONS}) | 1000 = 25 min\n`)

    if (answer === "") {
        return DEFAULT_VERIFICATIONS
    }

    return Number(answer)
}

async function askBetCriterion() {
    let answer = await ask(`Critério de aposta? (5)\n`)

    if (answer === "") {
        return DEFAULT_CRITERION
    }

    return Number(answer)
}

async function askUsername() {
    let answer = await ask("\nUsuário: \n")

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
    let possibleAttempts = ['1', '2', '3', "4", "5", "6", "7"]
    let answer = await ask("Quantidade de tentativas? (Martingale)\n")

    if (!possibleAttempts.includes(answer)) {
        throw Error(`A quantidade precisar estar entre ${possibleAttempts[0]} e ${possibleAttempts[possibleAttempts.length - 1]}`)
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

async function askUseMinValue() {
    let answer = await ask('Aposta com valor mínimo R$ 2,5 ? "sim" ou "não"\n')
    switch (answer.toLowerCase()) {
        case "sim":
        case "ss":
        case "s":
            return true
        case "não":
        case "nao":
        case "n":
            return false
        default:
            throw Error("Resposta inválida, você precisa digitar 'Sim' ou 'Não'!")
    }
}

const runSetup = async function () {
    return new Promise(async (resolve, reject) => {
        try {

            await utils.clearFolder('screenshots')

            var shouldUseMinValue = true
            var email = undefined

            let strategy = await askStrategy()
            let attempts = await askAttempts()
            let maxBets = await askMaxBets()
            let maxLoss = await askMaxLoss()
            let criterion = await askBetCriterion()
            let verifications = await askVerifications()

            if (strategy !== STRATEGY_UNIC_DOZEN) {
                shouldUseMinValue = await askUseMinValue()
            }

            
            var shouldSendEmailResult = await askShouldSendResult()

            if (shouldSendEmailResult) {
                email = await askEmail()
            }

            let username = await askUsername()
            let password = await askPassword()
            let minBalance = DEFAULT_MIN_BALANCE

            resolve({ strategy, attempts, maxLoss, maxBets, verifications, shouldUseMinValue, username, password, minBalance, criterion, shouldSendEmailResult, email })
        } catch (e) {
            reject(e)
        } finally {
            reader.close()
        }
    })
}

module.exports = {
    runSetup,
    STRATEGY_SIMPLE,
    STRATEGY_DOUBLE,
    STRATEGY_DOUBLE_ZERO,
    STRATEGY_UNIC_DOZEN
}
