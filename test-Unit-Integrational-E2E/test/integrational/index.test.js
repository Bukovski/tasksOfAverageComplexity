const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.should();

chai.use(chaiAsPromised);

const {
  makeArr, middleValue, replaceNum,
  arrFirstLast, insidePlus,
  countApartment, innerApartment
} = require("../../files/index");


describe("#replaceNum interaction with makeArr and middleValue", () => {
  let createArray;
  let middleNumber;
  
  beforeEach(() => {
    createArray = makeArr(10);
    middleNumber = middleValue(createArray);
  });
  
  it("should be not empty array", () => {
    const lengthArray = createArray.length;
    
    replaceNum(createArray, middleNumber).should.be.a('array').to.have.lengthOf(lengthArray);
  });
  
  it("should have values of the old array", () => {
    const filterLessMiddleArray = createArray.filter(elem => elem < middleNumber);
  
    replaceNum(createArray, middleNumber).should.be.include.members(filterLessMiddleArray)
  });
});

describe("#insidePlus internal function", () => {
  beforeEach(() => {
    arrFirstLast([]);
  });

  it("argument set array, return string result", () => {
    insidePlus([1, 2, 3, 4, 5]).should.be.a('string').is.equal("15-24-3")
  });
  
  it("argument set empty array, return empty string", () => {
    insidePlus([]).should.be.a('string').is.empty;
  });
  
  it("result is compiled in the right algorithm", () => {
    const startArr = [1, 2, 3, 4, 5, 6];
    const joinEdgesElems = startArr[0] + startArr.slice(-1);
  
    insidePlus(startArr).should.be.a('string').and.includes(joinEdgesElems);
  });
});

describe("#innerApartment internal function", () => {
  before(() => {
    countApartment(1, 1, 1, 1);
  });
  
  it("argument set step 2 and max item 20, return array of length 4", () => {
    innerApartment(5, 20).should.be.a('array').and.lengthOf(4);
  });
  
  it("argument set step 2 and max item 20, should equal result array", () => {
    innerApartment(5, 20).should.be.a('array').is.deep.equal([ 5, 10, 15, 20 ]);
  });
  
  it("argument set step 20 and max item 1, should equal result array", () => {
    innerApartment(20, 1).should.be.a('array').is.deep.equal([ 20 ]);
  });
  
  it("argument set step 1 and max item 999, result array of length 999", () => {
    innerApartment(1, 999).should.be.a('array').and.lengthOf(999);
  });
});
