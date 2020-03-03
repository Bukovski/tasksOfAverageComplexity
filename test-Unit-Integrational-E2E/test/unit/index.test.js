const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const axios = require('axios');

chai.should();

chai.use(chaiAsPromised);

const {
  makeArr, middleValue, replaceNum,
  abcLeng,
  arrFirstLast,
  countApartment,
  todo, allUsers
} = require("../../files/index");


describe("#makeArr", () => {
  describe("must be success if", () => {
    it("argument is number", () => {
      makeArr(10).should.be.a('array').lengthOf(10)
    });
  
    it("argument is number inside string", () => {
      makeArr('10').should.be.a('array').lengthOf(10)
    });
    
    it("argument is number 999", () => {
      makeArr(999).should.be.a('array').lengthOf(999)
    });
  });
  
  describe("must return empty array if", () => {
    it("argument is number zero", () => {
      makeArr(0).should.be.a('array').is.empty
    });
    
    it("argument is string", () => {
      makeArr('10dd').should.be.a('array').is.empty
    });
  
    it("argument is object", () => {
      makeArr({}).should.be.a('array').is.empty;
    });
  });
});

describe("#middleValue", () => {
  describe("pass if", () => {
    it("argument array has [1, 2, 3, 4, 5] return number 3", () => {
      middleValue([1, 2, 3, 4, 5]).should.be.a('number').and.equal(3);
    });
    
    it("argument array has [ 9, 9, 4, 4, 1, 6, 5, 2, 4, 3 ] return number 5", () => {
      middleValue([ 9, 9, 4, 4, 1, 6, 5, 2, 4, 3 ]).should.be.a('number').and.equal(5);
    });
  });
  
  describe("not correct work if", () => {
    it("array have number inside the string [ '1', '2', '3', '4' ] return 309", () => {
      middleValue([ '1', '2', '3', '4' ]).should.be.a('number').and.equal(309)
    });
  });
  
  describe("fail if", () => {
    it("array have string [ 'a', 'b', 'c', 'd' ] return NaN", () => {
      middleValue([ 'a', 'b', 'c', 'd' ]).should.be.NaN;
    });
  });
  
  describe("return zero if", () => {
    it("argument is empty array", () => {
      middleValue([]).should.be.a('number').and.equal(0);
    });
  
    it("argument is string", () => {
      middleValue("some string").should.be.a('number').and.equal(0);
    });
  
    it("argument is number", () => {
      middleValue(0).should.be.a('number').and.equal(0);
    });
  
    it("argument is object", () => {
      middleValue({}).should.be.a('number').and.equal(0);
    });
  
    it("argument is null", () => {
      middleValue(null).should.be.a('number').and.equal(0);
    });
  })
});

describe("#replaceNum", () => {
  const arrayFirstArg = [ 9, 9, 4, 4, 1, 6, 5, 2, 4, 3 ];
  let firstArg;
  let secondArg;
  
  before(() => {
    firstArg = (arr = arrayFirstArg) => replaceNum(arr, 5);
    secondArg = (num = 5) => replaceNum(arrayFirstArg, num);
  });
  
  describe("pass if", () => {
    it("first argument is correct array, must return same length array", () => {
      const arrayFirstArgLength = arrayFirstArg.length;
    
      firstArg().should.be.a('array').lengthOf(arrayFirstArgLength)
    });
  
    it("first argument is correct array, must return change array", () => {
      const arrayChange = [ 5, 5, 4, 4, 1, 5, 5, 2, 4, 3 ];
    
      firstArg().should.be.a('array').to.deep.equal(arrayChange)
    });
    
    it("second argument is number 9, must return change array", () => {
      const arrayChange = [ 9, 9, 4, 4, 1, 6, 5, 2, 4, 3 ];
    
      secondArg(9).should.be.a('array').have.members(arrayChange);
    });
  
    it("second argument is zero, must return change array, filled only with zeros", () => {
      const arrayChange = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    
      secondArg(0).should.be.a('array').have.members(arrayChange);
    });
  });
  
  describe("return empty array if" , () => {
    it("first argument is any string", () => {
      firstArg('5').should.be.a('array').is.empty;
    });
    
    it("first argument is object", () => {
      firstArg({}).should.be.a('array').lengthOf(0);
    });
  
    it("first argument is empty array", () => {
      firstArg([]).should.be.a('array').is.empty;
    });
  
    it("first argument is null", () => {
      firstArg(null).should.be.a('array').is.empty;
    });
    
    it("second argument is any string", () => {
      secondArg('5').should.be.a('array').is.empty;
    });
  
    it("second argument is object", () => {
      secondArg({}).should.be.a('array').is.empty;
    });
  
    it("second argument is null", () => {
      secondArg(null).should.be.a('array').is.empty;
    });
  });
});

describe("#abcLeng pass if", () => {
  let abcFunc;
  
  before(() => {
    abcFunc = abcLeng("aabbcc87878abccbaaaaaabbbccc4155cabbac478dr")
  });
  
  it("return object", () => {
    abcFunc.should.be.a('object');
  });
  
  it("object have keys words, wordsLength and count", () => {
    abcFunc.should.be.a('object').to.have.all.keys('words', 'wordsLength', 'count');
  });
  
  it("object must be equal to the result", () => {
    const resultObj = { words: 'rd874cBbbBc5514AccCbbBaaBaaCccCa87878ccCbaB',
      wordsLength: 43,
      count: 12 };
    
    abcFunc.should.be.a('object').to.include(resultObj);
  });
  
  it("argument is less string, should return object be equal to the result", () => {
    const resultObj = { words: 'gnirts ssel emos', wordsLength: 16, count: 2 };
    
    abcLeng('some less string').should.be.a('object').to.include(resultObj);
  });
  
  it("argument is empty string, should return object be equal to the result", () => {
    const resultObj = { words: '', wordsLength: 0, count: 0 };
    
    abcLeng('').should.be.a('object').to.include(resultObj);
  });
});

describe("#arrFirstLast pass if", () => {
  it("return string", () => {
    arrFirstLast(['1', '2', '3', '4', '5', '6']).should.be.a('string');
  });
  
  it("array has an even number of elements, return correct results", () => {
    arrFirstLast(['1', '2', '3', '4', '5', '6']).should.be.a('string').is.equal('16-25-34');
  });
  
  it("array has not an even number of elements, return correct results", () => {
    arrFirstLast(['1', '2', '3', '4', '5', '6', '7']).should.be.a('string').is.equal('17-26-35-4');
  });
  
  it("argument is empty array, must return empty string", () => {
    arrFirstLast([]).should.be.a('string').is.empty;
  });
  
  it("array consists only of digits, return correct results", () => {
    arrFirstLast([1, 2, 3, 4, 5, 6]).should.be.a('string').is.equal('16-25-34');
  });
  
  it("result is compiled in the right algorithm", () => {
    const startArr = ['1', '2', '3', '4', '5', '6'];
    const joinEdgesElems = startArr[0] + startArr.slice(-1); //16
    
    arrFirstLast(startArr).should.be.a('string').and.includes(joinEdgesElems);
  });
});

describe("#countApartment", () => {
  let apartmentFn;
  
  before(() => {
    apartmentFn = (apartment) => countApartment(5, 4, 3, apartment);
  });
  
  describe("pass if", () => {
    it("all arguments correct, return entrance number in house", () => {
      apartmentFn(23).should.be.a('number').and.equal(2);
    });
  
    it("all arguments correct and apartment from the first entrance, return entrance number in house", () => {
      apartmentFn(1).should.be.a('number').and.equal(1);
    });
  
    it("all arguments correct and apartment from the last entrance, return entrance number in house", () => {
      apartmentFn(59).should.be.a('number').and.equal(3);
    });
  });
  
  describe("return warning if", () => {
    it("four argument flat, equal zero", () => {
      apartmentFn(0).should.be.a('string').and.equal('Нулевых квартир не бывает');
    });
  
    it("four argument flat, more than there is in the house", () => {
      apartmentFn(100).should.be.a('string').and.includes('Квартир в доме меньше чем вы задали.');
    });
  })
});

describe("#todo", () => {
  let status;
  let data;
  
  before(async () => {
    ({ status, data } = await todo(1));
  });
  
  it("check status code, must be 200", () => {
    status.should.be.a('number').and.equal(200);
  });
  
  it("data should be a object", () => {
    data.should.be.a('object');
  });
  
  it("should have certain keys", () => {
    data.should.have.all.keys('userId', 'id', 'title', 'completed');
  });
  
  it("check type data key userId, should be a number", () => {
    data.userId.should.be.a('number');
  });
  
  it("check type data key id, should be a number", () => {
    data.id.should.be.a('number');
  });
  
  it("check type data key title, should be a string", () => {
    data.title.should.be.a('string');
  });
  
  it("check type data key completed, should be a boolean", () => {
    data.completed.should.be.a('boolean');
  });
  
  it("Error if user not exists, should return status 404", async () => {
    try {
      await todo(201);
    } catch (err) {
      err.response.status.should.be.a('number').and.equal(404);
    }
  });
});

describe("#allUsers", () => {
  let status;
  let data;
  
  before((done) => {
    allUsers.then(res => {
      ({ data, status } = res);
      
      done();
    });
  });
  
  it("check status code, must be 200", () => {
    status.should.be.a('number').and.equal(200);
  });
  
  it("data should be a array", () => {
    data.should.be.a('array');
  });
  
  it("inside array data must be objects", () => {
    data[0].should.be.a('object');
  });
  
  it("address is not to find 404", () => {
    axios.get('http://jsonplaceholder.typicode.com/userss').should.be.rejectedWith(Error)
  });
});
