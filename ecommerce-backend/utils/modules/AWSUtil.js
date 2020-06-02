const aws  = require('aws-sdk');
const uuid  = require('uuid');
const multer  = require('multer');
const s3  = require('multer-s3');
const bvalid = require('bvalid');
const sConf = require('../../config/app').server;

aws.config.update({
  secretAccessKey:sConf.AWS_SECRET_KEY,
  accessKeyId:  sConf.AWS_ACCESS_KEY,
  region: sConf.AWS_REGION,
});
const s3opt = new aws.S3({});

exports.upload = multer({
    storage: s3({
      s3: s3opt,
      ACL: 'public-read',
      bucket: sConf.S3_BUCKET,
      
      contentType: (req, file, next)=> {
        console.log(req.file_type,file.mimetype,":=====:");
        console.log('content-type :: ' + JSON.stringify(file))
        
        next(null, file.mimetype);
      },
      key: function(req, file, cb) {
        if(bvalid.isString(req.file_type) && req.file_type.trim().length > 0){
          if(!/^image/.test(file.mimetype)){
            return cb("invalid_file_type",null);
          }
        }
        let flnameextn = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
        console.log('key :: ' + JSON.stringify(flnameextn))
        cb(null, uuid.v1() + '' + flnameextn); 
    }
  })
});


exports.getSignedUrl = (filename,url)=>{
  console.log(filename);
    if(!(bvalid.isString(filename) && filename.trim().length > 0) && bvalid.isUrl(url)) {
      try{
        var filename = url.replace(/^\s*http[s]?:\/{2}/,"").replace(/\?\s*\S*$/,"");
        filename = filename.substring(filename.lastIndexOf('/')+1,filename.length);
        if(!(bvalid.isString(filename) && filename.trim().length > 0)){
          return null;
        }
      }catch(err){
        console.trace(err);
        return null
      }
    } else { return null }
    return s3opt.getSignedUrl('getObject', {
      Bucket: sConf.S3_BUCKET,
      Key: filename.trim(),
      Expires: 60*60*24*3*1 
    })
}

