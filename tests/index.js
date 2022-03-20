const actions = require('../src/actions.js')
const betManagerTests = require('./bet_manager_test.js')
const constants = require('./utils/test_constants.js')
const helpers = require('./utils/test_helpers.js')
const puppeteer = require('puppeteer');

/* Constants */

const TABLES_TO_BET = constants.TABLES_TO_BET
const TABLE_STATE_DEFAULT = constants.TABLE_STATE_DEFAULT
const TABLE_BET_POINTS = constants.TABLE_BET_POINTS

/* Helpers */

const testAsync = helpers.testAsync
const getHtmlRes = helpers.getHtmlRes

/* Tests */

const FindTablesToBetTest = async () => {
    let browser = await puppeteer.launch();
    let page = await browser.newPage()
    await page.setContent(getHtmlRes('loob.html'))

    let result = await actions.findTablesToBet(page)
    await browser.close()
    return result
}

const TableStateTest = async () => {
    let browser = await puppeteer.launch();
    let page = await browser.newPage()
    await page.setContent(getHtmlRes('casino.html'))

    let result = await actions.getTableState(page)
    await browser.close()
    return result
}

const TableBetPointsTest = async () => {
    let browser = await puppeteer.launch();
    let page = await browser.newPage()
    await page.setContent(getHtmlRes('casino.html'))

    let result = await actions.getTableBetPoints(page)
    await browser.close()
    return result
}

/* End Tests */

(async () => {

  //  await testAsync('Find tables to bet', TABLES_TO_BET, FindTablesToBetTest)
  //  await testAsync('Table state', TABLE_STATE_DEFAULT, TableStateTest)
  //  await testAsync('Table bet points', TABLE_BET_POINTS, TableBetPointsTest)

    betManagerTests.tests()

})();