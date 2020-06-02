const bcrypt                = require('bcryptjs');
const jwt					= require('jsonwebtoken');
const bv                    = require('bvalid');
const salt_val = 10;

//------Functions-----
function Crypt(){}
function _JWT(){}
//--------------------


Crypt.prototype.encode = function(password,cb)
{
    if(bv.isFunction(cb)){
        bcrypt.genSalt(salt_val, function(err, salt) {
            if(err){return cb(err)}
            bcrypt.hash(password, salt, function(err, hash) {
                return cb(err,hash);
            });
        });
    } else {
        var salt = bcrypt.genSaltSync(salt_val);
        return bcrypt.hashSync(password, salt);
    }
};

Crypt.prototype.decode = function(password,hash,cb)
{
    if(bv.isFunction(cb)){
        bcrypt.compare(password, hash, function(err, res) {
            return cb(err,res);
        });
    } else {
        return bcrypt.compareSync(password, hash);
    }
}

_JWT.prototype.sign = function(obj,pkey,exp){
    var pkey = pkey;
    var exp = exp;
    return jwt.sign(obj,pkey,{
        expiresIn : exp
    })
}

_JWT.prototype.verify = function(token,pkey,cb){
    var pkey = pkey;
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

module.exports = {
    Crypt : new Crypt(),
    JWT : new _JWT()
}