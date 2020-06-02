const mongoose  = require('mongoose');
const sConf     = require('./app').server;

var mongoOption = { 
    useNewUrlParser: true 
};

mongoose.connect(sConf.MONGO_URL,mongoOption);

//On connect
mongoose.connection.on('connected', function () {
    console.log('Mongo connected with '+sConf.MONGO_URL);
});

//on error
mongoose.connection.on('error',function (err) {
    // logger.error("Error occur in mongo");
    console.log('Error occur in mongo '+ err);
});

//On disconnected
mongoose.connection.on('disconnected', function () {
    // logger.error("Mongo connection disconnected");
    console.log('Mongo connection disconnected');
});