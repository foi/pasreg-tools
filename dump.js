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
    //
    //const orgsResponse = await fetch(`https://pasreg.rosminzdrav.ru/api/orgs?subject_code=${subject}&per_page=100`, opts)
    const orgsResponse = await fetch(`https://pasreg.rosminzdrav.ru/api/orgs/mini_index?data={"subject_code":"${subject}","per_page":"100","type_id":null,"id":null,"search_text":null,"federal_name":null,"state_id":null,"page":null}`, opts)
    const orgsJson = await orgsResponse.json()
    console.log(orgsJson);
    const orgs = orgsJson.data
    console.log(`Регион: ${subject}, организаций: ${orgs.length}`)
    const orgsIdAndName = orgs.forEach(async (org) => {
       const folderName = `${org.id}@${formatShortName(org.nameshort)}`
       await mkdir(`${ROOT_PATH}/${folderName}`, { recursive: true })
       await mkdir(`${ROOT_PATH}/${folderName}/houses`, { recursive: true })
       await mkdir(`${ROOT_PATH}/${folderName}/frmo`, { recursive: true })
       console.log(`Дампаем данные об организации ${ROOT_PATH}/${folderName}/data.json`)
       await writeFile(`${ROOT_PATH}/${folderName}/data.json`, JSON.stringify(org))
       const orgInfoResponse = await (await fetch(`https://pasreg.rosminzdrav.ru/api/orgs/${org.id}`, opts)).json()
       if (orgInfoResponse.houses.length > 0) {
         orgInfoResponse.houses.forEach(async (h) => {
           const housePath = `${ROOT_PATH}/${folderName}/houses/${h.id}@${formatShortName(h.name)}`
           await mkdir(housePath, { recursive: true })
           console.log(`Дампаем данные о здании ${housePath}/data.json`)
           await writeFile(`${housePath}/data.json`, JSON.stringify(h))
         })
       }
       const orgDepartmentsResponse = await (await fetch(`https://pasreg.rosminzdrav.ru/api/org_departments?org_id=${org.id}&per_page=250`, opts)).json()
       if (orgDepartmentsResponse.data) {
         orgDepartmentsResponse.data.forEach(async (department) => {
           const departmentName = department.frmo_department && department.frmo_department.depart_name ? formatShortName(department.frmo_department.depart_name) : ''
           const departmentPath = `${ROOT_PATH}/${folderName}/frmo/${department.id}@${departmentName}`
           await mkdir(departmentPath, { recursive: true })
           console.log(`Дампаем данные об подразделении ${departmentPath}/data.json`)
           await writeFile(`${departmentPath}/data.json`, JSON.stringify(department))
         })
       }
     })
  } catch (e) {
    console.error(e)
  }

})()