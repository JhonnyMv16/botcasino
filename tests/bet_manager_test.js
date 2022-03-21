const puppeteer = require('puppeteer');
const betManager = require('../src/bet_manager.js')
const constants = require('./utils/test_constants.js')
const helpers = require('./utils/test_helpers.js')
const actions = require('./../src/actions.js')

/* Constants */

const TABLES_TO_BET = constants.TABLES_TO_BET
const BET_DM_DA_EXPECTED = constants.BET_DM_DA_EXPECTED

/* Helpers */

const testsync = helpers.testSync
const testAsync = helpers.testAsync
const getHtmlRes = helpers.getHtmlRes

/* Tests */

const PossibleBetDbDaTest = () => {
  return betManager.findPossibleBet(TABLES_TO_BET)
}

const ClickMinValueTest = async () => {
  let browser = await puppeteer.launch();
  let page = await browser.newPage()
  await actions.exposeFunctions(page)
  await page.setContent(getHtmlRes('casino.html'))

  let result = await betManager.clickMinValue(page)
  await browser.close()
  return result
}

const ClickLowDozenTest = async () => {
  let browser = await puppeteer.launch();
  let page = await browser.newPage()
  await actions.exposeFunctions(page)
  await page.setContent(getHtmlRes('casino.html'))

  let result = await betManager.clickLowDozen(page, 1)
  await browser.close()
  return result
}

const clickMediumDozenTest = async () => {
  let browser = await puppeteer.launch();
  let page = await browser.newPage()
  await actions.exposeFunctions(page)
  await page.setContent(getHtmlRes('casino.html'))

  let result = await betManager.clickMediumDozen(page, 1)
  await browser.close()
  return result
}

const clickHighDozenTest = async () => {
  let browser = await puppeteer.launch();
  let page = await browser.newPage()
  await actions.exposeFunctions(page)
  await page.setContent(getHtmlRes('casino.html'))

  let result = await betManager.clickHighDozen(page, 1)
  await browser.close()
  return result
}

const clickColOneTest = async () => {
  let browser = await puppeteer.launch();
  let page = await browser.newPage()
  await actions.exposeFunctions(page)
  await page.setContent(getHtmlRes('casino.html'))

  let result = await betManager.clickColOne(page, 1)
  await browser.close()
  return result
}

const clickColTwoTest = async () => {
  let browser = await puppeteer.launch();
  let page = await browser.newPage()
  await actions.exposeFunctions(page)
  await page.setContent(getHtmlRes('casino.html'))

  let result = await betManager.clickColTwo(page, 1)
  await browser.close()
  return result
}

const clickColThreeTest = async () => {
  let browser = await puppeteer.launch();
  let page = await browser.newPage()
  await actions.exposeFunctions(page)
  await page.setContent(getHtmlRes('casino.html'))

  let result = await betManager.clickColThree(page, 1)
  await browser.close()
  return result
}

const clickHeaderAccountTest = async () => {
  let browser = await puppeteer.launch();
  let page = await browser.newPage()
  await actions.exposeFunctions(page)
  await page.setContent(getHtmlRes('index.html'))

  let result = await betManager.clickHeaderAccount(page)
  await browser.close()
  return result
}

const clickAnnouncementButtonTest = async () => {
  let browser = await puppeteer.launch();
  let page = await browser.newPage()
  await actions.exposeFunctions(page)
  await page.setContent(getHtmlRes('info_dialog.html'))

  let result = await betManager.clickAnnouncementButton(page, page)
  await browser.close()
  return result
}

exports.tests = async () => {

  testsync('Possible bet DM DA', BET_DM_DA_EXPECTED, PossibleBetDbDaTest)
  await testAsync('Click min value', undefined, ClickMinValueTest)
  await testAsync('Click low dozen', undefined, ClickLowDozenTest)
  await testAsync('Click medium dozen', undefined, clickMediumDozenTest)
  await testAsync('Click high dozen', undefined, clickHighDozenTest)
  await testAsync('Click col one', undefined, clickColOneTest)
  await testAsync('Click col two', undefined, clickColTwoTest)
  await testAsync('Click col three', undefined, clickColThreeTest)
  await testAsync('Click header account', undefined, clickHeaderAccountTest)
  await testAsync('Click annoucement button', undefined, clickAnnouncementButtonTest)
  
}