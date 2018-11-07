const doc = document;

const docObj = {
  textArea: doc.getElementsByTagName('textarea')[0],
  saveButton: doc.getElementsByTagName('button')[0],
  clearAreaButton: doc.getElementsByTagName('button')[1],
  clearListButton: doc.getElementsByTagName('button')[2],
  listNotes: doc.getElementById('listNotes'),
  tagP: doc.getElementsByTagName('p')
};


const LocalData = (function () {
  let _dataName;
  
  return class {
    constructor(dataName) {
      this.listObj = {};
      
      _dataName = dataName;
    }
    
    parse() {
      if (!localStorage[ _dataName ]) {
        localStorage[ _dataName ] = '{}'
      }
      
      try {
        this.listObj = JSON.parse(localStorage[ _dataName ]);
      } catch (e) {
        return {};
      }
      
      return this.listObj;
    }
    
    save() {
      localStorage[ _dataName ] = JSON.stringify(this.listObj);
      
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
      localStorage.removeItem(_dataName);
    }
    
    changeOne(oldValue, newValue) {
      const structuringDataOld = JSON.stringify(oldValue);
      const structuringDataNew = JSON.stringify(newValue);
      
      const changeData = localStorage[ _dataName ].replace(structuringDataOld, structuringDataNew);
      
      localStorage[ _dataName ] = changeData;
    }
  }
})();

const localData = new LocalData("textList");



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


const ViewList = (function () {
  let _tag;
  
  return class {
    constructor(tag) {
      _tag = tag;
    }
    
    wrapperTag(insertInto, text) { //insert into
      const p = document.createElement('p');
      const span = document.createElement('span');
      
      p.className = "textParagraph";
      span.className = "delete";
      
      span.appendChild(document.createTextNode(' ' + String.fromCharCode(10006))); //вставляем крест
      p.appendChild(document.createTextNode(text)); //текст перед крестом
      
      const tagP = insertInto.appendChild(p); //listNotes --> p
      
      tagP.appendChild(span); //добавили в p -> span
    }
    
    storageShow(insertInto, listObj) {
      for (let list in listObj) {
        this.wrapperTag(insertInto, list);
      }
    }
    
    removeTag(tag) {
      return tag.remove();
    }
    
    clearDom() {
      let length = _tag.length;
      
      while (length) {
        length--;
        
        this.removeTag(_tag[ length ]);
      }
      
      return null;
    }
  };
})();

const viewList = new ViewList(docObj.tagP);


const SwitchClick = (function () {
  let _firing = false;
  let _timer = 0;
  
  let _localData;
  let _viewList;
  let _tag;
  
  return class {
    constructor(localData, viewList, tag) {
      _localData = localData;
      _viewList = viewList;
      _tag = tag;
    }
    
    textFromTag(value) {
      const textTag = value.innerHTML.split("<span")[ 0 ];
      
      return textTag.trim();
    }
    deleteButtonOneClick(event) {
      const { tagName, parentNode } = event.target;
      
      if (tagName === "SPAN" && parentNode.className === "textParagraph") {
        const trimText = this.textFromTag(parentNode);
        
        _localData.removeOne(trimText);
        _viewList.removeTag(parentNode);
      }
    }
    editNoteDoubleClick(event) {
      const target = event.target;
      
      if (target.tagName === "P" && target.className === "textParagraph") {
        const trimText = this.textFromTag(event.target);
        
        _tag.value = trimText;
        
        return target;
      }
    }
    managementDoubleSingleClick(event) {
      if (_firing) { //двойной клик
        clearTimeout(_timer);
        _firing = false;
        
        return this.editNoteDoubleClick(event);
      }
      
      _firing = true;
      _timer = setTimeout(() => { //один клик, если через 300 мск не кликнули второй раз то вызвать
        this.deleteButtonOneClick(event);
        
        _firing = false;
      }, 300);
      
      return false;
    }
  }
})();

const switchClick = new SwitchClick(localData, viewList, docObj.textArea);



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


function editClickNote(value, editTag, bufferTag, saveData) {
  value = value.trim();
  
  const oldText = editTag.textFromTag(bufferTag.get());
  const newText = bufferTag.get().innerHTML.replace(oldText, value);
  
  bufferTag.get().innerHTML = newText;
  
  saveData.changeOne(oldText, value);
  
  bufferTag.clear();
}


docObj.saveButton.addEventListener('click', (event) => {
  event.preventDefault();
  
  const areaField = docObj.textArea;
  
  if (areaField.value.trim().length && !(localData.checkDuplicate(areaField.value))) {
    if (bufferTagNote.get()) {
      editClickNote(areaField.value, switchClick, bufferTagNote, localData);
    } else {
      localData.saveOne(areaField.value);
      
      viewList.wrapperTag(docObj.listNotes, areaField.value);
    }
    
    textAreaField.set();
  }
});


docObj.clearAreaButton.addEventListener('click', (event) => {
  textAreaField.clear();
});


docObj.clearListButton.addEventListener('click', (event) => {
  event.preventDefault();
  
  localData.removeAll();
  
  viewList.clearDom()
});


docObj.listNotes.addEventListener("click", (event) => {
  event.stopPropagation();
  event.preventDefault();
  
  bufferTagNote.set(switchClick.managementDoubleSingleClick(event));
});



window.onload = () => {
  textAreaField.get();
  
  viewList.storageShow(docObj.listNotes, localData.parse());
};
