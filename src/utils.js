const fs = require('fs');
const path = require('path');

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

async function runCatchingAsync(func) {
  try {
      await func()
  } catch (error) {
      actions.printError(error)
      await actions.printScreen(page)
  }
}

module.exports = {
  sleep,
  range,
  clearFolder,
  runCatchingAsync
}