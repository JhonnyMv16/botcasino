const clicks = require('./clicks.js')
const codes = require('./codes.js')

exports.bet = async function (casinoFrame, betCode, attempt) {
    var clicksToBet = 0

    switch (attempt) {
        case 7:
            clicksToBet = 13
            break
        case 6:
            clicksToBet = 9
            break
        case 5:
            clicksToBet = 6
            break
        case 4:
            clicksToBet = 4
            break
        case 3:
            clicksToBet = 3
            break
        case 2:
            clicksToBet = 2
            break
        case 1:
            clicksToBet = 1
            break
        default:
            throw Error(`Invalid attempet ${attempt}`)

    }

    switch (betCode) {
        case codes.HIGH_DOZEN: {
            await clicks.clickHighDozen(casinoFrame, clicksToBet)
            break;
        }
        case codes.MEDIUM_DOZEN: {
            await clicks.clickMediumDozen(casinoFrame, clicksToBet)
            break;
        }
        case codes.LOW_DOZEN: {
            await clicks.clickLowDozen(casinoFrame, clicksToBet)
            break;
        }
    }
}