const fs = require('fs');

function compare(x, y) {
    return JSON.stringify(x) === JSON.stringify(y)
}

function getHtmlRes(name) {
    return fs.readFileSync(`C:/Users/Magno/Documents/NodeProjects/ws-bet/tests/resources/${name}`, 'utf8')
}

function testSync(name, expected, func) {
    let value = func()
    let result = compare(expected, value)
    if (result) {
        console.log(`${name} ✔️`)
    } else {
        console.log(`${name} ❌`)
        console.log('\nExpected')
        console.log(expected)
        console.log('\nResult')
        console.log(value)
    }
}

async function testAsync(name, expected, func) {
    let value = await func()
    let result = compare(expected, value)
    if (result) {
        console.log(`${name} ✔️`)
    } else {
        console.log(`${name} ❌`)
        console.log('\nExpected')
        console.log(expected)
        console.log('\nResult')
        console.log(value)
    }
}

module.exports = {
    compare,
    getHtmlRes,
    testAsync,
    testSync
}