const betManager = require('../src/bet_manager.js')
const constants = require('./utils/test_constants.js')
const helpers = require('./utils/test_helpers.js')

/* Constants */

const TABLES_TO_BET = constants.TABLES_TO_BET

const BET_DM_DA_EXPECTED = [
    {
      name: 'Roulette',
      bet: 'Dúzia média e dúzia alta',
      code: 'DM_DA',
      history: [ 3, 1, 3, 1, 11, 4 ],
      className: 'lobby-table__wrapper',
      index: 1
    }
  ]

/* Helpers */

const testsync = helpers.testSync

/* Tests */

const PossibleBetDbDaTest = () => {
    return betManager.findPossibleBet(TABLES_TO_BET)
}

exports.tests = () => {
    testsync('Possible bet DM DA', BET_DM_DA_EXPECTED, PossibleBetDbDaTest)
}