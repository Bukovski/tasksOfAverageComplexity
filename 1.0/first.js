const doc = document;

const docObj = {
  textArea: doc.getElementsByTagName('textarea')[0],
  saveButton: doc.getElementsByTagName('button')[0],
  clearButton: doc.getElementsByTagName('button')[1],
  tagP: doc.getElementsByTagName('p')
};


function createWrapperTag(docObj, text) {
  const p = doc.createElement('p');
  const span = doc.createElement('span');
  
  p.className = "textParagraph";
  span.className = "delete";
  
  span.appendChild(doc.createTextNode(' ' + String.fromCharCode(10006))); //вставляем крест
  p.appendChild(doc.createTextNode(text)); //текст перед крестом
  
  // const tagP = docObj.textArea.parentNode.insertBefore(p, doc.body.firstChild); //вставляем на страницу p перед textarea
  const tagP = docObj.textArea.parentNode.appendChild(p); //вставляем на страницу p после
  tagP.appendChild(span); //добавили в p -> span
}


function localStorageParse() {
  //не помешает кэширование данных чтобы не бегать постоянно к данным
  if (!localStorage.textList) {
    localStorage.textList = '{}'
  }
  
  let listObj;
  
  try {
    listObj = JSON.parse(localStorage.textList);
  } catch (e) {
    return {};
  }
  
  return listObj;
}


function localStorageSave(listObj, text) {
  text = text.trim();
  listObj[text] = "1";
  
  localStorage.textList = JSON.stringify(listObj);
  
  return listObj;
}

function localStorageDuplicateCheck(listObj, text) {
  text = text.trim();
  
  return !!listObj[text]
}

// console.log(localStorageDuplicateCheck(localStorageParse(), 'some text')); //true
// console.log(localStorageDuplicateCheck(localStorageParse(), 'some text111')); //false


function localStorageShow(listObj) {
  for(let list in listObj) {
    createWrapperTag(docObj, list);
  }
}

function clearDom(tag) {
  let length = tag.length;
  
  while(length) {
    length--;
  
    tag[length].remove();
  }
  
  return null;
}


docObj.saveButton.addEventListener('click', (event) => {
  event.preventDefault();
  
  if (!(localStorageDuplicateCheck(localStorageParse(), docObj.textArea.value))) {
    createWrapperTag(docObj, docObj.textArea.value);
    localStorageSave(localStorageParse(), docObj.textArea.value);
  }
});

docObj.clearButton.addEventListener('click', (event) => {
  event.preventDefault();
  
  localStorage.removeItem('textList');
  
  clearDom(docObj.tagP)
} );











window.onload = () => localStorageShow(localStorageParse());






/*
Функция высшего порядка — это функция, которая принимает другую функцию в качестве аргумента, или это функция, которая будет возвращать в результате другую функцию (или и то, и другое).
 */