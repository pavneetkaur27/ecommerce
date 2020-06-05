const mongoose             = require('mongoose');

const model_name = 'order';

const schema = mongoose.Schema({

    // id of product from product model
    product_id : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    },
      
    // account id from account model
    aid : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    },

    // status of order placed
    status : {
        type    : Number,
        default : 1,
        required : true
    },
 
    //number of quantities ordered for product_id
    quantity : {
        type    : Number,
        default : 1,
        required : true
    },

    // price per item 
    price_per_quantity : {
        type : Number,
        required : true
    },

    //discount 
    discount_per_item : {
        type : Number,
        required : false
    },

    //total amount paid by user
    total_paid : {
        type : Number,
        required : true
    },

    // transaction id from transaction model
    transaction_id : {
        type : mongoose.Schema.Types.ObjectId,
        required : false
    },

    // active attribute for soft deletion 
    act : {
        type : Boolean,
        default : true
    },

    },{ 
    timestamps : true
  }
);


schema.statics = {
    STATUS : {
        ADDED_TO_CART   : 1,           
        CANCELLED       : 2,
        PAID            : 3,
        EXCHANGED       : 4    
    }
};


module.exports = mongoose.model(model_name,schema,model_name);