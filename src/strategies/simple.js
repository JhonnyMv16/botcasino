const clicks = require('./clicks.js')

exports.bet = async function (casinoFrame, betCode, attempt) {
    var clicksToBet = 0

    switch (attempt) {
        case 5:
            clicksToBet = 16
            break
        case 4:
            clicksToBet = 8
            break
        case 3:
            clicksToBet = 4
            break
        case 2:
            clicksToBet = 2
            break
        default:
            clicksToBet = 1
    }

    switch (betCode) {
        case BET_LN:
            await clicks.clickLowNumbers(casinoFrame, clicksToBet)
            break
        case BET_HN:
            await clicks.clickHighNumbers(casinoFrame, clicksToBet)
            break
        default:
            throw Error(`Invalid bet code ${betCode} for simple strategy`)
    }
}
