"use strict";

const doc = document;

// delete window.indexedDB; //<-- for test how to work a mobile devices

/**
 * Обьект с привызками к DOM элементам
 *
 * @default
 * @type {{textArea: HTMLTextAreaElement, saveButton: HTMLButtonElement, clearAreaButton: HTMLButtonElement, clearListButton: HTMLButtonElement, listNotes: HTMLElement, tagP: HTMLElementTagNameMap}}
 */
const docObj = {
  textArea: doc.getElementsByTagName('textarea')[0],
  saveButton: doc.getElementsByTagName('button')[0],
  clearAreaButton: doc.getElementsByTagName('button')[1],
  clearListButton: doc.getElementsByTagName('button')[2],
  listNotes: doc.getElementById('listNotes'),
  tagP: doc.getElementsByTagName('p')
};

/**
 * Константы для настроки хранилищь данных
 *
 * @constant
 * @default
 * @type {{LOCAL_STORAGE_NAME: string, INDEXED_DB_NAME: string, INDEXED_DB_STORAGE: string, INDEXED_DB_VERSION: number, COOKIE_NAME: string}}
 */
const SETTINGS = {
  LOCAL_STORAGE_NAME: 'textList',
  INDEXED_DB_NAME: 'areaDB',
  INDEXED_DB_STORAGE: 'textList',
  INDEXED_DB_VERSION: 1,
  COOKIE_NAME: 'area'
};


/**
 * Класс для взаимодействия с LocalStorage
 * Создается через new LocalStorageData
 *
 * @class
 * @param {string} storageName - имя хранилища в LocalStorage
 */
class LocalStorageData {
  constructor(storageName) {
    /**
     * _listObj - служит для хранения и обмена данными из LocalStorage между методами класса
     *
     * @private
     * @type {Object}
     */
    this._listObj = {};
    
    this.storageName = storageName || SETTINGS.LOCAL_STORAGE_NAME;
  }
  
  /**
   * Делает запрос к LocalStorage и полученные данные превращает из строки в обьект
   *
   * @private
   * @param {string} name - имя хранилища в LocalStorage
   * @returns {Object} - обьект к данными LocalStorage либо пустой обьект
   */
  _parse(name) {
    const nameStorage = (typeof name === "string") ? name : this.storageName;
    
    if (!localStorage[ nameStorage ]) {
      localStorage[ nameStorage ] = '{}'
    }
    
    try {
      this._listObj = JSON.parse(localStorage[ nameStorage ]);
    } catch (e) {
      console.warn("Empty parse LS");
      
      return {};
    }
  }
  
  /**
   * Сохраняет данные в LocalStorage, перезаписывая старые данные
   *
   * @private
   * @return {Object} - общий обьект с данными из конструктора куда попадают и новые данные для перезаписи LocalStorage при сохранении новых записей
   * @example
   * { "text": "1", "new text": "1", "awesome text ↵new↵text": "1" }
   */
  _save() {
    localStorage[ this.storageName ] = JSON.stringify(this._listObj);
    
    return this._listObj;
  }
  
  /**
   * Выводит все записи из LocalStorage.
   * Данные из LocalStorage приходят в виде JSON потому конвектируем их в массив
   * для удобной обработки в дальнейшем
   *
   * @return {Array}
   * @example
   * { "text": "1", "new text": "1", "awesome text ↵new↵text": "1" }
   * //==> [ "text", "new text", "awesome text ↵new↵text" ]
   */
  showAll() {
    this._parse();
    
    const dataObj = this._listObj;
    let dataArr = [];
    
    for(let valueObj in dataObj) {
      dataArr = dataArr.concat(valueObj);
    }
    
    return dataArr;
  }
  
  /**
   * Сохранение одной записи в LocalStorage
   *
   * @param {string} text - введенный текст из поля ввода
   */
  saveOne(text) {
    this._parse();
    
    text = text.trim();
    this._listObj[ text ] = "1";
    
    this._save();
  }
  
  /**
   * Проверяет на дубликаты (уже сохраненные ранее) записи в LocalStorage
   *
   * @param {string} text - введенный текст из поля ввода
   * @return {boolean} - true если запись уже существует
   */
  isDuplicate(text) {
    this._parse();
    
    text = text.trim();
    
    return !!this._listObj[ text ]
  }
  
  /**
   * Удаляет определенную запись из хранилища.
   * Для поиска записи используется полный текст записи.
   *
   * @param {string} text - введенный текст из поля ввода
   */
  removeOne(text) {
    this._parse();
    
    delete this._listObj[ text ];
    
    this._save();
  }
  
  /**
   * Удаляет само хранилище с записями из LocalStorage.
   * Необходимо указать имя хранилища которое принимается из конструктора this.storageName
   */
  removeAll() {
    localStorage.removeItem(this.storageName);
  }
  
  /**
   * Редактирование записи из LocalStorage.
   *
   * @param {string} oldValue - старые данные которые хотим заменить. Служат идентификатором по которому происходит поиск записи в LocalStorage
   * @param {string} newValue - новые данные
   */
  changeOne(oldValue, newValue) {
    const structuringDataOld = JSON.stringify(oldValue);
    const structuringDataNew = JSON.stringify(newValue);
    
    const changeData = localStorage[ this.storageName ].replace(structuringDataOld, structuringDataNew);
    
    localStorage[ this.storageName ] = changeData;
  }
}


/**
 * Класс для работы с IndexedDB
 * Создается через new IDBData
 *
 * @class
 * @param {string} dbName - имя базы данных
 * @param {number} version - версия базы данных
 * @param {string} storageName - имя таблицы в базе данных
 */
class IDBData {
  constructor(dbName, version, storageName) {
    this._dbName = dbName || SETTINGS.INDEXED_DB_NAME;
    this._version = version || SETTINGS.INDEXED_DB_VERSION;
    this._storageName = storageName || SETTINGS.INDEXED_DB_STORAGE;
  
    /**
     * _db - служит для хранения и обмена данными из IndexedDB между методами класса
     *
     * @private
     * @type {(null|Object)}
     */
    this._db = null;
  }
  
  /**
   * Создает базу данных и таблицу для хранения данных.
   * Получает все данные из IndexedDB если она доступна.
   * Сохраняет в _db данные которые получили и передаем их через Promise.
   *
   * @private
   * @return {Promise<Object>} - коллекция данных от IndexedDB или ошибку
   */
  _parse() {
    const idb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    
    const openRequest = idb.open(this._dbName, this._version);
    
    return new Promise((resolve, reject) => {
      openRequest.onerror = (event) => {
        reject(event.target.error.message);
      };
      
      openRequest.onsuccess = (event) => {
        try {
          const target = event.target;
          this._db = target.result;
          
          resolve(this._db);
        } catch (e) {
          reject(e);
        }
      };
      
      openRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if(!db.objectStoreNames.contains(this._storageName)) {
          const objectStore = db.createObjectStore(this._storageName, { autoIncrement: true });
          
          objectStore.createIndex("text", "text", { unique: true });
        }
      };
    });
  }
  
  /**
   * Закрывает соединение с базой данных и обнуляет данные _db в конструкторе
   *
   * @private
   */
  _close() {
    this._db.close();
    this._db = null;
  }
  
  /**
   * Подключаем транзакции для взаимодействия с данными IndexedDB
   *
   * @async
   * @private
   * @param {boolean} readOnlyWrite - true включает режим readonly
   * @return {Promise<{tx: (never|IDBTransaction|void), store: IDBObjectStore}>} - коллекция полученная транзакицей для дальнейшей работы с IndexedDB и ее данными
   */
  async _store(readOnlyWrite) {
    readOnlyWrite = (typeof readOnlyWrite === 'boolean' && readOnlyWrite === true) ? "readonly" : "readwrite";
    
    try {
      const db = await this._parse();
      const tx = db.transaction(this._storageName, readOnlyWrite);
  
      return { tx, store: tx.objectStore(this._storageName) }
    } catch (e) {
      throw new Error("IDBData don't parse");
    }
  }
  
  /**
   * Вывести все данные из IndexedDB objectStore
   *
   * @async
   * @return {Promise<array>} - массив с записями или пустой массив в случае ошибки
   * @example
   * [ {text: "text"}, {text: "new text"}, {text: "awesome text ↵new↵text"} ]
   */
  async showAll() { //arr obj -> arr
    let data;
    
    try {
      const { store } = await this._store(true);
      
      data = store.getAll();
    } catch (e) {
      this.close();
      
      return Promise.resolve().then(() => []);
    }
    
    this._close();
    
    return new Promise(resolve => {
      data.onsuccess = event => resolve(event.target.result.map(elem => elem.text));
      data.onerror = event => resolve([]);
    });
  }
  
  /**
   * Сохранение одной записи в таблицу IndexedDB
   *
   * @async
   * @param {string} text - новая запись для сохранения
   * @return {Promise<void>}
   */
  async saveOne(text) {
    text = text.trim();
    
    try {
      const { store } = await this._store();
  
      store.add({ text: text });
    } catch (e) {}
    
    this._close();
  }
  
  /**
   * Проверка на дублирование (существование записи) в IndexedDB таблице
   *
   * @async
   * @param {string} text - полный текст записи для сравнения
   * @return {Promise<boolean>} - true запись уже существует
   */
  async isDuplicate(text) {
    text = text.trim();
    
    let data;
    
    try {
      const { store } = await this._store(true);
      data = store.index("text").get(text);
    } catch (e) {
      this._close();
      
      return Promise.resolve().then(() => false);
    }
    
    this._close();
    
    return new Promise(resolve => {
      data.onsuccess = event => resolve(!!event.target.result);
      data.onerror = event => resolve(false);
    });
  }
  
  /**
   * Удаление одной конкретной записи. Идентификатор - текст записи
   *
   * @async
   * @param {string} text - идентификатор для поиска записи в таблице IndexedDB objectStore
   */
  async removeOne(text) {
    try {
      const { store } = await this._store();
  
      const index = store.index("text"); // add, clear, count, delete, get, getAll, getAllKeys, getKey, put
  
      index.getKey(text).onsuccess = (event) => {
        const key = event.target.result;
    
        store.delete(key)
      };
    } catch (e) {}
    
    this._close();
  }
  
  /**
   * Очистка от всех записей таблицы IndexedDB
   *
   * @async
   * */
  async removeAll() {
    try {
      const { store } = await this._store();
  
      store.clear();
    } catch (e) {}
    
    this._close();
  }
  
  /**
   * Редактирование записи в таблице IndexedDB.
   *
   * @async
   * @param {string} oldValue - старые данные которые хотим заменить. Служат идентификатором по которому происходит поиск записи в таблице IndexedDB objectStore
   * @param {string} newValue - новые данные
   */
  async changeOne(oldValue, newValue) {
    try {
      const { store } = await this._store();
  
      const index = store.index("text");
  
      index.openCursor(oldValue).onsuccess = (event) => {
        const cursor = event.target.result;
    
        cursor.update({ text: newValue })
      };
    } catch (e) {}
    
    this._close();
  }
}


/**
 * Адаптер, слежит для переключения между классами IndexedDB и LocalStorageData.
 * Если нам не доступна indexedDB в браузере то используем LocalStorage
 * для хранения и взаимодествия с хранилищем данных браузера.
 * Создается через new LocalData
 *
 * @class
 * @param {Object} ls - ссылка на класс LocalStorageData
 * @param {Object} idb - ссылка на класс IDBData
 */
class LocalData {
  constructor(ls, idb) {
    this._localStorage = ls;
    this._indexedDB = idb;
  }
  
  /**
   * Управление выбором хранилища для данных в браузере.
   * Если не доступно indexedDB то используем LocalStorage
   *
   * @private
   * @return {Object} - ссылка на методы выбранного класса
   */
  _managerData() {
    const idb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    
    if(!idb) return this._localStorage;
    
    return this._indexedDB;
  }
  
  /**
   * Показать все записи из хранилища
   *
   * @return {Promise<array>} - массив данныих или пустой массив
   */
  showAll() {
    return Promise.resolve().then(() => this._managerData().showAll());
  }
  
  /**
   * Сохранение одной записи в хранилище
   *
   * @param {string} text - введенный текст из поля ввода
   */
  saveOne(text) {
    this._managerData().saveOne(text);
  }
  
  /**
   * Проверяет на дубликаты (уже сохраненные ранее) записи в хранилище
   *
   * @param {string} text - введенный текст из поля ввода
   * @return {Promise<boolean>} - true если запись уже существует
   */
  isDuplicate(text) {
    return Promise.resolve().then(() => this._managerData().isDuplicate(text));
  }
  
  /**
   * Удаляет определенную запись из хранилища.
   * Для поиска записи используется полный текст записи.
   *
   * @param {string} text - введенный текст из поля ввода
   */
  removeOne(text) {
    this._managerData().removeOne(text);
  }
  
  /** Очищает хранилище от всех записей */
  removeAll() {
    this._managerData().removeAll();
  }
  
  /**
   * Редактирование записи в хранилище.
   *
   * @param {string} oldValue - старые данные которые хотим заменить. Служат идентификатором по которому происходит поиск записи в хранилище
   * @param {string} newValue - новые данные
   */
  changeOne(oldValue, newValue) {
    this._managerData().changeOne(oldValue, newValue);
  }
}

const localStorageData = new LocalStorageData();
const idbData = new IDBData();
const localData = new LocalData(localStorageData, idbData);


/**
 * Класс для работы с хранилищем Cookie браузера
 *
 * @class
 * @param {string} key - ключ для идентификации хранилища cookie браузера
 * @example
 * new CookieData().set("awesome text", { expires: 7, path: '' });
 * new CookieData("areaName").set("awesome text", { expires: 7, path: '' });
 * new CookieData().set("awesome text", { expires: 7, secure: false });
 * new CookieData().set("new 55↵text<>lkj@_dfdf");
 * new CookieData().set("new 55↵text");
 * new CookieData().set("some text");
 * new CookieData().remove();
 * console.log(new CookieData().get());
 */
class CookieData {
  constructor(key) {
    this.key = key || SETTINGS.COOKIE_NAME
  }
  
  /**
   * Удаляет символы несущие угрозу коду котоыре мог ввести пользователь
   * "#","$","&","+",":","<",">","=","/","?","@","[","]","^","`","{","}","|","""
   *
   * @private
   * @param {string} value - строка которая будет измененена если в ней есть ненужные символы
   * @return {string} - строка с удаленными символами
   * @example
   * some%20text%20link%20%3Ca%20href%3D'%23'%3ELink%3C%2Fa%3E
   * //==> some%20text%20link%20a%20href''Linka
   */
  _replace(value) {
    return value.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, '');
  }
  
  /**
   * Кодирует строки исопьзуя функцию кодировки JavaScript encodeURIComponent.
   * После чего происходит удаление ненужных символов используя метод _replace
   *
   * @private
   * @param {string} value - строка которую передали
   * @return {string} - закодированная строка
   * @example
   * "some text link <a href='#'>Link</a>"
   * //==> some%20text%20link%20%3Ca%20href%3D'%23'%3ELink%3C%2Fa%3E
   * //==> some%20text%20link%20a%20href''Linka
   */
  _encode(value) {
    return this._replace(encodeURIComponent(String(value)));
  }
  
  /**
   * Декодирует закодированную строку изменя спец-символы
   *
   * @private
   * @param {string} value - закодированная строка
   * @return {string} - разкодированная строка
   * @example
   * some%20text%20link%20a%20href''Linka
   * // ==> some text link a href''Linka
   */
  _decode(value) {
    return decodeURIComponent(String(value));
  }
  
  /**
   * Формирует строку с данными для запросов в хранилище и устанавливает cookie браузера
   *
   * @param {string} value - данные которую будет хранить cookie
   * @param {{expires: number, path: string, domain: string, secure: boolean}} attr - настройка параметров (expires - количество дней жизни куки, path - на какой странице будет испоьзоватся, domain - домен на котором устанавливаем куки, secure - true означает что кука защищенная)
   * @return {string} - сформированную строку устанавливаем в cookie браузера
   */
  set(value, attr = {}) {
    if (typeof document === 'undefined' || !this.key || typeof attr !== 'object') return;
    
    if (attr.expires && typeof attr.expires === 'number') {
      // attr.expires = new Date(new Date() * 1 + attr.expires * 1000 * 60 * 60 * 24);
      attr.expires = new Date(new Date() * 1 + attr.expires * 864e+5);
    }
    
    attr.expires = (attr.expires) ? attr.expires.toUTCString() : '';
    
    this.key = this._encode(this.key);
    value = this._encode(value);
    
    attr.path = (attr.path) ? attr.path : '/';
    attr.domain = (attr.domain) ? attr.domain : '';
    attr.secure = (attr.secure) ? "secure" : '';
    
    let stringAttributes = '';
    
    for (let keyAttr in attr) {
      if (!attr.hasOwnProperty(keyAttr)) continue;
      
      if (attr[keyAttr]) {
        if (keyAttr !== "secure") {
          stringAttributes += '; ' + keyAttr + '=' + attr[ keyAttr ];
        } else {
          stringAttributes += '; ' + keyAttr;
        }
      }
    }
    
    return (document.cookie = this.key + '=' + value + stringAttributes);
  }
  
  /**
   * Выводит данные из cookie браузера
   * и декодирует их value для корректного отображения в браузере
   *
   * @readonly
   * @return {string} - декодированная строка
   * @example
   * some%20text%20link%20a%20href''Linka
   * // ==> some text link a href''Linka
   */
  get() {
    if (typeof document === 'undefined' || !this.key || typeof this.key !== 'string') return [];
    
    let cookies = document.cookie ? document.cookie.match('(^|;) ?' + this.key + '=([^;]*)(;|$)') : [];
    
    return this._decode(cookies[2]);
  }
  
  /**
   * Удаляет куки устанавливая дату в прошедшем времени
   *
   * @return {string}
   */
  remove() {
    return this.set('', { expires: -1 });
  }
}


/**
 * Класс отображает список коментариев под полем ввода
 * Создается через new ViewList
 *
 * @class
 */
class ViewList {
  constructor() {}
  
  /**
   * Создает разметку тегов вокруг текста.
   * Вставляет теги в указанные блок разметки на странице.
   *
   * @static
   * @param {Object} insertInto - ссылка на тег в который будем вставлять новые теги
   * @param {string} text - текст для вставки
   */
  wrapperTag(insertInto, text) {
    const newTag = document.createElement('p');
    const tagInside = document.createElement('span');
    
    newTag.className = "textParagraph";
    tagInside.className = "delete";
    
    tagInside.appendChild(document.createTextNode(' ' + String.fromCharCode(10006))); //add text
    newTag.appendChild(document.createTextNode(text)); //text before the cross to remove
  
    const tagWrapper = insertInto.appendChild(newTag); //listNotes --> p
    
    tagWrapper.appendChild(tagInside); //p -> span
  }
  
  /**
   * Производит вставку нескольких запсией из массива в переданный тег на странице.
   *
   * @param {Object} insertInto - ссылка на тег на странице в который будем вставлять несколько новых тегов разметки
   * @param {array} listArray - массив с текстом для вывода на страницу списком
   */
  storageShow(insertInto, listArray) {
    for (let list of listArray) {
      this.wrapperTag(insertInto, list);
    }
  }
}

/**
 * Класс для очистки списка коментариев под полем ввода
 * Создается через new ViewCleaner
 *
 * @class
 */
class ViewCleaner {
  constructor() {}
  
  /**
   * Удаляет указанные тег с страницы по ссылке на тег
   *
   * @static
   * @param {Object} tag - ссылка на тег
   * @return {*}
   */
  removeTag(tag) {
    return tag.remove();
  }
  
  /**
   * Очищает весь список коментариев с страницы
   *
   * @param {Object} allTags - коллекция DOM элементов для удаления
   * @return {null}
   */
  clearWrapperList(allTags) {
    let length = allTags.length;
    
    while (length) {
      length--;
      
      this.removeTag(allTags[ length ]);
    }
    
    return null;
  }
}


/**
 * Служит для хранение и передачи коллекции DOM элемента между методами классов.
 *
 * @module constructors
 * @type {{get, set, clear}}
 */
const bufferTagNote = (function () {
  /**
   * Храненит ссылку на DOM коллекцию
   *
   * @private
   * @type {(string|Object)}
   */
  let _bufferTag = '';
  
  return {
    /**
     * Считывает данные из переменной
     *
     * @readonly
     * @return {Object} - коллекция DOM элемента
     */
    get() {
      return _bufferTag;
    },
    /**
     * Сохраняет коллекцию одного DOM тега
     *
     * @param {Object} tag - коллекция DOM тега для сохранения
     */
    set(tag) {
      if (tag) {
        _bufferTag = tag;
      }
    },
    /** Очищает переменную от коллекций */
    clear() {
      _bufferTag = '';
    }
  }
})();


/**
 * Класс для редактирования и удаления записей списка комментариев
 *
 * @class
 */
class EditButtons {
  constructor() {}
  
  /**
   * Выдодит только текст из DOM элемента
   *
   * @static
   * @param {Object} tag - коллекция DOM элемента
   * @return {string} - текст записи комментария из DOM коллекции
   */
  textFromTag(tag) {
    const textTag = tag.innerHTML.split("<span")[ 0 ];
    
    return textTag.trim();
  }
  
  /**
   * Удаляет выбранный комментарий с страницы и с хранилища браузера
   *
   * @param {Object} event - коллекция выбранного DOM элемента
   * @param {Object} db - ссылка на класс для работы с хранилищем данных в браузере
   * @param {Object} view - ссылка на класс для удаления DOM элементов с страницы
   */
  deleteTag(event, db, view) {
    const { tagName, parentNode } = event.target;
    
    if (tagName === "SPAN" && parentNode.className === "textParagraph") {
      const trimText = this.textFromTag(parentNode);
      
      db.removeOne(trimText);
      view.removeTag(parentNode);
    }
  }
  
  /**
   * Редактирует выбранный комментарий на странице и в хранилище браузера
   *
   * @param {Object} event - коллекция выбранного DOM элемента
   * @param {Object} tagArea - ссылка на поле ввода на странице для вставки в него текста редактируемой записи
   * @return {Object}
   */
  editTag(event, tagArea) {
    const target = event.target;
    
    if (target.tagName === "P" && target.className === "textParagraph") {
      const trimText = this.textFromTag(event.target);
      
      tagArea.value = trimText;
      
      return target;
    }
  }
}


/**
 * Класс для переключения между одинарным и двойным кликом по комментарию
 * для удаления и редаклирования комментария
 *
 * @class
 * @param {{edit: function, delete: function}} buttonEvent - вместо наследования классов принимаем их в качестве аргументов используя нужные методы
 */
class SwitchClick {
  constructor(buttonEvent) {
    this.buttonEvent = buttonEvent;
  
    /**
     * нужен для переключения одинарного и двойного клика по записи
     *
     * @private
     * @type {boolean}
     */
    this._firing = false;
    /**
     * id таймера setTimeout
     *
     * @private
     * @type {number}
     */
    this._timer = 0;
  }
  
  /**
   * Управляет количеством кликов по записям комментариев.
   * Нужна чтобы не вешать события одинарого и двойного клика по одному тегу.
   * Используется только одинарный клик и ослеживаем повторный клик в течении 300мск.
   *
   * При одинарном клике по кнопке (кресту) происходит удаление если небыл второй клик по записи в течении 300мск
   * Если был двойной клик по записи то вызывается метод редактирования записи при этом отменяется тайнер для удаления записи.
   * Если клиенуть по записи один раз но не по кнопке удаления то запись не удалится.
   *
   * @param {Object} event - коллекция полученная из события клика по тегу DOM элемента
   * @return {*} - вызывает нужный метод редактирования либо удаления записи.
   */
  managementDoubleSingleClick(event) {
    if (this._firing) { //double click
      clearTimeout(this._timer);
      
      this._firing = false;
      return this.buttonEvent.edit(event);
    }
    
    this._firing = true;
    this._timer = setTimeout(() => {
      //if clicking is not repeated after the 300ms, call (one click)
      this.buttonEvent.delete(event);
      
      this._firing = false;
    }, 300);
    
    return false;
  }
}

const switchClick = new SwitchClick({
  edit: (event) => new EditButtons().editTag(event, docObj.textArea),
  delete: (event) => new EditButtons().deleteTag(event, localData, new ViewCleaner())
});


/**
 * Класс для рарботы с данными тектового поля ввода на странице
 *
 * @class
 * @param {Object} field - ссылка на тег поля ввода данных
 * @param {Object} db - ссылка на класс сохранения данных в браузере
 */
class TextField {
  constructor(field, db) {
    this.field = field;
    this.db = db;
  }
  
  /**
   * Получить данные из хранилища cookie и вывести их в поле ввода
   *
   * @readonly
   * @return {string} - вставляет данные из cookie и вставляет их в поле ввода либо вставляет пустую строку если данные небыли найдены
   */
  get() {
    const areaCookie = this.db.get();
    
    return this.field.value = (areaCookie !== "undefined") ? areaCookie : '';
  }
  
  /** Сохраняем данные из поля ввода в cookie браузера */
  set() {
    this.db.set(this.field.value, { expires: 7 })
  }
  
  /** Очищаем поле ввода и удаляем данные из cookie браузера */
  clear() {
    this.db.remove();
    this.field.value = '';
  }
}

const textField = new TextField(docObj.textArea, new CookieData());


/**
 * Функция инициалиации событий которые вешаются на кнопки
 * @function
 */
const initListeners = () => {
  /**
   * Функция для обьединения вызовов методов при нажатии кнопки сохранить.
   * Переключается между режимами сохранения и редактирования данных
   *
   * @async
   * @function
   * @param {Object} event - коллекция полученная при вызове события addEventListener
   */
  async function switchClicker(event) {
    event.preventDefault();
    
    const areaField = docObj.textArea;
    const dataStorage = await localData.isDuplicate(areaField.value);
    
    if (areaField.value.trim().length && !(dataStorage)) {
      const switchSaveEdit = bufferTagNote.get();
      
      if (switchSaveEdit) {
        let value = areaField.value;
        
        value = value.trim();
        
        const oldText = new EditButtons().textFromTag(switchSaveEdit);
        const newText = switchSaveEdit.innerHTML.replace(oldText, value);
        
        switchSaveEdit.innerHTML = newText;
        
        localData.changeOne(oldText, value);
        
        bufferTagNote.clear();
      } else {
        localData.saveOne(areaField.value);
        
        new ViewList().wrapperTag(docObj.listNotes, areaField.value);
      }
      
      textField.set();
    }
  }
  
  docObj.saveButton.addEventListener('click', switchClicker);
  
  
  docObj.clearAreaButton.addEventListener('click', (event) => {
    textField.clear();
  });
  
  
  docObj.clearListButton.addEventListener('click', (event) => {
    event.preventDefault();
    
    localData.removeAll();
    
    new ViewCleaner().clearWrapperList(docObj.tagP);
  });
  
  
  docObj.listNotes.addEventListener("click", (event) => {
    event.preventDefault();
    
    bufferTagNote.set(switchClick.managementDoubleSingleClick(event));
  });
};


/** При загрузке страницы загрузить и вывести данные из хранилищь данных браузера на страницу */
window.onload = async () => {
  const dataStorage = await localData.showAll();
  
  textField.get();
  
  new ViewList().storageShow(docObj.listNotes, dataStorage);
  
  initListeners();
};
