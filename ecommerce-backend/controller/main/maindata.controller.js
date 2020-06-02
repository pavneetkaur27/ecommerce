const mongoose              = require('mongoose');
const request 				= require('request');
const bvalid                = require("bvalid");
const mongo                 = require('../../services').Mongo;
const to                    = require('../../services').Utility.to;
const moment                = require('moment-timezone');
const helper                = require('../../helper');
const utils					= require('../../utils');
const configs               = require('../../config/app').server;
const httpResponse          = helper.HttpResponse;
const constants             = helper.Constants;
const errorCodes            = helper.Errors;
const crypt 				= utils.Crypt;
const JWT 					= utils.jwt;
const sendError 		    = httpResponse.sendError;
const sendSuccess			= httpResponse.sendSuccess;
const upload                = require('../../utils').s3Uploader.upload;
const getSignedUrl          = require('../../utils').s3Uploader.getSignedUrl;
const uploader              = upload.single('file');

exports.signUp = function(req,res,next){
    req.checkBody('eml',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('pwd',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('cpwd',errorCodes.invalid_parameters[1]).notEmpty();

	if(req.validationErrors()){
       return sendError(res,req.validationErrors(),"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST);
    }
    
    function invaliParms(msg,flag){
        msg = msg ? msg : 'invalid_parameters';
        if(flag){
            return sendError(res,msg,"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST,true);
        }
        return sendError(res,msg,msg,constants.HTTP_STATUS.BAD_REQUEST);
    }

    if(!bvalid.isEmail(req.body.eml)){
        return invaliParms("invalid_email");
    }
    if(!(bvalid.isString(req.body.pwd) && bvalid.isString(req.body.cpwd))){
        return invaliParms();
    }
    if(req.body.pwd != req.body.cpwd){
        return invaliParms("password_not_match");
    }

    mongo.Model('orguseracc').findOne({
        'eml' : req.body.eml.trim().toLowerCase()
    },function(err0,resp0){
        if(err0){
            return sendError(res,"server_error","server_error");
        }
        if(resp0){
            return sendError(res,"account_already_exists","account_already_exists");
        }
        return saveNew();
    })
    function saveNew(){
        mongo.Model('orguseracc').insert({
            'eml' : req.body.eml,
            'pwd' : req.body.pwd
        },function(err0,resp0){
            if(err0){
                return sendError(res,"server_error","server_error");
            }
            var encrypt_aid = crypt.TwoWayEncode(resp0._id.toString(),configs.TWO_WAY_CRYPT_SECRET);
            var ob = {
                'id' : resp0._id,
                'eml' : resp0.eml,
                'role' : 1
            };
            var jtoken = JWT.sign(ob,configs.JWT_PRIVATE_KEY,60*60*24*30);
            return sendSuccess(res,{a_tkn : jtoken });
        })
    }
}

exports.signIn = async function(req,res,next){
    req.checkBody('eml',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('pwd',errorCodes.invalid_parameters[1]).notEmpty();

    if(req.validationErrors()){
  		return sendError(res,req.validationErrors(),"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST);
    }
    
    function invaliParms(msg,flag){
        msg = msg ? msg : 'invalid_parameters';
        if(flag){
            return sendError(res,msg,"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST,true);
        }
        return sendError(res,msg,msg,constants.HTTP_STATUS.BAD_REQUEST);
    }

    if(!bvalid.isEmail(req.body.eml)){
        return invaliParms("invalid_email");
    }

    if(!bvalid.isString(req.body.pwd)){
        return invaliParms("invalid_type_of_password");
    }

    mongo.Model('orguseracc').findOne({
        'eml' : req.body.eml,
        'act' : true
    },{
        pwd : 1
    },function(err0,resp0){
        if(err0){
            return sendError(res,"server_error","server_error");
        }
        if(!resp0){
            return invaliParms("account_not_found");
        }
       
        try{
            var isValid = crypt.decode(req.body.pwd , resp0.pwd); 
        }catch(err){
            return sendError(res,err,"server_error");
        }
        if(isValid){
            var ob = {
                'id' : resp0._id,
                'eml' : resp0.eml,
                'role' : 1
            };
            let jtoken  = JWT.sign(ob,configs.JWT_PRIVATE_KEY,60*60*24*30);
            let is_org  = false;
            
            mongo.Model('orgmap').findOne({
                'oemp' : resp0._id,
                'act' : true
            },function(err2, usr_org_map){
                if(err2){
                    return sendError(res,err,"server_error");
                }
                if(usr_org_map){
                    is_org  = true;
                }
                return sendSuccess(res,{a_tkn : jtoken, is_org : is_org });
            })
        } else {
            return sendError(res,"password_not_match","password_not_match");
        } 
    })
}


exports.uploadFile = async (req,res,next)=>{
    console.log(req.file);
    return uploader(req, res, function(err) {
      if(err){
        if(err === "invalid_file_type"){
          return sendError(res, "invalid_file_type", "invalid_file_type");
        }
        return sendError(res, "server_error", "server_error");
      }
      if(!req.file) {
        return sendError(res, "invalid_parameters", "invalid_parameters");
      } else {
        var signedUrl = getSignedUrl(null,req.file.location);
        if(!signedUrl){
          return sendError(res, "server_error", "server_error");
        }
        return sendSuccess(res,{url : signedUrl})
      }
    });
};


exports.fetchAllProducts = async function(req,res,next){
    
}

exports.createOrder = async function(req,res,next){    

}