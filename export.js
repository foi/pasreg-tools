(async () => {
  const util = require('util')
  const fs = require('fs')
  const readdir = util.promisify(fs.readdir)

  const TYPE = process.argv[2]
  const DATA_PATH = process.argv[3]

  const listMO = await readdir(DATA_PATH)

  const readP = listMO.map((mo) => {
    const overall = { }
    return readdir(`${DATA_PATH}/${mo}/frmo`)
    .then((frmoList) => {
      overall[mo] = {}
      overall[mo]['frmo'] = frmoList
      return readdir(`${DATA_PATH}/${mo}/houses`)
    })
    .then((housesList) => {
      overall[mo]['houses'] = housesList
      return overall
    })
  })
  const overall = await Promise.all(readP)
  console.log(JSON.stringify(overall))
  //
  // listMO.forEach(async (mo) => {
  //   const frmoList = await readdir(`${DATA_PATH}/${mo}/frmo`)
  //   const housesList = await readdir(`${DATA_PATH}/${mo}/houses`)
  //   overall[mo] = {}
  //   overall[mo]['frmo'] = frmoList
  //   overall[mo]['houses'] = housesList
  // })

  // console.log(overall);
})()