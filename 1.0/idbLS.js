"use strict";

const doc = document;

// delete window.indexedDB; //<-- for test how to work a mobile devices

const docObj = {
  textArea: doc.getElementsByTagName('textarea')[0],
  saveButton: doc.getElementsByTagName('button')[0],
  clearAreaButton: doc.getElementsByTagName('button')[1],
  clearListButton: doc.getElementsByTagName('button')[2],
  listNotes: doc.getElementById('listNotes'),
  tagP: doc.getElementsByTagName('p')
};

const SETTINGS = {
  LOCAL_STORAGE_NAME: 'textList',
  INDEXED_DB_NAME: 'areaDB',
  INDEXED_DB_STORAGE: 'textList',
  INDEXED_DB_VERSION: 1,
  COOKIE_NAME: 'area'
};


class LocalStorageData {
  constructor(storageName) {
    this.listObj = {};
    
    this.storageName = storageName || SETTINGS.LOCAL_STORAGE_NAME;
  }
  
  parse(name) {
    const nameStorage = (typeof name === "string") ? name : this.storageName;
    
    if (!localStorage[ nameStorage ]) {
      localStorage[ nameStorage ] = '{}'
    }
    
    try {
      this.listObj = JSON.parse(localStorage[ nameStorage ]);
    } catch (e) {
      return {};
    }
  }
  save() {
    localStorage[ this.storageName ] = JSON.stringify(this.listObj);
    
    return this.listObj;
  }
  showAll() { //obj -> arr
    this.parse();
    
    const dataObj = this.listObj;
    let dataArr = [];
    
    for(let valueObj in dataObj) {
      dataArr = dataArr.concat(valueObj);
    }
    
    return dataArr;
  }
  saveOne(text) {
    this.parse();
    
    text = text.trim();
    this.listObj[ text ] = "1";
    
    this.save();
  }
  isDuplicate(text) { //text -> bool
    this.parse();
    
    text = text.trim();
    
    return !!this.listObj[ text ]
  }
  removeOne(text) {
    this.parse();
    
    delete this.listObj[ text ];
    
    this.save();
  }
  removeAll() {
    localStorage.removeItem(this.storageName);
  }
  changeOne(oldValue, newValue) {
    const structuringDataOld = JSON.stringify(oldValue);
    const structuringDataNew = JSON.stringify(newValue);
    
    const changeData = localStorage[ this.storageName ].replace(structuringDataOld, structuringDataNew);
    
    localStorage[ this.storageName ] = changeData;
  }
}

class IDBData {
  constructor(dbName, version, storageName) {
    this._dbName = dbName || SETTINGS.INDEXED_DB_NAME;
    this._version = version || SETTINGS.INDEXED_DB_VERSION;
    this._storageName = storageName || SETTINGS.INDEXED_DB_STORAGE;
    this._db = null;
  }
  
  parse() {
    const idb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    
    const openRequest = idb.open(this._dbName, this._version);
    
    return new Promise((resolve, reject) => {
      openRequest.onerror = (event) => {
        reject(event.target.error.message);
      };
      
      openRequest.onsuccess = (event) => {
        try {
          const target = event.target;
          const db = target.result;
          this._db = target.result;
          
          resolve(db);
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
  close() {
    this._db.close();
    this._db = null;
  }
  async _store(readOnlyWrite) {
    readOnlyWrite = (typeof readOnlyWrite === 'boolean' && readOnlyWrite === true) ? "readonly" : "readwrite";
    
    const db = await this.parse();
    const tx = db.transaction(this._storageName, readOnlyWrite);
    
    return { tx, store: tx.objectStore(this._storageName) }
  }
  async showAll() { //arr obj -> arr
    const { store } = await this._store(true);
    const data = store.getAll();
    
    this.close();
    
    return new Promise(resolve => {
      data.onsuccess = event => resolve(event.target.result.map(elem => elem.text));
      data.onerror = event => resolve([]);
    });
  }
  async saveOne(text) {
    text = text.trim();
    
    const { store } = await this._store();
    
    store.add({ text: text });
    
    this.close();
  }
  async isDuplicate(text) { //text -> bool
    text = text.trim();
    
    const { store } = await this._store(true);
    const data = store.index("text").get(text);
    
    this.close();
    
    return new Promise(resolve => {
      data.onsuccess = event => resolve(!!event.target.result);
      data.onerror = event => resolve(false);
    });
  }
  async removeOne(text) {
    const { store } = await this._store();
    
    const index = store.index("text"); // add, clear, count, delete, get, getAll, getAllKeys, getKey, put
    
    index.getKey(text).onsuccess = (event) => {
      const key = event.target.result;
      
      store.delete(key)
    };
    
    this.close();
  }
  async removeAll() {
    const { store } = await this._store();
    
    store.clear();
    
    this.close();
  }
  async changeOne(oldValue, newValue) {
    const { store } = await this._store();
  
    const index = store.index("text");
    
    index.openCursor(oldValue).onsuccess = (event) => {
      const cursor = event.target.result;
      
      cursor.update({ text: newValue })
    };
    
    this.close();
  }
}


class LocalData {
  constructor(ls, idb) {
    this._localStorage = ls;
    this._indexedDB = idb;
  }
  
  _managerData() {
    const idb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    
    if(!idb) return this._localStorage;
    
    return this._indexedDB;
  }
  showAll() {
    return Promise.resolve().then(() => this._managerData().showAll());
  }
  saveOne(text) {
    this._managerData().saveOne(text);
  }
  isDuplicate(text) {
    return Promise.resolve().then(() => this._managerData().isDuplicate(text));
  }
  removeOne(text) {
    this._managerData().removeOne(text);
  }
  removeAll() {
    this._managerData().removeAll();
  }
  changeOne(oldValue, newValue) {
    this._managerData().changeOne(oldValue, newValue);
  }
}

const localStorageData = new LocalStorageData();
const idbData = new IDBData();
const localData = new LocalData(localStorageData, idbData);


class CookieData {
  constructor(key) {
    this.key = key || SETTINGS.COOKIE_NAME
  }
  
  _replace(value) {
    return value.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, '');
  }
  
  _encode(value) {
    return this._replace(encodeURIComponent(String(value)));
  }
  
  _decode(value) {
    return decodeURIComponent(String(value));
  }
  
  
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
  
  get() {
    if (typeof document === 'undefined' || !this.key || typeof this.key !== 'string') return [];
    
    let cookies = document.cookie ? document.cookie.match('(^|;) ?' + this.key + '=([^;]*)(;|$)') : [];
    
    return this._decode(cookies[2]);
  }
  
  remove() {
    return this.set('', { expires: -1 });
  }
}

// new CookieData("area").set("awesome text", { expires: 7, path: '' });
// new CookieData("area").set("awesome text", { expires: 7, secure: false });
// new CookieData("area").set("new 55↵text<>lkj@_dfdf");
// new CookieData("area").set("new 55↵text");
// new CookieData("area").set("some text");
// new CookieData("area").remove();
// console.log(new CookieData("area").get());


class ViewList {
  constructor() {}
  
  wrapperTag(insertInto, text) { //insert into
    const newTag = document.createElement('p');
    const tagInside = document.createElement('span');
    
    newTag.className = "textParagraph";
    tagInside.className = "delete";
    
    tagInside.appendChild(document.createTextNode(' ' + String.fromCharCode(10006))); //вставляем крест
    newTag.appendChild(document.createTextNode(text)); //текст перед крестом
    
    const tagWrapper = insertInto.appendChild(newTag); //listNotes --> p
    
    tagWrapper.appendChild(tagInside); //добавили в p -> span
  }
  
  storageShow(insertInto, listObj) {
    for (let list of listObj) {
      this.wrapperTag(insertInto, list);
    }
  }
}


class ViewCleaner {
  constructor() {}
  
  removeTag(tag) {
    return tag.remove();
  }
  
  clearWrapperList(tag) {
    let length = tag.length;
    
    while (length) {
      length--;
      
      this.removeTag(tag[ length ]);
    }
    
    return null;
  }
}


const bufferTagNote = (function () {
  let _bufferTag = '';
  
  return {
    get() {
      return _bufferTag;
    },
    set(tag) {
      if (tag) {
        _bufferTag = tag;
      }
    },
    clear() {
      _bufferTag = '';
    }
  }
})();


class EditButtons {
  constructor() {}
  
  textFromTag(value) {
    const textTag = value.innerHTML.split("<span")[ 0 ];
    
    return textTag.trim();
  }
  deleteOneClick(event, db, view) {
    const { tagName, parentNode } = event.target;
    
    if (tagName === "SPAN" && parentNode.className === "textParagraph") {
      const trimText = this.textFromTag(parentNode);
      
      db.removeOne(trimText);
      view.removeTag(parentNode);
    }
  }
  editDoubleClick(event, tag) {
    const target = event.target;
    
    if (target.tagName === "P" && target.className === "textParagraph") {
      const trimText = this.textFromTag(event.target);
      
      tag.value = trimText;
      
      return target;
    }
  }
}


class SwitchClick {
  constructor(buttonEvent) {
    this.firing = false;
    this.timer = 0;
    
    this.buttonEvent = buttonEvent;
  }
  
  managementDoubleSingleClick(event) {
    if (this.firing) { //двойной клик
      clearTimeout(this.timer);
      this.firing = false;
      return this.buttonEvent.edit(event);
    }
    
    this.firing = true;
    this.timer = setTimeout(() => { //один клик, если через 150 мск не кликнули второй раз то вызвать
      this.buttonEvent.delete(event);
      
      this.firing = false;
    }, 300);
    
    return false;
  }
}

const switchClick = new SwitchClick({
  edit: (event) => new EditButtons().editDoubleClick(event, docObj.textArea),
  delete: (event) => new EditButtons().deleteOneClick(event, localData, new ViewCleaner())
});


class TextField {
  constructor(field, db) {
    this.field = field;
    this.db = db;
  }
  
  get() {
    const areaCookie = this.db.get();
    
    return this.field.value = (areaCookie !== "undefined") ? areaCookie : '';
  }
  set() {
    this.db.set(this.field.value, { expires: 7 })
  }
  clear() {
    this.db.remove();
    this.field.value = '';
  }
}

const textField = new TextField(docObj.textArea, new CookieData());


function switchClicker(event) {
  event.preventDefault();
  
  const areaField = docObj.textArea;
  
  if (localData.isDuplicate(areaField.value)
    .then(dataStorage => areaField.value.trim().length && !(dataStorage))) {
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
  event.stopPropagation();
  event.preventDefault();
  
  bufferTagNote.set(switchClick.managementDoubleSingleClick(event));
});



window.onload = () => {
  textField.get();
  
  localData.showAll().then(dataStorage => new ViewList().storageShow(docObj.listNotes, dataStorage));
};
