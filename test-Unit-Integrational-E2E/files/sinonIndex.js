/*
1
2-1
1-2-3
4-3-2-1
1-2-3-4-5
6-5-4-3-2-1
(Естественно, вместо 6 может быть любое число).
числа которые вводим должны быть в диапазоне от 1 до безконечности
 */
/*
повесить шпионов на left и right сколько раз они были вызваны.
Вывести первый, последний и 3-й вызов (returnValue) и сравнить с теми даными которые должны быть,
узнать left был вызван раньше чем right.
Поставить шпиона на treeOfNumbers и отследить сколько раз он был вызван за время тестов
и отследить вервый аргумент функции чтобы был одинаковым числом при всех вызовах
sinonIndex.treeOfNumbers(10, edge);
*/
const edge = (function (){
  return {
    left: function (max) {
      const arr = [];
      
      for (let i = 0; i < max; i++) {
        arr.push(i + 1)
      }
      
      return arr;
    },
    right: function (max) {
      const arr = [];
      
      for (let i = max; i > 0; i--) {
        arr.push(i)
      }
      
      return arr;
    }
  }
}());

function treeOfNumbers(len, rageFn) {
  let treeStr = '';
  
  for (let i = 1; i <= len; i++) {
    const innerArr = (i % 2) ? rageFn.left(i) : rageFn.right(i);
    
    treeStr += (innerArr.join('-') + '\n');
  }
  
  return treeStr;
}

// console.log(treeOfNumbers(10, edge));

/********************************************************/

//stub подделать функции makeArr, middleValue
//вызвать функцию replaceNum 5 раз.
// middleValue должно вернуть 1, 2, 5, 7, 9.
// makeArr тоже должен вовзращать разные массивы [ 1, 2, 3, 4, 5 ] [ 5, 3, 6, 8, 2 ] [ 9, 9, 9, 9, 9 ] [ 0, 0, 0, 0, 0 ] [ 4, 4, 9, 9, 1 ].
//засунуть их в replaceNum и сделать 5 вызовов в тестах и проверить чтобы она выдавала корректный результат. Так мы отследим работает ли правильно фукнция без реальных функций но с разным набором данных

//spy
//вызвать replaceNum с реальными данными
//replaceNum отследить функцию map и найти входные данные и выходные из нее они должны не совпадать при этом соблюдать алгоритм замены цифр в массиве.
//makeArr узнать сколько раз была вызвана функция push и сранить ее с длинной массива
//middleValue узнать какой результат выдала функция round и сравнить его с результатом функции middleValue

function makeArr(len) {
  if (!len.isFinite && isNaN(len)) return [];
  
  const arr = [];
  
  for(let i = 0; i < len; i++) {
    arr.push(Math.round(Math.random() * 10));
  }
  
  return arr;
}

function middleValue(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  
  const sumNumbers = arr.reduce((sum, current) => +sum + +current, 0);
  const middleNumber = Math.round(sumNumbers / arr.length);
  
  return middleNumber;
}

function replaceNum(arr, middle) {
  if (!Array.isArray(arr) || arr.length === 0 || (typeof middle !== 'number')) return [];
  
  return arr.map(elem => (elem > middle) ? middle : elem);
}

// const lengthArr = 10;
// const lengthArr = '10';
// const lengthArr = '10dd';
// const funArr = makeArr(lengthArr);
// const middleNumber = middleValue(funArr);
// const middleNumber = middleValue([]);
// const middleNumber = middleValue('dd');

// console.log(replaceNum(funArr, middleNumber));
// console.log(replaceNum(funArr, 0));
// console.log(replaceNum(2, middleNumber));
// console.log(replaceNum(funArr, 'dd'));
// console.log(replaceNum(2, 'dd'));

/**************************************************************/

//spy отследить была ли вызвана функция console.log и сколько раз.
// Проверить какая из них была раньше.

// stub Заменить alertFinished на заглушку с ответом "I'm from stub".
// spy Проверить чтобы она была вызвана и вывела новую надпись
function doHomework(subject, callback) {
  console.log(`Starting my ${subject} homework.`);
  
  callback();
}
function alertFinished(){
  console.log('Finished my homework');
}
// doHomework('math', alertFinished);

/**************************************************************/

//mock заменить Apple.getInfo и заменить на строку 'I stole your money. P.S. Apple company',
// вызвать ее один раз через john.bay(). Проверить сработало ли.

//mock заменить apple.price с аргуметртом и закинуть данные в john.getPrice({name: 'watch', price: 2000}), проверить что данные попали в apple.price

//mock вызвать john.newOrder('phone', 4500) 4 раза проверить был ли вызван apple.price c указанными аргументами, и проверить чтобы он вызвался 4 раза.

class Apple {
  constructor(type) {
    this.type = type;
    this.color = "red";
  }
  getInfo() {
    return this.color + ' ' + this.type + ' apple';
  }
  price(obj) {
    return obj.name + ' : ' + obj.price;
  }
}

const apple = new Apple("macintosh");
// console.log(apple.getInfo());


class Person {
  constructor(name, apple) {
    this.name = name;
  }
  
  bay() {
    return apple.getInfo();
  }
  getPrice(obj) {
    return apple.price(obj);
  }
  wrapper(name, price, callback) {
    callback({
      name: name,
      price: price
    });
  }
  newOrder(name, price) {
    this.wrapper(name, price, apple.price)
  }
}

const john = new Person('John');
// console.log(john.bay()); //red macintosh apple
// console.log(john.getPrice({name: 'watch', price: 2000})); //watch : 2000
// john.newOrder('phone', 4500);

/**************************************************************/

const request = require('request');

/*
{
  "userId": 1,
  "id": 10,
  "title": "distinctio laborum qui"
}

эмулировать данные с сервера и проверить чтобы все поля обьекта от сервера пришли,
проверить чтобы id записи соответствовало id в обьекте с сервера
сделать проверку если данные не пришли
 */

const getAlbumById = function(id) {
  const reqString = `https://jsonplaceholder.typicode.com/albums/${ id }`; //0-100
  
  return new Promise((resolve, reject) => {
    request.get(reqString, (err, res, body) => {
      if (err) return reject(err);
      
      resolve(JSON.parse(body));
    })
  })
};
// console.log(getAlbumById(1))



//заменить axios.get и использовать данные из users.json для подмены.
//проверка чтобы массив имел длинну 10
//вложенные обьекты имели все поля
//https://medium.com/@srph/axios-easily-test-requests-f04caf49e057
const axios = require('axios');

const getUsers = function(){
  return axios.get('http://jsonplaceholder.typicode.com/users')
    .then(obj => obj.data)
};


module.exports = {
  edge, treeOfNumbers ,
  makeArr, middleValue, replaceNum,
  doHomework, alertFinished,
  apple, john,
  getAlbumById, getUsers
};
