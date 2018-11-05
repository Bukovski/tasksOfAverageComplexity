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
  save() {
    localStorage.textList = JSON.stringify(this.listObj);
    
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
}

const localData = new LocalData();


docObj.saveButton.addEventListener('click', (event) => {
  event.preventDefault();
  
  if (!(localData.checkDuplicate(docObj.textArea.value))) {
    viewData.wrapperTag(docObj.textArea.value);
    
    localData.saveOne(docObj.textArea.value);
  }
});

docObj.clearButton.addEventListener('click', (event) => {
  event.preventDefault();
  
  localStorage.removeItem('textList');
  
  viewData.clearDom()
} );


doc.body.addEventListener("click", deleteButton);

function deleteButton(even) {
  const { tagName, parentNode } = even.target;
  
  if (tagName === "SPAN" && parentNode.className === "textParagraph") {
    const textTag = parentNode.innerHTML.split("<span")[0];
    
    localData.removeOne(textTag);
    
    viewData.removeTag(parentNode);
  }
}








window.onload = () => viewData.storageShow(localData.parse());
