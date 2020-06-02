require('dotenv').config();
const fs = require("fs-extra");
const path = require('path');

if(!fs.existsSync(path.resolve(__dirname, 'AppConfig_Overwrite.js'))){
    fs.copySync(
        path.resolve(__dirname,'AppConfig.js'),
        path.resolve(__dirname,'AppConfig_Overwrite.js')
    )
}

const a_c = require('./AppConfig');
const a_c_o = require('./AppConfig_Overwrite');

if(
    process.env.MODE === 'ci' ||
    process.env.MODE === 'dapi' ||
    process.env.MODE === 'local' ||
    process.env.MODE === 'development' ||
    process.env.MODE === 'dev'
){
    module.exports = a_c;
} else {
    module.exports = a_c_o;
}