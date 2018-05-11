const User = require('../models/user');
const Profile = require('../models/profile');
const Permission = require('../models/permission');
const UserPermission = require('../models/user_permission');
const _ = require('lodash');
const faker=  require('faker')
const q = require('async');
const ADMIN = Permission.ADMIN;
const USER = Permission.USER;
const sformat = require('util').format;
faker.seed(123);
faker.phone.phoneFormats("08#-###-####")


const usr_json = (usr,pwd,fname,lname,phone,line,permissionName) => ({
    email: usr,
    password: pwd,
    firstname: fname,
    lastname : lname,
    phone: phone,
    line: line,
    permissionName: permissionName
})

const MOCK_ADMINS = [
    usr_json('admin@gmail.com', '123123', 'PCOMMERCE', 'ADMIN', '+14134069796', 'ADMIN',  ADMIN),
    usr_json('natcha.simsiri@gmail.com', '123123', 'natcha', 'simsiri', '0807790076', 'nsimsiri_line', ADMIN)
]

const N_USERS = 123;
const MOCK_USERS = _.map(_.range(N_USERS), i => {
    return usr_json(
        sformat("user_%s@gmail.com", i+1),
        '123123',
        faker.name.firstName(),
        faker.name.lastName(),
        faker.phone.phoneNumber(),
        faker.internet.userName(),
        USER
    )
})


const initialize = (permissions, callback, options = {fake: false}) => {
    const permissionTable = _.chain(permissions)
        .map(permission => { var result = {}; result[permission.name] = permission; return result; })
        .reduce((accum, x) => ({...accum, ...x}))
        .value()

    const user_jsons = options.fake ? _.union(MOCK_ADMINS, MOCK_USERS) : MOCK_ADMINS;
    q.map(user_jsons, (json, callback) => {
        User.create(json.email, json.password, (err, user) => {
            if (!user || err) throw Error("[ERR INITIALIZING USERS - see user_mock.js]: " + err);
            const userId = user._id;
            const permissionId = permissionTable[json.permissionName]._id;
            Profile.create(userId, json.firstname, json.lastname, json.phone, json.line, (err, profile) => {
                if(!profile || err) throw Error("[ERR INITIALIZING PROFILES - see user_mock.js]: " + err);
                UserPermission.create(userId, permissionId, (err, userPermission) => {
                    if(!userPermission || err) throw Error("[ERR INITIALIZING UserPermissions - see user_mock.js]: " + err);
                    return callback(null, {
                        user: user,
                        profile: profile,
                        userPermission: userPermission,
                        permission: _.find(permissions, permission => permission._id == userPermission.permissionId)
                    })
                })
            })
        })
    }, (err, userWrappers) => {
        return callback(userWrappers);
    })
}

exports.initialize = initialize
