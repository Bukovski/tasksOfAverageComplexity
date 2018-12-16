const assert = require('assert');

const {
  max, wordsWith,
  doubleAfter2Seconds, addAsync
} = require("../../files/forTest");


describe("callback function", () => {
  describe("#max", () => {
    let maxFn;
    
    before(() => {
      maxFn = (callback) => max("Seamlessly 11 architect 98333flexible e-tailers vis55 virtual 321643resources. Authori7842tatively productivate.", callback)
    });
    
    it("is must be a number", (done) => {
      maxFn((err, res) => {
        if (err) return done(err);
        
        assert(!isNaN(res));
        
        done();
      })
    });
    it("should return numbers", (done) => {
      maxFn((err, res) => {
        assert.equal(res, '0321643');
        
        done();
      })
    });
    it("should be error", (done) => {
      max("short string", (err, res) => {
        assert.equal(err, 'Error Must be a string');
      
        done();
      })
    });
  });
  
  describe("#wordsWith", () => {
    let wordsFn;
    
    before(() => {
      wordsFn = (callback) => wordsWith("Seamlessly 11 architect 9853flexible e-tailers vis55 virtual 321643resources. Authori7842tatively productivate.", callback);
    });
    
    it("it should be array", (done) => {
      wordsFn((res) => {
        assert(Array.isArray(res));
        
        done();
      });
    });
    
    it("must return inside object", (done) => {
      wordsFn((res) => {
        const isObject = res.every(elem => (typeof elem === 'object'));
        
        assert(isObject);
        
        done();
      });
    });
    
    it("inside object key should be a string", (done) => {
      wordsFn((res) => {
        const isObject = res.every(elem => isNaN(Object.keys(elem)[ 0 ]));
        
        assert(isObject);
        
        done();
      });
    });
    
    it("inside object value should be a number", (done) => {
      wordsFn((res) => {
        const isObject = res.every(elem => !isNaN(Object.values(elem)[ 0 ]));
        
        assert(isObject);
        
        done();
      });
    });
  });
});


describe("async Promise", () => {
  describe("#doubleAfter2Seconds", () => {
    let Promise2Seconds;
    
    before(() => {
      Promise2Seconds = doubleAfter2Seconds(10)
    });
    
    it("must be a number", () => {
      Promise2Seconds.then((r) => {
        assert(!isNaN(r));
      });
    });
  
    it("should be equal 20", () => {
      Promise2Seconds.then((r) => {
        assert.deepStrictEqual(r, 20); //===
      });
    });
  });
  
  describe("#addAsync", () => {
    let asyncResult;
    
    before(async () => { // 6сек
      asyncResult = await addAsync(10);
    });
    
    it("must be a number", async () => {
      const result = await asyncResult;
      
      assert(!isNaN(result));
    });
    
    it("should be equal 130", async () => {
      const result = await asyncResult;
    
      assert.deepStrictEqual(result, 130);
    });
  })
});
