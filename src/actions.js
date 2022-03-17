"use strict";

async function findAsync(arr, asyncCallback) {
    const promises = arr.map(asyncCallback);
    const results = await Promise.all(promises);
    const index = results.findIndex(result => result);
    return arr[index];
}

/**
 * this method will click on tab with name 'Roulette'
 */
exports.clickRouletteTab = async function clickRouletteTab(page) {
    console.log('Finding tab..')
    let tabs = await page.$$('.lobby-category__slide')
    let rouletteTab = await findAsync(tabs, async h => await h.evaluate(el => el.textContent.trim().includes('Roulette')))
    
    if (!rouletteTab) {
        console.log('Roullete tab not found')
        process.exit(0)
    }

    await rouletteTab.click()
    console.log('Roulette tab clicked')
}

// lobby-category-item__icon

/**
 * this method will retrieve all tables from page
 * 
 * table result example
 * 
 * {
    name: 'Football French Roulette',
    min: '2.50',
    max: '10,000',
    history: [
      '31', '34', '29',
      '18', '3',  '25',
      '18', '5',  '13',
      '13'
    ]
  }
 */
exports.retrieveTables = async function retrieveTables(page) {
    console.log('Verificando mesas..')
    let tables = await page.$$('.lobby__container .lobby-tables__item .lobby-table__wrapper')
    let result = await Promise.all(
        tables.map(async table => {
            let name = await table.$eval('.lobby-table__name-container', el => el.innerText.trim())
            let minMax = await table.$eval('.lobby-table__limits', el => el.innerText.trim())
            let historyContainerList = await table.$$('.lobby-table__container > div:nth-child(4) > div')

            let inlineMinMax = minMax.replace('R$', '').replace(/(\r\n|\n|\r)/gm, "").replace('- ', '-').replace(' ','')
            let min = inlineMinMax.split('-')[0]
            let max = inlineMinMax.split('-')[1] 

            let history = []

            for (let h of historyContainerList) {
                let divs = await h.$$('div')
                for (let div of divs) {
                    let object = await div.evaluate(e => {
                        let value = Number(e.innerText.trim())
                        return {  class: e.className, value }
                    })
                    
                    if (object.class.includes('roulette-history-item__value-')) {
                        history.push(object.value)
                    }
                }
            }
            
            return { name, min, max, history }
     })
    )

    console.log(result.length + ' mesas encontradas!')
    console.log(result)
    return result
}

exports.findTablesToBet = function findTablesToBet(tables) {
    console.log('Verificando possibilidade de aposta..')
    let tablesToBet = []

    let dG = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]

    tables.forEach(table => {
        if (table.min !== '2.50') {
            return
        }

        let lastResults = table.history.slice(0, 4)
        console.log(lastResults)

        if (lastResults.some(item => {
            let inc = dG.includes(item)
            console.log(item, inc)
            return inc
        })) {
            tablesToBet.push({
                name: table.name,
                bet: 'Dúzia média e dúzia baixa'
            })
        }
    })

    if (tablesToBet.length === 0) {
        console.log('Sem possíbilidade de apostas')
    }

    return tablesToBet
}