const mongoose             = require('mongoose');

const model_name = 'inventory';

const schema = mongoose.Schema({

    //name of product
    product_nm : {
        type        : String,
        required    : true
    },
    
    //product description
    product_desc : {
        type        : String,
        required    : true
    },

    //picture of product if any
    product_pic : {
        type : String,
        required : false
    },


    // account id from account model(admin)i.e. inventory created by whom
    aid : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    },

    //original price of per item
    actual_price : {
        type : Number,
        required : true
    },

    //offered price of per item
    offered_price : {
        type : Number,
        required : true
    },

    //discount on item if any
    discount : {
        type : Number,
        required : false,
        default : 0
    }, 

    //total quantity of the product
    total_stock : {
        type : Number ,
        required : true
    },

    // total quantity ordered by the user 
    stock_ordered : {
        type : Number,
        required : false
    },
    
    // is product available for order
    is_product_avail : {
        type        : Boolean,
        required    : true,
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
 
};


module.exports = mongoose.model(model_name,schema,model_name);