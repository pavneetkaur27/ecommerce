const mongoose              = require('mongoose');
const request 				= require('request');
const bvalid                = require("bvalid");
const mongo                 = require('../../services').Mongo;
const to                    = require('../../services').Utility.to;
const helper                = require('../../helper');
const utils					= require('../../utils');
const configs               = require('../../config/app').server;
const httpResponse          = helper.HttpResponse;
const constants             = helper.Constants;
const errorCodes            = helper.Errors;
const crypt 				= utils.Crypt;
const JWT 					= utils.jwt;
const sendError 		    = httpResponse.sendError;
const sendSuccess			= httpResponse.sendSuccess;


exports.signUp = function(req,res,next){
    
    req.checkBody('eml',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('pwd',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('cpwd',errorCodes.invalid_parameters[1]).notEmpty();

	if(req.validationErrors()){
       return sendError(res,req.validationErrors(),"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST);
    }
    
    function invaliParms(msg,flag){
        msg = msg ? msg : 'invalid_parameters';
        if(flag){
            return sendError(res,msg,"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST,true);
        }
        return sendError(res,msg,msg,constants.HTTP_STATUS.BAD_REQUEST);
    }

    if(!bvalid.isEmail(req.body.eml)){
        return invaliParms("invalid_email");
    }
    if(!(bvalid.isString(req.body.pwd) && bvalid.isString(req.body.cpwd))){
        return invaliParms();
    }
    if(req.body.pwd != req.body.cpwd){
        return invaliParms("password_not_match");
    }

    mongo.Model('account').findOne({
        'eml' : req.body.eml.trim().toLowerCase()
    },function(err0,resp0){
        if(err0){
            return sendError(res,"server_error","server_error");
        }
        if(resp0){
            return sendError(res,"account_already_exists","account_already_exists");
        }
        return saveNew();
    })
    function saveNew(){
        mongo.Model('account').insert({
            'eml' : req.body.eml,
            'pwd' : req.body.pwd
        },function(err0,resp0){
            if(err0){
                return sendError(res,"server_error","server_error");
            }
            var encrypt_aid = crypt.TwoWayEncode(resp0._id.toString(),configs.TWO_WAY_CRYPT_SECRET);
            var ob = {
                'id' : resp0._id,
                'eml' : resp0.eml,
                'role' : 1
            };
            var jtoken = JWT.sign(ob,configs.JWT_PRIVATE_KEY,60*60*24*30);
            return sendSuccess(res,{a_tkn : jtoken });
        })
    }
}

exports.signIn = async function(req,res,next){
    req.checkBody('eml',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('pwd',errorCodes.invalid_parameters[1]).notEmpty();

    if(req.validationErrors()){
  		return sendError(res,req.validationErrors(),"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST);
    }
    
    function invaliParms(msg,flag){
        msg = msg ? msg : 'invalid_parameters';
        if(flag){
            return sendError(res,msg,"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST,true);
        }
        return sendError(res,msg,msg,constants.HTTP_STATUS.BAD_REQUEST);
    }

    if(!bvalid.isEmail(req.body.eml)){
        return invaliParms("invalid_email");
    }

    if(!bvalid.isString(req.body.pwd)){
        return invaliParms("invalid_type_of_password");
    }

    mongo.Model('account').findOne({
        'eml' : req.body.eml,
        'act' : true
    },{
        pwd : 1
    },function(err0,resp0){
        if(err0){
            return sendError(res,"server_error","server_error");
        }
        if(!resp0){
            return invaliParms("account_not_found");
        }
       
        try{
            var isValid = crypt.decode(req.body.pwd , resp0.pwd); 
        }catch(err){
            return sendError(res,err,"server_error");
        }
        if(isValid){
            var ob = {
                'id' : resp0._id,
                'eml' : resp0.eml,
                'role' : 1
            };
            let jtoken  = JWT.sign(ob,configs.JWT_PRIVATE_KEY,60*60*24*30);
            return sendSuccess(res,{a_tkn : jtoken });
        } else {
            return sendError(res,"password_not_match","password_not_match");
        } 
    })
}



exports.fetchProducts = async function(req,res,next){
    req.checkBody('limit',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('pageno',errorCodes.invalid_parameters[1]).notEmpty();

    if(req.validationErrors()){
  		return sendError(res,req.validationErrors(),"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST);
    }

    try{
        var data = req.body;

        var query_string = {
            act : true,
        }

        var [err0, total_prod_count] = await to(mongo.Model('inventory').count(query_string)); 
        if(err0){
            return sendError(res,err0,"server_error");
        }
        var proj    = {};

        //fetching limited data at a time(pagination)
        var option  = {
            limit : data.limit,
            skip  : (data.pageno -1) * data.limit
        }

        var [err,products] = await to(mongo.Model('inventory').find(query_string, proj, option)); 
        // console.log(products);
        if(err){
            return sendError(res,err,"server_error");
        }
        return sendSuccess(res, {
            products        : products,
            total_products  :  total_prod_count
        })
    }catch(err){
        return sendError(res,err,"server_error");
    }
}
  
// Create order API : Placing order scenarios
// Let us suppose on clicking place order then below api is executed
// In case he is buying it directly or adding to cart the below api will work properly
// Let user is buying n quantity of 'xyz' product so the following checks are applied before sending back the response
// CHECK 1 : product with product_id exists or not ====> if does not exist then send error "product_not_found"  else continue
// CHECK 2 : product is available for ordering or not  ====> In inventory model, 'is_product_avail' (boolean) attriute describe whether the product is available for ordering,  if is_product_avail = false then, send error "product_not_avail"  else continue
// CHECK 3 : total stock(initial stock) for a product if lesser than 1 i.e. stock is empty ====> if total_stock is lesser than 1 then send error "product_not_found"  else continue
// CHECK 4 : calculate current_avail_stock  (total_stock - stock_ordered) i.e. stock available for ordering ====>  if current_avail_stock is greater than quantity to be ordered then continuew else go through following checks
//           4.1 :  if current_avail_stock is greater than 0 then he can reorder but by decreasing the quantity of product , thus throw "decrease_order_quantity"
//           4.2 :  Else stock is already purchased(empty), through "total_stock_empty" error
// CHECK 5 : Check if same user was ordering the same product but didn't completed the payment(it can be added to cart) ,
//           5.1 :  if previous order exists then instead of creating new order document previous order is updated with new quantity (previous_quantity + new quantity)
//           5.2 :  Else create a new order in order model

// NOTE : Here i haven't updated "stock_ordered" attribute (corresponds to the number of ordered product by user ) of inventory model. Because at the time of placing order n number of users can place the order at the same time, if stock is blocked without payment, then the user who is ready to pay for the product instantly will be deprived.
// So as soon as payment is successfully done, inventory model is updated i.e.(quantity of product buyed + stock_ordered uptill now)
// If stock is limited, then in this approach multiple users can order without facing the problem but the one with who pays first can buy the product and rest will have to try again after stock is available.

// Scenario 1: There can be multiple fields like size , color , phone varient depending on type of Ecommerce Domain. I haven't added to some time problem.
// Scenario 2: Whenever  


exports.createOrder = async function(req,res,next){    
    req.checkBody('prd_id',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('quant',errorCodes.invalid_parameters[1]).notEmpty();

    if(req.validationErrors()){
  		return sendError(res,req.validationErrors(),"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST);
    }

    try{
        var data = req.body;

        var aid  = req.decoded.id;

        function invaliParms(msg,flag){
            msg = msg ? msg : 'invalid_parameters';
            if(flag){
                return sendError(res,msg,"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST,true);
            }
            return sendError(res,msg,msg,constants.HTTP_STATUS.BAD_REQUEST);
        }
        
        if(!(bvalid.isNumber(parseInt(data.quant)))){
            return invaliParms("invalid_quantity");   
        }
        if(!(bvalid.isString(data.prd_id) && data.prd_id.trim().length != 0)){
            return invaliParms("invalid_product");   
        }
        
        var quantity = parseInt(data.quant); //quantity selected by user to be ordered for this product

        //check if product exists in database
        var inventory_query_string = {
            _id : data.prd_id,
            act : true
        }
        var inventory_proj    = {};
        var inventory_option  = {};

        var [err,product] = await to(mongo.Model('inventory').findOne(inventory_query_string, inventory_proj, inventory_option)); 
        if(err){
            return sendError(res,err,"server_error");
        }

        // product with product_id not found in inventory
        if(!product){
            return sendError(res,"product_not_found","product_not_found");
        }

        //if product is not available for ordering
        if(!product.is_product_avail){
            return sendError(res,"product_not_avail","product_not_avail");
        }

        var total_stock = product.total_stock;

        //check if avaibable stock is greater than 0
        if(total_stock < 1){
            return sendError(res,"total_stock_empty","total_stock_empty");
        }

        var current_avail_stock = total_stock - product.stock_ordered; //current stock in inventory ( total-stock - stock_ordered_uptill_now)

        //check if current stock can meet need of user
        if(current_avail_stock < quantity){

            //check if user can re-order by decreasing his ordering quantity
            if(current_avail_stock > 0){
                return sendError(res,"decrease_order_quantity","decrease_order_quantity");
            }else {
                return sendError(res,"total_stock_empty","total_stock_empty");
            }
        }


        var order_query_string = {
            act         : true,
            product_id  : data.prd_id,
            aid         : aid,
            status      : 1                     //fetch previous order that is added to cart so that order can be updated
        }
        var order_proj    = {quantity : 1};
        var order_option  = {};

        var [err1, previous_order] = await to(mongo.Model('order').findOne(order_query_string, order_proj, order_option)); 
        if(err1){
            return sendError(res,err,"server_error");
        }
        if(previous_order){   //update previous order

            var updated_ob = {     //adding the attributes that need to be updated
                quantity            : previous_order.quantity + quantity,          //adding the previous ordered quantity to current choosen quantity
                price_per_quantity  : product.offered_price,
                discount_per_item   : product.discount,
                total_paid          : (previous_order.quantity + quantity) * product.offered_price 
            }

            var  [err2,updated_order] = await to(mongo.Model('order').updateOne(
                order_query_string,
                {$set : updated_ob }
            ));
            if(err2){
                return sendError(res,"server_error","server_error");
            }else{
                if(updated_order.nModified){
                    return sendSuccess(res, {});   //updated cart
                }else{
                    return sendError(res, "unable_to_update","unable_to_update");
                }
            }
        }else{      // add new order 

            var order_ob = {                //creating order object for saving in order model
                act                 : true ,
                product_id          : data.prd_id,
                aid                 : aid,   
                status              : 1,                //added to Cart
                quantity            : quantity,          //adding the previous ordered quantity to current choosen quantity
                price_per_quantity  : product.offered_price,
                discount_per_item   : product.discount,
                total_paid          : quantity * product.offered_price 
            }
            console.log(JSON.stringify(product));
            return saveNewOrder();
        }
        function saveNewOrder(){
            mongo.Model('order').insert(order_ob,function(err0,resp0){
                if(err0){
                    return sendError(res,"server_error","server_error");
                }
              
                return sendSuccess(res,{});   
            })
        }
    }catch(err){
        return sendError(res,err,"server_error");
    }
}


// Edit/Update order API : Updating order scenarios
// Let us suppose on clicking edit order then below api is executed
// CHECK 1 : product with product_id exists or not ====> if does not exist then send error "product_not_found"  else continue
// CHECK 2 : product is available for ordering or not  ====> In inventory model, 'is_product_avail' (boolean) attriute describe whether the product is available for ordering,  if is_product_avail = false then, send error "product_not_avail"  else continue
// CHECK 3 : Check if the order with order_id exist in database or not.
// CHECK 4 : total stock(initial stock) for a product if lesser than 1 i.e. stock is empty ====> if total_stock is lesser than 1 then send error "product_not_found"  else continue
// CHECK 5 : calculate current_avail_stock  (total_stock - stock_ordered) i.e. stock available for ordering ====>  if current_avail_stock is greater than quantity to be ordered then continuew else go through following checks
//           5.1 :  if current_avail_stock is greater than 0 then he can reorder but by decreasing the quantity of product , thus throw "decrease_order_quantity"
//           5.2 :  Else stock is already purchased(empty), through "total_stock_empty" error

exports.updateOrder = async function(req,res,next){ 
    req.checkBody('order_id',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('prd_id',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('quant',errorCodes.invalid_parameters[1]).notEmpty();

    if(req.validationErrors()){
  		return sendError(res,req.validationErrors(),"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST);
    }

    try{
        var data = req.body;

        var aid  = req.decoded.id;

        function invaliParms(msg,flag){
            msg = msg ? msg : 'invalid_parameters';
            if(flag){
                return sendError(res,msg,"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST,true);
            }
            return sendError(res,msg,msg,constants.HTTP_STATUS.BAD_REQUEST);
        }
        
        if(!(bvalid.isNumber(parseInt(data.quant)))){
            return invaliParms("invalid_quantity");   
        }
        if(!(bvalid.isString(data.prd_id) && data.prd_id.trim().length != 0)){
            return invaliParms("invalid_product");   
        }
        if(!(bvalid.isString(data.order_id) && data.order_id.trim().length != 0)){
            return invaliParms("invalid_order");   
        }

        var quantity = parseInt(data.quant); //quantity selected by user to be ordered for this product
        var order_id = data.order_id;   

        //check if product exists in database
        var inventory_query_string = {
            _id : data.prd_id,
            act : true
        }
        var inventory_proj    = {};
        var inventory_option  = {};

        var [err,product] = await to(mongo.Model('inventory').findOne(inventory_query_string, inventory_proj, inventory_option)); 
        if(err){
            return sendError(res,err,"server_error");
        }

        // product with product_id not found in inventory
        if(!product){
            return sendError(res,"product_not_found","product_not_found");
        }

        //if product is not available for ordering
        if(!product.is_product_avail){
            return sendError(res,"product_not_avail","product_not_avail");
        }

        //check if order exists in database
        var order_query_string = {
            act         : true,
            _id         : order_id,
            status      : 1                     //status = added to cart
        }

        var order_proj    = {};
        var order_option  = {};
        var [err1, order] = await to(mongo.Model('order').findOne(order_query_string, order_proj, order_option)); 
        if(err1){
            return sendError(res,err,"server_error");
        }

        if(!order){            // order not found in db with _id = order_id
            return sendError(res,"order_not_found","order_not_found");
        }

        var total_stock = product.total_stock;

        //check if avaibable stock is greater than 0
        if(total_stock < 1){
            return sendError(res,err,"total_stock_empty");
        }

        var current_avail_stock = total_stock - product.stock_ordered; //current stock in inventory ( total-stock - stock_ordered_uptill_now)

        //check if current stock can meet need of user
        if(current_avail_stock < quantity){

            //check if user can re-order by decreasing his ordering quantity
            if(current_avail_stock > 0){
                return sendError(res,err,"decrease_order_quantity");
            }else {
                return sendError(res,err,"total_stock_empty");
            }
        }

        // var previous_quantity = order.quantity ;
        
        var updated_ob = {     //adding the attributes that need to be updated
            quantity            : quantity,          //adding the previous ordered quantity to current choosen quantity
            price_per_quantity  : product.offered_price,
            discount_per_item   : product.discount,
            total_paid          : quantity * product.offered_price 
        }

        var  [err2,updated_order] = await to(mongo.Model('order').updateOne(
            order_query_string,
            {$set : updated_ob }
        ));
        if(err2){
            return sendError(res,"server_error","server_error");
        }else{
            if(updated_order.nModified){
                return sendSuccess(res, {});
            }else{
                return sendError(res, "unable_to_update","unable_to_update");
            }
        }
    }catch(err){
        return sendError(res,err,"server_error");
    }
}

// Cancel order API
// Let us suppose on clicking cancel order then below api is executed
// CHECK 1 : Check if order exists or not in database
// CHECK 2 : Soft delete from database by making "act"(active) attribute of order model false

exports.cancelOrder = async function(req,res,next){ 
    req.checkBody('order_id',errorCodes.invalid_parameters[1]).notEmpty();
    

    if(req.validationErrors()){
  		return sendError(res,req.validationErrors(),"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST);
    }

    try{
        var data = req.body;

        var aid  = req.decoded.id;

        function invaliParms(msg,flag){
            msg = msg ? msg : 'invalid_parameters';
            if(flag){
                return sendError(res,msg,"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST,true);
            }
            return sendError(res,msg,msg,constants.HTTP_STATUS.BAD_REQUEST);
        }
        
        if(!(bvalid.isString(data.order_id) && data.order_id.trim().length != 0)){
            return invaliParms("invalid_order");   
        }
        
        var order_id = data.order_id;
      
        //check if order exists in database
        var order_query_string = {
            act         : true,
            order_id    : order_id,
            status      : 1                     //fetch previous order that is added to cart so that order can be updated
        }
        var order_proj    = {_id : 1};
        var order_option  = {};
        var [err1, order] = await to(mongo.Model('order').findOne(order_query_string, order_proj, order_option)); 
        if(err1){
            return sendError(res,err,"server_error");
        }

        if(!order){            // order not found in db with _id = order_id
            return sendError(res,"order_not_found","order_not_found");
        }

        if(order){   //update previous order

            var updated_ob = {     //adding the attributes that need to be updated
               act : false                              // soft delete from database
            }

            var  [err2,updated_order] = await to(mongo.Model('order').updateOne(
                order_query_string,
                {$set : updated_ob }
            ));
            if(err2){
                return sendError(res,"server_error","server_error");
            }else{
                if(updated_order.nModified){
                    return sendSuccess(res, {});
                }else{
                    return sendError(res, "unable_to_update","unable_to_update");
                }
            }
        }
    }catch(err){
        return sendError(res,err,"server_error");
    }
}


// Payment API order API
// Let us suppose user attempt to pay on checkout page 
// I haven't integrated payment module, but i have integrated Razorpay and paytm third party Api in my one of the project
// CHECK 1 : Check if order and product exists in database or not
// CHECK 2 : Again Checks for stock available or not, if stock available in that moment, the proceed with payment.
// CHECK 3 : Before hitting razorpay api, check whether amount charged from user is actual amount to be charged or not
// CHECK 4 : If razorpay api returned status captured i.e. payment is done successfully. Then we can maintain rabbitmq queues to have payments done in order.(I haven't done here)
//            4.1 For once cross verify in rabbitmq workers or in the below api I directly checked whether stock was available even if payment is done
//                 4.1.1 If there is any of stock availability issue then refund the amount at that time or after a set time interval 
//                 4.1.2 We can update is_product_avail to false if stock is not available so that more users could not order it.
//            4.2 If stock is there and payment was successful , 
//                 4.2.1 Update stock_ordered in inventory model(increase in ordered stock)
//                 4.2.2 store the payment details of the user in transaction model and store the transaction_id in order model
//                 4.2.3 Generate invoice etc
//                 4.2.4 Update order status to PAID in order model
// Here even multiple users place orders, then only FIFO order will be followed in which stock gets ordered. Rest will be shown "Out of stock/ Temporary Unavailable" in UI side.
// ADDONs : Shipping Address details will be added before the payment details and stored in account model(Haven't added as of now)

exports.orderTransaction = async function(req,res,next){ 
    req.checkBody('order_id',errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('prd_id',errorCodes.invalid_parameters[1]).notEmpty();
   
    if(req.validationErrors()){
  		return sendError(res,req.validationErrors(),"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST);
    }

    try{
        var data = req.body;
        var aid  = req.decoded.id;

        function invaliParms(msg,flag){
            msg = msg ? msg : 'invalid_parameters';
            if(flag){
                return sendError(res,msg,"invalid_parameters",constants.HTTP_STATUS.BAD_REQUEST,true);
            }
            return sendError(res,msg,msg,constants.HTTP_STATUS.BAD_REQUEST);
        }
        
        if(!(bvalid.isString(data.prd_id) && data.prd_id.trim().length != 0)){
            return invaliParms("invalid_product");   
        }
      
        if(!(bvalid.isString(data.order_id) && data.order_id.trim().length != 0)){
            return invaliParms("invalid_order");   
        }

        var order_id    = data.order_id;
        var product_id  = data.prd_id;
        
        //check if product exists in database
        var inventory_query_string = {
            _id : product_id,
            act : true
        }
        var inventory_proj    = {};
        var inventory_option  = {};

        var [err,product] = await to(mongo.Model('inventory').findOne(inventory_query_string, inventory_proj, inventory_option)); 
        if(err){
            return sendError(res,err,"server_error");
        }

        // product with product_id not found in inventory
        if(!product){
            return sendError(res,"product_not_found","product_not_found");
        }

        //if product is not available for ordering
        if(!product.is_product_avail){
            return sendError(res,"product_not_avail","product_not_avail");
        }

        //check if order exists in database
        var order_query_string = {
            act         : true,
            _id         : order_id
        }
        var order_proj    = {};
        var order_option  = {};
        var [err1, order] = await to(mongo.Model('order').findOne(order_query_string, order_proj, order_option)); 
        if(err1){
            return sendError(res,err,"server_error");
        }

        if(!order){            // order not found in db with _id = order_id
            return sendError(res,"order_not_found","order_not_found");
        }

        var total_stock = product.total_stock;

        //check if avaibable stock is greater than 0
        if(total_stock < 1){
            return sendError(res,err,"total_stock_empty");
        }

        var current_avail_stock = total_stock - product.stock_ordered; //current stock in inventory ( total-stock - stock_ordered_uptill_now)

        //check if current stock can meet need of user
        if(current_avail_stock < quantity){

            //check if user can re-order by decreasing his ordering quantity
            if(current_avail_stock > 0){
                return sendError(res,err,"decrease_order_quantity");
            }else {
                return sendError(res,err,"total_stock_empty");
            }
        }

        completePayment(order, product, function(completePaymentERR , response){
            if(completePaymentERR){
                return sendError(res, completePaymentERR , completePaymentERR);
            }

            if(response.status == 'captured'){               //razorpay api return capture status when payment is done successfully

                //cross check if stock is present in inventory if not refund the amount
                var [err,current_product] = await to(mongo.Model('inventory').findOne(inventory_query_string, inventory_proj, inventory_option)); 
                if(err){
                    return sendError(res,err,"server_error");
                }
        
                // product with product_id not found in inventory
                if(!current_product){
                    return refundPayment();
                }
        
                //if product is not available for ordering
                if(!current_product.is_product_avail){
                    return refundPayment();
                }

                var total_stock = current_product.total_stock;

                //check if avaibable stock is greater than 0
                if(total_stock < 1){
                    return refundPayment();
                }
        
                var current_avail_stock = total_stock - current_product.stock_ordered; //current stock in inventory ( total-stock - stock_ordered_uptill_now)
        
                //check if current stock can meet need of user
                if(current_avail_stock < quantity){
        
                    //check if user can re-order by decreasing his ordering quantity
                    if(current_avail_stock > 0){
                        return refundPayment();
                    }else {
                        return refundPayment();
                    }
                }

                // if stock is there and payment is done update the stock_ordered number
                // update inventory for maintaing the count of orders placed 
                var inventory_updated_obj = {
                    stock_ordered :  (current_product.stock_ordered ? current_product.stock_ordered + order.quantity : order.quantity)
                }
                var [err0,updated_inventory] = await to(mongo.Model('inventory').updateOne(
                    inventory_query_string,
                    {$set :  inventory_updated_obj}
                ));
                if(err0){
                    return sendError(res,"server_error","server_error");
                }

                return sendSuccess(res, {});              // successfully placed order

                function refundPayment(){
                   // return back the money to user because ordered not placed
                }
        
            }else{
                return sendError(res, "payment_failed" , "payment_failed");
            }
        }) 
    }catch(err){
        return sendError(res,err,"server_error");
    }

}

// Suppose this function will fetch amount using razorpay
// Razorpay capture api give us status i.e. captured, failed , pending etc.
// CHECK 1 : calculate the amount to be fetching using razorpay api is actual amount to be charged from the user

function completePayment(order, product ,cb){

    var quantity = order.quantity;
    var price    = order.price_per_quantity;
    var final_amount    = quantity * price;

    if(product.total_paid != final_amount){
        return cb("invalid_amount_paid", null);
    }else{
        // suppose razorpay api return the result
        return cb(null, razorpay_response);
    }
}