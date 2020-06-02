exports.getIp = (req)=>{
    var ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress);
    if(!ip && (req.socket || req.connection.socket)){
        ip = req.socket.remoteAddress || req.connection.socket.remoteAddress
    }
    ip = ip ? ((ip.split(',')[0],ip.split(':').slice(-1))
            ?(ip.split(',')[0],ip.split(':').slice(-1)):null) : null;
    return ip;
}