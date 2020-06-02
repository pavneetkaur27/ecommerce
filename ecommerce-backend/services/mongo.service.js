const models = require('../models');
const models_names = require('../helper').Constants.models_name;
const invalid_model_msg = 'Model is invalid';

const invalid_models = new Array();

const getKeyByValue = function (value) {
  var k = Object.keys(models_names);
  for (var i = 0; i < k.length; i++) {
    if (models_names[k[i]] === value) {
      return k[i];
    }
  }
}

function isFunc(v) {
  return Object.prototype.toString.call(v) === '[object Function]';
}

function isUnd(v) {
  return Object.prototype.toString.call(v) === '[object Undefined]';
}

function isStr(v) {
  return Object.prototype.toString.call(v) === '[object String]';
}

function lwr(v) {
  if (isStr(v)) { return v.toLowerCase() }
  return v;
}

function validModel(modelname) {
  if (!models[modelname]) {
    var _modelname = getKeyByValue(lwr(modelname));
    if (_modelname) {
      if (models[_modelname]) {
        return { f: true, r: _modelname };
      }
    }
    return { f: false, r: modelname };
  }
  if (invalid_models.indexOf(modelname) < 0) {
    return { f: true, r: modelname };
  }
  return { f: false, r: modelname };
}


const Mongo = function () {
  this.model_name = null;
  this.lean = true;
};

Mongo.prototype.Model = function (model_name) {
  var _modelVal = validModel(model_name);
  this.model_name = _modelVal.r;
  if (_modelVal.f) {
    this.model = models[this.model_name];
    return this
  }
  throw new Error(invalid_model_msg);
};

Mongo.prototype.Schema = function (model_name) {
  var _modelVal = validModel(model_name);
  model_name = _modelVal.r;
  if (_modelVal.f) {
    return models[model_name];
  }
  return new Error(invalid_model_msg);
};

Mongo.prototype.insert = function (c, cb) {
  if (isFunc(cb)) {
    let model = this.model(c);
    model.save(c, function (er, resp) {
      if (er) {
        console.log(er);
        cb(er);
        return;
      }
      cb(null, resp);
    })
  } else {
    return this.model(c).save( c );
  }
}

Mongo.prototype.update = function (c, d, o, cb) {
  cb = isFunc(o) ? o : cb;
  o = (isFunc(o) || isUnd(o)) ? {} : o;
  if (isFunc(cb)) {
    this.model.update(c, d, o, cb);
  } else {
    return this.model.update(c, d, o);
  }
}

Mongo.prototype.updateOne = function (c, d, o, cb) {
  cb = isFunc(o) ? o : cb;
  o = (isFunc(o) || isUnd(o)) ? {} : o;
  if (isFunc(cb)) {
    this.model.updateOne(c, d, o, cb);
  } else {
    return this.model.updateOne(c, d, o);
  }
}

Mongo.prototype.findOneAndUpdate = function (c, d, o, cb) {
  cb = isFunc(o) ? o : cb;
  o = (isFunc(o) || isUnd(o)) ? {} : o;
  if (isFunc(cb)) {
    this.model.findOneAndUpdate(c, d, o, cb);
  } else {
    return this.model.findOneAndUpdate(c, d, o);
  }
}

Mongo.prototype.findOne = function (c, p, o, cb) {
  cb = isFunc(p) ? p : (isFunc(o) ? o : cb);
  o = (isFunc(o) || isUnd(o)) ? {} : o;
  p = (isFunc(p) || isUnd(p)) ? {} : p;
  o.lean = this.lean;
  if (isFunc(cb)) {
    this.model.findOne(c, p, o, cb);
  } else {
    return this.model.findOne(c, p, o);
  }
}

Mongo.prototype.find = function (c, p, o, cb) {
  cb = isFunc(p) ? p : (isFunc(o) ? o : cb);
  o = (isFunc(o) || isUnd(o)) ? {} : o;
  p = (isFunc(p) || isUnd(p)) ? {} : p;
  o.lean = this.lean;
  if (isFunc(cb)) {
    this.model.find(c, p, o, cb);
  } else {
    return this.model.find(c, p, o);
  }
}

Mongo.prototype.findByIdAndRemove = function (c, cb) {
  if (isFunc(cb)) {
    this.model.findByIdAndRemove(c, cb);
  } else {
    return this.model.findByIdAndRemove(c);
  }
}

Mongo.prototype.remove = function (c, cb) {
  if (isFunc(cb)) {
    this.model.remove(c, cb);
  } else {
    return this.model.remove(c);
  }
}

Mongo.prototype.aggregation = function (q, cb) {
  if (isFunc(cb)) {
    this.model.aggregate([q], cb);
  } else {
    return this.model.aggregate([q]);
  }
}

Mongo.prototype.count = function ( q, cb)
{
  if(isFunc(cb)){
    this.model.countDocuments( q, cb );
  } else {
    return this.model.countDocuments( q );
  }
}

module.exports = new Mongo();