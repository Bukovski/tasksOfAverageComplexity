const doc = document;

const docObj = {
  textArea: doc.getElementsByTagName('textarea')[0],
  saveButton: doc.getElementsByTagName('button')[0],
  clearAreaButton: doc.getElementsByTagName('button')[1],
  clearListButton: doc.getElementsByTagName('button')[2],
  listNotes: doc.getElementById('listNotes'),
  tagP: doc.getElementsByTagName('p')
};


let clickEditTag = '';

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
    localStorage[this.dataName]= JSON.stringify(this.listObj);
    
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
    constructor({ localData, viewData, docObj }) {
      this.localData = localData;
      this.viewData = viewData;
      this.docObj = docObj;
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
        this.viewData.removeTag(parentNode);
      }
    }
    editNoteDoubleClick(event) {
      const target = event.target;
      
      if (target.tagName === "P" && target.className === "textParagraph") {
        const trimText = this.textFromTag(event.target);
  
        this.docObj.textArea.value = trimText;
  
        clickEditTag = target;
      }
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

const switchClick = new SwitchClick({ localData, viewData, docObj });


docObj.saveButton.addEventListener('click', (event) => {
  event.preventDefault();
  
  const areaField = docObj.textArea;
  
  if (!(localData.checkDuplicate(areaField.value))) {
    if (clickEditTag) {
      editClickNote(areaField.value);
    } else {
      localData.saveOne(areaField.value);
  
      viewData.wrapperTag(areaField.value);
    }
  }
});

function editClickNote(value) { //придумать куда засунуть
  //clickEditTag  надо избавиться, сейчас глобальная в верху
  
  // console.log(value);
  // console.dir(clickEditTag);
  value = value.trim();
  
  const oldText = switchClick.textFromTag(clickEditTag);
  const newText = clickEditTag.innerHTML.replace(oldText, value);
  
  clickEditTag.innerHTML = newText;
  
  localData.changeOne(oldText, value);
  
  clickEditTag = '';
  
}



docObj.clearListButton.addEventListener('click', (event) => {
  event.preventDefault();
  
  localStorage.removeItem('textList');
  
  viewData.clearDom()
});


docObj.listNotes.addEventListener("click", (event) => {
  event.stopPropagation();
  event.preventDefault();
  
  switchClick.managementDoubleSingleClick(event)
});








window.onload = () => viewData.storageShow(localData.parse());

//one and double click
//http://qaru.site/questions/242268/how-to-use-both-onclick-and-ondblclick-on-an-element
