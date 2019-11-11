(async () => {
  const util = require('util')
  const fs = require('fs')
  const readdir = util.promisify(fs.readdir)
  const readFile = util.promisify(fs.readFile)
  const writeFile = util.promisify(fs.writeFile)

  const TYPE = process.argv[2]
  const DATA_PATH = process.argv[3]

  const listMO = await readdir(DATA_PATH)

  const groupBy = (list, keyGetter) => {
    const map = new Map()
    list.forEach((item) => {
       const key = keyGetter(item)
       const collection = map.get(key)
       if (!collection) {
           map.set(key, [item])
       } else {
           collection.push(item)
       }
    })
    const xahMapToObj = (aMap => {
      const obj = {}
      aMap.forEach ((v,k) => { obj[k] = v })
      return obj
    })
    return xahMapToObj(map)
  }

  const readHousesPathsP = listMO.map(async (mo) => {
    const housesList = await readdir(`${DATA_PATH}/${mo}/houses`)
    return housesList.map(e => `${DATA_PATH}/${mo}/houses/${e}/data.json`)
  })

  const readFrmoPathsP = listMO.map(async (mo) => {
    const frmoList = await readdir(`${DATA_PATH}/${mo}/frmo`)
    return frmoList.map(e => `${DATA_PATH}/${mo}/frmo/${e}/data.json`)
  })

  const readPathsP = async (type) => {
    return listMO.map(async (mo) => {
      const list = await readdir(`${DATA_PATH}/${mo}/${list}`)
      return list.map(e => `${DATA_PATH}/${mo}/${list}/${e}/data.json`)
    })
  }

  const flattenToOneLevel = (array) => {
    const result = []
    array.forEach(a => {
      a.forEach(aa => {
        result.push(aa)
      })
    })
    return result
  }

  if (TYPE === 'houses') {
    const housesPathsRaw = (await Promise.all(readHousesPathsP)).filter(e => e.length !== 0)
    const housesPaths = flattenToOneLevel(housesPathsRaw)
    const readHousesP = housesPaths.map(async (path) => {
      const housesJson = JSON.parse((await readFile(path)).toString())
      const pathElements = path.split("/")
      return { mo: pathElements[2], frmo: pathElements[4], json: housesJson }
    })
    const housesData = await Promise.all(readHousesP)
    const housesDataGrouped = groupBy(housesData, h => h.mo)
    const resultArray = []
    //console.log(  Object.keys(housesDataGrouped));
    Object.keys(housesDataGrouped).forEach(mo => {
      const housesCount = housesDataGrouped[mo].length
      let stringTemplate = `${mo}\t${housesCount}\n`
      housesDataGrouped[mo].forEach(e => {
        let hasInternet = 0
        if (e.json && e.json.building && e.json.building.has_internet){
          hasInternet = 1
        }
        stringTemplate = stringTemplate + `${e.frmo}\t${hasInternet}\n`
      })
      resultArray.push(stringTemplate)
    })
    await writeFile('houses.csv', resultArray.join('\n'))
  }
  else if (TYPE === 'frmo') {

    const frmoPathsRaw = (await Promise.all(readFrmoPathsP)).filter(e => e.length !== 0)
    const frmoPaths = flattenToOneLevel(frmoPathsRaw)
    const readFrmoP = frmoPaths.map(async (path) => {
      const frmoJson = JSON.parse((await readFile(path)).toString())
      const pathElements = path.split("/")
      return { mo: pathElements[2], frmo: pathElements[4], json: frmoJson }
    })
    const frmoData = await Promise.all(readFrmoP)
    const frmoDataGrouped = groupBy(frmoData, h => h.mo)

    const resultArray = []

    Object.keys(frmoDataGrouped).forEach(mo => {
      const departmentsCount = frmoDataGrouped[mo].length
      let stringTemplate = `${mo}\t${departmentsCount}\n`
      frmoDataGrouped[mo].forEach(e => {
        console.log('e', e);
        let computers_count = 0
        let computers_mis_count = 0
        let has_mis_recipes = false
        let has_telemed = false
        if (e.json){
          if (e.json.computers_count) {
            computers_count = e.json.computers_count
          }
          if (e.json.computers_mis_count) {
            computers_mis_count = e.json.computers_mis_count
          }
          if (e.json.has_mis_recipes) {
            has_mis_recipes = e.json.has_mis_recipes
          }
          if (e.json.has_telemed) {
            has_telemed = e.json.has_telemed
          }
        }
        stringTemplate = stringTemplate + `${e.frmo}\t${computers_count}\t${computers_mis_count}\t${has_mis_recipes}\t${has_telemed}\n`
      })
      resultArray.push(stringTemplate)
    })
    await writeFile('frmo.csv', resultArray.join('\n'))
  }
})()