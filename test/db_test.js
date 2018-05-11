const assert = require('assert');
const db = require('../db')
describe('hooks', () => {
    beforeEach('#defaultDBName', () => {
        if(db.defaultDBName != db.testDatabase){
            throw Error("PRODUCTION DATABASE IN USE");
        }
    })

    after(() => {
        it("should return a database connection in the callback and close the connections", (done) => {
            db.connect((err, conn) => {
                assert(conn!=null);
                conn.close();
                done();
            }, db.defaultDBName)
        })
    })


})

describe("db.js", () => {
    describe('#defaultDBName', ()=>{
        it("should be using defaultDBName not testDatabase", () => {
            assert(db.defaultDBName == db.testDatabase)
        })
    })
    describe('#dropDatabase', () => {
        it("should return result equals true in callback", (done) => {
            db.dropDatabase((err, result) => {
                assert(result);
                done();
            })
        });
    })
    describe("#connect(callback, db.defaultDBName)", () => {
        it("should return a database connection in the callback", (done) => {
            db.connect((err, conn) => {
                assert(conn!=null);
                done();
            }, db.defaultDBName)
        })
    })
})
