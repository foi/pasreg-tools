(async () => {
  try {
    const fetch = require("node-fetch")
    const util = require('util'), fs = require('fs')
    const mkdir = util.promisify(fs.mkdir)
    const exists = util.promisify(fs.exists)
    const rename = util.promisify(fs.rename)
    const writeFile = util.promisify(fs.writeFile)

    const subject = process.argv[2]
    const cookie = process.argv[3]
    const auth = process.argv[4]

    MAX_FILE_NAME_LENGTH = 100

    const opts = {
      headers: {
        cookie: cookie,
        Authorization: auth
      }
    }

    const ROOT_PATH = `data/${subject}`
    console.log(`Данные по региону будут размещены в ${ROOT_PATH}`)
    if (!await exists('data')) {
      await mkdir('data', { recursive: true })
      await mkdir(ROOT_PATH, { recursive: true })
    }
    else {
      await rename('data/', `data_${Date.now()}/`)
      await mkdir('data', { recursive: true })
      await mkdir(ROOT_PATH, { recursive: true })
    }

    const truncateString = (str, num) => {
      if (str.length <= num) {
        return str
      }
      return str.slice(0, num) + '...'
    }

    const formatShortName = (e) => {
      const cleanedName = e.replace(/'/g, "").replace(/"/g, "").replace(/«/g, "").replace(/»/g, "").split(' ').join('_')
      return cleanedName.length > MAX_FILE_NAME_LENGTH ? truncateString(cleanedName, MAX_FILE_NAME_LENGTH) : cleanedName
    }

    const range = (start, end) => {
      if(start === end) return [start]
      return [start, ...range(start + 1, end)]
    }

    const getDataFromAllPages = async (url) => {
      const initialResponseRaw = await fetch(url, opts)
      const initialResponseJson = await initialResponseRaw.json()
      const pagesCount = parseInt(initialResponseJson["last_page"])
      const getP = range(1, pagesCount).map(async (i) => {
        const _raw = await fetch(`${url}&page=${i}`, opts)
        return await _raw.json()
      })
      const unformatted = await Promise.all(getP)
      const results = []
      const dataUnformatted = unformatted.map(e => e.data)
      dataUnformatted.forEach(d => {
        d.forEach(dd => {
          results.push(dd)
        })
      })
      return results
    }


    const orgs = await getDataFromAllPages(`https://pasreg.rosminzdrav.ru/api/orgs/mini_index?data={"subject_code":"${subject}","per_page":"10","type_id":null,"id":null,"search_text":null,"federal_name":null,"state_id":null,"page":null`)

    console.log(`Регион: ${subject}, организаций: ${orgs.length}`)

    orgs.forEach(async (org) => {
      const orgShortName = formatShortName(org.nameshort)
      const oid = org.oid
      const orgId = org.id
      const orgFolderName = `${oid}@${orgId}@${orgShortName}`
      await mkdir(`${ROOT_PATH}/${orgFolderName}`, { recursive: true })
      await mkdir(`${ROOT_PATH}/${orgFolderName}/houses`, { recursive: true })
      await mkdir(`${ROOT_PATH}/${orgFolderName}/frmo`, { recursive: true })
      console.log(`Дампаем данные об организации ${ROOT_PATH}/${orgFolderName}/data.json`)
      await writeFile(`${ROOT_PATH}/${orgFolderName}/data.json`, JSON.stringify(org))
      const departments = await getDataFromAllPages(`https://pasreg.rosminzdrav.ru/api/org_departments?org_id=${orgId}`)
      departments.forEach(async (department) => {
        const departmentName = department.frmo_department && department.frmo_department.depart_name ? formatShortName(department.frmo_department.depart_name) : ''
        const departmentPath = `${ROOT_PATH}/${orgFolderName}/frmo/${department.id}@${departmentName}`
        await mkdir(departmentPath, { recursive: true })
        console.log(`Дампаем данные об подразделении ${departmentPath}/data.json`)
        await writeFile(`${departmentPath}/data.json`, JSON.stringify(department))
      })
      const buildingsRaw = await fetch(`https://pasreg.rosminzdrav.ru/api/org_buildings?oid=${oid}`, opts)
      const buildings = await buildingsRaw.json()
      buildings.forEach(async (building) => {
        const buildingRaw = await fetch(`https://pasreg.rosminzdrav.ru/api/buildings/${building.id}`, opts)
        const buildingJson = await buildingRaw.json()
        const buildingPath = `${ROOT_PATH}/${orgFolderName}/houses/${building.id}@${formatShortName(building.name)}`
        await mkdir(buildingPath, { recursive: true })
        console.log(`Дампаем данные о здании ${buildingPath}/data.json`)
        await writeFile(`${buildingPath}/data.json`, JSON.stringify(buildingJson))
      })
    })
  } catch (e) {
    console.error(e)
  }

})()