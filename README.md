# pasreg-tools
Утилиты для работы с "Паспорт медицинской организации Минздрава России" https://pasreg.rosminzdrav.ru/ - выгрузка и форматирование данных.

### Начало работы

* работу на ОС windows не проверял - на linux работает
* необходима nodejs новее 8 версии (нужна поддержка async/await)
* устанавливаем зависимости - `npm i`

### Дамп данных с портала

* Необходимо авторизоваться и перейдя, допустим, в раздел с подразделением, получить Cookie и Authorization. 

![Получаем данные об cookie и authorization](https://raw.githubusercontent.com/foi/pasreg-tools/master/assets/how-to-get-auth.png)

* Далее выполняем команду npm run dump кодрегиона "строка cookie" "строка authorization"

![дамп](https://raw.githubusercontent.com/foi/pasreg-tools/master/assets/how-to-dump.png)

* Выгруженные данные имеют структуру data/кодрегиона/{id@медорганизация},{houses-информация о зданиях,frmo-информация о подразделениях}/{id@наименование}/data.json

![формат выгрузки](https://raw.githubusercontent.com/foi/pasreg-tools/master/assets/structure.png)

### Форматирование данных в csv

Пример форматирования находится в export.js. 

Можно вывести данные о подключении к интернету здания (1 есть, 0 - нет) с суммой итого командой `npm run export houses data/идрегиона`.

![Отформатированная информация о зданиях](https://raw.githubusercontent.com/foi/pasreg-tools/master/assets/houses.csv.png)

Можно вывести информацию про подразделения (с суммами итого):
* Количество компьютеров в подразделении МО, всего
* Количество АРМ, подключенных к МИС/ГИС
* В подразделении оформляются электронные рецепты в МИС (true/false)
* Наличие телемедицинских технологий (true/false)

Командой `npm run export frmo data/идрегиона`

![Отформатированная информация о подразделениях](https://raw.githubusercontent.com/foi/pasreg-tools/master/assets/frmo.csv.png)
