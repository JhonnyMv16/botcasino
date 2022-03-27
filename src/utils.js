const fs = require('fs');
const path = require('path');


var print_step = 1;
var print_green = 1;
var print_loss = 1

const sleep = function (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const range = function (start, end, step = 1) {
  var ans = [];
  for (let i = start; i <= end; i += step) {
    ans.push(i);
  }
  return ans;
}

const clearFolder = (directory) => new Promise((resolve, reject) => {

  if (!fs.existsSync(directory)) {
    resolve()
    return
  }

  fs.readdir(directory, (err, files) => {
    if (err) reject(err);

    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) reject(err);
      })
    }

    resolve()
  })
})

async function runCatchingAsync(func, onError) {
  try {
    await func()
  } catch (error) {
    printError(error)
    await onError(error)
  }
}


const printScreen = async function (page) {
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  let path = `screenshots/step-${print_step}.jpg`
  await page.screenshot({ path: path });
  console.log(`print -> ${path}\n`)
  print_step++;
}

const printGreen = async function (page) {
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  let path = `screenshots/green-${print_green}.jpg`
  await page.screenshot({ path: path });
  console.log(`print green -> ${path}\n`)

  print_green++;
}


const printLoss = async function (page) {
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  let path = `screenshots/loss-${print_loss}.jpg`
  await page.screenshot({ path: path });
  console.log(`print loss -> ${path}\n`)

  print_loss++;
}

const printError = function (e) {
  console.error(`Error -> ${e.message}\n`)
  console.log('-------------------------')
  console.log(`\n${e.stack}\n`)
  console.log('-------------------------')
}


module.exports = {
  sleep,
  range,
  clearFolder,
  runCatchingAsync,
  printScreen,
  printGreen,
  printLoss,
  printError
}