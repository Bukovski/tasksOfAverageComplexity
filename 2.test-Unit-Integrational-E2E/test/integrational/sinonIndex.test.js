const request = require('request');
const axios = require('axios');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const usersJson = require('./users');

chai.should();
chai.use(chaiAsPromised);

const sinonIndex = require('../../files/sinonIndex');
const {
  edge, treeOfNumbers ,
  makeArr, middleValue, replaceNum,
  doHomework, alertFinished,
  apple, john,
  getAlbumById, getUsers
} = sinonIndex;


describe('#treeOfNumbers spy', () => {
  let sandbox;
  let left;
  let right;
  let treefn;
  
  before(() => {
    treefn = sinon.spy(sinonIndex, 'treeOfNumbers');
  });
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    left = sandbox.spy(edge, 'left');
    right = sandbox.spy(edge, 'right');
    
    sinonIndex.treeOfNumbers(10, edge);
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  it("count to edge call left method", () => {
    (left.callCount).should.be.equal(5)
  });
  
  it("count to edge call right method", () => {
    (right.callCount).should.be.equal(5)
  });
  
  it("check value edge firstCall right method", () => {
    (right.firstCall.returnValue).should.be.deep.eq([ 2, 1 ]);
  });
  
  it("check value edge lastCall right method", () => {
    (right.lastCall.returnValue).should.be.deep.eq([ 10, 9, 8, 7, 6, 5, 4, 3, 2, 1 ]);
  });
  
  it("check value edge getCall 3 right method", () => {
    (right.getCall(3).returnValue).should.be.deep.eq([ 8, 7, 6, 5, 4, 3, 2, 1 ]);
  });
  
  it("check value edge firstCall left method", () => {
    (left.firstCall.returnValue).should.be.deep.eq([ 1 ]);
  });
  
  it("check value edge lastCall left method", () => {
    (left.lastCall.returnValue).should.be.deep.eq([ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);
  });
  
  it("check value edge getCall 3 left method", () => {
    (left.getCall(3).returnValue).should.be.deep.eq([ 1, 2, 3, 4, 5, 6, 7 ]);
  });
  
  it("edge who call be first method, should be left first", () => {
    (left.calledBefore(right)).should.be.true;
  });
  
  it("treeOfNumbers should called 10 times, while tests were run", () => {
    (treefn.callCount).should.be.equal(10);
  });
  
  it("treeOfNumbers with what first argument must be a 10 for run functions", () => {
    (treefn.args.every(elem => elem[0] === 10)).should.be.true;
  });
});

describe("#replaceNum", () => {
  describe("stub", () => {
    let makeArr;
    let middleValue;
    
    before(() => {
      makeArr = sinon.stub(sinonIndex, "makeArr");
      middleValue = sinon.stub(sinonIndex, "middleValue");
      
      middleValue
        .onCall(0).returns(3)
        .onCall(1).returns(4)
        .onCall(2).returns(5)
        .onCall(3).returns(7)
        .onCall(4).returns(5);
      
      makeArr
        .onCall(0).returns([ 1, 2, 3, 4, 5 ])
        .onCall(1).returns([ 5, 3, 6, 8, 2 ])
        .onCall(2).returns([ 9, 9, 9, 9, 9 ])
        .onCall(3).returns([ 0, 0, 0, 0, 0 ])
        .onCall(4).returns([ 4, 4, 9, 9, 1 ]);
    });
    
    after(() => {
      middleValue.restore();
      makeArr.restore();
    });
    
    it("if replaceNum call arguments 3 and [ 1, 2, 3, 4, 5 ]", () => {
      (replaceNum(makeArr(), middleValue())).should.be.deep.eq([ 1, 2, 3, 3, 3 ]);
    });
    
    it("if replaceNum call arguments 4 and [ 5, 3, 6, 8, 2 ]", () => {
      (replaceNum(makeArr(), middleValue())).should.be.deep.eq([ 4, 3, 4, 4, 2 ]);
    });
    
    it("if replaceNum call arguments 5 and [ 9, 9, 9, 9, 9 ]", () => {
      (replaceNum(makeArr(), middleValue())).should.be.deep.eq([ 5, 5, 5, 5, 5 ]);
    });
    
    it("if replaceNum call arguments 7 and [ 0, 0, 0, 0, 0 ]", () => {
      (replaceNum(makeArr(), middleValue())).should.be.deep.eq([ 0, 0, 0, 0, 0 ]);
    });
    
    it("if replaceNum call arguments 5 and [ 4, 4, 9, 9, 1 ]", () => {
      (replaceNum(makeArr(), middleValue())).should.be.deep.eq([ 4, 4, 5, 5, 1 ]);
    });
  });
  
  describe("spy", () => {
    let sandbox;
    
    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });
    
    afterEach(() => {
      sandbox.restore();
    });
    
    it("replaceNum inner function map-loop should return new array but still use algorithm", () => {
      const mapCalled = sandbox.spy(global.Array.prototype, 'map');
      
      const newArr = makeArr(5);
      const middleNumber = middleValue(newArr);
      
      replaceNum(newArr, middleNumber);
      
      const checkAlgorithm = mapCalled.firstCall.thisValue.filter(elem => elem < middleNumber);
      
      (mapCalled.firstCall.returnValue).should.be.a('array').and.include.members(checkAlgorithm);
    });
    
    it("makeArr inner function push must be called as many times what is the length of array", () => {
      const pushCalled = sandbox.spy(global.Array.prototype, 'push');
      
      const newArr = makeArr(5);
      const middleNumber = middleValue(newArr);
      const lengthNewArray = replaceNum(newArr, middleNumber);
      
      (lengthNewArray).should.be.lengthOf(pushCalled.callCount);
    });
    
    it("middleValue inner function Math.round should return result for function", () => {
      const pushCalled = sandbox.spy(global.Math, 'round');
      
      const newArr = makeArr(5);
      const middleNumber = middleValue(newArr);
      
      middleNumber.should.be.equal(pushCalled.lastCall.returnValue);
    });
  });
});

describe("#doHomework", () => {
  describe("spy console.log", () => {
    let sandbox;
    let logCalled;
    
    before(() => {
      sandbox = sinon.createSandbox();
      
      logCalled = sandbox.spy(global.console, 'log');
      
      doHomework('math', alertFinished);
    });
    
    after(() => {
      sandbox.restore()
    });
    
    it("should be called twice", () => {
      (logCalled.callCount).should.be.equal(2);
    });
    
    it("should called first doHomework and next alertFinished", () => {
      (logCalled.firstCall.args[0]).should.be.equal('Starting my math homework.');
      
      logCalled.restore();
      
      (logCalled.secondCall.args[0]).should.be.equal('Finished my homework');
    });
  });
  
  describe("stub console.log", () => {
    let sandbox;
    let logCalled;
    
    before(() => {
      sandbox = sinon.createSandbox();
      
      logCalled = sandbox.spy(global.console, 'log');
    });
    
    after(() => {
      sandbox.restore();
    });
    
    it("changed message and called him", () => {
      const alertFinis = sandbox.stub(sinonIndex, 'alertFinished').callsFake(() => console.log("I\'m from stub"));
      
      doHomework('math', alertFinis);
      
      (logCalled.args).should.be.a('array').and.deep.include([ "I\'m from stub" ]);
    });
  });
});

describe("#Person mock", () => {
  let mockApple;
  
  beforeEach(() => {
    mockApple = sinon.mock(apple)
  });
  
  afterEach(() => {
    mockApple.restore()
  });
  
  it("replace apple.getInfo for mock, return new message and check it", () => {
    const getInfo = mockApple.expects('getInfo').once().returns('I stole your money. P.S. Apple company');
    
    john.bay();
    
    (getInfo.verify()).should.be.true;
  });
  
  it("replace apple.price for mock and check her arguments", () => {
    const objData = { name: 'watch', price: 2000 };
    const price = mockApple.expects("price").withArgs(objData).returns('watch : 9999');
    
    john.getPrice(objData); //watch : 9999
    
    (price.verify()).should.be.true;
  });
  
  it("replace apple.price for mock, call john.newOrder('phone', 4500) four times", () => {
    const objData = { name: 'phone', price: 4500 };
    const price = mockApple.expects('price').withArgs(objData).exactly(4);
    
    john.newOrder('phone', 4500);
    john.newOrder('phone', 4500);
    john.newOrder('phone', 4500);
    john.newOrder('phone', 4500);
    
    (price.verify()).should.be.true;
  });
});

describe("#getAlbumById stub", () => {
  let sandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  it("change request.get and replace data", () => {
    sandbox.stub(request, 'get')
      .yields(null, null, JSON.stringify({
        "userId": 1,
        "id": 10,
        "title": "distinctio laborum qui"
      }));
    
    getAlbumById(1).should.eventually.be.a('object').have.all.keys("userId", "id", "title");
  });
  
  it("if call record under 10, request.get should return object, they have id: 10", () => {
    sandbox.stub(request, 'get')
      .yields(null, null, JSON.stringify({
        "userId": 1,
        "id": 10,
        "title": "distinctio laborum qui"
      }));
    
    getAlbumById(1).should.eventually.be.a('object').to.deep.include({ "id": 10 })
  });
  
  it("if record does not exist", () => {
    sandbox.stub(request, 'get')
      .yields(null, null, JSON.stringify({}));
    
    getAlbumById(200).should.eventually.be.a('object').to.deep.eq({});
  });
});

describe("#getUsers stub", () => {
  let sandbox;
  const resolved = Promise.resolve({ data: usersJson });
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    sandbox.stub(axios, 'get').returns(resolved);
  });
  
  afterEach(() => sandbox.restore());
  
  it('return array which has length 10', () => {
    getUsers().should.eventually.a('array').and.lengthOf(10);
  });
  
  it('should return object inside array and have all keys', (done) => {
    getUsers().then(data => {
      data[0].should.a('object').have.all.keys("id", "name", "username", "email", "address", "phone", "website", "company");
      
      done();
    });
  });
});
