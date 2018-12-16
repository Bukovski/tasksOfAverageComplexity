//Дан текст. Найдите наибольшее количество идущих подряд цифр.
const max = (str, callback) => {
  if (typeof str === 'string' && str.trim().length < 20) return callback('Error Must be a string');
  
  const onlyNumber = (str) => str.split(' ')
    .reduce((list, el) => (/\d+/.test(el)) ? list.concat(el.match(/\d+/g)) : list, [])
    .sort((a, b) => b - a)[0];
  
  const sum = (str) => str.split('').reduce((old, count) => old + count, 0);
  
  const result = sum(onlyNumber(str));
  
  callback(null, result);
};

//console.log(max("Seamlessly 11 architect 98333flexible e-tailers vis55 virtual 321643resources. Authori7842tatively productivate."));
/*console.log(max("Seamlessly 11 architect 98333flexible e-tailers vis55 virtual 321643resources. Authori7842tatively productivate.", (err, res) => {
  if (err) return console.error(err);
  
  console.log(res);
}));*/


//2.Дан текст. Найти слова, состоящие из цифр, и сумму чисел, которые образуют эти слова.
const wordsWith = (str, callback) => {
  const strObj = (str) => str.split(' ')
    .reduce((list, el) => (isNaN(el) && (/\d+/.test(el)))
      ? list.concat({ name: [el], number: el.match(/\d+/g).toString() })
      : list
      , []);
  const sum = (str) => str.split('').reduce((old, item) => old + +item, 0);
  // const counter = (obj, fun) => obj.map(elem => `${ elem.name } => ${ fun(elem.number) }`);
  const counter = (obj, fun) => obj.map(elem => ({ [elem.name]: fun(elem.number) }) );
  const carryResult = (str) => counter(strObj(str), sum);
  
  return callback(carryResult(str));
};


/*console.log(wordsWith("Seamlessly 11 architect 9853flexible e-tailers vis55 virtual 321643resources. Authori7842tatively productivate.",
  (res) => console.log('-->', res)
));*/

/*****************************************************/

function doubleAfter2Seconds(x) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(x * 2);
    }, 2000);
  });
}

/*doubleAfter2Seconds(10).then((r) => {
  console.log(r); //20
});*/

async function addAsync(x) {
  const a = await doubleAfter2Seconds(10);
  const b = await doubleAfter2Seconds(20);
  const c = await doubleAfter2Seconds(30);
  
  return x + a + b + c;
}

/*addAsync(10).then((sum) => {
  console.log(sum); //130
});*/



module.exports = {
  max,
  wordsWith,
  doubleAfter2Seconds,
  addAsync
};
