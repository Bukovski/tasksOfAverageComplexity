const doc = document;

const docObj = {
  textArea: doc.getElementsByTagName('textarea')[0],
  saveButton: doc.getElementsByTagName('button')[0],
  clearAreaButton: doc.getElementsByTagName('button')[1],
  clearListButton: doc.getElementsByTagName('button')[2],
  listNotes: doc.getElementById('listNotes'),
  tagP: doc.getElementsByTagName('p')
};


class ViewList {
  constructor(docObj) {
    this.docObj = docObj;
  }
  
  wrapperTag(text) {
    const p = doc.createElement('p');
    const span = doc.createElement('span');
    
    p.className = "textParagraph";
    span.className = "delete";
    
    span.appendChild(doc.createTextNode(' ' + String.fromCharCode(10006))); //вставляем крест
    p.appendChild(doc.createTextNode(text)); //текст перед крестом
    
    const tagP = this.docObj.listNotes.appendChild(p); //listNotes --> p
    tagP.appendChild(span); //добавили в p -> span
  }
  storageShow(listObj) {
    for(let list in listObj) {
      this.wrapperTag(list);
    }
  }
  removeTag(tag) {
    return tag.remove();
  }
  clearDom() {
    let length = this.docObj.tagP.length;
    
    while(length) {
      length--;
      
      this.removeTag(this.docObj.tagP[length]);
    }
    
    return null;
  }
}

const viewList = new ViewList(docObj);


class LocalData {
  constructor(dataName) {
    this.listObj = {};
    this.dataName = dataName;
  }
  
  parse() {
    if (!localStorage[this.dataName]) {
      localStorage[this.dataName] = '{}'
    }
    
    try {
      this.listObj = JSON.parse(localStorage[this.dataName]);
    } catch (e) {
      return {};
    }
    
    return this.listObj;
  }
  save() {
    localStorage[this.dataName] = JSON.stringify(this.listObj);
    
    return this.listObj;
  }
  saveOne(text) {
    this.parse();
    
    text = text.trim();
    this.listObj[text] = "1";
    
    this.save();
  }
  checkDuplicate(text) {
    this.parse();
    
    text = text.trim();
    
    return !!this.listObj[text]
  }
  removeOne(value) {
    this.parse();
    
    delete this.listObj[value];
    
    this.save();
  }
  removeAll() {
    localStorage.removeItem(this.dataName);
  }
  changeOne(oldValue, newValue) {
    const structuringDataOld = JSON.stringify(oldValue);
    const structuringDataNew = JSON.stringify(newValue);
    
    const changeData = localStorage[this.dataName].replace(structuringDataOld, structuringDataNew);
    
    localStorage[this.dataName] = changeData;
  }
}

const localData = new LocalData("textList");


const SwitchClick = (function () {
  let _firing = false;
  let _timer = 0;
  
  return class {
    constructor({ localData, viewList, docObj }) {
      this.localData = localData;
      this.viewList = viewList;
      this.docObj = docObj;
      
      this.clickEditTag = '';
    }
    
    textFromTag(value) {
      const textTag = value.innerHTML.split("<span")[ 0 ];
      
      return textTag.trim();
    }
    deleteButtonOneClick(event) {
      const { tagName, parentNode } = event.target;
      
      if (tagName === "SPAN" && parentNode.className === "textParagraph") {
        const trimText = this.textFromTag(parentNode);
        
        this.localData.removeOne(trimText);
        this.viewList.removeTag(parentNode);
      }
    }
    editNoteDoubleClick(event) {
      const target = event.target;
      
      if (target.tagName === "P" && target.className === "textParagraph") {
        const trimText = this.textFromTag(event.target);
        
        this.docObj.textArea.value = trimText;
        
        this.clickEditTag = target;
      }
    }
    cleanTag() {
      this.clickEditTag = '';
    }
    managementDoubleSingleClick(event) {
      if (_firing) { //двойной клик
        clearTimeout(_timer);
        _firing = false;
        
        this.editNoteDoubleClick(event);
        
        return;
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

const switchClick = new SwitchClick({ localData, viewList, docObj });



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

class TextAreaField {
  constructor(docObj, cookie) {
    this.area = docObj.textArea;
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

const textAreaField = new TextAreaField(docObj, cookieData);


function editClickNote(value, editTag, clear) {
  value = value.trim();
  
  const oldText = switchClick.textFromTag(editTag);
  const newText = editTag.innerHTML.replace(oldText, value);
  
  editTag.innerHTML = newText;
  
  localData.changeOne(oldText, value);
  
  clear();
}


docObj.saveButton.addEventListener('click', (event) => {
  event.preventDefault();
  
  const areaField = docObj.textArea;
  
  if (areaField.value.trim().length && !(localData.checkDuplicate(areaField.value))) {
    if (switchClick.clickEditTag) {
      editClickNote(areaField.value, switchClick.clickEditTag, switchClick.cleanTag);
    } else {
      localData.saveOne(areaField.value);
      
      viewList.wrapperTag(areaField.value);
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
  
  switchClick.managementDoubleSingleClick(event)
});



window.onload = () => {
  textAreaField.get();
  
  viewList.storageShow(localData.parse());
};
