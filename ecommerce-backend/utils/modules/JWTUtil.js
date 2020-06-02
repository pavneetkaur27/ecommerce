"use strict";
const bv  = require('bvalid');
const jwt = require('jsonwebtoken');
const sConf = require('../../config/app').server;
function _JWT(){}

function getPrivateKey(pkey){
    if(bv.isString(pkey) && pkey.length != 0){
        return pkey;
    } else {
        return sConf.JWT_PRIVATE_KEY;
    }
}

_JWT.prototype.sign = function(obj,pkey,exp){
    pkey = getPrivateKey(pkey);
    if(!exp){
        exp = 60*60*24*30;
    }
    return jwt.sign(obj,pkey,{
        expiresIn : exp
    })
}

_JWT.prototype.verify = function(token,pkey,cb){
    pkey = getPrivateKey(pkey);
    if(bv.isFunction(cb)){
        jwt.verify(token,pkey,function(err,decoded){
            return cb(err,decoded);
        });
    } else {
        return new Promise(function(rs,rj){
            jwt.verify(token,pkey,function(err,decoded){
                if(err){
                    return rj(err);
                } else {
                    return rs(decoded);
                }
            });
        })
    }   
}

module.exports = new _JWT();