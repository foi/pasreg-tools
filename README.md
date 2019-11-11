# pasreg-tools
Утилиты для работы с https://pasreg.rosminzdrav.ru/ - выгрузка и форматирование данных

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
