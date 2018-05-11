const assert = require('assert');
const User = require('../models/user')
const db = require('../db')

describe('user.js', () => {
    after((done) => {
        db.connect((err, conn) => {
            assert(conn!=null);
            conn.close();
            done();
        }, db.defaultDBName)
    })
    describe("#create(\'natcha.simsiri@gmail.com\', \'password\')", () => {
        it ("should create user and return saved user object with field \'_id\'", (done) => {
            const email = 'natcha.simsiri@gmail.com';
            User.create(email, 'password', (err, user) => {
                assert(err==null);
                assert(user!=null)
                assert(user._id != null);
                assert(user.email == email);
                done();
            });
        });
    })
    describe("#create(\'bob.amb@gmail.com\', \'password\') twice", () => {
        it ("should only have 2 entry in database", (done) => {
            const email = 'bob.amb@gmail.com';
            User.create(email, 'password', (err, user) => {
                assert(err==null);
                assert(user!=null)
                assert(user._id != null);
                assert(user.email == email);
                User.create(email, 'password2', (err, user2) => {
                    assert(err!=null);
                    assert(user2 == null);
                    User.getAll((err, users) => {
                        assert(users!=null)
                        assert(users.length == 2);
                        assert(users[1]._id.equals(user._id));
                        done();
                    })
                })
            });
        });
    })
    describe('#getByEmail(\'natcha.simsiri@gmail.com\')', ()=>{
        it('should return a valid user with that email', done => {
            User.getByEmail('natcha.simsiri@gmail.com', (err, user) => {
                assert(err==null);
                assert(user!=null);
                assert(user.email == 'natcha.simsiri@gmail.com');
                done();
            });
        });
    });
    describe('#getByEmail(\'wrong_email@gmail.com\')', ()=>{
        it('should return null user with no error', done => {
            User.getByEmail('wrong_email@gmail.com', (err, user) => {
                assert(err==null);
                assert(user==null);
                done();
            });
        });
    });
    describe('#create(null, null)', () => {
        it("should throw exception", done => {
            User.create(null, null, (err, user) => {
                assert(err!=null);
                assert(user==null);
                done();
            })
        })
    })
    describe('#create(\'\', \'\')', () => {
        it("should throw exception", done => {
            User.create(null, null, (err, user) => {
                assert(err!=null);
                assert(user==null);
                done();
            })
        })
    })
    describe('#create(\'a b@gmaill.com\', \'password\')', () => {
        it("should throw exception", done => {
            User.create('a b@gmail.com', 'password', (err, user) => {
                assert(err!=null);
                assert(user==null);
                done();
            })
        })
    })
    describe('#create(\'\', \'password\')', () => {
        it("should throw exception", done => {
            User.create(null, 'password', (err, user) => {
                assert(err!=null);
                assert(user==null);
                done();
            })
        })
    })
    describe('#create(\'email@gmail.com\', \'\')', () => {
        it("should throw exception", done => {
            User.create('email@gmail.com', null, (err, user) => {
                assert(err!=null);
                assert(user==null);
                done();
            })
        })
    })
})
