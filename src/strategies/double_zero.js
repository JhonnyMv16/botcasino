const clicks = require('./clicks.js')

exports.bet = async function (casinoFrame, betCode, attempt) {
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

    await clicks.clickZero(casinoFrame, clicksZeroToBet)

    switch (betCode) {
        case DB_DM: {
            await clicks.clickLowDozen(casinoFrame, clicksToBet)
            await clicks.clickMediumDozen(casinoFrame, clicksToBet)
            break;
        }
        case DM_DA: {
            await clicks.clickMediumDozen(casinoFrame, clicksToBet)
            await clicks.clickHighDozen(casinoFrame, clicksToBet)
            break;
        }
        case DB_DA: {
            await clicks.clickLowDozen(casinoFrame, clicksToBet)
            await clicks.clickHighDozen(casinoFrame, clicksToBet)
            break;
        }
        case BET_C1_C2: {
            await clicks.clickColOne(casinoFrame, clicksToBet)
            await clicks.clickColTwo(casinoFrame, clicksToBet)
            break;
        }
        case BET_C2_C3: {
            await clicks.clickColTwo(casinoFrame, clicksToBet)
            await clicks.clickColThree(casinoFrame, clicksToBet)
            break;
        }
        case BET_C1_C3: {
            await vclickColOne(casinoFrame, clicksToBet)
            await clicks.clickColThree(casinoFrame, clicksToBet)
            break;
        }
    }
}