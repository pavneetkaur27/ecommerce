const {to} = require('await-to-js');

module.exports.to = async (promise) => {
    let err, res;
    [err, res] = await to(promise);
    if(err) return [err];

    return [null, res];
};
