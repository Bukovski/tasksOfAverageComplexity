//Интеграционный тест на работу с другими функциями

/**
 * Форммируем рандомно массив в диапазоне чисел 0 - 10
 * @param {number} len - длинна массива
 * @return {Array}
 * @example
 * [ 9, 9, 4, 4, 1, 6, 5, 2, 4, 3 ]
 */
function makeArr(len) {
  if (!len.isFinite && isNaN(len)) return [];
  
  const arr = [];
  
  for(let i = 0; i < len; i++) {
    arr.push(Math.round(Math.random() * 10));
  }
  
  return arr;
}

/**
 * Принимает массив и выдает среднее число
 * @param {Array} arr
 * @return {number}
 * @example
 * 5
 */
function middleValue(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  
  const sumNumbers = arr.reduce((sum, current) => sum + current, 0);
  const middleNumber = Math.round(sumNumbers / arr.length);
  
  return middleNumber;
}

/**
 * Принимает массив и число меньше которого числа будут заменены на это число
 * @param {Array} arr
 * @param {number} middle
 * @return {Array}
 * @example
 * [ 9, 9, 4, 4, 1, 6, 5, 2, 4, 3 ], 5 => [ 5, 5, 4, 4, 1, 5, 5, 2, 4, 3 ]
 */
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


/********************************************************/

//Переделать результат функции на тестируемый вариант и покрыть тестами.

//Дана строка. Заменить каждый четный символ или на 'a', если символ не равен 'a' или 'b',
//или на 'c' в противном случае. В данной строке найти количество цифр.
function abcLeng(str) {
  let len = str.length,
    words = "",
    count = 0,
    symbol;

  for (len; len--;) {
    symbol = str.charAt(len);

    if (len % 3 === 0) {
      if (symbol === 'a') {
        words += 'B'
      } else if (symbol === 'b') {
        words += 'C'
      } else if (symbol === 'c') {
        words += 'A'
      } else {
        words += symbol;
      }
    } else {
      words += symbol;
    }

    if (!isNaN(+symbol)) { //количество цифр в строке
      count += 1;
    }
  }

  // return words + ' Length:' + words.length + ' Count:' + count;
  return {
    words: words,
    wordsLength: words.length,
    count: count
  };
}

// console.log(abcLeng("aabbcc87878abccbaaaaaabbbccc4155cabbac478dr"));
/* { words: 'rd874cBbbBc5514AccCbbBaaBaaCccCa87878ccCbaB',
  wordsLength: 43,
  count: 12 } */

/********************************************************/

//Дан массив ['1', '2', '3', '4', '5', '6']. Сделайте из него строку '16-25-34'. Массив, конечно же, может быть любым.
let arrPlus;

function arrFirstLast(arr) {
  var str = '';
  
  // function arrPlus(arr) { //<-- протестировать внутренюю функцию
  arrPlus = function (arr) { //<-- протестировать внутренюю функцию
    let len = arr.length;
    
    if (len) {
      str += (len > 1) ? arr.shift() : '';
      str += arr.pop();
      str += (len > 2) ? '-' : '';
      
      arrPlus(arr);
    }
    
    return str;
  };
  
  return arrPlus(arr);
}

const insidePlus = (arr) => arrPlus(arr);

// console.log(arrFirstLast(['1', '2', '3', '4', '5', '6'])); //'16-25-34'
// console.log(arrFirstLast(['1', '2', '3', '4', '5', '6', '7'])); //'17-26-35-4'

/********************************************************/

//протестировать все вложенные функции

/**
 * Поиск квартиры в доме.
 * Находит номер подьезда в котором находится заданная квартира
 *
 * @param flours - этажей в одном подьезде
 * @param apart  - количество квартир на одном этаже
 * @param entrance - количество подьездом в доме
 * @param flat   - номер квартиры которую нужно найти
 * @return {number} - номер подьезда в котором находится квартира
 * @example
 * (5, 4, 3, 59) => 3
 */
let arrApartments;

function countApartment(flours, apart, entrance, flat) {
  if (flat === 0) return 'Нулевых квартир не бывает';
  
  const entranceApart = Math.round(flours * apart); //количество квартир в первом подьезде
  const apartments = Math.round(entranceApart * entrance); //количество во всем доме
  
  //function arrApartments(entranceApart) { //<-- протестировать внутренюю функцию
  arrApartments = function (step, maxItem) { //<-- протестировать внутренюю функцию
    const arr = [];
    let countApart = 0;
    
    while (countApart < maxItem) {
      countApart += step;
      
      arr.push(countApart);
    }
    
    return arr;
  };
  
  const allApartNumbers = arrApartments(entranceApart, apartments);
  let flatSearch = 0;
  
  for (let i = 0, len = allApartNumbers.length; i < len; i++) {
    if (flat <= allApartNumbers[0]) {
      flatSearch = allApartNumbers[0];
      
      break;
    } else if (allApartNumbers[i] < flat && flat < allApartNumbers[i + 1]) {
      flatSearch = allApartNumbers[i + 1];
      
      break;
    } else if (allApartNumbers[i] < flat && allApartNumbers[i + 1] === undefined) {
      flatSearch = 0;
      
      break;
    }
  }
  
  if (flatSearch === 0) return 'Квартир в доме меньше чем вы задали. Общее число квартир в доме: ' + apartments;
  
  return allApartNumbers.indexOf(flatSearch) + 1;
}

const innerApartment = (step, maxItem) => arrApartments(step, maxItem);
// console.log(countApartment(5, 4, 3, 59)); //3

/********************************************************/

const axios = require('axios');

//https://github.com/axios/axios
//https://jsonplaceholder.typicode.com

//через promise
//тип данных, ключи и их тип, value type, ошибки если ввели id не существующей записи, првоерить что приходит статус 200 с сервера
const todo = (id) => axios.get('https://jsonplaceholder.typicode.com/todos/' + id);

// todo(2)
//   .then(function (response) {
//     console.log(response.status);
//     console.log(response.data);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });



//через async await
//тип данных, ключи и их тип, value type, првоерить что приходит статус 200 с сервера, ошибку вызвать передав не корректный адресс 'http://jsonplaceholder.typicode.com/userss' проверить что ошибка вызвалась.
const allUsers = axios.get('http://jsonplaceholder.typicode.com/users');

// allUsers
//   .then(function (response) {
//     console.log(response.status);
//     console.log(response.data);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });



module.exports = {
  makeArr, middleValue, replaceNum,
  abcLeng,
  arrFirstLast, insidePlus,
  countApartment, innerApartment,
  todo, allUsers
};
