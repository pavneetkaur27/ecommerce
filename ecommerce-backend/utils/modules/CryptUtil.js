const crypto    = require('crypto');
const bcrypt    = require('bcryptjs');
const bv        = require('bvalid');
const salt_val  = 10;
const two_way_algorithm = 'aes256';
function Crypt(){}

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

Crypt.prototype.TwoWayEncode = function(str,skey)
{
    skey = bv.isString(skey) ? skey : 'twowayencode20199120';
    var cipher = crypto.createCipher(two_way_algorithm, skey);
    return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
}

Crypt.prototype.TwoWayDecode = function(hash,skey)
{
    skey = bv.isString(skey) ? skey : 'twowayencode20199120';
    var decipher = crypto.createDecipher(two_way_algorithm, skey);
    return decipher.update(hash, 'hex', 'utf8') + decipher.final('utf8');
}

module.exports = new Crypt();