module.exports = {
    'Security'                  : require('./app/Security'),
    "ServerValidator"           : require('./validator/ServerValidator'),
    "AppUtil"                   : require('./modules/AppUtil'),
    "Crypt"                     : require('./modules/CryptUtil'),
    "jwt"                       : require('./modules/JWTUtil'),
    's3Uploader'                 : require('./modules/AWSUtil')
};