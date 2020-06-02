module.exports = function(client,config){


if(config.REDIS_PASSWORD && config.REDIS_PASSWORD.length>0){
    client.auth(config.REDIS_PASSWORD,function(err,reply) {
      if(err){
        console.log(err);
      }else{
        console.log("["+reply+"]","Redis Authenticated");
      }
    });
}

client.set("language","nodejs");
client.on('ready',function() {
  console.log("Redis is connected and ready");
});

client.on("error", function (err) {
  console.log("Redis error:-" + err);
});

}