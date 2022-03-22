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

module.exports = {
  sleep,
  range,
  clearFolder
}