"use strict";
var express               = require('express');
var router                = express.Router();
var session               = require('express-session');
var bodyParser            = require('body-parser');
const controller          = require('../controller');
const orgController       = controller.maindata;
const mdlw                = require('../middleware/user.mdlw');

router.get('/',function(req, res, next) {
    res.send("user working");
});

//user login
router.post('/login',orgController.maindata.signIn);

//user signup 
router.post('/sign_up',orgController.maindata.signUp);
 

//fetch all products 
router.post('/ft_products',orgController.maindata.fetchProducts);

//middleware to verify if user is authenticated or not
router.use(mdlw.accessToken);

// All apis below the above middleware will verify if user is verifed or not (used JWT authentication for this)

//create order
router.post('/ad_order',orgController.maindata.createOrder);

//edit/updating order
router.post('/ed_order',orgController.maindata.updateOrder);

//cancel order
router.post('/dl_order',orgController.maindata.cancelOrder);

//payment for orders 
router.post('/order_trxn',orgController.maindata.orderTransaction);

module.exports = router;
