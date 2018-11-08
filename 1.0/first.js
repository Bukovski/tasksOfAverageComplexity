const doc = document;

const docObj = {
  textArea: doc.getElementsByTagName('textarea')[0],
  saveButton: doc.getElementsByTagName('button')[0],
  clearAreaButton: doc.getElementsByTagName('button')[1],
  clearListButton: doc.getElementsByTagName('button')[2],
  listNotes: doc.getElementById('listNotes'),
  tagP: doc.getElementsByTagName('p')
};



class LocalData {
  constructor(storageName) {
    this.listObj = {};
    
    this.storageName = storageName;
  }
  
  parse() {
    if (!localStorage[ this.storageName ]) {
      localStorage[ this.storageName ] = '{}'
    }
    
    try {
      this.listObj = JSON.parse(localStorage[ this.storageName ]);
    } catch (e) {
      return {};
    }
    
    return this.listObj;
  }
  save() {
    localStorage[ this.storageName ] = JSON.stringify(this.listObj);
    
    return this.listObj;
  }
  saveOne(text) {
    this.parse();
    
    text = text.trim();
    this.listObj[ text ] = "1";
    
    this.save();
  }
  checkDuplicate(text) {
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


const cookieData = (function () {
  function _replace(value) {
    return value.replace(/(<|>|_|@|{|}|\[|\])/g, '');
  }
  
  function _encode(value) {
    return _replace(encodeURIComponent(String(value)));
  }
  
  function _decode(value) {
    return _replace(decodeURIComponent(String(value)));
  }
  
  
  function set(key, value, attr = {}) {
    if (typeof document === 'undefined' || !key || typeof attr !== 'object') return;
    
    if (attr.expires && typeof attr.expires === 'number') {
      // attr.expires = new Date(new Date() * 1 + attr.expires * 1000 * 60 * 60 * 24);
      attr.expires = new Date(new Date() * 1 + attr.expires * 864e+5);
    }
    
    attr.expires = (attr.expires) ? attr.expires.toUTCString() : '';
    
    key = _encode(key);
    value = _encode(value);
    
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
    
    return (document.cookie = key + '=' + value + stringAttributes);
  }
  
  function get(key) {
    if (typeof document === 'undefined' || !key || typeof key !== 'string') return;
    
    let cookies = document.cookie ? document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)') : [];
    
    return _decode(cookies[2]);
  }
  
  function remove(key) {
    return set(key, '', { expires: -1 });
  }
  
  return {
    set,
    get,
    remove
  }
})();

// cookieData.set("area", "awesome text", { expires: 7, path: '' });
// cookieData.set("area", "awesome text", { expires: 7, secure: false });
// cookieData.set("area", "new 55↵text<>lkj@_dfdf");
// cookieData.set("area", "new 55↵text");
// cookieData.set("area", "some text");
// cookieData.remove("area");
// console.log(cookieData.get("area"));


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



class SwitchClick {
  constructor() {
    this.firing = false;
    this.timer = 0;
  }
  
  textFromTag(value) {
    const textTag = value.innerHTML.split("<span")[ 0 ];
    
    return textTag.trim();
  }
  deleteButtonOneClick(event, db, view) {
    const { tagName, parentNode } = event.target;
    
    if (tagName === "SPAN" && parentNode.className === "textParagraph") {
      const trimText = this.textFromTag(parentNode);
  
      db.removeOne(trimText);
      view.removeTag(parentNode);
    }
  }
  editNoteDoubleClick(event, tag) {
    const target = event.target;
    
    if (target.tagName === "P" && target.className === "textParagraph") {
      const trimText = this.textFromTag(event.target);
      
      tag.value = trimText;
      
      return target;
    }
  }
  managementDoubleSingleClick(event, args) { //args { tag: textarea, db: localStorage, view: removeTagDom }
    if (this.firing) { //двойной клик
      clearTimeout(this.timer);
      this.firing = false;
      
      return this.editNoteDoubleClick(event, args.tag);
    }
    
    this.firing = true;
    this.timer = setTimeout(() => { //один клик, если через 300 мск не кликнули второй раз то вызвать
      this.deleteButtonOneClick(event, args.db, args.view);
      
      this.firing = false;
    }, 300);
    
    return false;
  }
}

const switchClick = new SwitchClick();



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


class TextAreaField {
  constructor(textArea, cookie) {
    this.area = textArea;
    this.cookie = cookie;
  }
  
  get() {
    const areaCookie = this.cookie.get("area");
    
    return this.area.value = (areaCookie !== "undefined") ? areaCookie.replace(/↵/g, '\n ') : '';
  }
  set() {
    this.cookie.set("area", this.area.value, { expires: 7 })
  }
  clear() {
    this.cookie.remove("area");
    this.area.value = '';
  }
}

const textAreaField = new TextAreaField(docObj.textArea, cookieData);


function switchClicker(event) {
  event.preventDefault();
  
  const areaField = docObj.textArea;
  const localData = new LocalData("textList");
  
  if (areaField.value.trim().length && !(localData.checkDuplicate(areaField.value))) {
    const switchSaveEdit = bufferTagNote.get();
    
    if (switchSaveEdit) {
      let value = areaField.value;
      
      value = value.trim();
      
      const oldText = new SwitchClick().textFromTag(switchSaveEdit);
      const newText = switchSaveEdit.innerHTML.replace(oldText, value);
      
      switchSaveEdit.innerHTML = newText;
      
      localData.changeOne(oldText, value);
      
      bufferTagNote.clear();
    } else {
      localData.saveOne(areaField.value);
      
      new ViewList().wrapperTag(docObj.listNotes, areaField.value);
    }
    
    textAreaField.set();
  }
}

docObj.saveButton.addEventListener('click', switchClicker);


docObj.clearAreaButton.addEventListener('click', (event) => {
  textAreaField.clear();
});


docObj.clearListButton.addEventListener('click', (event) => {
  event.preventDefault();
  
  new LocalData("textList").removeAll();
  
  new ViewCleaner().clearWrapperList();
});


docObj.listNotes.addEventListener("click", (event) => {
  event.stopPropagation();
  event.preventDefault();
  
  bufferTagNote.set(switchClick.managementDoubleSingleClick(event, { tag: docObj.textArea, db: new LocalData("textList"), view: new ViewCleaner() }));
});



window.onload = () => {
  textAreaField.get();
  
  new ViewList().storageShow(docObj.listNotes, new LocalData("textList").parse());
};
