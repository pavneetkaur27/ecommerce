const mongoose             = require('mongoose');
const Crypt                = require('../utils').Crypt;
const errors               = require('../helper').Errors;
const bv                   = require('bvalid');

const model_name = 'orguseracc';

const schema = mongoose.Schema({

    eml : { type : String,trim : true,lowercase : true,required : true,unique : true }, //e-mail
    nm  : {type : String,trim: true,default : "No Name" }, //user name
    pwd : {type : String, required : true },
    act : { type : Boolean, default : true },
  },{ 
    timestamps : true
  }
);

schema.index({eml : 1, act : 1});

schema.statics = {
 
};


schema.pre("save",function(next){
  
  if(!this.eml){
    return next(errors.email_required[1]);
  }
  if(bv.isEmail(this.eml)===false){
    return next(errors.invalid_email[1]);
  }
  if( (!this.nm || !bv.isString(this.nm)) ||
      (bv.isString(this.nm) && this.nm.trim().length === 0)
    ){
      this.nm = this.eml.match(/^(\S+)@\S+$/)[1];
      try{
        this.nm = this.nm.split('.').join(' ');
      }catch(err){}
  }

  if(bv.isString(this.pwd) || bv.isNumber(this.pwd)){
    Crypt.encode(this.pwd,(err,hash)=>{
      if(err){
        return next(err);
      }
      this.pwd = hash;
      return next();
    })
  } else {
    return next(errors.invalid_type_of_password);
  }
});

schema.pre('update', function(next) {
  var updt = this._update;
  if(updt && updt.$set && updt.$set.pwd){
    var pwd = updt.$set.pwd;
    if(bv.isString(pwd) || bv.isNumber(pwd))
    {
      pwd = String(pwd);
      try{
        var hash = Crypt.encode(pwd);
        this._update.$set.pwd = hash;
      }catch(err){
        return next(err);
      }
    } else {
      return next(errors.invalid_type_of_password);
    }
  }
  return next();
});

schema.pre('updateOne', function(next) {
  var updt = this._update;
  if(updt && updt.$set && updt.$set.pwd){
    var pwd = updt.$set.pwd;
    if(bv.isString(pwd) || bv.isNumber(pwd))
    {
      pwd = String(pwd);
      try{
        var hash = Crypt.encode(pwd);
        this._update.$set.pwd = hash;
      }catch(err){
        return next(err);
      }
    } else {
      return next(errors.invalid_type_of_password);
    }
  }
  return next();
});

schema.pre('findOneAndUpdate', function(next) {
  var updt = this._update;
  if(updt && updt.$set && updt.$set.pwd){
    var pwd = updt.$set.pwd;
    if(bv.isString(pwd) || bv.isNumber(pwd))
    {
      pwd = String(pwd);
      try{
        var hash = Crypt.encode(pwd);
        this._update.$set.pwd = hash;
      }catch(err){
        return next(err);
      }
    } else {
      return next(errors.invalid_type_of_password);
    }
  }
  return next();
});

module.exports = mongoose.model(model_name,schema,model_name);