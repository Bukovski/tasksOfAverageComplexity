const doc = document;

const docObj = {
  textArea: doc.getElementsByTagName('textarea')[0],
  saveButton: doc.getElementsByTagName('button')[0],
  clearAreaButton: doc.getElementsByTagName('button')[1],
  clearListButton: doc.getElementsByTagName('button')[2],
  listNotes: doc.getElementById('listNotes'),
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

docObj.clearListButton.addEventListener('click', (event) => {
  event.preventDefault();
  
  localStorage.removeItem('textList');
  
  viewData.clearDom()
} );





docObj.listNotes.addEventListener("click", switchDoubleSingleClick);

const objSwitchClick = {
  firing: false,
  timer: 0
};

function switchDoubleSingleClick(event) {
  console.log(objSwitchClick.timer)
  console.log(objSwitchClick.firing)
  
  if (objSwitchClick.firing){
    editNoteDoubleClick(event);
  
    clearTimeout(objSwitchClick.timer);
    objSwitchClick.firing = false;
    
    return;
  }
  
  objSwitchClick.firing = true;
  
  objSwitchClick.timer = setTimeout(() => {
    deleteButtonOneClick(event);
    
    objSwitchClick.firing = false;
  }, 300);
}

function deleteButtonOneClick(event) {
  console.log('test calls');
  
  const { tagName, parentNode } = event.target;
  
  if (tagName === "SPAN" && parentNode.className === "textParagraph") {
    const textTag = parentNode.innerHTML.split("<span")[ 0 ];
    
    localData.removeOne(textTag);
    
    viewData.removeTag(parentNode);
  }
}

function editNoteDoubleClick(event) {
  console.log('==', objSwitchClick.timer)
  
  console.log(event)
}








window.onload = () => viewData.storageShow(localData.parse());

//one and double click
//http://qaru.site/questions/242268/how-to-use-both-onclick-and-ondblclick-on-an-element
