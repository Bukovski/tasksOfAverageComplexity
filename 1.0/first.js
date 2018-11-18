"use strict";

const doc = document;

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


class LocalData {
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
  showAll() {
    this.parse();
  
    return this.listObj;
  }
  saveOne(text) {
    this.parse();
    
    text = text.trim();
    this.listObj[ text ] = "1";
    
    this.save();
  }
  isDuplicate(text) {
    this.parse();
    
    text = text.trim();
    
    return !!this.listObj[ text ]
  }
  removeOne(value) {
    this.parse();
    
    delete this.listObj[ value ];
    
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
    for (let list in listObj) {
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
  delete: (event) => new EditButtons().deleteOneClick(event, new LocalData(), new ViewCleaner())
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
  const localData = new LocalData();
  
  if (areaField.value.trim().length && !(localData.isDuplicate(areaField.value))) {
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
  
  new LocalData().removeAll();
  
  new ViewCleaner().clearWrapperList(docObj.tagP);
});


docObj.listNotes.addEventListener("click", (event) => {
  event.stopPropagation();
  event.preventDefault();
  
  bufferTagNote.set(switchClick.managementDoubleSingleClick(event));
});



window.onload = () => {
  textField.get();
  
  new ViewList().storageShow(docObj.listNotes, new LocalData().showAll());
};
