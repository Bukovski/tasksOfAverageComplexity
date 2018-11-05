const doc = document;

const docObj = {
  textArea: doc.getElementsByTagName('textarea')[0],
  saveButton: doc.getElementsByTagName('button')[0],
  clearButton: doc.getElementsByTagName('button')[1],
  tagP: doc.getElementsByTagName('p')
};


class ViewData {
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
    
    // const tagP = this.docObj.textArea.parentNode.insertBefore(p, doc.body.firstChild); //p перед textarea
    const tagP = this.docObj.textArea.parentNode.appendChild(p); //p после
    tagP.appendChild(span); //добавили в p -> span
  }
  storageShow(listObj) {
    for(let list in listObj) {
      this.wrapperTag(this.docObj, list);
    }
  }
  clearDom() {
    let length = this.docObj.tagP.length;
    
    while(length) {
      length--;
  
      this.docObj.tagP[length].remove();
    }
    
    return null;
  }
}

const viewData = new ViewData(docObj);


class LocalData {
  constructor() {
    this.listObj = {};
  }
  parse() {
    //не помешает кэширование данных чтобы не бегать постоянно к данным
    if (!localStorage.textList) {
      localStorage.textList = '{}'
    }
    
    try {
      this.listObj = JSON.parse(localStorage.textList);
    } catch (e) {
      return {};
    }
    
    return this.listObj;
  }
  save(text) {
    this.parse();
    
    text = text.trim();
    this.listObj[text] = "1";
    
    localStorage.textList = JSON.stringify(this.listObj);
    
    return this.listObj;
  }
  checkDuplicate(text) {
    this.parse();
    
    text = text.trim();
    
    return !!this.listObj[text]
  }
}

const localData = new LocalData();


docObj.saveButton.addEventListener('click', (event) => {
  event.preventDefault();
  
  if (!(localData.checkDuplicate(docObj.textArea.value))) {
    viewData.wrapperTag(docObj.textArea.value);
    
    localData.save(docObj.textArea.value);
  }
});

docObj.clearButton.addEventListener('click', (event) => {
  event.preventDefault();
  
  localStorage.removeItem('textList');
  
  viewData.clearDom()
} );











window.onload = () => viewData.storageShow(localData.parse());
