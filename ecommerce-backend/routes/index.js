"use strict";
const express                 = require('express');
const router                  = express.Router();
const bodyParser              = require('body-parser');
const httpResponse            = require('../helper').HttpResponse;
const sendError 		      = httpResponse.sendError;
const sendSuccess			  = httpResponse.sendSuccess;


router.post('/',function(req, res, next) {
    res.send("working");
});


module.exports = router;