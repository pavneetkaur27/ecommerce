const constants = require('./Constants');
const Errors = require('./Errors');
const isUndefined = require('bvalid').isUndefined;

const sendError = (res, err, err_index, status_code) => {
	console.trace(err);
	var errMsg;
	var errCode;
	status_code = (isUndefined(status_code) || isUndefined(Errors[err_index]))
		? constants.HTTP_STATUS.SERVER_ERROR : status_code;

	if(isUndefined(Errors[err_index])) {
		errCode = errorCodes["server_error"][0]
		errMsg = errorCodes["server_error"][1];
	} else {
		errCode = Errors[err_index][0]
		errMsg = Errors[err_index][1];
	}

	return res.status(status_code).send({
		code: errCode,
		err: errMsg,
		success: false
	});
}

const sendSuccess = (res,data)=>{
	return res.status(constants.HTTP_STATUS.OK).send({
		data: data,
		success: true
	})
}

module.exports = {
	sendError: sendError,
	sendSuccess: sendSuccess
};