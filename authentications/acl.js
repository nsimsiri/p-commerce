var sformat = require('util').format;
var q = require('async');
var User = require('../models/user')
var Permission = require('../models/permission')
var UserPermission = require('../models/user_permission')
var express = require('express');
var router = express.Router();
var url = require('url');

module.exports.hasInternalPrivileges = function(permissions){
    var internalPrivilegePermissionNames = [
        Permission.ADMIN
    ];

    return internalPrivilegePermissionNames
        .map(function(name){
            return permissions.some(function(perm){ return perm.name == name; });
        })
        .reduce(function(a,b){
            return a || b;
        });

};

module.exports.permission = function(permissionNames){
    var middleware = function(req, res, next){
        var permissions = req.user.permissions;
        if (permissions){
            var hasPerm = permissions
            .map(function(perm){
                return permissionNames.some(function(pname){ return pname == perm.name });
            })
            .reduce(function(a,b){
                return a || b;
            });

            if (hasPerm){
                next();
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/')
        }
    }
    return middleware;
}


/* old method
UserPermission.getByUser(req.user._id, function(err, userPermissions, db){
    if (err){
        res.status(500).send(err);
        return null;
    }
    Permission.getAll(function(err, permissions, db){
        if (err){
            res.status(500).send(err);
            return null;
        }
        console.log(userPermissions);
        console.log(permissions);
        var idToName = permissions.map(function(p){
            var _o = {};
            _o[p._id.toString()] = p.name;
            return _o;
        }).reduce(function(a,b){
            for(var key in b){
                a[key] = b[key]
            }
            return a;
        });
        console.log(idToName);
        var hasPerm = userPermissions.map(function(up){
            return permissionNames.some(function(nm){ return nm==idToName[up.permissionId.toString()] });
        }).reduce(function(a,b){
            return a || b;
        })

        if (hasPerm){
            next();
        } else {
            res.redirect('/');
        }
    });
});
*/
