const mongoose              = require('mongoose');
const bvalid                = require('bvalid');
const mongo                 = require('../services').Mongo;
const sConf                 = require('../config/app').server;
const helper                = require('../helper');
const httpResponse          = helper.HttpResponse;
const constants             = helper.Constants;
const errorCodes            = helper.Errors;
const sendError 		    = httpResponse.sendError;
const utils					= require('../utils');
const JWT                   = utils.jwt;
const schema                = mongo.Schema;


exports.accessToken = function(req,res,next){
    var cookies = req.cookies;
    var access_token = null;
    var origin = req.get('host') || req.get('origin');
    if(!bvalid.isObject(cookies)){
        access_token = req.headers['x-access-token'];
    } else {
        access_token = cookies.ouat;
        if(!bvalid.isString(access_token)){
            access_token = req.headers['x-access-token'];
        }
    }
    if(!bvalid.isString(access_token)){
        return sendError(res,'unauthorised','unauthorised',errorCodes.unauthorised[0]);
    }
    if(!access_token){
        return sendError(res,"jwt_token_not_found","unauthorised",constants.HTTP_STATUS.UNAUTHORIZED);
    }
    if((
        access_token &&
        bvalid.isString(access_token) &&
        access_token.trim() !== 'undefined' &&
        access_token.trim().length !== 0) === false
    ){
        return sendError(res,"jwt_token_not_found","unauthorised",constants.HTTP_STATUS.UNAUTHORIZED);
    }
    JWT.verify(access_token,sConf.JWT_PRIVATE_KEY,function(err,decoded){
        if(err){
            console.log(err);
            if(bvalid.isObject(err) && err.name == "TokenExpiredError"){
                return sendError(res,"jwt_token_expired","jwt_token_expired");
            }
            return sendError(res,'server_error','server_error',errorCodes.server_error[0]);
        }
        req.decoded = decoded;
        var aid     = req.decoded.id;
       
        var aid = mongoose.Types.ObjectId(aid);
        mongo.Model('orguseracc').findOne({
            '_id' : aid,
            'act' : true
        },function(err0,resp0){
            if(err){
                console.log(err);
                return sendError(res,'server_error','server_error',errorCodes.server_error[0]);
            }
            if(!resp0){
                return sendError(res,'unauthorised','unauthorised',errorCodes.unauthorised[0]);
            }
            return next();
        })
    })
}

